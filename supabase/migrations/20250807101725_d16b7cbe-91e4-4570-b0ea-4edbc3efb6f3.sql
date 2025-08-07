
-- First, let's completely clean up the current policies again
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'reports' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reports', rec.policyname);
    END LOOP;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create the comprehensive INSERT policy for reports as recommended by Supabase
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

-- Let's also add SELECT policies so organizational users can view their reports
CREATE POLICY "Allow_org_users_view_reports" ON public.reports
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND 
        organization_id IN (
            SELECT organization_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Add UPDATE policy for organizational users
CREATE POLICY "Allow_org_users_update_reports" ON public.reports
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND 
        organization_id IN (
            SELECT organization_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );
