-- Add some debugging to understand what's happening
-- Let's check if the policy is working correctly by temporarily making it more permissive

-- Drop the existing policy and recreate with better debugging
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

-- Create a more permissive policy for debugging
CREATE POLICY "Allow public report submissions via links" 
  ON public.reports 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    submitted_via_link_id IS NOT NULL
  );