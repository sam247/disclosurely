# 🔍 Sentry Error Monitoring Setup

## 📋 Prerequisites

1. **Create Sentry Account**: https://sentry.io/signup/
2. **Create New Project**:
   - Go to Projects → Create Project
   - Platform: React
   - Alert Frequency: Every event (for now)
   - Give Alerts A Name: "Disclosurely Production Errors"
   - Project Name: `disclosurely-production`

## 🔑 Get Your Sentry DSN

After creating the project, you'll see your DSN:

```
https://YOUR_KEY@YOUR_SENTRY_ID.ingest.us.sentry.io/YOUR_PROJECT_ID
```

**Example**: `https://abc123@o1234567.ingest.us.sentry.io/9876543`

---

## 🚀 Setup Steps

### 1. Add Environment Variables

#### **Local Development** (`.env.local`):
```bash
VITE_SENTRY_DSN=https://YOUR_KEY@YOUR_SENTRY_ID.ingest.us.sentry.io/YOUR_PROJECT_ID
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=local
```

#### **Production** (Vercel):
Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
VITE_SENTRY_DSN=https://YOUR_KEY@YOUR_SENTRY_ID.ingest.us.sentry.io/YOUR_PROJECT_ID
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=auto  # Auto-generated from git SHA
```

---

### 2. Configure Sentry in Your App

The following files have been updated:

#### **`src/main.tsx`**
- Sentry initialized before React
- Performance monitoring enabled
- User context captured (ID, email, org)
- React integration with error boundaries

#### **`vite.config.ts`**
- Source maps uploaded to Sentry on build
- Release tracking with git SHA
- Auth token for uploads (set in `.env.local`)

---

### 3. Set Up Sentry Auth Token (For Source Maps)

1. Go to Sentry → Settings → Account → API → Auth Tokens
2. Create New Token:
   - Name: "Vercel Deployments"
   - Scopes: `project:read`, `project:releases`, `org:read`
3. Copy the token

#### **Local** (`.env.local`):
```bash
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
```

#### **Vercel**:
```bash
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
```

---

## 🎯 Features Implemented

### 1. **Error Tracking**
- All unhandled errors automatically captured
- Stack traces with source maps
- User context (who experienced the error)
- Device/browser info

### 2. **Performance Monitoring**
- Page load times
- API call durations
- Component render times
- Sample rate: 10% (to control costs)

### 3. **User Context**
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: organization?.name,
})
```

### 4. **Custom Tags**
```typescript
Sentry.setTag('organization_id', organization?.id)
Sentry.setTag('subscription_tier', subscriptionData.subscription_tier)
```

### 5. **Breadcrumbs**
Automatic tracking of:
- Console logs
- Network requests
- User interactions
- Navigation changes

### 6. **Error Boundaries**
Catches React component errors with graceful fallback UI

---

## 📊 Alert Configuration

### Recommended Alerts (Set in Sentry):

#### 1. **Critical Errors** (Immediate Slack/Email)
- Condition: Error level = `fatal` OR `error`
- Action: Slack + Email
- Frequency: Every time

#### 2. **High Error Rate** (Warning)
- Condition: >10 errors in 1 minute
- Action: Slack
- Frequency: Once per 5 minutes

#### 3. **New Error Type** (Info)
- Condition: First time seeing this error
- Action: Slack
- Frequency: Once

#### 4. **Performance Degradation** (Warning)
- Condition: P95 response time >3000ms
- Action: Slack
- Frequency: Once per 10 minutes

---

## 🧪 Testing Sentry Integration

### Test Error Capture:
```typescript
// Add this to a test button in your app
try {
  throw new Error('Test Sentry Error!')
} catch (error) {
  Sentry.captureException(error, {
    tags: { test: true },
    level: 'error',
  })
}
```

### Test Performance Tracking:
```typescript
const transaction = Sentry.startTransaction({
  name: 'Test Transaction',
  op: 'test',
})

// Do some work...

transaction.finish()
```

