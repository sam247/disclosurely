-- Update the notification trigger to call our new case notification edge function
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Create internal notification record
  INSERT INTO public.notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    NEW.organization_id,
    NEW.id,
    'new_report',
    'New Report Submitted',
    'A new report "' || NEW.title || '" has been submitted.',
    jsonb_build_object('tracking_id', NEW.tracking_id, 'report_type', NEW.report_type)
  FROM public.profiles p
  WHERE p.organization_id = NEW.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');

  -- Call the edge function to send email notifications asynchronously
  PERFORM net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-new-case-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTk1MDEsImV4cCI6MjA2NTgzNTUwMX0.NxqrBnzSR-dxfWw4mn7nIHB-QTt900MtAh96fCCm1Lg"}'::jsonb,
    body := jsonb_build_object('reportId', NEW.id)
  );
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS notify_new_report ON public.reports;
CREATE TRIGGER notify_new_report
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION notify_new_report_via_email();

-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily check for unread messages (every day at 9 AM UTC)
SELECT cron.schedule(
  'daily-unread-messages-check',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/check-unread-messages',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTk1MDEsImV4cCI6MjA2NTgzNTUwMX0.NxqrBnzSR-dxfWw4mn7nIHB-QTt900MtAh96fCCm1Lg"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Schedule weekly roundup (every Monday at 8 AM UTC)  
SELECT cron.schedule(
  'weekly-roundup',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-weekly-roundup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTk1MDEsImV4cCI6MjA2NTgzNTUwMX0.NxqrBnzSR-dxfWw4mn7nIHB-QTt900MtAh96fCCm1Lg"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);