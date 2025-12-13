-- Remove chat_widget feature flag
-- Created: 2025-01-20

-- Delete chat_widget feature flag if it exists
DELETE FROM feature_flags WHERE feature_name = 'chat_widget';

-- Create RPC function to update feature flags (bypasses RLS for admins)
-- This allows the toggle to work properly
CREATE OR REPLACE FUNCTION update_feature_flag(
  p_feature_name TEXT,
  p_is_enabled BOOLEAN DEFAULT NULL,
  p_rollout_percentage INTEGER DEFAULT NULL
)
RETURNS feature_flags
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_result feature_flags;
BEGIN
  -- Check if user is admin or org_admin (org_admin can also manage feature flags)
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = auth.uid()
    AND role IN ('admin', 'org_admin')
    AND is_active = true
  LIMIT 1;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Only admins can modify feature flags. Current user role not found or inactive.';
  END IF;
  
  -- Update feature flag
  UPDATE feature_flags
  SET 
    is_enabled = COALESCE(p_is_enabled, is_enabled),
    rollout_percentage = COALESCE(p_rollout_percentage, rollout_percentage),
    updated_at = now(),
    updated_by = auth.uid()
  WHERE feature_name = p_feature_name
  RETURNING * INTO v_result;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Feature flag % not found', p_feature_name;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users (RLS will check admin role inside function)
GRANT EXECUTE ON FUNCTION update_feature_flag TO authenticated;

COMMENT ON FUNCTION update_feature_flag IS 'Update feature flag (admin only, uses SECURITY DEFINER to bypass RLS)';
