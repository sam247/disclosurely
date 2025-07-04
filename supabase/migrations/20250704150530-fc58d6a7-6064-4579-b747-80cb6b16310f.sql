
-- Enable the required extensions for cron jobs
SELECT cron.schedule(
  'check-unread-messages-hourly',
  '0 * * * *', -- Run every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://cxmuzperkittvibslnff.supabase.co/functions/v1/check-unread-messages',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1OTUwMSwiZXhwIjoyMDY1ODM1NTAxfQ.vqQjLF7BKfWaWM5eV97HgCO_9lBRD4UvCBAL0Qy-JXQ"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
