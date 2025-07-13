-- Re-enable RLS and create a working policy for report submissions
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy and create a new one that properly validates the link
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

CREATE POLICY "Allow public report submissions via links" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  submitted_via_link_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.organization_links 
    WHERE id = submitted_via_link_id 
    AND is_active = true
  )
);