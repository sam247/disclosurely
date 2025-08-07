
-- First, let's see what policies currently exist on the reports table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'reports' 
ORDER BY policyname;

-- Drop ALL existing INSERT policies for reports to start fresh
DROP POLICY IF EXISTS "allow_all_report_submissions" ON public.reports;
DROP POLICY IF EXISTS "anonymous_report_submissions" ON public.reports;
DROP POLICY IF EXISTS "organization_members_insert_reports" ON public.reports;

-- Create a single, simple INSERT policy that allows all insertions
CREATE POLICY "allow_report_insertions" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Ensure RLS is enabled but the policy allows everything
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
