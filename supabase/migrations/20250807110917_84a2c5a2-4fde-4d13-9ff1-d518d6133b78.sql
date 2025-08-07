
-- Drop the existing problematic RLS policy
DROP POLICY IF EXISTS "Allow_anonymous_link_submissions" ON public.reports;

-- Create a more explicit RLS policy that handles null values correctly
CREATE POLICY "Allow_anonymous_link_submissions" 
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
