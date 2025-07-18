
-- Fix the reports RLS policy to allow anonymous submissions with proper validation
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

CREATE POLICY "Allow public report submissions via links" ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  submitted_via_link_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.organization_links 
    WHERE id = submitted_via_link_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);

-- Ensure anonymous users can read organization data for branding
DROP POLICY IF EXISTS "Allow public access to organization branding" ON public.organizations;

CREATE POLICY "Allow public access to organization branding" 
  ON public.organizations 
  FOR SELECT 
  TO anon, authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.organization_links 
      WHERE is_active = true
    )
  );

-- Fix messaging policies to allow anonymous messaging on reports
DROP POLICY IF EXISTS "Allow anonymous message creation for reports" ON public.report_messages;
DROP POLICY IF EXISTS "Allow anonymous message viewing for reports" ON public.report_messages;

CREATE POLICY "Allow anonymous message creation for reports" ON public.report_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  report_id IN (
    SELECT id FROM public.reports 
    WHERE tracking_id IS NOT NULL
  )
);

CREATE POLICY "Allow anonymous message viewing for reports" ON public.report_messages
FOR SELECT
TO anon, authenticated
USING (
  report_id IN (
    SELECT id FROM public.reports 
    WHERE tracking_id IS NOT NULL
  )
);
