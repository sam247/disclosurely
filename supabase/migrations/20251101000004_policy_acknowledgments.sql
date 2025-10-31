-- Policy Acknowledgment System
-- Tracks employee policy sign-offs with digital signatures and timestamps

-- Table: policy_assignments
-- Tracks which policies are assigned to which users
CREATE TABLE IF NOT EXISTS public.policy_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(policy_id, user_id)
);

-- Table: policy_acknowledgments
-- Records when users acknowledge/sign policies
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
  policy_version INT NOT NULL, -- Tracks which version was acknowledged
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  signature_data JSONB, -- Digital signature details (name, timestamp, etc)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_policy_assignments_org ON public.policy_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_policy_assignments_policy ON public.policy_assignments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_assignments_user ON public.policy_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_assignments_due_date ON public.policy_assignments(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_org ON public.policy_acknowledgments(organization_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_policy ON public.policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user ON public.policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_date ON public.policy_acknowledgments(acknowledged_at);

-- RLS Policies for policy_assignments
ALTER TABLE public.policy_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view assignments for their organization
CREATE POLICY "Users can view policy assignments in their organization"
  ON public.policy_assignments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Org admins can create/update/delete assignments
CREATE POLICY "Org admins can manage policy assignments"
  ON public.policy_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.organization_id = policy_assignments.organization_id
        AND ur.role IN ('org_admin', 'compliance_officer', 'policy_owner')
        AND ur.is_active = true
    )
  );

-- RLS Policies for policy_acknowledgments
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Users can view acknowledgments in their organization
CREATE POLICY "Users can view policy acknowledgments in their organization"
  ON public.policy_acknowledgments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Users can create their own acknowledgments
CREATE POLICY "Users can create their own policy acknowledgments"
  ON public.policy_acknowledgments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Org admins can view all acknowledgments
CREATE POLICY "Org admins can manage policy acknowledgments"
  ON public.policy_acknowledgments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.organization_id = policy_acknowledgments.organization_id
        AND ur.role IN ('org_admin', 'compliance_officer')
        AND ur.is_active = true
    )
  );

-- Helper view: Pending policy acknowledgments
-- Shows policies assigned but not yet acknowledged
CREATE OR REPLACE VIEW public.pending_policy_acknowledgments AS
SELECT 
  pa.id AS assignment_id,
  pa.organization_id,
  pa.policy_id,
  pa.user_id,
  pa.assigned_at,
  pa.due_date,
  pa.reminder_sent_at,
  cp.policy_name,
  cp.policy_type,
  cp.version AS current_version,
  p.email AS user_email,
  p.first_name,
  p.last_name,
  CASE 
    WHEN pa.due_date < NOW() THEN 'overdue'
    WHEN pa.due_date < NOW() + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'pending'
  END AS status
FROM public.policy_assignments pa
JOIN public.compliance_policies cp ON pa.policy_id = cp.id
JOIN public.profiles p ON pa.user_id = p.id
LEFT JOIN public.policy_acknowledgments pack ON 
  pa.policy_id = pack.policy_id AND 
  pa.user_id = pack.user_id AND
  pack.policy_version = cp.version
WHERE pack.id IS NULL -- Not yet acknowledged
  AND cp.status = 'active'; -- Only active policies

-- Helper view: Policy acknowledgment summary
-- Shows acknowledgment status per policy
CREATE OR REPLACE VIEW public.policy_acknowledgment_summary AS
SELECT 
  cp.id AS policy_id,
  cp.organization_id,
  cp.policy_name,
  cp.policy_type,
  cp.version,
  COUNT(DISTINCT pa.user_id) AS total_assigned,
  COUNT(DISTINCT pack.user_id) AS total_acknowledged,
  COUNT(DISTINCT pa.user_id) - COUNT(DISTINCT pack.user_id) AS pending_count,
  ROUND(
    CAST(COUNT(DISTINCT pack.user_id) AS DECIMAL) / 
    NULLIF(COUNT(DISTINCT pa.user_id), 0) * 100, 
    2
  ) AS acknowledgment_rate
FROM public.compliance_policies cp
LEFT JOIN public.policy_assignments pa ON cp.id = pa.policy_id
LEFT JOIN public.policy_acknowledgments pack ON 
  pa.policy_id = pack.policy_id AND 
  pa.user_id = pack.user_id AND
  pack.policy_version = cp.version
WHERE cp.status = 'active'
GROUP BY cp.id, cp.organization_id, cp.policy_name, cp.policy_type, cp.version;

-- Function: Mark assignment reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(assignment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.policy_assignments
  SET 
    reminder_sent_at = NOW(),
    updated_at = NOW()
  WHERE id = assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to views
GRANT SELECT ON public.pending_policy_acknowledgments TO authenticated;
GRANT SELECT ON public.policy_acknowledgment_summary TO authenticated;

COMMENT ON TABLE public.policy_assignments IS 'Tracks which policies are assigned to which users for acknowledgment';
COMMENT ON TABLE public.policy_acknowledgments IS 'Records timestamped policy acknowledgments with digital signatures';
COMMENT ON VIEW public.pending_policy_acknowledgments IS 'Shows policies assigned but not yet acknowledged';
COMMENT ON VIEW public.policy_acknowledgment_summary IS 'Summary of acknowledgment rates per policy';

