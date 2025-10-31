# Policy Acknowledgment Auto-Reminders Setup

## Cron Job Configuration

To enable automatic daily reminders for pending policy acknowledgments, you need to set up a cron job in Supabase.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]
   - Go to **Database** → **Cron Jobs** (via pg_cron extension)

2. **Enable pg_cron Extension** (if not already enabled)
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

3. **Create the Cron Job**
   Run this SQL in the SQL Editor:
   
   ```sql
   -- Schedule daily reminders at 9:00 AM UTC
   SELECT cron.schedule(
     'send-policy-reminders-daily',  -- Job name
     '0 9 * * *',                      -- Cron expression (9 AM daily)
     $$
     SELECT
       net.http_post(
         url:='https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-policy-notifications',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR_SERVICE_ROLE_KEY]", "x-cron-job": "true"}'::jsonb,
         body:='{"type": "reminder"}'::jsonb
       ) as request_id;
     $$
   );
   ```

4. **Replace Placeholders**
   - `[YOUR_PROJECT_REF]`: Your Supabase project reference (e.g., `abcdefghijklmnop`)
   - `[YOUR_SERVICE_ROLE_KEY]`: Your Supabase service role key (found in Project Settings → API)

5. **Verify the Cron Job**
   ```sql
   -- List all cron jobs
   SELECT * FROM cron.job;
   
   -- Check cron job run history
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'send-policy-reminders-daily' 
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

## Cron Schedule Options

You can adjust the schedule to fit your needs:

- **Every day at 9 AM**: `0 9 * * *`
- **Monday-Friday at 9 AM**: `0 9 * * 1-5`
- **Twice daily (9 AM & 5 PM)**: `0 9,17 * * *`
- **Every 2 hours (business hours)**: `0 9-17/2 * * *`

## Manual Testing

Test the reminder system manually via API:

```bash
curl -X POST \
  'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-policy-notifications' \
  -H 'Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"type": "reminder"}'
```

## Monitoring

- **Check Logs**: Supabase Dashboard → Edge Functions → `send-policy-notifications` → Logs
- **Email Delivery**: Check Resend dashboard for email delivery status
- **Reminder Tracking**: The `policy_assignments` table tracks when reminders were sent via `reminder_sent_at`

## Notes

- Reminders are sent only for policies with status `due_soon` or `overdue`
- Each user receives ONE consolidated email with all their pending policies
- The system automatically updates `reminder_sent_at` after sending
- No duplicate reminders will be sent for the same assignment until manually reset

