-- Test script to verify audit trail system is working
-- Run this after applying the main migration

-- Test 1: Insert a test audit log
INSERT INTO public.audit_logs (
  organization_id,
  actor_id,
  actor_email,
  actor_type,
  event_type,
  category,
  action,
  severity,
  target_type,
  target_id,
  target_name,
  summary,
  description,
  before_state,
  after_state,
  changes,
  request_context,
  metadata
) VALUES (
  (SELECT id FROM public.organizations LIMIT 1), -- Use first org
  (SELECT id FROM public.profiles LIMIT 1), -- Use first user
  'test@example.com',
  'user',
  'test.audit_system',
  'system',
  'create',
  'low',
  'test',
  gen_random_uuid(),
  'Test Audit Entry',
  'Test audit log entry to verify system is working',
  'This is a test entry to verify the audit trail system is functioning correctly',
  '{"status": "before"}',
  '{"status": "after"}',
  '{"field": "status", "old": "before", "new": "after"}',
  '{"ip": "127.0.0.1", "user_agent": "test"}',
  '{"test": true}'
);

-- Test 2: Verify the audit log was created with proper hash
SELECT 
  id,
  created_at,
  event_type,
  summary,
  hash,
  previous_hash,
  chain_index
FROM public.audit_logs
WHERE event_type = 'test.audit_system'
ORDER BY created_at DESC
LIMIT 1;

-- Test 3: Verify chain integrity
SELECT * FROM verify_audit_chain(
  (SELECT id FROM public.organizations LIMIT 1)
);

-- Test 4: Check if report_status enum includes 'reviewing'
SELECT enum_range('public.report_status'::regtype);

-- Success message
SELECT 'Audit trail system test completed successfully!' as message;
