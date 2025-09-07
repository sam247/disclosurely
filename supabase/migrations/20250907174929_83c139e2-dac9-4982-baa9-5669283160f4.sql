-- Phase 4 Final: Fix Remaining Critical Security Issues (Corrected)

-- 1. Fix profiles table - Already fixed, skip this section

-- 2. Fix reports table - Use different policy names to avoid conflicts
DROP POLICY IF EXISTS "Case handlers can view reports in their org" ON reports;
DROP POLICY IF EXISTS "Case handlers can update reports in their org" ON reports;

-- Create role-based access policies for reports with new names
CREATE POLICY "Authorized case handlers can view org reports" 
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

CREATE POLICY "Authorized case handlers can update org reports" 
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
DROP POLICY IF EXISTS "Only super admins can view audit logs" ON audit_logs;

-- Only super admins can view audit logs
CREATE POLICY "Audit logs restricted to super admins only" 
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
DROP POLICY IF EXISTS "Only super admins can view security alerts" ON security_alerts;
DROP POLICY IF EXISTS "Only super admins can view security events" ON security_events;

-- Create new restrictive policies
CREATE POLICY "Security alerts restricted to super admins" 
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

CREATE POLICY "Security events restricted to super admins" 
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