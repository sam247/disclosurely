
-- Drop existing INSERT policy for reports if it exists
DROP POLICY IF EXISTS "allow_all_report_submissions" ON public.reports;

-- Create a new permissive INSERT policy that allows anonymous submissions
CREATE POLICY "anonymous_report_submissions" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Ensure the policy is enabled
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;
