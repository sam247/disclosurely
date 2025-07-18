
-- Fix the RLS policy for public report submissions
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

CREATE POLICY "Allow public report submissions via links" ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  submitted_via_link_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.organization_links 
    WHERE id = submitted_via_link_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);
