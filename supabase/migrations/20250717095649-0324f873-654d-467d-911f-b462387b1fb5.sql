-- Fix the RLS policy for public report submissions
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

CREATE POLICY "Allow public report submissions via links" ON public.reports
FOR INSERT
WITH CHECK (
  (submitted_via_link_id IS NOT NULL) AND 
  (EXISTS (
    SELECT 1 FROM organization_links 
    WHERE organization_links.id = reports.submitted_via_link_id 
    AND organization_links.is_active = true
  ))
);