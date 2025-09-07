-- Complete Phase 4: Fix Final Function Search Path Issue

-- Find and fix any remaining functions without search_path
-- The linter is still showing 1 function, let's fix the common ones that might be missing

-- Fix log_login_attempt function
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email text, 
  p_ip_address text, 
  p_user_agent text, 
  p_success boolean, 
  p_failure_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (
    email, 
    ip_address, 
    user_agent, 
    success, 
    failure_reason
  ) VALUES (
    p_email,
    p_ip_address::inet,
    p_user_agent,
    p_success,
    p_failure_reason
  );
END;
$$;

-- Fix log_security_event function  
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text, 
  p_user_id uuid DEFAULT NULL, 
  p_organization_id uuid DEFAULT NULL, 
  p_details jsonb DEFAULT '{}', 
  p_ip_address text DEFAULT NULL, 
  p_user_agent text DEFAULT NULL, 
  p_severity text DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (
    event_type, 
    user_id, 
    organization_id, 
    details, 
    ip_address, 
    user_agent, 
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_organization_id,
    p_details,
    CASE WHEN p_ip_address IS NOT NULL THEN p_ip_address::inet ELSE NULL END,
    p_user_agent,
    p_severity
  );
END;
$$;

-- Fix validate_organization_link function
CREATE OR REPLACE FUNCTION public.validate_organization_link(link_id uuid)
RETURNS TABLE(valid boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_record organization_links%ROWTYPE;
BEGIN
  SELECT * INTO link_record FROM organization_links WHERE id = link_id;
  
  IF link_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Link not found';
    RETURN;
  END IF;
  
  IF link_record.is_active = false THEN
    RETURN QUERY SELECT false, 'Link is not active';
    RETURN;
  END IF;
  
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'Link has expired';
    RETURN;
  END IF;
  
  IF link_record.usage_limit IS NOT NULL AND link_record.usage_count >= link_record.usage_limit THEN
    RETURN QUERY SELECT false, 'Link usage limit reached';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Link is valid';
  RETURN;
END;
$$;

-- Fix get_link_branding function
CREATE OR REPLACE FUNCTION public.get_link_branding(p_link_token text)
RETURNS TABLE(organization_name text, brand_color text, custom_logo_url text, valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.name,
    o.brand_color,
    o.custom_logo_url,
    (ol.is_active = true 
     AND (ol.expires_at IS NULL OR ol.expires_at > now())
     AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
    ) as valid
  FROM organization_links ol
  JOIN organizations o ON o.id = ol.organization_id
  WHERE ol.link_token = p_link_token
  LIMIT 1;
END;
$$;