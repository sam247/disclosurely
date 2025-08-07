
-- Drop existing policies
DROP POLICY IF EXISTS "Allow_anonymous_and_org_reports" ON public.reports;

-- Create a more explicit policy with additional checks
CREATE POLICY "Allow_anonymous_and_org_reports" ON public.reports
    FOR INSERT 
    WITH CHECK (
        -- Allow anonymous reports via organization links
        (submitted_via_link_id IS NOT NULL AND 
         EXISTS (
             SELECT 1 
             FROM public.organization_links ol 
             WHERE ol.id = submitted_via_link_id 
             AND ol.is_active = true 
             AND (ol.expires_at IS NULL OR ol.expires_at > NOW())
             AND (ol.usage_limit IS NULL OR ol.usage_count < ol.usage_limit)
         )) 
        OR 
        -- Allow organizational users to insert reports for their org
        (auth.uid() IS NOT NULL AND 
         organization_id IN (
             SELECT organization_id 
             FROM public.profiles 
             WHERE id = auth.uid()
         ))
    );
