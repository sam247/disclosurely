-- Check if RLS is blocking inserts
-- First, let's see what user we're authenticated as
SELECT auth.uid() as current_user_id;

-- Check if the current user has access to the organization
SELECT p.id, p.organization_id, o.name as org_name
FROM public.profiles p
JOIN public.organizations o ON o.id = p.organization_id
WHERE p.id = auth.uid();

-- Check the RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- Try a simple insert to see if it works
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

-- Check the result
SELECT COUNT(*) as total_records
FROM public.audit_logs 
WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
