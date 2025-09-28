-- Handle dependencies properly before securing functions
-- First drop policies that depend on functions, then recreate them securely

-- Drop and recreate the organization policy that depends on user_is_in_organization
DROP POLICY IF EXISTS "org_admins_can_manage" ON public.organizations;

-- Now we can safely update the function
CREATE OR REPLACE FUNCTION public.user_is_in_organization(org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NOT NULL THEN EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = org_id 
      AND is_active = true
    )
    ELSE false
  END;
$$;

-- Recreate the organization policy with the updated function
CREATE POLICY "org_admins_can_manage"
  ON public.organizations
  FOR ALL
  USING (
    user_is_in_organization(id) AND 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = ANY(ARRAY['admin'::user_role, 'org_admin'::user_role]) 
      AND profiles.is_active = true
    )
  );

-- Secure the audit logs access function
CREATE OR REPLACE FUNCTION public.get_audit_logs_safe()
 RETURNS TABLE(id uuid, user_id uuid, event_type text, action text, result text, resource_type text, resource_id text, ip_address inet, user_agent text, details jsonb, risk_level text, created_at timestamp with time zone, user_email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated super admins
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  ) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.event_type,
    a.action,
    a.result,
    a.resource_type,
    a.resource_id,
    a.ip_address,
    a.user_agent,
    a.details,
    a.risk_level,
    a.created_at,
    -- Only show email to super admins
    a.user_email
  FROM audit_logs a
  WHERE 
    -- Users can only see their own logs or admins see all
    a.user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.is_active = true
    );
END;
$$;

-- Secure all logging functions to require proper authentication
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_organization_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_severity text DEFAULT 'low'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Only allow system (service role) or authenticated users
  IF auth.role() != 'service_role' AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
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

-- Secure login attempt logging to system only
CREATE OR REPLACE FUNCTION public.log_login_attempt(p_email text, p_ip_address text, p_user_agent text, p_success boolean, p_failure_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- Only allow system (service role) to log login attempts
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'System access only';
  END IF;
  
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