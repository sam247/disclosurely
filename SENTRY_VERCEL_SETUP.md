# 🚀 Sentry + Vercel Environment Variables Setup

## ✅ Your Sentry Project Details
- **Project Name**: `disclosurely-production`
- **DSN**: `https://c24f9f868f525e9c9206d551d4249d08@o4510273780187136.ingest.de.sentry.io/4510273790410832`
- **Region**: EU (Germany) - Great for GDPR compliance! 🇪🇺

---

## 📋 Step 1: Add to Vercel Environment Variables

Go to: https://vercel.com/your-username/disclosurely/settings/environment-variables

### **Required Variables** (for error tracking):

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SENTRY_DSN` | `https://c24f9f868f525e9c9206d551d4249d08@o4510273780187136.ingest.de.sentry.io/4510273790410832` | Production, Preview, Development |
| `VITE_SENTRY_ENVIRONMENT` | `production` | Production |
| `VITE_SENTRY_ENVIRONMENT` | `preview` | Preview |
| `VITE_SENTRY_ENVIRONMENT` | `development` | Development |

---

## 📋 Step 2: Add Source Maps Upload (Optional but Recommended)

This allows Sentry to show you the exact line of code that caused errors (unminified).

### Get Your Sentry Auth Token:
1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. **Name**: `Vercel Deployments`
4. **Scopes**: Check:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click "Create Token"
6. **Copy the token** (you won't see it again!)

### Add to Vercel:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SENTRY_AUTH_TOKEN` | `YOUR_TOKEN_HERE` | Production |
| `SENTRY_ORG` | `your-org-slug` | Production |
| `SENTRY_PROJECT` | `disclosurely-production` | Production |

**To find your org slug:**
- Look at your Sentry URL: `https://sentry.io/organizations/YOUR-ORG-SLUG/...`
- Or go to: Settings → General → Organization Slug

---

## 🧪 Step 3: Test Locally

### 1. Start your dev server:
```bash
npm run dev
```

### 2. Sentry should initialize and log:
```
✅ Sentry initialized: development
```

### 3. Test error capture by adding a button to your app:

**Add to any component** (e.g., Dashboard):
```typescript
import * as Sentry from "@sentry/react"

// In your component:
<button onClick={() => {
  try {
    throw new Error('🧪 Test Sentry Error - This is intentional!')
  } catch (error) {
    Sentry.captureException(error, {
      tags: { test: true, environment: 'manual-test' },
      level: 'error',
    })
    console.log('✅ Test error sent to Sentry!')
  }
}}>
  Test Sentry Error
</button>
```

### 4. Click the button, then check:
- **Sentry Dashboard**: https://sentry.io/organizations/your-org/issues/
- You should see the test error appear within seconds!

---

## 🚀 Step 4: Deploy to Production

### 1. Commit and push:
```bash
git add .
git commit -m "Add Sentry DSN to environment"
git push origin main
```

### 2. Vercel will automatically:
- Build your app with source maps
- Upload source maps to Sentry (if auth token is set)
- Deploy with Sentry enabled

### 3. Monitor in Sentry:
- Real errors will now appear in: https://sentry.io/organizations/your-org/issues/
- You'll get email/Slack alerts for new errors

---

## 📊 What You'll See in Sentry

### For Each Error:
1. **Error Message**: "Cannot read property 'x' of undefined"
2. **Stack Trace**: Exact file and line number (with source maps)
3. **User Context**: ID, email, organization
4. **Breadcrumbs**: Last 100 actions before error
5. **Device Info**: Browser, OS, screen size
6. **Tags**: Environment, subscription tier, org ID

### Example:
```
TypeError: Cannot read property 'name' of undefined
  at Dashboard.tsx:145:28
  at onClick
  
User: user@example.com (ID: abc-123)
Organization: Acme Corp (org_456)
Browser: Chrome 119.0.0.0
Tags: subscription_tier: pro, environment: production
```

---

## 🎯 Set Up Alerts (Recommended)

### 1. Go to your Sentry project:
https://sentry.io/organizations/your-org/projects/disclosurely-production/

### 2. Click "Alerts" → "Create Alert"

### Alert 1: New Issue Alert (Every Error)
- **Name**: "New Production Error"
- **When**: A new issue is created
- **Conditions**: Environment equals "production"
- **Actions**: 
  - ✅ Send email to: your-email@example.com
  - ✅ Send Slack notification (if connected)

### Alert 2: High Error Rate
- **Name**: "High Error Rate"
- **When**: Number of events is above 10 in 1 minute
- **Conditions**: Environment equals "production"
- **Actions**: Send email + Slack

### Alert 3: New Error Pattern
- **Name**: "First Time Seeing This Error"
- **When**: An issue is first seen
- **Actions**: Send Slack notification

---

## 💰 Stay Within Free Tier

### Current Config (in `src/main.tsx`):
```typescript
tracesSampleRate: 0.1,  // 10% of performance transactions
```

### Your Free Limits:
- ✅ **5,000 errors/month** - You'll use ~1,000-1,500
- ⚠️ **10,000 performance transactions/month** - You might exceed this

### If You Want to Stay 100% Free:
Modify `src/main.tsx` to disable performance monitoring:

```typescript
// Only track errors, no performance (stays free forever)
tracesSampleRate: 0,
```

Or reduce sampling even more:
```typescript
// Track only 5% of performance
tracesSampleRate: 0.05,
```

---

## ✅ Completion Checklist

- [x] Sentry project created: `disclosurely-production`
- [x] DSN obtained
- [x] DSN added to `.env.local`
- [ ] DSN added to Vercel (you need to do this)
- [ ] Auth token generated in Sentry
- [ ] Auth token added to Vercel
- [ ] Test error triggered locally
- [ ] Test error verified in Sentry dashboard
- [ ] Production deployment verified
- [ ] Alerts configured

---

## 🔗 Quick Links

- **Your Sentry Dashboard**: https://sentry.io/organizations/your-org/issues/
- **Sentry Settings**: https://sentry.io/settings/
- **Vercel Env Vars**: https://vercel.com/your-username/disclosurely/settings/environment-variables
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/

---

## 🆘 Troubleshooting

### "Sentry DSN not found" in console:
- Check `.env.local` file exists
- Restart dev server (`npm run dev`)
- Verify variable name: `VITE_SENTRY_DSN` (must start with `VITE_`)

### Errors not appearing in Sentry:
- Check you're in production mode or removed localhost filter
- Verify DSN is correct
- Check browser console for Sentry errors
- Try the test error button

### Source maps not uploading:
- Verify `SENTRY_AUTH_TOKEN` in Vercel
- Check token has correct scopes
- Look for "Uploading source maps" in Vercel build logs

---

**Status**: ✅ Ready to add to Vercel!  
**Next**: Add environment variables to Vercel and deploy 🚀

