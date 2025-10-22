-- Fix get_user_profile_safe function to use user_roles table instead of profiles.role
-- This function was still referencing the removed profiles.role column

CREATE OR REPLACE FUNCTION public.get_user_profile_safe(p_user_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, role user_role, is_active boolean, organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    ur.role,
    p.is_active,
    p.organization_id
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.is_active = true
  WHERE p.id = p_user_id
  AND (
    p.id = auth.uid()
    OR p.organization_id IN (
      SELECT org_p.organization_id 
      FROM profiles org_p
      JOIN user_roles org_ur ON org_p.id = org_ur.user_id AND org_ur.is_active = true
      WHERE org_p.id = auth.uid() 
      AND org_ur.role IN ('admin', 'org_admin')
    )
  );
END;
$function$;
