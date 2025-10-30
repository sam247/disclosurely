-- AI Gateway Database Schema
-- Purpose: Support Private AI Gateway with PII redaction and multi-model routing
-- Created: 2025-10-30
-- SAFE: All new tables, no modifications to existing tables

-- ============================================================================
-- AI GATEWAY POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_gateway_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Policy configuration (YAML/JSON stored as JSONB)
  policy_version TEXT NOT NULL DEFAULT '1.0',
  policy_data JSONB NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, policy_version)
);

-- RLS for policies
ALTER TABLE ai_gateway_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org AI policies"
ON ai_gateway_policies FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Org admins can manage AI policies"
ON ai_gateway_policies FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'org_admin') 
      AND is_active = true
  )
);

-- ============================================================================
-- AI GATEWAY LOGS TABLE (Structured logs, NO sensitive data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_gateway_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  -- Request metadata (NO prompt/completion content)
  model TEXT NOT NULL,
  vendor TEXT NOT NULL,
  purpose TEXT,  -- e.g., 'case_analysis', 'content_generation'
  
  -- Token usage
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  
  -- Performance
  latency_ms INTEGER NOT NULL,
  
  -- PII detection (counts only, not actual PII)
  pii_detected BOOLEAN DEFAULT false,
  pii_entity_count INTEGER DEFAULT 0,
  redaction_applied BOOLEAN DEFAULT false,
  
  -- Error tracking
  error_type TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes
  INDEX idx_ai_logs_org_created (organization_id, created_at DESC),
  INDEX idx_ai_logs_request_id (request_id)
);

-- RLS for logs
ALTER TABLE ai_gateway_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org AI logs"
ON ai_gateway_logs FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "System can insert AI logs"
ON ai_gateway_logs FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow system to log

-- ============================================================================
-- AI GATEWAY REDACTION MAPS (Temporary, auto-expire)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_gateway_redaction_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Redaction mapping (e.g., {"John Doe": "PERSON_1", "john@email.com": "EMAIL_1"})
  redaction_map JSONB NOT NULL,
  
  -- Auto-expiry
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  
  INDEX idx_redaction_request (request_id),
  INDEX idx_redaction_expires (expires_at)
);

-- RLS for redaction maps
ALTER TABLE ai_gateway_redaction_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org redaction maps"
ON ai_gateway_redaction_maps FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- ============================================================================
-- TOKEN USAGE TRACKING (For billing/limits)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_gateway_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  model TEXT NOT NULL,
  
  -- Aggregated counts
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, date, model)
);

-- RLS for token usage
ALTER TABLE ai_gateway_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org token usage"
ON ai_gateway_token_usage FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- ============================================================================
-- VECTOR DOCUMENTS (For RAG - Optional, Phase 2)
-- ============================================================================
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_gateway_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  document_id TEXT NOT NULL,
  
  -- Document metadata
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, document_id)
);

