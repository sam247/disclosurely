
-- First, let's check if there are proper RLS policies for public access to organization_links
-- and ensure anonymous users can access organization links and submit reports

-- Allow anonymous users to read active organization links
CREATE POLICY "Allow public access to active organization links" 
  ON public.organization_links 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- Ensure the existing policy for public report submissions is correct
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

CREATE POLICY "Allow public report submissions via links" 
  ON public.reports 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    -- Allow if submitted via a valid, active organization link
    submitted_via_link_id IS NOT NULL 
    AND submitted_via_link_id IN (
      SELECT id FROM public.organization_links 
      WHERE is_active = true
    )
  );

-- Also need to allow anonymous users to read organizations data for branding
CREATE POLICY "Allow public access to organization branding" 
  ON public.organizations 
  FOR SELECT 
  TO anon, authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.organization_links 
      WHERE is_active = true
    )
  );
