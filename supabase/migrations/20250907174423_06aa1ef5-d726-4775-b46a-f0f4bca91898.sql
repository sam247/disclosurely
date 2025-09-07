-- Phase 4: Fix Critical Data Exposure Issues

-- 1. Fix audit_logs table - Remove public read access to email addresses
-- Current policy "Org admins can view organization audit logs" may be too broad
-- Restrict audit log access to only super admins and users viewing their own logs

-- Drop existing policies
DROP POLICY IF EXISTS "Org admins can view organization audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

-- Create more restrictive policies for audit_logs
CREATE POLICY "Super admins can view all audit logs" 
ON audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  )
);

CREATE POLICY "Users can view only their own audit logs" 
ON audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Fix profiles table - Remove overly broad public access
-- Current policy may allow too much access - need to restrict to organization members only

-- Check existing policies and update if needed
-- Users should only see profiles within their organization context

-- Create a more restrictive policy for profiles viewing
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;

-- Recreate with proper restrictions
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Add policy for organization members to view profiles in their org (if needed for functionality)
CREATE POLICY "Organization members can view profiles in their org" 
ON profiles 
FOR SELECT 
USING (
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_active = true
  )
);

-- 3. Add additional security constraints
-- Ensure audit_logs user_email field is properly protected
-- Add a view for sanitized audit logs if needed by admins

CREATE OR REPLACE VIEW public.audit_logs_sanitized AS
SELECT 
  id,
  user_id,
  event_type,
  action,
  result,
  resource_type,
  resource_id,
  ip_address,
  user_agent,
  details,
  risk_level,
  created_at,
  -- Mask email addresses for non-super-admin users
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.is_active = true
    ) THEN user_email
    WHEN user_id = auth.uid() THEN user_email
    ELSE NULL
  END as user_email
FROM audit_logs
WHERE 
  -- Only show logs user has permission to see
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  );

-- Grant access to the sanitized view
GRANT SELECT ON public.audit_logs_sanitized TO authenticated;

-- 4. Create function to safely get user profile information
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  role user_role,
  is_active boolean,
  organization_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return profile if user has permission to see it
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    p.is_active,
    p.organization_id
  FROM profiles p
  WHERE p.id = p_user_id
  AND (
    -- User can see their own profile
    p.id = auth.uid()
    -- Or user is in same organization
    OR p.organization_id IN (
      SELECT org_p.organization_id 
      FROM profiles org_p 
      WHERE org_p.id = auth.uid() 
      AND org_p.is_active = true
    )
  );
END;
$$;