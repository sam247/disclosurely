
-- Drop existing policies for debugging
DROP POLICY IF EXISTS "Allow_anonymous_and_org_reports" ON public.reports;
DROP POLICY IF EXISTS "Debug_report_insertion" ON public.reports;

-- Create a very permissive debugging policy to isolate the issue
CREATE POLICY "Debug_report_insertion" ON public.reports
    FOR INSERT 
    WITH CHECK (
        -- For debugging: Allow all anonymous submissions via links
        (submitted_via_link_id IS NOT NULL)
        OR
        -- Allow authenticated users to create reports for their organization
        (auth.uid() IS NOT NULL AND 
         organization_id IN (
             SELECT profiles.organization_id
             FROM profiles
             WHERE profiles.id = auth.uid() AND profiles.is_active = true
         ))
    );

-- Also check the SELECT policy for reports
DROP POLICY IF EXISTS "Allow_org_users_view_reports" ON public.reports;

CREATE POLICY "Allow_org_users_view_reports" ON public.reports
    FOR SELECT 
    USING (
        -- Allow authenticated users to view reports in their organization
        (auth.uid() IS NOT NULL AND 
         organization_id IN (
             SELECT profiles.organization_id
             FROM profiles
             WHERE profiles.id = auth.uid() AND profiles.is_active = true
         ))
    );
