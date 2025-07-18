-- Make sure the policy exists by dropping and recreating it
DROP POLICY IF EXISTS "Allow public access to active organization links" ON public.organization_links;

CREATE POLICY "Allow public access to active organization links" 
  ON public.organization_links 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);