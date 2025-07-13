-- Temporarily disable RLS on reports table to test if the issue is purely RLS-related
-- This will help us understand if the submission process works without RLS restrictions

-- First, let's create a more permissive temporary policy for debugging
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

-- Create a very simple policy that just checks for submitted_via_link_id
CREATE POLICY "Allow public report submissions via links" 
ON public.reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (submitted_via_link_id IS NOT NULL);

-- Also ensure we can read organization_links for validation
DROP POLICY IF EXISTS "Allow public access to active organization links" ON public.organization_links;

CREATE POLICY "Allow public access to active organization links" 
ON public.organization_links 
FOR SELECT 
TO anon, authenticated
USING (true);