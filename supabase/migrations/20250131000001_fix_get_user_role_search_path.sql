-- Fix get_user_role function to add SET search_path = public
-- This is the last remaining SECURITY DEFINER function without search_path protection
-- Prevents schema poisoning vulnerability

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_role app_role;
BEGIN
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = p_user_id 
    AND is_active = true
  LIMIT 1;
  
  RETURN v_role;
END;
$function$;

