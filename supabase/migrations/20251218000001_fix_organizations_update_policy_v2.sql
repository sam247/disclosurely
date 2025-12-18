-- Fix organizations UPDATE policy for active_url_type switching
-- Version 2: Ensure function signature matches and policy works correctly

-- First, ensure user_is_in_organization function exists with correct signature (1 parameter)
CREATE OR REPLACE FUNCTION public.user_is_in_organization(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id = org_id 
    AND is_active = true
  );
$$;

-- Drop the old broken policy that checks profiles.role
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;

-- Drop and recreate the correct policy
DROP POLICY IF EXISTS "org_admins_can_manage" ON public.organizations;

CREATE POLICY "org_admins_can_manage" ON public.organizations
FOR ALL 
USING (
  public.user_is_in_organization(id) AND
  (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.organization_id = organizations.id
        AND ur.role IN ('admin', 'org_admin')
        AND ur.is_active = true
    )
  )
)
WITH CHECK (
  public.user_is_in_organization(id) AND
  (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.organization_id = organizations.id
        AND ur.role IN ('admin', 'org_admin')
        AND ur.is_active = true
    )
  )
);

-- Add comment
COMMENT ON POLICY "org_admins_can_manage" ON public.organizations IS 
'Allows org admins and system admins to manage their organization, including updating active_url_type. Uses user_roles table directly.';
