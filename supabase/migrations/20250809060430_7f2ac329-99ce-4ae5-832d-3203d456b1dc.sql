
-- Grant explicit INSERT permission to the anon role on the reports table
-- This addresses a common issue where RLS is enabled but basic privileges are missing
GRANT INSERT ON reports TO anon;

-- Also ensure anon can SELECT from organization_links (needed for the form to load)
GRANT SELECT ON organization_links TO anon;

-- Verify the grants are working
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'reports' AND grantee = 'anon';
