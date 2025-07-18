
-- Create a security definer function to validate organization links
CREATE OR REPLACE FUNCTION public.validate_organization_link(link_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_links 
    WHERE id = link_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  );
END;
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow public report submissions via links" ON public.reports;

-- Create a new policy using the security definer function
CREATE POLICY "Allow public report submissions via links" ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  submitted_via_link_id IS NOT NULL AND 
  public.validate_organization_link(submitted_via_link_id)
);
