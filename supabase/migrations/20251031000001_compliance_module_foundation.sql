-- ============================================================================
-- Compliance Module Foundation
-- Purpose: Policy tracking, risk management, compliance calendar
-- ============================================================================

-- ============================================================================
-- 1. COMPLIANCE POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Policy metadata
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN (
    'data_privacy', 'hr', 'financial', 'security', 'operational', 
    'environmental', 'legal', 'ethics', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'under_review', 'active', 'archived'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Dates
  effective_date DATE,
  review_date DATE,
  next_review_date DATE,
  
  -- Ownership
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT, -- Fallback if owner leaves
  
  -- Content
  policy_description TEXT,
  policy_content TEXT, -- Rich text/markdown
  file_path TEXT, -- Path to uploaded policy PDF
  
  -- Tags & categorization
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_compliance_policies_org ON public.compliance_policies(organization_id);
CREATE INDEX idx_compliance_policies_status ON public.compliance_policies(status);
CREATE INDEX idx_compliance_policies_review_date ON public.compliance_policies(next_review_date);
CREATE INDEX idx_compliance_policies_owner ON public.compliance_policies(owner_id);

-- RLS
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policies in their organization"
  ON public.compliance_policies FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create policies in their organization"
  ON public.compliance_policies FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update policies in their organization"
  ON public.compliance_policies FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete policies in their organization"
  ON public.compliance_policies FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 2. POLICY VERSION HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  
  version INTEGER NOT NULL,
  policy_content TEXT,
  file_path TEXT,
  
  changes_summary TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policy_versions_policy ON public.compliance_policy_versions(policy_id);

ALTER TABLE public.compliance_policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policy versions in their organization"
  ON public.compliance_policy_versions FOR SELECT
  USING (
    policy_id IN (
      SELECT id FROM public.compliance_policies 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 3. RISK REGISTER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Risk details
  risk_title TEXT NOT NULL,
  risk_description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'financial', 'operational', 'strategic', 'compliance', 
    'reputational', 'security', 'legal', 'environmental', 'other'
  )),
  
  -- Risk scoring (1-5 scale)
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  
  -- Mitigation
  mitigation_status TEXT NOT NULL DEFAULT 'identified' CHECK (mitigation_status IN (
    'identified', 'assessing', 'mitigating', 'monitoring', 'closed'
  )),
  mitigation_plan TEXT,
  residual_likelihood INTEGER CHECK (residual_likelihood >= 1 AND residual_likelihood <= 5),
  residual_impact INTEGER CHECK (residual_impact >= 1 AND residual_impact <= 5),
  residual_score INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN residual_likelihood IS NOT NULL AND residual_impact IS NOT NULL 
      THEN residual_likelihood * residual_impact 
      ELSE NULL 
    END
  ) STORED,
  
  -- Ownership
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT,
  
  -- Related items
  related_policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE SET NULL,
  related_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Review
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE
);

-- Indexes
CREATE INDEX idx_compliance_risks_org ON public.compliance_risks(organization_id);
CREATE INDEX idx_compliance_risks_score ON public.compliance_risks(risk_score DESC);
CREATE INDEX idx_compliance_risks_status ON public.compliance_risks(mitigation_status);
CREATE INDEX idx_compliance_risks_owner ON public.compliance_risks(owner_id);
CREATE INDEX idx_compliance_risks_category ON public.compliance_risks(category);

-- RLS
ALTER TABLE public.compliance_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risks in their organization"
  ON public.compliance_risks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create risks in their organization"
  ON public.compliance_risks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update risks in their organization"
  ON public.compliance_risks FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete risks in their organization"
  ON public.compliance_risks FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 4. COMPLIANCE CALENDAR TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Event details
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'policy_review', 'risk_assessment', 'audit', 'training', 
    'reporting', 'certification', 'meeting', 'deadline', 'other'
  )),
  
  -- Dates
  due_date DATE NOT NULL,
  completed_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'overdue', 'cancelled'
  )),
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  recurrence_end_date DATE,
  
  -- Assignment
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  
  -- Related items
  related_policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  related_risk_id UUID REFERENCES public.compliance_risks(id) ON DELETE CASCADE,
  
  -- Reminders
  reminder_days_before INTEGER[] DEFAULT '{7, 3, 1}',
  last_reminder_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_compliance_calendar_org ON public.compliance_calendar(organization_id);
CREATE INDEX idx_compliance_calendar_due_date ON public.compliance_calendar(due_date);
CREATE INDEX idx_compliance_calendar_status ON public.compliance_calendar(status);
CREATE INDEX idx_compliance_calendar_assigned ON public.compliance_calendar(assigned_to);
CREATE INDEX idx_compliance_calendar_type ON public.compliance_calendar(event_type);

-- RLS
ALTER TABLE public.compliance_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calendar events in their organization"
  ON public.compliance_calendar FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create calendar events in their organization"
  ON public.compliance_calendar FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update calendar events in their organization"
  ON public.compliance_calendar FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete calendar events in their organization"
  ON public.compliance_calendar FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 5. COMPLIANCE EVIDENCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Evidence details
  evidence_name TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'policy_document', 'training_record', 'audit_report', 
    'certificate', 'meeting_minutes', 'correspondence', 'screenshot', 'other'
  )),
  description TEXT,
  
  -- File storage
  file_path TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  
  -- Related items
  related_policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  related_risk_id UUID REFERENCES public.compliance_risks(id) ON DELETE CASCADE,
  related_report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Retention
  retention_period_months INTEGER, -- NULL = indefinite
  scheduled_deletion_date DATE
);

-- Indexes
CREATE INDEX idx_compliance_evidence_org ON public.compliance_evidence(organization_id);
CREATE INDEX idx_compliance_evidence_type ON public.compliance_evidence(evidence_type);
CREATE INDEX idx_compliance_evidence_policy ON public.compliance_evidence(related_policy_id);
CREATE INDEX idx_compliance_evidence_risk ON public.compliance_evidence(related_risk_id);

-- RLS
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence in their organization"
  ON public.compliance_evidence FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can upload evidence in their organization"
  ON public.compliance_evidence FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete evidence in their organization"
  ON public.compliance_evidence FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_compliance_policies_updated_at
  BEFORE UPDATE ON public.compliance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_risks_updated_at
  BEFORE UPDATE ON public.compliance_risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_calendar_updated_at
  BEFORE UPDATE ON public.compliance_calendar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update calendar event status to 'overdue'
CREATE OR REPLACE FUNCTION update_overdue_calendar_events()
RETURNS void AS $$
BEGIN
  UPDATE public.compliance_calendar
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
    AND status IN ('pending', 'in_progress')
    AND completed_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. INITIAL DATA / SEED (Optional)
-- ============================================================================

-- Common policy types can be seeded here if needed
-- Example: Essential policies every organization should have

COMMENT ON TABLE public.compliance_policies IS 'Stores organizational compliance policies with versioning and review tracking';
COMMENT ON TABLE public.compliance_policy_versions IS 'Tracks historical versions of compliance policies';
COMMENT ON TABLE public.compliance_risks IS 'Risk register with likelihood, impact, and mitigation tracking';
COMMENT ON TABLE public.compliance_calendar IS 'Compliance calendar for deadlines, reviews, and recurring events';
COMMENT ON TABLE public.compliance_evidence IS 'Secure storage references for compliance evidence and documentation';

