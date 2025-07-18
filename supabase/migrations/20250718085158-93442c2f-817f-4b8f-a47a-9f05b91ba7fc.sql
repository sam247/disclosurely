-- Ensure anonymous users can read organization links for validation
-- This should already exist but let's make sure
CREATE POLICY IF NOT EXISTS "Allow public access to active organization links" 
  ON public.organization_links 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);