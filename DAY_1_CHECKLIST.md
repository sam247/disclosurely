# 🚀 Day 1 Checklist - Workflow Automation Begins
## Friday, November 8, 2025

---

## 📋 Today's Goal
Create the database foundation for workflow automation (assignment rules, SLA policies, escalations, workflow logs)

---

## ✅ Morning Tasks (9am - 12pm)

### 1. Create Migration File
```bash
# Create new migration
touch supabase/migrations/20251108210000_add_workflow_automation.sql
```

### 2. Write Database Schema
Copy this SQL into the migration file:

```sql
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
```

### 3. Run Migration
```bash
# If using Supabase CLI
supabase db push

# Or run in Supabase SQL Editor
# Copy the SQL and execute
```

---

## ✅ Afternoon Tasks (1pm - 5pm)

### 4. Create Edge Function Scaffold
```bash
# Create edge function directory
mkdir -p supabase/functions/case-workflow-engine

# Create index.ts
touch supabase/functions/case-workflow-engine/index.ts
```

### 5. Write Basic Edge Function
Copy this TypeScript into `supabase/functions/case-workflow-engine/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssignmentRule {
  id: string;
  priority: number;
  conditions: {
    category?: string;
    urgency?: string;
    keywords?: string[];
  };
  assign_to_user_id?: string;
  assign_to_team?: string;
}

interface SLAPolicy {
  critical_response_time: number;
  high_response_time: number;
  medium_response_time: number;
  low_response_time: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await req.json()
    const { action, reportId, organizationId } = body

    switch (action) {
      case 'auto_assign':
        return await autoAssignReport(supabase, reportId, organizationId)
      case 'calculate_sla':
        return await calculateSLA(supabase, reportId, organizationId)
      case 'escalate':
        return await escalateCase(supabase, reportId, body.escalateTo, body.reason)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function autoAssignReport(supabase: any, reportId: string, organizationId: string) {
  // 1. Get report details
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report) {
    throw new Error('Report not found')
  }

  // 2. Fetch active assignment rules (ordered by priority)
  const { data: rules } = await supabase
    .from('assignment_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('enabled', true)
    .order('priority', { ascending: false })

  // 3. Match rules against report
  for (const rule of rules || []) {
    if (matchesConditions(report, rule.conditions)) {
      // Assign report
      await supabase
        .from('reports')
        .update({
          assigned_to: rule.assign_to_user_id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', reportId)

      // Log the action
      await supabase
        .from('workflow_logs')
        .insert({
          report_id: reportId,
          action: 'auto_assigned',
          details: {
            rule_id: rule.id,
            rule_name: rule.name,
            assigned_to: rule.assign_to_user_id
          }
        })

      return new Response(
        JSON.stringify({ success: true, assigned_to: rule.assign_to_user_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // No rule matched
  return new Response(
    JSON.stringify({ success: true, assigned_to: null, message: 'No matching rule' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function matchesConditions(report: any, conditions: any): boolean {
  // Category match
  if (conditions.category && report.report_type !== conditions.category) {
    return false
  }

  // Urgency match (priority mapping: 1=low, 2=medium, 3=high, 4=critical)
  if (conditions.urgency) {
    const urgencyMap: any = { low: 1, medium: 2, high: 3, critical: 4 }
    if (urgencyMap[conditions.urgency] !== report.priority) {
      return false
    }
  }

  // Keyword match
  if (conditions.keywords && conditions.keywords.length > 0) {
    const contentLower = (report.title + ' ' + report.description).toLowerCase()
    const hasKeyword = conditions.keywords.some((keyword: string) =>
      contentLower.includes(keyword.toLowerCase())
    )
    if (!hasKeyword) {
      return false
    }
  }

  return true
}

async function calculateSLA(supabase: any, reportId: string, organizationId: string) {
  // Get report
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  // Get SLA policy
  const { data: slaPolicy } = await supabase
    .from('sla_policies')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_default', true)
    .single()

  if (!slaPolicy) {
    return new Response(
      JSON.stringify({ success: false, message: 'No SLA policy found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate deadline based on priority
  const priorityMap: any = {
    1: slaPolicy.low_response_time,
    2: slaPolicy.medium_response_time,
    3: slaPolicy.high_response_time,
    4: slaPolicy.critical_response_time
  }

  const hoursToAdd = priorityMap[report.priority] || slaPolicy.medium_response_time
  const deadline = new Date(report.created_at)
  deadline.setHours(deadline.getHours() + hoursToAdd)

  // Update report with SLA deadline
  await supabase
    .from('reports')
    .update({ sla_deadline: deadline.toISOString() })
    .eq('id', reportId)

  return new Response(
    JSON.stringify({ success: true, sla_deadline: deadline }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function escalateCase(supabase: any, reportId: string, escalateTo: string, reason: string) {
  // Get current assignee
  const { data: report } = await supabase
    .from('reports')
    .select('assigned_to')
    .eq('id', reportId)
    .single()

  // Create escalation record
  await supabase
    .from('case_escalations')
    .insert({
      report_id: reportId,
      escalated_from: report.assigned_to,
      escalated_to: escalateTo,
      reason: reason,
      sla_breached: false
    })

  // Update report assignment
  await supabase
    .from('reports')
    .update({ assigned_to: escalateTo })
    .eq('id', reportId)

  // Log workflow
  await supabase
    .from('workflow_logs')
    .insert({
      report_id: reportId,
      action: 'escalated',
      details: {
        from: report.assigned_to,
        to: escalateTo,
        reason
      }
    })

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### 6. Deploy Edge Function
```bash
supabase functions deploy case-workflow-engine
```

---

## ✅ Testing Checklist

- [ ] Migration runs without errors
- [ ] All tables created successfully
- [ ] RLS policies in place
- [ ] Edge function deploys successfully
- [ ] Can call edge function via Postman/curl
- [ ] Basic auto-assignment works

---

## 📝 End of Day Report

**What should be done by 5pm:**
1. ✅ 4 new tables created (assignment_rules, sla_policies, case_escalations, workflow_logs)
2. ✅ RLS policies configured
3. ✅ Edge function scaffold deployed
4. ✅ Basic auto-assignment logic working

**Tomorrow (Day 2):**
- Refine assignment rule matching logic
- Add support for more condition types
- Create default SLA policy on org creation
- Start building UI for assignment rules

---

## 🚨 Blockers? Issues?

If you hit any blockers:
1. Check Supabase logs: Dashboard → Edge Functions → Logs
2. Verify RLS policies: Dashboard → Database → Policies
3. Test edge function: Use Postman or `curl -X POST ...`
4. Ask for help in team chat

**Let's ship workflow automation!** 🚀
