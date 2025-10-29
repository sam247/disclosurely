# 🚀 Upstash Redis Rate Limiting Setup

## ✅ Credentials (Already Set Up!)

```
Endpoint: liberal-roughy-24597.upstash.io:6379
Token: AWAVAAIncDI5MzQ5NGM1MGJmY2Y0NTc3YjI4NWRkOGI0NjE1MDA0MHAyMjQ1OTc
```

## 📋 Setup Steps

### 1. Add Environment Variables to Supabase

Go to Supabase Dashboard → Edge Functions → Settings → Secrets:

```bash
UPSTASH_REDIS_REST_URL=https://liberal-roughy-24597.upstash.io
UPSTASH_REDIS_REST_TOKEN=AWAVAAIncDI5MzQ5NGM1MGJmY2Y0NTc3YjI4NWRkOGI0NjE1MDA0MHAyMjQ1OTc
```

Or using CLI:
```bash
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://liberal-roughy-24597.upstash.io --project-ref cxmuzperkittvibslnff
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=AWAVAAIncDI5MzQ5NGM1MGJmY2Y0NTc3YjI4NWRkOGI0NjE1MDA0MHAyMjQ1OTc --project-ref cxmuzperkittvibslnff
```

### 2. Test Connection

```bash
redis-cli --tls -u redis://default:AWAVAAIncDI5MzQ5NGM1MGJmY2Y0NTc3YjI4NWRkOGI0NjE1MDA0MHAyMjQ1OTc@liberal-roughy-24597.upstash.io:6379

# Then run:
> PING
# Should return: PONG
```

### 3. Rate Limiting Rules

| Operation | Limit | Window | Identifier |
|-----------|-------|--------|------------|
| Report Submissions | 5 | 15 min | IP Address |
| Domain Operations | 10 | 10 sec | User ID |
| Messaging | 20 | 1 hour | tracking_id |
| Auth Attempts | 5 | 15 min | IP Address |
| General API | 60 | 1 min | IP Address |

### 4. Apply Rate Limiting to Edge Functions

#### Example: `submit-anonymous-report`

```typescript
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts'

serve(async (req) => {
  // CORS handling...
  
  // Rate limit check
  const rateLimit = await checkRateLimit(req, rateLimiters.reportSubmission)
  
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit, corsHeaders)
  }
  
  // Continue with normal logic...
})
```

### 5. Priority Functions to Update

1. ✅ **`submit-anonymous-report`** - CRITICAL (prevent spam reports)
2. ✅ **`simple-domain-v2`** - CRITICAL (prevent domain abuse)
3. ✅ **`anonymous-report-messaging`** - HIGH (prevent message spam)
4. ✅ **`send-otp-email`** - HIGH (prevent email bombing)
5. **`analyze-logs-with-ai`** - MEDIUM (expensive AI calls)

### 6. Monitoring

Check Upstash Console for:
- Request count (Free: 10K commands/day)
- Rate limit hits
- Most active IPs

### 7. Testing

```bash
# Test rate limiting
for i in {1..6}; do
  curl -X POST https://your-project.supabase.co/functions/v1/submit-anonymous-report \
    -H "Content-Type: application/json" \
    -d '{"test": true}' &
done

# 6th request should return 429 Too Many Requests
```

## 🎯 Next Steps

1. Set Supabase secrets (above)
2. Deploy rate-limited functions
3. Test with 6+ rapid requests
4. Monitor Upstash dashboard

