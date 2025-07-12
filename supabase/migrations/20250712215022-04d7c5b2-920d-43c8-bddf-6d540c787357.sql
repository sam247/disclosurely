-- Clean up duplicate and conflicting RLS policies on reports table
-- and ensure public submissions work correctly

-- First, drop all existing policies on reports table
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;
DROP POLICY IF EXISTS "Organization members can update their reports" ON public.reports;
DROP POLICY IF EXISTS "Organization members can view their reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete organization reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update organization reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports in their organization" ON public.reports;
DROP POLICY IF EXISTS "Users can view organization reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view reports in their organization" ON public.reports;

-- Create clean, non-conflicting policies

-- Policy to allow public (anonymous/unauthenticated) report submissions via active links
CREATE POLICY "Allow public report submissions via links" 
  ON public.reports 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    submitted_via_link_id IS NOT NULL 
    AND submitted_via_link_id IN (
      SELECT id FROM public.organization_links 
      WHERE is_active = true
    )
  );

-- Policy for organization members to view reports
CREATE POLICY "Organization members can view reports" 
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

-- Policy for organization members to update reports
CREATE POLICY "Organization members can update reports" 
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

-- Policy for organization members to delete reports
CREATE POLICY "Organization members can delete reports" 
  ON public.reports 
  FOR DELETE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );