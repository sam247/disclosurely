-- Simple audit logs check - no policy creation
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

-- 3. Test the exact query the frontend is making
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

-- 4. Check current RLS policies
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

-- Success message
SELECT 'Audit logs check complete!' as message;
