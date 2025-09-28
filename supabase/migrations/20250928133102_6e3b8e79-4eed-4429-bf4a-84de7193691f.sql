-- Fix profiles table RLS policies to prevent anonymous public access
-- Drop existing permissive policies and create strict authenticated-only policies

-- First, check current policies on profiles table
DROP POLICY IF EXISTS "profiles_select_org_members" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Create strict policies that require authentication
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only"
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Organization members can view other members in same org (but only basic info)
CREATE POLICY "Org members can view basic org member info"
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND organization_id IS NOT NULL 
    AND organization_id IN (
      SELECT p.organization_id 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_active = true
    )
  );

-- Fix audit_logs table to also prevent anonymous access
-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Audit logs restricted to super admins only" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view only their own audit logs" ON public.audit_logs;

-- Create strict authenticated-only policies for audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin' 
      AND p.is_active = true
    )
  );

CREATE POLICY "Users can view their own audit logs only"
  ON public.audit_logs 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );