-- Fix ambiguous column reference in invitation token generator
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token TEXT;
BEGIN
  v_token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  
  -- Ensure uniqueness; qualify column to avoid ambiguity
  WHILE EXISTS (
    SELECT 1 FROM public.user_invitations ui WHERE ui.token = v_token
  ) LOOP
    v_token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  END LOOP;
  
  RETURN v_token;
END;
$function$;