-- Fix any remaining SECURITY DEFINER functions missing search_path
-- This addresses the Semgrep security finding about missing search_path

-- Check and fix any functions that might still be missing search_path
-- We'll recreate the most commonly used functions to ensure they have proper search_path

-- Fix get_organization_by_tracking_id function
CREATE OR REPLACE FUNCTION public.get_organization_by_tracking_id(p_tracking_id text)
RETURNS TABLE(organization_id uuid, organization_name text, logo_url text, custom_logo_url text, brand_color text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.organization_id,
    o.name as organization_name,
    o.logo_url,
    o.custom_logo_url,
    o.brand_color
  FROM reports r
  JOIN organizations o ON o.id = r.organization_id
  WHERE r.tracking_id = p_tracking_id
  LIMIT 1;
END;
$function$;

-- Fix log_messaging_attempt function
CREATE OR REPLACE FUNCTION public.log_messaging_attempt(
  p_report_id uuid,
  p_sender_type text,
  p_success boolean,
  p_failure_reason text DEFAULT NULL::text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_ip_address text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO audit_logs (
    event_type,
    category,
    action,
    severity,
    actor_type,
    actor_id,
    actor_ip_address,
    actor_user_agent,
    target_type,
    target_id,
    summary,
    description,
    metadata
  ) VALUES (
    'messaging_attempt',
    'security',
    CASE WHEN p_success THEN 'success' ELSE 'failure' END,
    CASE WHEN p_success THEN 'low' ELSE 'medium' END,
    p_sender_type,
    p_user_id,
    NULL, -- Set to NULL to avoid inet type issues
    p_user_agent,
    'report',
    p_report_id,
    CASE WHEN p_success THEN 'Message sent successfully' ELSE 'Message send failed' END,
    CASE WHEN p_success THEN 'Message sent via secure messaging' ELSE 'Failed to send message: ' || COALESCE(p_failure_reason, 'Unknown error') END,
    jsonb_build_object(
      'success', p_success,
      'failure_reason', p_failure_reason
    )
  );
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_organization_id uuid DEFAULT NULL::uuid,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text,
  p_severity text DEFAULT 'low'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO audit_logs (
    event_type,
    category,
    action,
    severity,
    actor_type,
    actor_id,
    actor_ip_address,
    actor_user_agent,
    target_type,
    target_id,
    summary,
    description,
    metadata
  ) VALUES (
    p_event_type,
    'security',
    'log',
    p_severity,
    CASE WHEN p_user_id IS NOT NULL THEN 'user' ELSE 'system' END,
    p_user_id,
    NULL, -- Set to NULL to avoid inet type issues
    p_user_agent,
    'system',
    p_organization_id,
    'Security event: ' || p_event_type,
    'Security event logged: ' || p_event_type,
    p_details
  );
END;
$function$;

-- Fix notify_new_message function (trigger function)
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  report_record RECORD;
BEGIN
  SELECT r.*, o.id as org_id INTO report_record
  FROM reports r
  JOIN organizations o ON r.organization_id = o.id
  WHERE r.id = NEW.report_id;
  
  IF NEW.sender_type = 'organization' THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO notifications (user_id, organization_id, report_id, type, title, message, metadata)
  SELECT 
    p.id,
    report_record.org_id,
    NEW.report_id,
    'new_message',
    'New Message on Report',
    'New message received on report "' || report_record.title || '"',
    jsonb_build_object('tracking_id', report_record.tracking_id, 'sender_type', NEW.sender_type)
  FROM profiles p
  JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.organization_id = report_record.org_id 
    AND p.is_active = true
    AND ur.role IN ('admin', 'case_handler', 'org_admin');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
