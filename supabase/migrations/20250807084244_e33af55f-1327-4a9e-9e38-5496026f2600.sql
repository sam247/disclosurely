-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Allow anonymous report submissions via valid links" ON public.reports;

-- Create a more permissive policy for anonymous report submissions
-- This allows anonymous users to insert reports as long as they have basic required fields
CREATE POLICY "allow_anonymous_reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  -- Ensure basic required fields are present
  organization_id IS NOT NULL 
  AND tracking_id IS NOT NULL 
  AND title IS NOT NULL 
  AND encrypted_content IS NOT NULL
);