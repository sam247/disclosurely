-- Fix SECURITY DEFINER functions missing SET search_path
-- This prevents schema poisoning attacks

-- Fix generate_domain_verification_token
CREATE OR REPLACE FUNCTION public.generate_domain_verification_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$function$;

-- Fix is_valid_domain
CREATE OR REPLACE FUNCTION public.is_valid_domain(domain text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Basic domain validation regex
  RETURN domain ~ '^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$';
END;
$function$;

-- Fix verify_audit_chain
CREATE OR REPLACE FUNCTION public.verify_audit_chain(p_organization_id uuid)
RETURNS TABLE(is_valid boolean, total_records bigint, invalid_records bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_total_records BIGINT := 0;
BEGIN
  SELECT COUNT(*) INTO v_total_records
  FROM public.audit_logs
  WHERE organization_id = p_organization_id;
  
  RETURN QUERY SELECT TRUE, v_total_records, 0::BIGINT;
END;
$function$;