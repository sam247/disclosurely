-- Check if the email notification trigger exists and recreate it properly
DROP TRIGGER IF EXISTS trigger_new_report_email_notification ON reports;

-- Create or replace the function that handles new report email notifications
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create internal notification records first
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    NEW.organization_id,
    NEW.id,
    'new_report',
    'New Report Submitted',
    'A new report "' || NEW.title || '" has been submitted.',
    jsonb_build_object('tracking_id', NEW.tracking_id, 'report_type', NEW.report_type)
  FROM profiles p
  WHERE p.organization_id = NEW.organization_id 
    AND p.is_active = true
    AND p.role IN ('admin', 'case_handler', 'org_admin');

  -- Log security event for new report submission
  PERFORM log_security_event(
    'report_submitted',
    NULL, -- user_id (anonymous)
    NEW.organization_id,
    jsonb_build_object(
      'report_id', NEW.id,
      'tracking_id', NEW.tracking_id,
      'report_type', NEW.report_type,
      'submitted_via_link', NEW.submitted_via_link_id IS NOT NULL
    ),
    NULL, -- ip_address (will be added by edge function)
    NULL, -- user_agent (will be added by edge function)
    'medium'
  );

  -- Call the email notification edge function via webhook
  PERFORM net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-notification-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1OTUwMSwiZXhwIjoyMDY1ODM1NTAxfQ.dYJ0qN7R6h_l4eZwvxrWXF_vq7Yv10nA-Tl8cZ6-bNQ'
    ),
    body := jsonb_build_object('reportId', NEW.id)
  );
    
  RETURN NEW;
END;
$function$;

-- Create the trigger that calls the email notification function
CREATE TRIGGER trigger_new_report_email_notification
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION notify_new_report_via_email();