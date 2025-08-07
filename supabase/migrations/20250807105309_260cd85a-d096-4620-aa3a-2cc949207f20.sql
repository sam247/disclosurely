
-- Drop the current policy that's too restrictive
DROP POLICY IF EXISTS "Debug_report_insertion" ON public.reports;

-- Create a proper policy for anonymous link-based submissions
CREATE POLICY "Allow_anonymous_link_submissions" ON public.reports
    FOR INSERT 
    WITH CHECK (
        -- Allow anonymous submissions via valid links
        submitted_via_link_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM organization_links ol 
            WHERE ol.id = submitted_via_link_id 
            AND ol.is_active = true 
            AND (ol.expires_at IS NULL OR ol.expires_at > NOW())
            AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
        )
    );

-- Also create a separate policy for authenticated users
CREATE POLICY "Allow_authenticated_org_submissions" ON public.reports
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND organization_id IN (
            SELECT profiles.organization_id
            FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_active = true
        )
    );
