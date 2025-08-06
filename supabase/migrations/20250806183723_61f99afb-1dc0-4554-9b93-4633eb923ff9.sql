
-- Update the RLS policy for reports to properly handle submissions via organization links
DROP POLICY IF EXISTS "Allow report submissions via organization links" ON public.reports;

CREATE POLICY "Allow report submissions via organization links" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM public.organization_links 
    WHERE id = submitted_via_link_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);
