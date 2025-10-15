-- Add AI risk assessment fields to reports table
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS ai_risk_score INTEGER CHECK (ai_risk_score >= 1 AND ai_risk_score <= 25),
  ADD COLUMN IF NOT EXISTS ai_likelihood_score INTEGER CHECK (ai_likelihood_score >= 1 AND ai_likelihood_score <= 5),
  ADD COLUMN IF NOT EXISTS ai_impact_score INTEGER CHECK (ai_impact_score >= 1 AND ai_impact_score <= 5),
  ADD COLUMN IF NOT EXISTS ai_risk_level TEXT CHECK (ai_risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  ADD COLUMN IF NOT EXISTS ai_risk_assessment JSONB,
  ADD COLUMN IF NOT EXISTS ai_assessed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ai_assessment_version TEXT DEFAULT '1.0';

-- Create indexes for AI risk assessment fields
CREATE INDEX IF NOT EXISTS idx_reports_ai_risk_score ON reports(ai_risk_score);
CREATE INDEX IF NOT EXISTS idx_reports_ai_risk_level ON reports(ai_risk_level);
CREATE INDEX IF NOT EXISTS idx_reports_ai_assessed_at ON reports(ai_assessed_at);

-- Add comments for documentation
COMMENT ON COLUMN reports.ai_risk_score IS 'AI-calculated risk score (1-25) based on likelihood × impact';
COMMENT ON COLUMN reports.ai_likelihood_score IS 'AI-assessed likelihood score (1-5)';
COMMENT ON COLUMN reports.ai_impact_score IS 'AI-assessed impact score (1-5)';
COMMENT ON COLUMN reports.ai_risk_level IS 'AI-determined risk level (Low/Medium/High/Critical)';
COMMENT ON COLUMN reports.ai_risk_assessment IS 'Full AI risk assessment JSON data';
COMMENT ON COLUMN reports.ai_assessed_at IS 'Timestamp when AI risk assessment was performed';
COMMENT ON COLUMN reports.ai_assessment_version IS 'Version of AI assessment algorithm used';
