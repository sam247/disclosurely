
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Enable link submissions" ON public.reports;

-- Create a simpler, more permissive policy for anonymous submissions
CREATE POLICY "Allow anonymous submissions via links" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND report_type = 'anonymous'
  AND submitted_by_email IS NULL
);
