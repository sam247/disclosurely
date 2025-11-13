-- Assignment Rules Table
CREATE TABLE IF NOT EXISTS public.assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,

  -- Conditions (JSON for flexibility)
  conditions JSONB DEFAULT '{}'::jsonb,
  -- Example: {"category": "financial", "urgency": "critical", "keywords": ["fraud", "embezzlement"]}

  -- Actions
  assign_to_user_id UUID REFERENCES public.profiles(id),
  assign_to_team TEXT, -- "finance", "legal", "hr", etc.

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SLA Policies Table
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,

  -- SLA thresholds (in hours)
  critical_response_time INTEGER DEFAULT 24,
  high_response_time INTEGER DEFAULT 48,
  medium_response_time INTEGER DEFAULT 120, -- 5 days
  low_response_time INTEGER DEFAULT 240, -- 10 days

  -- Escalation settings
  escalate_after_breach BOOLEAN DEFAULT true,
  escalate_to_user_id UUID REFERENCES public.profiles(id),

  is_default BOOLEAN DEFAULT false, -- One default policy per organization

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Case Escalations Table (audit trail)
CREATE TABLE IF NOT EXISTS public.case_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  escalated_from UUID REFERENCES public.profiles(id),
  escalated_to UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT,
  sla_breached BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Logs Table (audit trail)
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- "auto_assigned", "sla_warning", "escalated", "rule_matched"
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add assigned_to column to reports table (if not exists)
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_rules_org ON public.assignment_rules(organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_priority ON public.assignment_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_sla_policies_org ON public.sla_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_case_escalations_report ON public.case_escalations(report_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_report ON public.workflow_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_sla_deadline ON public.reports(sla_deadline);

-- Row Level Security Policies

-- Assignment Rules: Org members can CRUD their own rules
ALTER TABLE public.assignment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's assignment rules"
  ON public.assignment_rules FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create assignment rules for their org"
  ON public.assignment_rules FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org's assignment rules"
  ON public.assignment_rules FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their org's assignment rules"
  ON public.assignment_rules FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- SLA Policies: Similar to assignment rules
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's SLA policies"
  ON public.sla_policies FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create SLA policies for their org"
  ON public.sla_policies FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org's SLA policies"
  ON public.sla_policies FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their org's SLA policies"
  ON public.sla_policies FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Case Escalations: Users can view escalations for reports they have access to
ALTER TABLE public.case_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view escalations for their org's reports"
  ON public.case_escalations FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM public.reports
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create escalations for their org's reports"
  ON public.case_escalations FOR INSERT
  WITH CHECK (
    report_id IN (
      SELECT id FROM public.reports
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

-- Workflow Logs: Read-only for users, service role can insert
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow logs for their org's reports"
  ON public.workflow_logs FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM public.reports
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can insert workflow logs"
  ON public.workflow_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.assignment_rules IS 'Auto-assignment rules for reports based on conditions';
COMMENT ON TABLE public.sla_policies IS 'SLA (Service Level Agreement) policies for response times';
COMMENT ON TABLE public.case_escalations IS 'Audit trail for case escalations';
COMMENT ON TABLE public.workflow_logs IS 'Audit trail for workflow automation actions';
