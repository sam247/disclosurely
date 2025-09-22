-- Fix 500 error on report submission caused by notify_new_report_via_email inserting
-- incomplete rows into email_notifications (subject/email_address NOT NULL)
--
-- Strategy: keep internal notifications + security log, but remove the
-- email_notifications insert from the function. Email delivery is handled by
-- the edge function `send-notification-emails` invoked after report creation.

-- Replace the function while preserving SECURITY DEFINER and behavior
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create internal notification records for org members
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

  -- Log security event
  PERFORM log_security_event(
    'report_submitted',
    NULL,
    NEW.organization_id,
    jsonb_build_object(
      'report_id', NEW.id,
      'tracking_id', NEW.tracking_id,
      'report_type', NEW.report_type,
      'submitted_via_link', NEW.submitted_via_link_id IS NOT NULL
    ),
    NULL,
    NULL,
    'medium'
  );

  -- IMPORTANT: Do not insert into email_notifications here.
  -- Email sending is managed by the edge function 'send-notification-emails'.
  RETURN NEW;
END;
$function$;
