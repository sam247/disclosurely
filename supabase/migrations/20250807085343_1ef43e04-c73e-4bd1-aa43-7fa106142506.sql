-- Ensure RLS is enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "allow_anonymous_reports" ON public.reports;

-- Create a new policy specifically for anonymous insertions
CREATE POLICY "allow_anonymous_reports" 
ON public.reports 
FOR INSERT 
TO anon  -- Explicitly specify the anon role
WITH CHECK (
  -- Ensure basic required fields are present
  organization_id IS NOT NULL 
  AND tracking_id IS NOT NULL 
  AND title IS NOT NULL 
  AND encrypted_content IS NOT NULL
);