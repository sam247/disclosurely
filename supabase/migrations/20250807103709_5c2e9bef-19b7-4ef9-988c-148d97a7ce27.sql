
-- Drop existing policy
DROP POLICY IF EXISTS "Allow_anonymous_and_org_reports" ON public.reports;

-- Create a comprehensive policy with detailed checks
CREATE POLICY "Allow_anonymous_and_org_reports" ON public.reports
    FOR INSERT 
    WITH CHECK (
        -- Allow anonymous reports via organization links
        (submitted_via_link_id IS NOT NULL AND 
         EXISTS (
             SELECT 1 
             FROM organization_links ol 
             WHERE ol.id = submitted_via_link_id 
             AND ol.is_active = true 
             AND (ol.expires_at IS NULL OR ol.expires_at > NOW())
             AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
             AND ol.organization_id = reports.organization_id
         ))
        OR
        -- Allow authenticated users to create reports for their organization
        (auth.uid() IS NOT NULL AND 
         organization_id IN (
             SELECT profiles.organization_id
             FROM profiles
             WHERE profiles.id = auth.uid() AND profiles.is_active = true
         ))
    );
