-- Fix has_role function to properly cast text to app_role enum
-- This fixes the "operator does not exist: app_role = text" error

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role = _role::app_role 
    AND is_active = true
  );
$$;
