-- Feature Flags System
-- Purpose: Enable/disable new features instantly without code deploy
-- Created: 2025-10-30

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  
  -- Per-organization overrides
  organization_overrides JSONB DEFAULT '{}',
  
  -- Rollout percentage (0-100)
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default feature flags (all disabled initially)
INSERT INTO feature_flags (feature_name, description, is_enabled, rollout_percentage) VALUES
  ('ai_gateway', 'Private AI Gateway with PII redaction', false, 0),
  ('ai_gateway_multi_model', 'Multi-model AI support (OpenAI, Anthropic)', false, 0),
  ('risk_compliance_module', 'Risk & Compliance management module', false, 0),
  ('policy_tracker', 'Policy management and version control', false, 0),
  ('risk_register', 'Risk assessment and mitigation tracking', false, 0),
  ('compliance_calendar', 'Compliance deadlines and reminders', false, 0),
  ('ai_insights', 'AI-powered analytics and insights', false, 0)
ON CONFLICT (feature_name) DO NOTHING;

-- Function to check if feature is enabled for an organization
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_feature_name TEXT,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_org_override BOOLEAN;
  v_random INTEGER;
BEGIN
  -- Get feature flag
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE feature_name = p_feature_name;
  
  -- If flag doesn't exist, default to false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check organization-specific override
  IF p_organization_id IS NOT NULL THEN
    v_org_override := (v_flag.organization_overrides->>p_organization_id::TEXT)::BOOLEAN;
    IF v_org_override IS NOT NULL THEN
      RETURN v_org_override;
    END IF;
  END IF;
  
  -- If globally disabled, return false
  IF NOT v_flag.is_enabled THEN
    RETURN false;
  END IF;
  
  -- Check rollout percentage
  IF v_flag.rollout_percentage = 100 THEN
    RETURN true;
  ELSIF v_flag.rollout_percentage = 0 THEN
    RETURN false;
  ELSE
    -- Deterministic rollout based on organization ID
    IF p_organization_id IS NOT NULL THEN
      v_random := (hashtext(p_organization_id::TEXT) % 100);
      RETURN v_random < v_flag.rollout_percentage;
    ELSE
      -- Random rollout for non-org requests
      RETURN (random() * 100) < v_flag.rollout_percentage;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable feature for specific organization
CREATE OR REPLACE FUNCTION enable_feature_for_org(
  p_feature_name TEXT,
  p_organization_id UUID,
  p_enabled BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
  v_overrides JSONB;
BEGIN
  -- Get current overrides
  SELECT organization_overrides INTO v_overrides
  FROM feature_flags
  WHERE feature_name = p_feature_name;
  
  -- Update overrides
  v_overrides := jsonb_set(
    COALESCE(v_overrides, '{}'::JSONB),
    ARRAY[p_organization_id::TEXT],
    to_jsonb(p_enabled)
  );
  
  -- Save
  UPDATE feature_flags
  SET 
    organization_overrides = v_overrides,
    updated_at = now()
  WHERE feature_name = p_feature_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Admins can view all flags
CREATE POLICY "Admins can view feature flags"
ON feature_flags FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'org_admin')
      AND is_active = true
  )
);

-- Only system admins can modify flags
CREATE POLICY "System admins can modify feature flags"
ON feature_flags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  )
);

-- Create index for fast lookups
CREATE INDEX idx_feature_flags_name ON feature_flags(feature_name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_feature_flag_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    NULL,  -- Global feature flag
    auth.uid(),
    TG_OP,
    'feature_flag',
    NEW.id,
    jsonb_build_object(
      'feature_name', NEW.feature_name,
      'is_enabled', NEW.is_enabled,
      'rollout_percentage', NEW.rollout_percentage,
      'old_enabled', CASE WHEN TG_OP = 'UPDATE' THEN OLD.is_enabled ELSE NULL END
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_feature_flags
AFTER INSERT OR UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION audit_feature_flag_changes();

-- Comment
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and instant rollback';
COMMENT ON FUNCTION is_feature_enabled IS 'Check if feature is enabled globally or for specific org';
COMMENT ON FUNCTION enable_feature_for_org IS 'Enable/disable feature for specific organization';

