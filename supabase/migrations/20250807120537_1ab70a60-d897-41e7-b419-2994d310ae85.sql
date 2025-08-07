
-- Drop the conflicting policies
DROP POLICY IF EXISTS "Allow_anonymous_link_submissions" ON public.reports;
DROP POLICY IF EXISTS "Allow_authenticated_org_submissions" ON public.reports;

-- Create a unified policy that handles both anonymous and authenticated link submissions
CREATE POLICY "Allow_link_submissions" 
ON public.reports 
FOR INSERT 
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

-- Keep the authenticated org submissions policy for direct submissions (not via links)
CREATE POLICY "Allow_authenticated_org_submissions" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  submitted_via_link_id IS NULL
  AND auth.uid() IS NOT NULL 
  AND organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.is_active = true
  )
);
