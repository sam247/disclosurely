-- Fix remaining functions by updating them in place

-- Fix the existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix domain token generation functions 
DROP FUNCTION IF EXISTS public.generate_domain_verification_token();
CREATE OR REPLACE FUNCTION public.generate_domain_verification_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := 'disclosurely-verify-' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 16));
  RETURN token;
END;
$$;

DROP FUNCTION IF EXISTS public.set_domain_verification_token();
CREATE OR REPLACE FUNCTION public.set_domain_verification_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
    NEW.verification_token := generate_domain_verification_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix invitation token functions
DROP FUNCTION IF EXISTS public.generate_invitation_token();
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  
  WHILE EXISTS (SELECT 1 FROM user_invitations WHERE token = token) LOOP
    token := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 32));
  END LOOP;
  
  RETURN token;
END;
$$;

DROP FUNCTION IF EXISTS public.set_invitation_token();
CREATE OR REPLACE FUNCTION public.set_invitation_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix AI analysis function
DROP FUNCTION IF EXISTS public.update_ai_analysis_updated_at();
CREATE OR REPLACE FUNCTION public.update_ai_analysis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;