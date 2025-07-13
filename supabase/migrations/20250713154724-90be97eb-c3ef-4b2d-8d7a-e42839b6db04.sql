-- Fix the RLS policy for report submissions to properly validate link submissions
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

-- Create a more comprehensive policy that validates the link properly
CREATE POLICY "Allow public report submissions via links" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND submitted_via_link_id IN (
    SELECT id FROM public.organization_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);