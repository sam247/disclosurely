-- Phase 5 & 6: Remove hardcoded anon keys and add security event logging

-- Phase 5: Remove hardcoded anon key from notification function
-- Replace notify_new_report_via_email to remove hardcoded Bearer token
CREATE OR REPLACE FUNCTION public.notify_new_report_via_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create internal notification records only (no HTTP calls with hardcoded tokens)
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

  -- Phase 6: Log security event for new report submission
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
    
  RETURN NEW;
END;
$$;

-- Phase 6: Add function to log link validation failures
CREATE OR REPLACE FUNCTION public.log_link_validation_failure(
  p_link_token text,
  p_failure_reason text,
  p_organization_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM log_security_event(
    'link_validation_failure',
    NULL, -- user_id (anonymous attempt)
    p_organization_id,
    jsonb_build_object(
      'link_token', p_link_token,
      'failure_reason', p_failure_reason,
      'timestamp', now()
    ),
    p_ip_address,
    p_user_agent,
    'medium'
  );
END;
$$;

-- Phase 6: Add function to log messaging attempts 
CREATE OR REPLACE FUNCTION public.log_messaging_attempt(
  p_report_id uuid,
  p_sender_type text,
  p_success boolean,
  p_failure_reason text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_org_id uuid;
BEGIN
  -- Get organization ID from report
  SELECT organization_id INTO report_org_id FROM reports WHERE id = p_report_id;
  
  PERFORM log_security_event(
    'message_attempt',
    p_user_id,
    report_org_id,
    jsonb_build_object(
      'report_id', p_report_id,
      'sender_type', p_sender_type,
      'success', p_success,
      'failure_reason', p_failure_reason,
      'timestamp', now()
    ),
    p_ip_address,
    p_user_agent,
    CASE WHEN p_success THEN 'low' ELSE 'medium' END
  );
END;
$$;

-- Phase 5: Remove cron jobs that use hardcoded Bearer tokens
-- These should be handled by proper edge function scheduling or external cron
SELECT cron.unschedule('daily-unread-messages-check') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-unread-messages-check'
);
SELECT cron.unschedule('weekly-roundup') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-roundup'
);

-- Phase 6: Add security event logging trigger for failed authentication attempts
CREATE OR REPLACE FUNCTION public.log_anonymous_access_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This will be called by edge functions when validating anonymous report access
  -- Log successful anonymous report access
  PERFORM log_security_event(
    'anonymous_report_access',
    NULL, -- anonymous user
    NEW.organization_id,
    jsonb_build_object(
      'report_id', NEW.id,
      'tracking_id', NEW.tracking_id,
      'access_method', 'anonymous_token'
    ),
    NULL, -- ip will be provided by edge function
    NULL, -- user_agent will be provided by edge function  
    'low'
  );
  
  RETURN NEW;
END;
$$;