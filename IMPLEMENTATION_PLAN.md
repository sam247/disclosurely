# 🚀 Implementation Plan: 3 Critical Blockers + Security Fixes

## ✅ **COMPLETED: Security Fix (localStorage → sessionStorage)**

### What Was Fixed:
1. **CustomDomainSettings**: DNS records & verification tokens
   - Changed from `localStorage` to `sessionStorage`
   - Added 15-minute TTL for cached records
   - Removed persistence of verification tokens entirely (fetch fresh from server)

2. **useAuth Hook**: Subscription data
   - Changed from `localStorage` to `sessionStorage`
   - Added 15-minute TTL with automatic expiry check
   - Reduced cache freshness from 1 hour to 15 minutes

### Security Benefits:
- ✅ **Auto-clear on tab close**: sessionStorage clears automatically when browser tab closes
- ✅ **TTL implementation**: All cached security-relevant data expires after 15 minutes
- ✅ **No token persistence**: Verification tokens are never stored client-side
- ✅ **Reduced reconnaissance risk**: Sensitive data no longer persists indefinitely

---

## 🚦 **NEXT: 3 Critical Blockers**

### **BLOCKER 1: Server-Side Rate Limiting** (READY TO IMPLEMENT)

#### Current Status:
- ❌ Only client-side rate limiting (easily bypassed)
- ✅ Client-side implementation exists in `src/hooks/useSecureForm.ts`

#### Solution: Upstash Redis Rate Limiting

**Step 1: Install Upstash**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Step 2: Set Up Upstash (Free Tier)**
1. Sign up at https://upstash.com (Free: 10K commands/day)
2. Create Redis database
3. Get UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
4. Add to `.env` and Supabase Edge Function secrets

**Step 3: Create Rate Limiting Middleware**

File: `supabase/functions/_shared/rateLimit.ts`
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
})

// Different rate limits for different operations
export const rateLimiters = {
  // Anonymous report submissions: 5 per 15 minutes per IP
  reportSubmission: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  }),
  
  // Domain operations: 10 per 10 seconds per user
  domainOperations: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  }),
  
  // Message sending: 20 per hour per tracking_id
  messaging: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
  }),
  
  // Authentication attempts: 5 per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  }),
}

export async function checkRateLimit(
  req: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Use custom identifier or fall back to IP
  const id = identifier || req.headers.get("x-forwarded-for") || "anonymous"
  const result = await limiter.limit(id)
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
```

**Step 4: Apply to Critical Edge Functions**

Example for `submit-anonymous-report`:
```typescript
import { checkRateLimit, rateLimiters } from '../_shared/rateLimit.ts'

serve(async (req) => {
  // Rate limit check
  const rateLimit = await checkRateLimit(req, rateLimiters.reportSubmission)
  
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({ 
        error: "Too many requests. Please try again later.",
        reset: rateLimit.reset 
      }),
      { 
        status: 429,
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.reset.toString(),
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        }
      }
    )
  }
  
  // Continue with normal logic...
})
```

**Functions to Update:**
1. `submit-anonymous-report` - Report submissions
2. `simple-domain-v2` - Domain operations
3. `anonymous-report-messaging` - Messaging
4. `send-otp-email` - Authentication

**Estimated Time:** 2 days
**Risk:** LOW - Non-breaking addition

---

### **BLOCKER 2: Error Monitoring & Alerting** (READY TO IMPLEMENT)

#### Current Status:
- ✅ Centralized logging to `system_logs` table
- ✅ AI-powered log analysis
- ❌ No external error tracking
- ❌ No real-time alerts

#### Solution: Sentry + Email Alerts

**Step 1: Set Up Sentry (Free Tier)**
1. Sign up at https://sentry.io (Free: 5K errors/month)
2. Create new project (React + Node.js)
3. Get DSN

**Step 2: Install Sentry**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Step 3: Configure Sentry**

File: `src/utils/sentry.ts`
```typescript
import * as Sentry from "@sentry/react";

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors
      environment: "production",
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });
  }
}
```

In `src/main.tsx`:
```typescript
import { initSentry } from './utils/sentry'
initSentry()
```

**Step 4: Add Error Boundaries**
```typescript
import { ErrorBoundary } from '@sentry/react'

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

**Step 5: Set Up Alerts**
- Sentry Dashboard → Alerts → Create Alert Rule
- Trigger: Error count > 10 in 5 minutes
- Actions: Email + Slack notification

**Estimated Time:** 1 day
**Risk:** LOW - Non-breaking addition

---

### **BLOCKER 3: Load Testing** (READY TO IMPLEMENT)

#### Current Status:
- ❌ No baseline performance metrics
- ❌ Unknown concurrent user capacity
- ❌ No stress testing performed

#### Solution: k6 Load Testing

**Step 1: Install k6**
```bash
brew install k6  # macOS
```

**Step 2: Create Load Test Scripts**

File: `load-tests/report-submission.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],    // <1% error rate
  },
};

export default function () {
  const url = 'https://your-project.supabase.co/functions/v1/submit-anonymous-report';
  const payload = JSON.stringify({
    organizationLinkId: 'test-link-id',
    title: 'Load Test Report',
    description: 'Testing concurrent submissions',
    reportType: 'anonymous',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.ANON_KEY}`,
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1); // Think time between requests
}
```

File: `load-tests/domain-operations.js` (Similar structure for CNAME operations)

**Step 3: Run Tests**
```bash
k6 run load-tests/report-submission.js
k6 run load-tests/domain-operations.js
```

**Step 4: Analyze Results**
- Record p95, p99 response times
- Identify bottlenecks (slow queries, API timeouts)
- Add database indexes where needed

**Step 5: Database Optimization**
Based on test results, likely indexes needed:
```sql
-- reports table
CREATE INDEX IF NOT EXISTS idx_reports_organization_created ON reports(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_tracking_id ON reports(tracking_id);

-- custom_domains table
CREATE INDEX IF NOT EXISTS idx_custom_domains_org_active ON custom_domains(organization_id, is_active, is_primary);

-- system_logs table  
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp_level ON system_logs(timestamp DESC, level);
```

**Estimated Time:** 2 days
**Risk:** LOW - Read-only tests, optimization is iterative

---

## 📅 **Recommended Implementation Order**

### **Week 1: Critical Security**
- ✅ Day 1: localStorage → sessionStorage (DONE!)
- 🚀 Day 2-3: Implement Upstash rate limiting
- 🚀 Day 4: Integrate Sentry error tracking

### **Week 2: Performance & Stability**
- 🚀 Day 5-6: Run k6 load tests
- 🚀 Day 7: Add database indexes based on results
- 🚀 Day 8-10: Fix any identified bottlenecks

### **Week 3: Final Polish**
- Day 11-13: Edge function timeout handling
- Day 14-15: Disaster recovery documentation

### **Week 4: Go/No-Go**
- Day 16-18: Final load tests
- Day 19-20: Security audit
- Day 21: **LAUNCH DECISION**

---

## ✅ **Safety Checks**

### Before Each Implementation:
1. ✅ Create git branch for feature
2. ✅ Test in development first
3. ✅ Deploy to staging (if available)
4. ✅ Monitor logs for 24 hours
5. ✅ Merge to main only after validation

### Rollback Plan:
- All implementations are **additive** (no breaking changes)
- Rate limiting: Remove middleware, revert Edge Functions
- Sentry: Remove init call, uninstall packages
- Load tests: No production changes needed

---

**Status**: Ready to proceed with BLOCKER 1 (Rate Limiting)  
**Next Step**: Set up Upstash account and get credentials  
**Time to Production Ready**: ~10-14 days

