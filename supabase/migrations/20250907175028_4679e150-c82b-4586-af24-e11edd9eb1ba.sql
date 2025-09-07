-- Phase 4 Final Critical Fix: Secure Report Communications (Policy Fix)

-- 1. Add secure token field to reports for anonymous access
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_access_token text;

-- 2. Create function to generate secure anonymous access tokens using available functions
CREATE OR REPLACE FUNCTION public.generate_anonymous_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a strong random token using MD5 and random
  token := LOWER(
    MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) ||
    MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT)
  );
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM reports WHERE anonymous_access_token = token) LOOP
    token := LOWER(
      MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) ||
      MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT)
    );
  END LOOP;
  
  RETURN token;
END;
$$;

-- 3. Set anonymous access tokens for existing reports
UPDATE reports 
SET anonymous_access_token = generate_anonymous_access_token()
WHERE anonymous_access_token IS NULL;

-- 4. Add trigger to auto-generate tokens for new reports
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

DROP TRIGGER IF EXISTS set_report_anonymous_token ON reports;
CREATE TRIGGER set_report_anonymous_token
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_anonymous_access_token();

-- 5. Update existing message policies with proper names
DROP POLICY IF EXISTS "System only can manage anonymous messages" ON report_messages;
DROP POLICY IF EXISTS "Organization members can manage messages" ON report_messages;

-- Recreate organization member access (they need this for functionality)
CREATE POLICY "Organization members can manage all messages" 
ON report_messages 
FOR ALL
USING (
  report_id IN (
    SELECT r.id
    FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
)
WITH CHECK (
  report_id IN (
    SELECT r.id
    FROM reports r
    JOIN profiles p ON p.organization_id = r.organization_id
    WHERE p.id = auth.uid() AND p.is_active = true
  )
);

-- 6. Create secure function for anonymous report access validation
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

-- 7. Add note that the application layer will need to validate access tokens
-- before allowing anonymous users to create/view messages
COMMENT ON FUNCTION validate_anonymous_report_access IS 'Use this function to validate anonymous access before allowing message operations';