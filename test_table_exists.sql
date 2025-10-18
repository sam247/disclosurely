-- Simple test to check if audit_logs table exists and if we can insert
-- This will help identify the root cause

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'audit_logs'
) as table_exists;

-- If table exists, check its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current user and organization
SELECT 
  auth.uid() as current_user_id,
  p.organization_id,
  o.name as org_name
FROM public.profiles p
JOIN public.organizations o ON o.id = p.organization_id
WHERE p.id = auth.uid();

-- Try a simple insert to see what happens
INSERT INTO public.audit_logs (
  event_type,
  category,
  action,
  severity,
  actor_type,
  actor_id,
  actor_email,
  target_type,
  target_id,
  target_name,
  summary,
  organization_id
) VALUES (
  'test.event',
  'system',
  'create',
  'low',
  'system',
  auth.uid(),
  'test@example.com',
  'test',
  gen_random_uuid(),
  'Test Entry',
  'Test audit log entry',
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- Check if it was inserted
SELECT COUNT(*) as total_records
FROM public.audit_logs 
WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
