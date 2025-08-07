-- Fix RLS policy for anonymous report submissions
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow report submissions via organization links" ON public.reports;

-- Create a more permissive policy that allows anonymous submissions
CREATE POLICY "Allow anonymous report submissions via valid links" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND submitted_via_link_id IN (
    SELECT id FROM public.organization_links 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  )
);