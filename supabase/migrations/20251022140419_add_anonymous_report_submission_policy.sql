-- Add policy to allow anonymous report submissions via organization links
-- This policy was missing after the security migration that dropped profiles.role

CREATE POLICY "Allow anonymous report submissions via organization links"
ON public.reports FOR INSERT TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.organization_links 
    WHERE organization_links.organization_id = reports.organization_id 
    AND organization_links.is_active = true
  )
);

-- Also ensure anonymous users can insert into audit_logs for report creation
CREATE POLICY "Allow anonymous audit log creation for reports"
ON public.audit_logs FOR INSERT TO anon
WITH CHECK (true);
