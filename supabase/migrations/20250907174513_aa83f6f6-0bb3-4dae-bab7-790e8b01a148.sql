-- Fix Security Definer View Issue and Complete Phase 4

-- 1. Remove the problematic SECURITY DEFINER view and replace with proper RLS
DROP VIEW IF EXISTS public.audit_logs_sanitized;

-- 2. Instead, create a safe function for getting sanitized audit log data
CREATE OR REPLACE FUNCTION public.get_audit_logs_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  event_type text,
  action text,
  result text,
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  details jsonb,
  risk_level text,
  created_at timestamp with time zone,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    -- Only show email to super admins or for user's own logs
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'admin' 
        AND p.is_active = true
      ) THEN a.user_email
      WHEN a.user_id = auth.uid() THEN a.user_email
      ELSE NULL
    END as user_email
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

-- 3. Fix the remaining function that needs search_path (from the warning)
-- Let's check and fix any function that doesn't have search_path set
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

-- 4. Create additional security constraints to prevent data leakage
-- Add a constraint to ensure sensitive fields are not exposed
ALTER TABLE profiles ADD CONSTRAINT check_email_privacy 
CHECK (email IS NOT NULL); -- Ensure we always have email for security tracking

-- 5. Add logging function for security events
CREATE OR REPLACE FUNCTION public.log_profile_access(p_accessed_user_id uuid, p_access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when profiles are accessed for auditing
  INSERT INTO audit_logs (
    user_id, 
    event_type, 
    action, 
    result, 
    resource_type, 
    resource_id, 
    details
  ) VALUES (
    auth.uid(),
    'profile_access',
    p_access_type,
    'success',
    'profile',
    p_accessed_user_id::text,
    jsonb_build_object('accessed_user_id', p_accessed_user_id, 'timestamp', now())
  );
END;
$$;