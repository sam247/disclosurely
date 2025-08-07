
-- First, let's see what tables actually exist and their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('reports', 'organizations', 'organization_links', 'profiles')
ORDER BY table_name, ordinal_position;

-- Check if we have any existing RLS policies on reports
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'reports';

-- Let's also check what's actually in the organization_links table
SELECT id, organization_id, link_token, is_active, expires_at, usage_limit, usage_count
FROM organization_links 
WHERE link_token = 'bucuc1ckrk'
LIMIT 1;
