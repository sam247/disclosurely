-- Fix the validation function to return proper format
DROP FUNCTION IF EXISTS validate_organization_link(UUID);

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
    RETURN;
  END IF;
  
  IF link_record.is_active = false THEN
    RETURN QUERY SELECT false, 'Link is not active';
    RETURN;
  END IF;
  
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'Link has expired';
    RETURN;
  END IF;
  
  IF link_record.usage_limit IS NOT NULL AND link_record.usage_count >= link_record.usage_limit THEN
    RETURN QUERY SELECT false, 'Link usage limit reached';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Link is valid';
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;