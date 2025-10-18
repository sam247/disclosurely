-- Test audit log insertion directly
-- Run this in Supabase SQL Editor

-- 1. Try to insert a test audit log directly
INSERT INTO public.audit_logs (
  event_type,
  category,
  action,
  severity,
  actor_type,
  actor_id,
  actor_email,
  organization_id,
  target_type,
  target_id,
  summary,
  hash,
  previous_hash,
  chain_index
) VALUES (
  'test.event',
  'system',
  'create',
  'low',
  'system',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '0358e286-699a-43d7-b8ea-6d33c269af5e',
  'test',
  '00000000-0000-0000-0000-000000000000',
  'Test audit log entry',
  'test-hash-123',
  'previous-hash-123',
  1
);

-- 2. Check if it was inserted
SELECT 
  id, 
  created_at, 
  organization_id, 
  event_type, 
  summary
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e'
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if the trigger is working
SELECT 
  id, 
  hash,
  previous_hash,
  chain_index
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e'
ORDER BY created_at DESC 
LIMIT 1;

-- Success message
SELECT 'Test audit log insertion complete!' as message;
