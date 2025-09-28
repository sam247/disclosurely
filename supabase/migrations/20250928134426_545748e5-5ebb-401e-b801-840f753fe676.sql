-- Fix audit_logs security vulnerability by implementing stricter RLS policies
-- The current policies allow regular users to view their own audit logs, which could expose sensitive security data

-- Drop existing potentially problematic policies
DROP POLICY IF EXISTS "Users can view their own audit logs only" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;

-- Create a single, more restrictive policy that only allows super admins to view audit logs
-- This prevents regular users from accessing any audit log data, which could contain sensitive information
CREATE POLICY "Only super admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'::user_role 
    AND p.is_active = true
  )
);

-- Keep the existing system-only insert policy as it's secure
-- CREATE POLICY "System only can insert audit logs" already exists and is correct

-- Add a policy to prevent any updates or deletes to maintain audit integrity
CREATE POLICY "No updates or deletes allowed on audit logs" 
ON public.audit_logs 
FOR ALL 
USING (false);