-- RLS for documents
ALTER TABLE ai_gateway_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org documents"
ON ai_gateway_documents FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- ============================================================================
-- VECTOR EMBEDDINGS (For RAG - Optional, Phase 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_gateway_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ai_gateway_documents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Chunk information
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  redacted_text TEXT,  -- PII-redacted version
  
  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536),
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector similarity index (for fast nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_org_embedding 
ON ai_gateway_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WHERE organization_id IS NOT NULL;

-- RLS for embeddings
ALTER TABLE ai_gateway_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org embeddings"
ON ai_gateway_embeddings FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get active policy for organization
CREATE OR REPLACE FUNCTION get_active_ai_policy(p_organization_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_policy JSONB;
BEGIN
  SELECT policy_data INTO v_policy
  FROM ai_gateway_policies
  WHERE organization_id = p_organization_id
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return default policy if none exists
  IF v_policy IS NULL THEN
    v_policy := jsonb_build_object(
      'routing', jsonb_build_object(
        'default_model', 'deepseek-chat'
      ),
      'limits', jsonb_build_object(
        'daily_tokens', 1000000,
        'per_request_max_tokens', 4000
      ),
      'pii_protection', jsonb_build_object(
        'enabled', true,
        'redaction_level', 'strict'
      )
    );
  END IF;
  
  RETURN v_policy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if organization has exceeded token limits
CREATE OR REPLACE FUNCTION check_token_limit(
  p_organization_id UUID,
  p_requested_tokens INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_policy JSONB;
  v_daily_limit INTEGER;
  v_today_usage INTEGER;
BEGIN
  -- Get policy
  v_policy := get_active_ai_policy(p_organization_id);
  v_daily_limit := (v_policy->'limits'->>'daily_tokens')::INTEGER;
  
  -- Get today's usage
  SELECT COALESCE(SUM(total_tokens), 0) INTO v_today_usage
  FROM ai_gateway_token_usage
  WHERE organization_id = p_organization_id
    AND date = CURRENT_DATE;
  
  -- Check if request would exceed limit
  RETURN (v_today_usage + p_requested_tokens) <= v_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-cleanup expired redaction maps (scheduled via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_redaction_maps()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM ai_gateway_redaction_maps
  WHERE expires_at < now();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_policies_org ON ai_gateway_policies(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_gateway_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_org_model ON ai_gateway_logs(organization_id, model);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON ai_gateway_token_usage(date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_org ON ai_gateway_documents(organization_id);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE ai_gateway_policies IS 'AI Gateway policies for routing, limits, and PII protection';
COMMENT ON TABLE ai_gateway_logs IS 'Structured logs for AI requests (NO sensitive data)';
COMMENT ON TABLE ai_gateway_redaction_maps IS 'Temporary PII redaction mappings (auto-expire after 24h)';
COMMENT ON TABLE ai_gateway_token_usage IS 'Aggregated token usage for billing and limits';
COMMENT ON TABLE ai_gateway_documents IS 'Documents for RAG (Retrieval-Augmented Generation)';
COMMENT ON TABLE ai_gateway_embeddings IS 'Vector embeddings for semantic search';

-- Upsert token usage (called from Edge Function)
CREATE OR REPLACE FUNCTION upsert_token_usage(
  p_organization_id UUID,
  p_date DATE,
  p_model TEXT,
  p_tokens INTEGER,
  p_cost DECIMAL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_gateway_token_usage (
    organization_id,
    date,
    model,
    total_tokens,
    total_requests,
    total_cost_usd
  ) VALUES (
    p_organization_id,
    p_date,
    p_model,
    p_tokens,
    1,
    p_cost
  )
  ON CONFLICT (organization_id, date, model)
  DO UPDATE SET
    total_tokens = ai_gateway_token_usage.total_tokens + p_tokens,
    total_requests = ai_gateway_token_usage.total_requests + 1,
    total_cost_usd = ai_gateway_token_usage.total_cost_usd + p_cost,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_ai_policy IS 'Get active AI policy for organization with default fallback';
COMMENT ON FUNCTION check_token_limit IS 'Check if organization can make request without exceeding daily limit';
COMMENT ON FUNCTION cleanup_expired_redaction_maps IS 'Auto-cleanup expired redaction maps (run daily)';
COMMENT ON FUNCTION upsert_token_usage IS 'Upsert daily token usage for organization (atomic increment)';

-- ============================================================================
-- INSERT DEFAULT POLICY FOR EXISTING ORGANIZATIONS (Optional)
-- ============================================================================
-- Uncomment to create default policies for all existing orgs
/*
INSERT INTO ai_gateway_policies (organization_id, policy_data)
SELECT 
  id,
  jsonb_build_object(
    'routing', jsonb_build_object(
      'default_model', 'deepseek-chat',
      'purpose_routing', jsonb_build_object(
        'case_analysis', jsonb_build_object('model', 'deepseek-chat', 'temperature', 0.3)
      )
    ),
    'limits', jsonb_build_object(
      'daily_tokens', 1000000,
      'per_request_max_tokens', 4000
    ),
    'pii_protection', jsonb_build_object(
      'enabled', true,
      'redaction_level', 'strict'
    ),
    'vendors', jsonb_build_object(
      'deepseek', jsonb_build_object(
        'enabled', true,
        'models', jsonb_build_array('deepseek-chat', 'deepseek-coder')
      )
    )
  )
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM ai_gateway_policies 
  WHERE ai_gateway_policies.organization_id = organizations.id
);
*/

