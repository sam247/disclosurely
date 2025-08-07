
-- Drop existing INSERT policies to recreate them properly
DROP POLICY IF EXISTS "Allow_anonymous_link_submissions" ON public.reports;
DROP POLICY IF EXISTS "Allow_authenticated_org_submissions" ON public.reports;

-- Create mutually exclusive INSERT policies
-- Policy 1: For anonymous submissions via links (when no user is authenticated)
CREATE POLICY "Allow_anonymous_link_submissions" 
ON public.reports 
FOR INSERT 
TO anon
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM organization_links ol 
    WHERE ol.id = reports.submitted_via_link_id 
      AND ol.is_active = true
      AND (ol.expires_at IS NULL OR ol.expires_at > now())
      AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
  )
);

-- Policy 2: For authenticated users in their organization
CREATE POLICY "Allow_authenticated_org_submissions" 
ON public.reports 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.is_active = true
  )
);
