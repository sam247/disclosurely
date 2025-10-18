-- Fix RLS policy for audit_logs table
-- Run this in Supabase SQL Editor

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Organization members can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Organization members can insert audit logs" ON public.audit_logs;

-- Create more permissive policies that allow audit logging
CREATE POLICY "Allow audit log viewing for organization members"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.id
      FROM public.profiles p
      WHERE p.organization_id = audit_logs.organization_id
    )
  );

CREATE POLICY "Allow audit log insertion for authenticated users"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    organization_id IS NOT NULL
  );

-- Success message
SELECT 'RLS policies updated successfully!' as message;
