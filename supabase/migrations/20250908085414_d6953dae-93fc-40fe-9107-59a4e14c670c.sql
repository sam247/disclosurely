-- Update the notify_new_report_via_email function to remove edge function call
-- since we're now using direct Supabase SMTP integration
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Note: Email notifications are now handled by Supabase's built-in SMTP
  -- No longer calling external edge function
    
  RETURN NEW;
END;
$function$;