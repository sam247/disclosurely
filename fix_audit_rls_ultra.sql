-- ULTRA-PERMISSIVE RLS FIX for audit_logs
-- Run this in Supabase SQL Editor if the previous fix doesn't work

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Organization members can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Organization members can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log viewing for organization members" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log insertion for authenticated users" ON public.audit_logs;

-- Create ultra-permissive policies (for debugging - can be tightened later)
CREATE POLICY "Allow all authenticated users to view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Alternative: Temporarily disable RLS entirely (for testing)
-- ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Ultra-permissive RLS policies created! Audit logging should now work.' as message;
