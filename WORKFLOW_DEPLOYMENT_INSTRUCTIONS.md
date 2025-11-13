# Workflow Automation - Deployment Instructions

## Overview
This document provides step-by-step instructions for deploying the workflow automation backend (Day 1 implementation).

---

## What Was Created

### 1. Database Migration
**File:** `supabase/migrations/20251108210000_add_workflow_automation.sql`

**Creates:**
- `assignment_rules` table - Auto-assignment rules based on conditions
- `sla_policies` table - SLA (Service Level Agreement) response time policies
- `case_escalations` table - Audit trail for escalations
- `workflow_logs` table - Audit trail for all workflow actions
- Adds 3 new columns to `reports` table: `assigned_to`, `assigned_at`, `sla_deadline`
- Row Level Security (RLS) policies for all tables
- Performance indexes

### 2. Edge Function
**File:** `supabase/functions/case-workflow-engine/index.ts`

**Provides:**
- `auto_assign` - Automatically assigns reports based on rules
- `calculate_sla` - Calculates SLA deadlines based on priority
- `escalate` - Escalates cases to different users

---

## Deployment Steps

### Step 1: Run Database Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
# From project root
supabase db push
```

**Option B: Using Supabase Dashboard (Manual)**
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy the entire contents of `supabase/migrations/20251108210000_add_workflow_automation.sql`
5. Paste into the SQL editor
6. Click **Run**
7. Verify all tables were created: Go to **Database** → **Tables** and look for:
   - `assignment_rules`
   - `sla_policies`
   - `case_escalations`
   - `workflow_logs`

---

### Step 2: Deploy Edge Function

**Option A: Using Supabase CLI (Recommended)**
```bash
# From project root
supabase functions deploy case-workflow-engine
```

**Option B: Using Supabase Dashboard (Manual)**
1. Go to your Supabase project
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name: `case-workflow-engine`
5. Copy the contents of `supabase/functions/case-workflow-engine/index.ts`
6. Paste into the function editor
7. Click **Deploy**

---

### Step 3: Verify Deployment

#### Verify Tables
```sql
-- Run in SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('assignment_rules', 'sla_policies', 'case_escalations', 'workflow_logs');
```

You should see 4 rows returned.

#### Verify RLS Policies
```sql
-- Run in SQL Editor
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('assignment_rules', 'sla_policies', 'case_escalations', 'workflow_logs');
```

You should see policies for SELECT, INSERT, UPDATE, DELETE on each table.

#### Verify Edge Function
1. Go to **Edge Functions** → **case-workflow-engine**
2. Click **Invoke**
3. Send test payload:
```json
{
  "action": "auto_assign",
  "reportId": "test-id",
  "organizationId": "test-org-id"
}
```
4. You should get a response (even if it's an error about missing report - that's expected)

---

## Testing the Workflow Engine

### Test 1: Create an Assignment Rule

```sql
-- Create a test assignment rule (replace UUIDs with real ones from your database)
INSERT INTO public.assignment_rules (
  organization_id,
  name,
  priority,
  enabled,
  conditions,
  assign_to_user_id
)
VALUES (
  'YOUR_ORG_ID',  -- Replace with actual org ID
  'Auto-assign financial reports',
  100,
  true,
  '{"category": "financial", "urgency": "high"}'::jsonb,
  'YOUR_USER_ID'  -- Replace with actual user ID
);
```

### Test 2: Create a Default SLA Policy

```sql
-- Create a default SLA policy
INSERT INTO public.sla_policies (
  organization_id,
  name,
  critical_response_time,
  high_response_time,
  medium_response_time,
  low_response_time,
  escalate_after_breach,
  is_default
)
VALUES (
  'YOUR_ORG_ID',  -- Replace with actual org ID
  'Default SLA Policy',
  24,   -- 24 hours for critical
  48,   -- 48 hours for high
  120,  -- 5 days for medium
  240,  -- 10 days for low
  true,
  true
);
```

### Test 3: Test Auto-Assignment

**Using the Edge Function Invoke UI:**
1. Go to **Edge Functions** → **case-workflow-engine**
2. Click **Invoke**
3. Use this payload (replace with real IDs):
```json
{
  "action": "auto_assign",
  "reportId": "YOUR_REPORT_ID",
  "organizationId": "YOUR_ORG_ID"
}
```

4. Check response - should show `assigned_to` if rule matched

**Verify in Database:**
```sql
-- Check if report was assigned
SELECT id, tracking_id, assigned_to, assigned_at
FROM public.reports
WHERE id = 'YOUR_REPORT_ID';

-- Check workflow log
SELECT action, details, created_at
FROM public.workflow_logs
WHERE report_id = 'YOUR_REPORT_ID';
```

### Test 4: Test SLA Calculation

**Using the Edge Function Invoke UI:**
```json
{
  "action": "calculate_sla",
  "reportId": "YOUR_REPORT_ID",
  "organizationId": "YOUR_ORG_ID"
}
```

**Verify in Database:**
```sql
SELECT id, tracking_id, priority, sla_deadline, created_at
FROM public.reports
WHERE id = 'YOUR_REPORT_ID';
```

---

## Next Steps (Day 2)

After successful deployment:

1. **Integrate with Report Submission**
   - Modify `submit-anonymous-report` edge function to call `case-workflow-engine` after creating a report
   - Auto-assign and calculate SLA for all new reports

2. **Create SLA Checker Cron Job**
   - Edge function that runs every hour
   - Checks for SLA breaches
   - Sends warnings and escalates if needed

3. **Build Frontend UI**
   - Assignment Rules management
   - SLA Policies management
   - Workflow History viewer

---

## Troubleshooting

### Migration Fails
- Check for existing tables with same names
- Verify foreign key references (organizations, profiles, reports tables must exist)
- Look at error message in SQL Editor

### Edge Function Fails to Deploy
- Check syntax errors in TypeScript
- Verify Deno imports are accessible
- Check function logs in Edge Functions dashboard

### RLS Policies Block Access
- Verify user is authenticated
- Check user's `organization_id` matches the data
- Service role bypasses RLS (used by edge functions)

### Auto-Assignment Not Working
- Verify assignment rule conditions match report data
- Check rule is enabled (`enabled = true`)
- Check priority order (higher priority rules are checked first)
- Look at edge function logs

---

## Success Criteria

✅ All 4 tables created successfully
✅ RLS policies in place
✅ Edge function deployed without errors
✅ Can create assignment rules via SQL
✅ Can create SLA policies via SQL
✅ Edge function responds to test invocations
✅ Auto-assignment works for test reports
✅ SLA calculation works for test reports

---

## Support

If you encounter issues:
1. Check Supabase logs: **Database** → **Logs** and **Edge Functions** → **Logs**
2. Verify RLS policies: **Database** → **Policies**
3. Test edge function with Invoke UI
4. Check this conversation history for detailed implementation notes

**Backend is ready!** Next: Build the frontend UI for managing rules and viewing workflow history.
