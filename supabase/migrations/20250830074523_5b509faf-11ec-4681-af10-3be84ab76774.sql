
-- Phase 1: Security fixes for RLS policies

-- 1. Fix audit_logs RLS - restrict access to own logs and org admins only
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Org admins can view organization audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'org_admin') 
    AND p.is_active = true
));

-- 2. Fix organizations RLS - remove overly permissive policies
DROP POLICY IF EXISTS "orgs_select_policy" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_policy" ON public.organizations;  
DROP POLICY IF EXISTS "orgs_insert_policy" ON public.organizations;

-- Keep the existing public branding policy (this is needed for anonymous submissions)
-- Add proper member access policy
CREATE POLICY "Organization members can view their organization" 
ON public.organizations 
FOR SELECT 
USING (id IN (
  SELECT organization_id FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_active = true
));

-- Org admins can update their organization
CREATE POLICY "Org admins can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (id IN (
  SELECT organization_id FROM profiles 
  WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'org_admin') 
    AND profiles.is_active = true
))
WITH CHECK (id IN (
  SELECT organization_id FROM profiles 
  WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'org_admin') 
    AND profiles.is_active = true
));

-- 3. Fix subscribers RLS - restrict to own records only
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "Users can update own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email())
WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR email = auth.email());
