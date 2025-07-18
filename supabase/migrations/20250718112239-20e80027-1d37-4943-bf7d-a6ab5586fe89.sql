
-- Check organization links details first
SELECT 
    id, 
    organization_id, 
    link_token, 
    is_active, 
    expires_at, 
    usage_limit, 
    usage_count,
    created_at
FROM 
    organization_links
WHERE 
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
LIMIT 10;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow report submissions via organization links" ON reports;

-- Create a more comprehensive policy with detailed logging
CREATE POLICY "Allow report submissions via organization links" ON reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Detailed validation with explicit conditions
  submitted_via_link_id IS NOT NULL 
  AND (
    SELECT 
      is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
    FROM 
      organization_links 
    WHERE 
      id = submitted_via_link_id
  )
);

-- Create a function to help diagnose link submission issues
CREATE OR REPLACE FUNCTION validate_organization_link(link_id UUID)
RETURNS TABLE (
  valid BOOLEAN, 
  reason TEXT
) AS $$
DECLARE
  link_record organization_links%ROWTYPE;
BEGIN
  SELECT * INTO link_record FROM organization_links WHERE id = link_id;
  
  IF link_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Link not found';
  END IF;
  
  IF link_record.is_active = false THEN
    RETURN QUERY SELECT false, 'Link is not active';
  END IF;
  
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'Link has expired';
  END IF;
  
  IF link_record.usage_limit IS NOT NULL AND link_record.usage_count >= link_record.usage_limit THEN
    RETURN QUERY SELECT false, 'Link usage limit reached';
  END IF;
  
  RETURN QUERY SELECT true, 'Link is valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS increment_link_usage_trigger ON reports;

CREATE OR REPLACE FUNCTION increment_link_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organization_links
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = NEW.submitted_via_link_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_link_usage_trigger
AFTER INSERT ON reports
FOR EACH ROW
WHEN (NEW.submitted_via_link_id IS NOT NULL)
EXECUTE FUNCTION increment_link_usage_count();
