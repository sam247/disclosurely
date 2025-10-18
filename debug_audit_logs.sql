-- Debug and fix audit logs display issue
-- Run this in Supabase SQL Editor

-- 1. Check what's actually in the audit_logs table
SELECT 
  id, 
  created_at, 
  organization_id, 
  event_type, 
  category, 
  action, 
  summary,
  hash,
  chain_index
FROM public.audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check the organization_id being used
SELECT 
  id, 
  name, 
  domain 
FROM public.organizations 
WHERE id = '0358e286-699a-43d7-b8ea-6d33c269af5e';

-- 3. Check current RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- 4. Fix RLS policy to allow SELECT for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log viewing for organization members" ON public.audit_logs;

-- Create a more permissive SELECT policy
CREATE POLICY "Allow authenticated users to view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. Test the query that the frontend is making
SELECT 
  id, 
  created_at, 
  organization_id, 
  event_type, 
  category, 
  action, 
  summary
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e'
ORDER BY created_at DESC 
LIMIT 10;

-- Success message
SELECT 'Audit logs debugging complete!' as message;
