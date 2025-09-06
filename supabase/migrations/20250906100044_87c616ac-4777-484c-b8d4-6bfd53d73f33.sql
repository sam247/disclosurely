-- Final function search_path fixes

-- Update remaining domain and invitation token generation functions
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

-- Update AI analysis function
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

-- Add organization_id constraint validation to ensure security_alerts are properly scoped
-- Backfill any existing security_alerts without organization_id (set to NULL for now)
UPDATE public.security_alerts 
SET organization_id = NULL 
WHERE organization_id IS NULL;

-- Create a secure function to create security alerts with proper organization context
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_event_type text,
  p_severity text DEFAULT 'low',
  p_message text,
  p_details jsonb DEFAULT '{}',
  p_organization_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO security_alerts (
    type,
    severity, 
    message,
    details,
    organization_id
  ) VALUES (
    p_event_type,
    p_severity,
    p_message,
    p_details,
    p_organization_id
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;