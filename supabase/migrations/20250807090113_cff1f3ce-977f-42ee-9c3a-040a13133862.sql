-- Allow both anonymous and authenticated users to submit reports
DROP POLICY IF EXISTS "allow_anonymous_reports" ON public.reports;

-- Create a comprehensive policy for report submissions
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