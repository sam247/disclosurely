-- OpenRedact Integration: Feature Flag and PII Detection Tables
-- Created: 2025-12-17

-- Add OpenRedact feature flag
INSERT INTO feature_flags (feature_name, description, is_enabled, rollout_percentage) VALUES
  ('use_openredact', 'Use OpenRedact library for PII detection and redaction', false, 0)
ON CONFLICT (feature_name) DO NOTHING;

-- PII detections table for tracking PII detection events
CREATE TABLE IF NOT EXISTS pii_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  pii_count INTEGER NOT NULL DEFAULT 0,
  pii_types TEXT[] NOT NULL DEFAULT '{}',
  severity_breakdown JSONB DEFAULT '{}',
  processing_time_ms INTEGER,
  detection_method VARCHAR(50) DEFAULT 'legacy', -- 'openredact' or 'legacy'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PII learning feedback table for improving detection accuracy
CREATE TABLE IF NOT EXISTS pii_learning_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('false_positive', 'false_negative')),
  original_text TEXT NOT NULL,
  detected_type VARCHAR(50),
  context TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pii_detections_report_id ON pii_detections(report_id);
CREATE INDEX IF NOT EXISTS idx_pii_detections_organization_id ON pii_detections(organization_id);
CREATE INDEX IF NOT EXISTS idx_pii_detections_detected_at ON pii_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_pii_detections_method ON pii_detections(detection_method);
CREATE INDEX IF NOT EXISTS idx_pii_learning_feedback_org_id ON pii_learning_feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_pii_learning_feedback_type ON pii_learning_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_pii_learning_feedback_created_at ON pii_learning_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE pii_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_learning_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pii_detections
-- Users can view PII detections for their organization's reports
CREATE POLICY "Users can view PII detections for their organization"
ON pii_detections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = pii_detections.organization_id
      AND ur.is_active = true
  )
);

-- System can insert PII detections (via edge functions)
CREATE POLICY "System can insert PII detections"
ON pii_detections FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for pii_learning_feedback
-- Users can view learning feedback for their organization
CREATE POLICY "Users can view learning feedback for their organization"
ON pii_learning_feedback FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = pii_learning_feedback.organization_id
      AND ur.is_active = true
  )
);

-- Users can insert learning feedback for their organization
CREATE POLICY "Users can insert learning feedback for their organization"
ON pii_learning_feedback FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = pii_learning_feedback.organization_id
      AND ur.is_active = true
  )
);

-- Comments
COMMENT ON TABLE pii_detections IS 'Tracks PII detection events for compliance and analytics';
COMMENT ON TABLE pii_learning_feedback IS 'Stores user feedback to improve PII detection accuracy';
COMMENT ON COLUMN pii_detections.detection_method IS 'Method used: openredact or legacy';
COMMENT ON COLUMN pii_learning_feedback.feedback_type IS 'Type of feedback: false_positive or false_negative';

