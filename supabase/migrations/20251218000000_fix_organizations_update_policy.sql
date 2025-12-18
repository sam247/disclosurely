-- Fix organizations UPDATE policy for active_url_type switching
-- The old policy checks profiles.role which was removed
-- This migration ensures the correct policy using user_roles is in place

-- Drop the old broken policy that checks profiles.role
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;

-- Ensure the correct policy exists (should already exist from comprehensive_security_fixes)
-- But recreate it to be sure it's correct
DROP POLICY IF EXISTS "org_admins_can_manage" ON public.organizations;

CREATE POLICY "org_admins_can_manage" ON public.organizations
FOR ALL 
USING (
  public.user_is_in_organization(id) AND
  (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.organization_id = id
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
        AND ur.organization_id = id
        AND ur.role IN ('admin', 'org_admin')
        AND ur.is_active = true
    )
  )
);

-- Add comment
COMMENT ON POLICY "org_admins_can_manage" ON public.organizations IS 
'Allows org admins and system admins to manage their organization, including updating active_url_type. Uses has_role() function with user_roles table.';
