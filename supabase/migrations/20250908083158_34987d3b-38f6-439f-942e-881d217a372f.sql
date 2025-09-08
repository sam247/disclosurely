-- Update notification function to call edge function properly
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create internal notification records
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

  -- Trigger email notifications via edge function (asynchronous)
  -- Use service role token for internal function calls
  PERFORM net.http_post(
    url := 'https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-notification-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('reportId', NEW.id)
  );
    
  RETURN NEW;
END;
$$;