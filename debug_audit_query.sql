-- Debug audit logs query to see what's actually in the database
-- This will help identify why only 1 record is being returned

-- First, let's see all audit logs for this organization
SELECT 
  id,
  created_at,
  organization_id,
  actor_id,
  actor_email,
  category,
  action,
  severity,
  target_type,
  target_id,
  summary,
  hash,
  chain_index
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e'
ORDER BY created_at DESC;

-- Check the total count
SELECT COUNT(*) as total_records
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e';

-- Check if there are any audit logs at all
SELECT COUNT(*) as total_all_records
FROM public.audit_logs;

-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- Test the exact query the frontend is using
SELECT *
FROM public.audit_logs
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e'
ORDER BY created_at DESC
LIMIT 50;
