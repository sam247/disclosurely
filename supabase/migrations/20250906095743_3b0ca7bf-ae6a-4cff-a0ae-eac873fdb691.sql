-- Phase 3: Complete remaining critical security fixes

-- 1. Fix remaining function search_path warnings
DROP FUNCTION IF EXISTS public.user_has_role(uuid, user_role);
CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND role = p_role AND is_active = true
  );
END;
$$;

-- 2. Fix other functions with search_path issues
DROP FUNCTION IF EXISTS public.log_login_attempt(text, text, text, boolean, text);
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

-- 3. Fix log_security_event function
DROP FUNCTION IF EXISTS public.log_security_event(text, uuid, uuid, jsonb, text, text, text);
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

-- 4. Add security constraint to ensure security_alerts require organization_id
ALTER TABLE public.security_alerts ADD CONSTRAINT security_alerts_org_required 
CHECK (organization_id IS NOT NULL);

-- 5. Create secure RPC for link validation to prevent enumeration
CREATE OR REPLACE FUNCTION public.get_link_branding(p_link_token text)
RETURNS TABLE(
  organization_name text,
  brand_color text,
  custom_logo_url text,
  valid boolean
)
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