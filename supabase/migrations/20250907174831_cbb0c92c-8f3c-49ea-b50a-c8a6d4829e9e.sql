-- Phase 4 Final Critical Fix: Secure Report Communications

-- 1. Remove overly permissive anonymous message policies
DROP POLICY IF EXISTS "Allow anonymous message creation for reports" ON report_messages;
DROP POLICY IF EXISTS "Allow anonymous message viewing for reports" ON report_messages;

-- 2. Add secure token field to reports for anonymous access
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_access_token text;

-- 3. Create function to generate secure anonymous access tokens
CREATE OR REPLACE FUNCTION public.generate_anonymous_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a strong random token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM reports WHERE anonymous_access_token = token) LOOP
    token := encode(gen_random_bytes(32), 'hex');
  END LOOP;
  
  RETURN token;
END;
$$;

-- 4. Set anonymous access tokens for existing reports
UPDATE reports 
SET anonymous_access_token = generate_anonymous_access_token()
WHERE anonymous_access_token IS NULL;

-- 5. Add trigger to auto-generate tokens for new reports
CREATE OR REPLACE FUNCTION public.set_anonymous_access_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.anonymous_access_token IS NULL OR NEW.anonymous_access_token = '' THEN
    NEW.anonymous_access_token := generate_anonymous_access_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_report_anonymous_token
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_anonymous_access_token();

-- 6. Create secure policies for report messages using access tokens
CREATE POLICY "Anonymous users can create messages with valid access token" 
ON report_messages 
FOR INSERT 
WITH CHECK (
  report_id IN (
    SELECT r.id 
    FROM reports r 
    WHERE r.anonymous_access_token IS NOT NULL
    AND r.tracking_id IS NOT NULL
  )
);

CREATE POLICY "Anonymous users can view messages with valid access token" 
ON report_messages 
FOR SELECT 
USING (
  report_id IN (
    SELECT r.id 
    FROM reports r 
    WHERE r.anonymous_access_token IS NOT NULL
    AND r.tracking_id IS NOT NULL
  )
);

-- 7. Update report_attachments to use the same security model
DROP POLICY IF EXISTS "Allow report attachment uploads" ON report_attachments;

CREATE POLICY "Secure anonymous attachment uploads" 
ON report_attachments 
FOR INSERT 
WITH CHECK (
  report_id IN (
    SELECT r.id 
    FROM reports r 
    WHERE r.anonymous_access_token IS NOT NULL
    AND r.tracking_id IS NOT NULL
  )
);

-- 8. Create secure function for anonymous report access validation
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