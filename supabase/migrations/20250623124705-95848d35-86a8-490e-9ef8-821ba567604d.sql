
-- Add RLS policies for reports table to allow public submissions via links
-- This allows anonymous report submissions through organization links

-- Policy to allow inserting reports (needed for public submissions)
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

-- Policy to allow organization members to view their reports
CREATE POLICY "Organization members can view their reports" 
  ON public.reports 
  FOR SELECT 
  TO authenticated 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Policy to allow organization members to update their reports
CREATE POLICY "Organization members can update their reports" 
  ON public.reports 
  FOR UPDATE 
  TO authenticated 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );
