-- Phase 4 Completion: Add Anonymous Access Token Infrastructure

-- Ensure the anonymous access token field exists
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_access_token text;

-- Update any existing reports without tokens
UPDATE reports 
SET anonymous_access_token = LOWER(
  MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) ||
  MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT)
)
WHERE anonymous_access_token IS NULL;

-- Ensure the function exists for token generation
CREATE OR REPLACE FUNCTION public.generate_anonymous_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := LOWER(
    MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) ||
    MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT)
  );
  
  WHILE EXISTS (SELECT 1 FROM reports WHERE anonymous_access_token = token) LOOP
    token := LOWER(
      MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) ||
      MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT)
    );
  END LOOP;
  
  RETURN token;
END;
$$;

-- Ensure the validation function exists
CREATE OR REPLACE FUNCTION public.validate_anonymous_report_access(
  p_tracking_id text, 
  p_access_token text
)
RETURNS TABLE(
  report_id uuid,
  valid boolean,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_record RECORD;
BEGIN
  SELECT r.id, r.anonymous_access_token INTO report_record
  FROM reports r 
  WHERE r.tracking_id = p_tracking_id;
  
  IF report_record.id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, false, 'Report not found';
    RETURN;
  END IF;
  
  IF report_record.anonymous_access_token != p_access_token THEN
    RETURN QUERY SELECT report_record.id, false, 'Invalid access token';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT report_record.id, true, 'Access granted';
  RETURN;
END;
$$;

-- Add constraint to ensure all new reports have access tokens
ALTER TABLE reports ADD CONSTRAINT ensure_anonymous_token CHECK (anonymous_access_token IS NOT NULL);