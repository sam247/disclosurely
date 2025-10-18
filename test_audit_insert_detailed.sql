-- Test inserting an audit log with the exact same data the frontend is sending
-- This will help identify any constraint violations

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
  before_state,
  after_state,
  metadata,
  organization_id,
  hash,
  previous_hash,
  chain_index
) VALUES (
  'case.update',
  'case_management',
  'update',
  'medium',
  'user',
  '0358e286-699a-43d7-b8ea-6d33c269af5e',
  'sam@betterranking.co.uk',
  'case',
  '0358e286-699a-43d7-b8ea-6d33c269af5e',
  'Test Case',
  'Case update: Test Case',
  '{"status": "new"}',
  '{"status": "reviewing", "updated_at": "2025-10-18T17:34:00.000Z"}',
  '{"action": "status_change", "previous_status": "new"}',
  '0358e286-699a-43d7-b8ea-6d33c269af5e',
  NULL, -- Let trigger handle this
  NULL, -- Let trigger handle this
  NULL  -- Let trigger handle this
);

-- Check if it was inserted
SELECT COUNT(*) as total_records
FROM public.audit_logs 
WHERE organization_id = '0358e286-699a-43d7-b8ea-6d33c269af5e';
