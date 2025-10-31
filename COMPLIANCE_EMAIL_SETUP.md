# 📧 Compliance Email Notifications Setup

## ✅ What's Deployed

The `send-compliance-reminders` Edge Function is now live and sends:

1. **Policy Review Reminders** - 30/7/3/1 days before review date
2. **High Risk Alerts** - New high-risk items (score ≥15) in last 24 hours
3. **Calendar Event Reminders** - 7/3/1 days before due date
4. **Overdue Alerts** - Daily summary of overdue policies & events

## 🎨 Email Design

All emails follow the beautiful blue-header template matching your existing notifications:
- Clean Disclosurely branding
- Color-coded urgency (blue/yellow/red)
- Professional layout
- Clear call-to-action buttons
- Footer with compliance text

## ⚙️ Setup Cron Job (Daily Execution)

### Option 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/cxmuzperkittvibslnff/functions
2. Click on `send-compliance-reminders`
3. Go to "Settings" tab
4. Add Cron trigger:
   - **Schedule**: `0 9 * * *` (9 AM daily)
   - **Timezone**: `UTC` (or your preferred timezone)
   - Click "Create Cron Job"

### Option 2: External Cron Service (Alternative)

Use GitHub Actions, Vercel Cron, or any cron service to hit:
```
POST https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-compliance-reminders
Authorization: Bearer YOUR_ANON_KEY
```

### Option 3: Database Trigger (Future)

Consider using `pg_cron` extension in Supabase for database-level scheduling.

## 📊 Monitoring

The function logs:
- ✅ Number of each email type sent
- ⚠️  Any errors encountered
- 📋 Policy/risk/event counts

View logs in Supabase Dashboard → Functions → send-compliance-reminders → Logs

## 🧪 Testing

To test immediately (without waiting for cron):

```bash
curl -X POST \
  'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-compliance-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

Or use the "Invoke" button in Supabase Dashboard.

## 📧 Email Recipients

Emails are sent to:
- **All org_admin users** in each organization
- Filtered by organization_id for multi-tenancy
- Only users with valid email addresses

## 🎯 Customization

To customize reminder timing, edit:
```typescript
// Policy reminders: [30, 7, 3, 1] days
// Calendar reminders: [7, 3, 1] days
// Risk alerts: Last 24 hours, score ≥15
```

## 🔐 Environment Variables Required

The function uses:
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `RESEND_API_KEY` ✅

All already configured in your Supabase project.

## 🚀 Next Steps

1. **Set up cron job** (see Option 1 above)
2. **Test with real data** - Add a policy with review date tomorrow
3. **Monitor for 1 week** - Check logs daily
4. **Adjust timing** if needed (e.g., send at 8 AM instead of 9 AM)
5. **Add user preferences** (future: let users choose notification frequency)

## 💡 Future Enhancements

- [ ] User notification preferences (daily digest vs. instant)
- [ ] Slack/Teams integration
- [ ] Weekly compliance summary emails
- [ ] Escalation workflows (if still overdue after X days)
- [ ] Custom reminder schedules per organization
- [ ] Email templates per organization (white-label)

---

**Status**: ✅ Deployed & Ready
**Function URL**: https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-compliance-reminders
**Last Updated**: Oct 31, 2025

