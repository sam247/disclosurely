
-- First, let's see all current policies on the reports table and drop them all
DROP POLICY IF EXISTS "Allow_link_submissions" ON public.reports;
DROP POLICY IF EXISTS "Allow_authenticated_org_submissions" ON public.reports;
DROP POLICY IF EXISTS "Allow_org_users_view_reports" ON public.reports;
DROP POLICY IF EXISTS "Allow_org_users_update_reports" ON public.reports;

-- Now let's create a simple, permissive policy for link submissions that works for both anonymous and authenticated users
CREATE POLICY "Enable link submissions" 
ON public.reports 
FOR INSERT 
TO public
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM organization_links ol 
    WHERE ol.id = reports.submitted_via_link_id 
      AND ol.is_active = true
  )
);

-- Re-add the viewing policy for authenticated org users
CREATE POLICY "Allow org users to view reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.is_active = true
  )
);

-- Re-add the update policy for authenticated org users
CREATE POLICY "Allow org users to update reports" 
ON public.reports 
FOR UPDATE 
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.is_active = true
  )
);