### Verify in Sentry Dashboard:
1. Go to Sentry Dashboard
2. Navigate to Issues
3. You should see the test error
4. Click for full details (stack trace, user context, breadcrumbs)

---

## 📈 Monitoring & Alerts

### What to Monitor:

#### Daily Review (5 minutes):
- New error types
- Error frequency trends
- Most affected users
- Performance regressions

#### Weekly Review (15 minutes):
- Top 10 errors by volume
- Unresolved critical errors
- Performance bottlenecks
- User feedback correlation

#### Monthly Review (30 minutes):
- Error rate trends
- Resolution time metrics
- Most problematic features
- Browser/device breakdowns

---

## 💰 Cost Management

### Sentry Free Tier:
- **5,000 errors/month**
- **10,000 performance transactions/month**
- 30-day retention

### Cost Optimization:
```typescript
// In main.tsx
tracesSampleRate: 0.1,  // 10% of transactions (adjust based on traffic)

// Filter out noisy errors
beforeSend(event, hint) {
  // Ignore network errors (handled by retry logic)
  if (event.message?.includes('NetworkError')) return null
  
  // Ignore local development errors
  if (window.location.hostname === 'localhost') return null
  
  return event
}
```

### Expected Usage (200 customers):
- **Errors**: 500-1,500/month (within free tier)
- **Performance**: 5,000-15,000 transactions/month (may exceed free tier)
- **Estimated Cost**: $0-$26/month (Developer tier if needed)

---

## 🔒 Privacy & Security

### PII Filtering:
```typescript
// Already configured in main.tsx
beforeSend(event) {
  // Remove sensitive data from error messages
  if (event.message) {
    event.message = event.message.replace(/Bearer\s+[^\s]+/g, 'Bearer [REDACTED]')
    event.message = event.message.replace(/password=\S+/g, 'password=[REDACTED]')
  }
  return event
}
```

### GDPR Compliance:
- Sentry is GDPR compliant
- User data anonymized after 30 days
- Right to erasure: Contact Sentry support to delete user data

---

## 🚨 Critical Errors to Watch

### High Priority:
1. **Report Submission Failures**
   - Tag: `report.submission_error`
   - Action: Immediate investigation

2. **Payment Processing Errors**
   - Tag: `payment.error`
   - Action: Immediate investigation + user notification

3. **Authentication Failures**
   - Tag: `auth.error`
   - Action: Check for security breach

4. **Database Connection Errors**
   - Tag: `database.connection_error`
   - Action: Check Supabase status

### Medium Priority:
1. **File Upload Failures**
2. **Email Send Failures**
3. **AI Analysis Timeouts**
4. **CNAME Verification Failures**

---

## 🔗 Integration with Existing Logs

### Correlate Sentry Errors with System Logs:
```typescript
// When logging to system_logs, also log to Sentry
await logToSystem(supabase, 'error', 'payment', 'Payment failed', data, error)

// Add Sentry event ID to system logs for correlation
const sentryEventId = Sentry.captureException(error)
await supabase.from('system_logs').insert({
  ...logData,
  sentry_event_id: sentryEventId,
})
```

---

## ✅ Setup Checklist

- [ ] Sentry account created
- [ ] Project created in Sentry
- [ ] DSN copied
- [ ] Environment variables set (local & Vercel)
- [ ] Sentry auth token generated
- [ ] Auth token added to Vercel
- [ ] Test error triggered and verified in Sentry
- [ ] Alerts configured (Slack/Email)
- [ ] Team invited to Sentry project
- [ ] Source maps uploading correctly

---

## 📚 Resources

- **Sentry Dashboard**: https://sentry.io/organizations/YOUR_ORG/issues/
- **Sentry React Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Sentry Performance**: https://docs.sentry.io/product/performance/
- **Sentry Alerts**: https://docs.sentry.io/product/alerts/

---

**Next Steps**: 
1. Create Sentry account
2. Get DSN
3. Add to `.env.local` and Vercel
4. Deploy and test
5. Configure alerts

**Status**: 🔄 AWAITING SENTRY CREDENTIALS

