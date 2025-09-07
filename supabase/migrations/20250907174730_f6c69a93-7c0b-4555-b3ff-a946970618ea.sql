-- Phase 4 Final: Fix Remaining Critical Security Issues

-- 1. Fix profiles table - Remove email exposure to organization members
DROP POLICY IF EXISTS "Organization members can view basic profile info in their org" ON profiles;

-- Create a secure function to get minimal profile info without email exposure
CREATE OR REPLACE FUNCTION public.get_profile_minimal(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  role user_role,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return minimal profile info, no email addresses
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    p.is_active
  FROM profiles p
  WHERE p.id = p_user_id
  AND (
    -- User can see their own full profile
    p.id = auth.uid()
    -- Or org members can see basic info only (no email)
    OR p.organization_id IN (
      SELECT org_p.organization_id 
      FROM profiles org_p 
      WHERE org_p.id = auth.uid() 
      AND org_p.is_active = true
    )
  );
END;
$$;

-- 2. Fix reports table - Restrict access to authorized case handlers only
DROP POLICY IF EXISTS "Authenticated users can view their org reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can update their org reports" ON reports;

-- Create role-based access policies for reports
CREATE POLICY "Case handlers can view reports in their org" 
ON reports 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'case_handler', 'org_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Case handlers can update reports in their org" 
ON reports 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT p.organization_id 
    FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'case_handler', 'org_admin')
    AND p.is_active = true
  )
);

-- 3. Further restrict audit logs access
DROP POLICY IF EXISTS "Super admins only can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view only their own audit entries" ON audit_logs;

-- Only super admins can view audit logs, users cannot see their own for security
CREATE POLICY "Only super admins can view audit logs" 
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

-- 4. Restrict security events and alerts to security admins only
DROP POLICY IF EXISTS "Organization members can view security alerts" ON security_alerts;
DROP POLICY IF EXISTS "Org admins can view organization security events" ON security_events;
DROP POLICY IF EXISTS "Users can view their own security events" ON security_events;

-- Only super admins can view security events and alerts
CREATE POLICY "Only super admins can view security alerts" 
ON security_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  )
);

CREATE POLICY "Only super admins can view security events" 
ON security_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.is_active = true
  )
);

-- 5. Restrict link analytics to minimize user tracking exposure
DROP POLICY IF EXISTS "Organization members can view their link analytics" ON link_analytics;

-- Create aggregated view function instead of direct access
CREATE OR REPLACE FUNCTION public.get_link_analytics_summary(p_link_id uuid)
RETURNS TABLE (
  link_id uuid,
  total_views bigint,
  unique_ips bigint,
  common_referrers jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return aggregated data only, no individual tracking details
  RETURN QUERY
  SELECT 
    la.link_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT la.ip_address) as unique_ips,
    jsonb_agg(DISTINCT la.referrer) FILTER (WHERE la.referrer IS NOT NULL) as common_referrers
  FROM link_analytics la
  WHERE la.link_id = p_link_id
  AND la.link_id IN (
    SELECT ol.id FROM organization_links ol
    JOIN profiles p ON p.organization_id = ol.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
  GROUP BY la.link_id;
END;
$$;