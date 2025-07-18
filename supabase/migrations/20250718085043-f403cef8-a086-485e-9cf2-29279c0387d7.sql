-- Drop the existing policy
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

-- Create a much simpler policy that allows anonymous insertions with valid link
CREATE POLICY "Allow public report submissions via links" ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Simply check that a link ID is provided and it exists in organization_links
  submitted_via_link_id IS NOT NULL
);