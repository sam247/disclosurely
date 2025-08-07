-- Check RLS and policy details
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced,
    (SELECT count(*) FROM pg_policy WHERE polrelid = c.oid) as policy_count,
    (SELECT array_agg(polname) FROM pg_policy WHERE polrelid = c.oid) as policy_names
FROM 
    pg_class c
JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    c.relname = 'reports' 
    AND n.nspname = 'public';

-- Comprehensive RLS Policy for Reports
-- Ensure RLS is fully enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_report_submissions" ON public.reports;
DROP POLICY IF EXISTS "Organization members can delete reports" ON public.reports;
DROP POLICY IF EXISTS "Organization members can update reports" ON public.reports;
DROP POLICY IF EXISTS "Organization members can view reports" ON public.reports;

-- Create a new comprehensive policy for submissions
CREATE POLICY "allow_report_submissions" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Ensure basic required fields are present
  organization_id IS NOT NULL 
  AND tracking_id IS NOT NULL 
  AND title IS NOT NULL 
  AND encrypted_content IS NOT NULL
);

-- Recreate organization member policies
CREATE POLICY "Organization members can view reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (organization_id IN ( 
  SELECT profiles.organization_id
  FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_active = true))
));

CREATE POLICY "Organization members can update reports" 
ON public.reports 
FOR UPDATE 
TO authenticated
USING (organization_id IN ( 
  SELECT profiles.organization_id
  FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_active = true))
));

CREATE POLICY "Organization members can delete reports" 
ON public.reports 
FOR DELETE 
TO authenticated
USING (organization_id IN ( 
  SELECT profiles.organization_id
  FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_active = true))
));