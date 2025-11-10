# 🚀 Fast-Track Workflow Build with Lovable + Cursor
## Using AI Tools to Ship in 2-3 Days Instead of 8

---

## 🎯 Strategy: Split the Work

### **Lovable (5 credits)** → Database & Migrations
**Why?** Direct Supabase connection = can run migrations instantly
**Use for:** Days 1-2 (backend/database work)

### **Cursor Composer (24 hours)** → Frontend Components
**Why?** 24 hours = tons of component generation
**Use for:** Days 3-8 (UI work)

### **Claude (me!)** → Review & Refine
**Why?** I'll review everything, fix bugs, add polish
**Use for:** After each Lovable/Cursor session

---

## 📋 Lovable Prompts (5 Credits = 5 Sessions)

### **Credit 1: Database Schema** ⚡
```
Create database tables for workflow automation:

1. assignment_rules table:
   - id (uuid, primary key)
   - organization_id (uuid, references organizations)
   - name (text)
   - priority (integer, default 0)
   - enabled (boolean, default true)
   - conditions (jsonb) - stores: category, urgency, keywords, department
   - assign_to_user_id (uuid, references profiles)
   - assign_to_team (text)
   - created_at, updated_at (timestamptz)

2. sla_policies table:
   - id (uuid, primary key)
   - organization_id (uuid, references organizations)
   - name (text)
   - critical_response_time (integer, hours)
   - high_response_time (integer, hours)
   - medium_response_time (integer, hours)
   - low_response_time (integer, hours)
   - escalate_after_breach (boolean)
   - escalate_to_user_id (uuid, references profiles)
   - is_default (boolean)
   - created_at, updated_at (timestamptz)

3. case_escalations table:
   - id (uuid, primary key)
   - report_id (uuid, references reports)
   - escalated_from (uuid, references profiles)
   - escalated_to (uuid, references profiles)
   - reason (text)
   - sla_breached (boolean)
   - created_at (timestamptz)

4. workflow_logs table:
   - id (uuid, primary key)
   - report_id (uuid, references reports)
   - action (text) - "auto_assigned", "sla_warning", "escalated"
   - details (jsonb)
   - created_at (timestamptz)

Add these columns to reports table:
- assigned_to (uuid, references profiles)
- assigned_at (timestamptz)
- sla_deadline (timestamptz)

Create indexes on:
- assignment_rules(organization_id, enabled)
- assignment_rules(priority DESC)
- sla_policies(organization_id)
- case_escalations(report_id)
- workflow_logs(report_id)
- reports(assigned_to)
- reports(sla_deadline)

Run this migration immediately.
```

**Expected:** Migration runs, tables created, indexes added ✅

---

### **Credit 2: RLS Policies** ⚡
```
Add Row Level Security policies for workflow tables:

assignment_rules:
- Users can SELECT their org's rules (organization_id matches user's org)
- Users can INSERT/UPDATE/DELETE their org's rules
- Service role has full access

sla_policies:
- Same as assignment_rules

case_escalations:
- Users can SELECT escalations for reports in their org
- Users can INSERT escalations for their org's reports
- No UPDATE/DELETE (immutable audit trail)

workflow_logs:
- Users can SELECT logs for their org's reports
- Only service role can INSERT
- No UPDATE/DELETE (immutable audit trail)

Enable RLS on all 4 tables and create these policies.
```

**Expected:** RLS enabled, policies created ✅

---

### **Credit 3: Edge Function - Auto Assignment** ⚡
```
Create edge function: case-workflow-engine

Location: supabase/functions/case-workflow-engine/index.ts

Function should:
1. Accept actions: "auto_assign", "calculate_sla", "escalate"

For auto_assign:
- Get report details by reportId
- Fetch enabled assignment_rules for organization (ordered by priority DESC)
- For each rule, check if conditions match:
  - Category match: rule.conditions.category === report.report_type
  - Urgency match: map urgency string to priority number (1-4)
  - Keywords match: check if report title/description contains any keyword
- If rule matches:
  - Update report: assigned_to = rule.assign_to_user_id, assigned_at = now()
  - Insert workflow_log: action="auto_assigned", details={rule_id, rule_name}
  - Return {success: true, assigned_to}
- If no rule matches: return {success: true, assigned_to: null}

For calculate_sla:
- Get report priority (1=low, 2=medium, 3=high, 4=critical)
- Get default SLA policy for organization
- Map priority to hours: sla_policy[priority_response_time]
- Calculate deadline: report.created_at + hours
- Update report: sla_deadline = deadline
- Return {success: true, sla_deadline}

For escalate:
- Insert case_escalation record
- Update report: assigned_to = escalateTo
- Insert workflow_log: action="escalated"
- Return {success: true}

Use service role key for database access.
Add CORS headers.
Deploy this function.
```

**Expected:** Edge function created and deployed ✅

---

### **Credit 4: SLA Checker Cron Job** ⚡
```
Create edge function: sla-checker (cron job)

Location: supabase/functions/sla-checker/index.ts

Function should:
- Run every hour: Deno.cron("Check SLA", "0 * * * *", ...)
- Get all reports with:
  - status != 'closed'
  - sla_deadline IS NOT NULL
  - sla_deadline > now()
- For each report:
  - Calculate time remaining: deadline - now()
  - If time remaining < 0 (breached):
    - Get SLA policy for organization
    - If escalate_after_breach = true:
      - Call case-workflow-engine with action="escalate"
    - Send email notification (SLA breached)
    - Log workflow_log: action="sla_breached"
  - Else if time remaining < 24 hours:
    - Send email warning (24h remaining)
    - Log workflow_log: action="sla_warning_24h"
  - Else if time remaining < 12 hours:
    - Send email warning (12h remaining)
    - Log workflow_log: action="sla_warning_12h"

Deploy this function with cron schedule.
```

**Expected:** Cron job created, runs every hour ✅

---

### **Credit 5: Trigger on Report Insert** ⚡
```
Create database trigger to auto-assign new reports:

When a new report is inserted:
1. Call case-workflow-engine edge function with action="auto_assign"
2. Call case-workflow-engine edge function with action="calculate_sla"

Create PostgreSQL trigger function:
- Trigger: AFTER INSERT on reports
- For each row:
  - Use pg_net or similar to call edge function
  - Pass reportId and organizationId

Alternative (simpler):
Modify submit-anonymous-report edge function to:
- After inserting report
- Call auto_assign logic
- Call calculate_sla logic

Use whichever approach is easier in Lovable.
```

**Expected:** Reports auto-assign on creation ✅

---

## 📋 Cursor Composer Prompts (Use 24 hours wisely)

### **Session 1: Assignment Rules UI (2-3 hours)**
```
Create assignment rules management UI:

File: src/components/dashboard/workflows/AssignmentRulesList.tsx
- Fetch assignment_rules from Supabase (for user's org)
- Display as cards with:
  - Rule name
  - Priority badge
  - Conditions summary (Category, Urgency, Keywords)
  - Assign to (user name)
  - Used count (query workflow_logs)
  - Edit/Delete buttons
- "New Rule" button opens modal
- Drag-and-drop to reorder priority (optional, nice-to-have)

File: src/components/dashboard/workflows/AssignmentRuleModal.tsx
- Form fields:
  - Rule name (text input)
  - Priority (number input)
  - Category dropdown (get from reports.report_type enum)
  - Urgency dropdown (Critical/High/Medium/Low/Any)
  - Keywords (comma-separated text input)
  - Assign to user (dropdown from profiles in org)
  - Enabled toggle
- On save:
  - Insert/update assignment_rules
  - Invalidate query cache
  - Show toast notification

File: src/pages/dashboard/WorkflowsPage.tsx
- Tabs: [Assignment Rules] [SLA Policies] [History]
- Route: /dashboard/workflows

Add to sidebar navigation:
- Workflows section with icon

Use shadcn/ui components (Card, Dialog, Select, Input, Toggle).
Use React Query for data fetching.
```

---

### **Session 2: SLA Policies UI (2-3 hours)**
```
Create SLA policies management UI:

File: src/components/dashboard/workflows/SLAPoliciesList.tsx
- Fetch sla_policies from Supabase (for user's org)
- Display as cards with:
  - Policy name
  - Response times (Critical: Xh, High: Xh, Medium: Xh, Low: Xh)
  - Escalation settings
  - Default badge if is_default=true
  - Edit button (only 1 policy per org for MVP)

File: src/components/dashboard/workflows/SLAPolicyModal.tsx
- Form fields:
  - Policy name
  - Critical response time (number input, hours)
  - High response time (number input, hours)
  - Medium response time (number input, hours)
  - Low response time (number input, hours)
  - Auto-escalate toggle
  - Escalate to user (dropdown)
  - Is default toggle
- On save:
  - Insert/update sla_policies
  - If is_default=true, set others to false
  - Show toast notification

Add to WorkflowsPage tabs.
```

---

### **Session 3: Workflow History/Logs (1-2 hours)**
```
Create workflow history audit log:

File: src/components/dashboard/workflows/WorkflowHistory.tsx
- Fetch workflow_logs from Supabase (for user's org)
- Join with reports to show report title/tracking_id
- Display as timeline:
  - Icon based on action (🤖 auto_assigned, ⚠️ sla_warning, 🔺 escalated)
  - Action description
  - Report link
  - Details (rule name, assigned to, etc.)
  - Timestamp (relative: "2 hours ago")
- Filters:
  - Action type dropdown
  - Date range picker
  - Report search
- Pagination (20 items per page)

Add to WorkflowsPage tabs.
```

---

### **Session 4: In-Report Workflow Indicators (2-3 hours)**
```
Add workflow indicators to existing report views:

File: src/components/dashboard/ReportDetailsWorkflow.tsx (new tab)
- Show assignment info:
  - Assigned to (user name + avatar)
  - Assignment method (auto/manual) with icon
  - Assigned date/time
  - Reassign button → opens reassign modal
  - Escalate button → opens escalate modal
- Show SLA status:
  - Deadline date/time
  - Time remaining (progress bar)
  - Visual indicator (green=ok, yellow=warning, red=breached)
  - Warning email status
- Show workflow history for THIS report:
  - Same as WorkflowHistory.tsx but filtered to report_id

File: src/components/dashboard/ReportListItem.tsx (update existing)
- Add badges:
  - 🤖 icon if auto-assigned
  - ⏱️ with time remaining if SLA active
  - ⚠️ if SLA warning
  - ❌ if SLA breached

Modify: src/pages/ReportDetails.tsx
- Add "Workflow" tab
- Show ReportDetailsWorkflow component
```

---

### **Session 5: Reassign & Escalate Modals (1-2 hours)**
```
Create manual reassignment and escalation:

File: src/components/dashboard/workflows/ReassignModal.tsx
- User dropdown (select from org members)
- Reason text input (optional)
- On submit:
  - Update report: assigned_to = new_user_id, assigned_at = now()
  - Insert workflow_log: action="manually_reassigned"
  - Show toast notification

File: src/components/dashboard/workflows/EscalateModal.tsx
- Escalate to user dropdown
- Reason text input (required)
- On submit:
  - Call case-workflow-engine edge function with action="escalate"
  - Show toast notification

Use in ReportDetailsWorkflow component.
```

---

### **Session 6: Email Notifications (2-3 hours)**
```
Create email notification system for workflow events:

File: supabase/functions/send-workflow-notification/index.ts
- Accept: {event: "assigned" | "sla_warning" | "escalated", reportId, userId}
- Fetch report, user, organization details
- Use Resend API to send emails:

For "assigned":
Subject: "New report assigned to you - [Tracking ID]"
Body:
- Report title
- Category, urgency
- SLA deadline
- Link to view report

For "sla_warning":
Subject: "SLA Warning - [Time remaining] on [Tracking ID]"
Body:
- Report title
- SLA deadline
- Time remaining
- Link to view report

For "escalated":
Subject: "Report escalated to you - [Tracking ID]"
Body:
- Report title
- Escalated from (user)
- Reason
- Link to view report

Update case-workflow-engine to call send-workflow-notification after each action.
Update sla-checker to call send-workflow-notification for warnings.
```

---

## 🔍 My Review Checklist (After Lovable/Cursor)

After each Lovable session, ping me to review:
- [ ] Database schema looks correct
- [ ] RLS policies are secure (no data leaks)
- [ ] Edge functions have proper error handling
- [ ] Cron job won't cause infinite loops

After each Cursor session, ping me to review:
- [ ] Components follow existing code style
- [ ] TypeScript types are correct
- [ ] React Query setup is optimal
- [ ] UI matches the design doc
- [ ] No performance issues (N+1 queries, etc.)

---

## ⏱️ Estimated Timeline

### Day 1 (4-5 hours total)
- **Lovable Credit 1-2** (1 hour): Database + RLS
- **Review with me** (30 min): Check schema, fix any issues
- **Lovable Credit 3-4** (1 hour): Edge functions + cron
- **Review with me** (30 min): Check functions, test auto-assign
- **Lovable Credit 5** (1 hour): Trigger setup
- **Review with me** (30 min): End-to-end test

**End of Day 1:** ✅ Backend complete, auto-assignment working

---

### Day 2 (6-8 hours total)
- **Cursor Session 1-2** (4-5 hours): Assignment Rules + SLA UI
- **Review with me** (1 hour): Check components, fix bugs
- **Cursor Session 3-4** (2-3 hours): History + Report indicators
- **Review with me** (1 hour): Polish UI, fix edge cases

**End of Day 2:** ✅ Main UI complete, can create rules and view history

---

### Day 3 (3-4 hours total)
- **Cursor Session 5-6** (2-3 hours): Reassign/escalate + emails
- **Review with me** (1 hour): Test all workflows
- **Final polish** (1 hour): Fix any bugs, improve UX

**End of Day 3:** ✅ **SHIPPED!** Workflow automation is live 🎉

---

## 💡 Tips for Using Lovable/Cursor

### For Lovable:
1. **Be specific with column types** (uuid vs text, timestamptz vs timestamp)
2. **Request indexes explicitly** (Lovable sometimes forgets)
3. **Test migrations immediately** after each credit
4. **Copy migration SQL** before running (in case you need to rollback)

### For Cursor Composer:
1. **Reference existing files** ("use same pattern as DashboardView.tsx")
2. **Specify shadcn components** ("use Card, Dialog from @/components/ui")
3. **Request TypeScript types** ("create interfaces for all props")
4. **Ask for React Query** ("use useQuery for fetching, useMutation for updates")
5. **Work in small chunks** (one component at a time, test as you go)

---

## 🚨 What Could Go Wrong (And How to Fix)

### Lovable Issues:
- **Migration fails**: DM me the error, I'll fix the SQL
- **RLS too restrictive**: Can't access data → I'll adjust policies
- **Edge function doesn't deploy**: Copy the code, I'll deploy manually

### Cursor Issues:
- **Components don't compile**: TypeScript errors → I'll fix types
- **Data doesn't load**: React Query issues → I'll debug
- **UI looks broken**: CSS issues → I'll fix styling

### General:
- **Auto-assignment not working**: I'll debug edge function logic
- **SLA cron not running**: I'll check cron configuration
- **Emails not sending**: I'll verify Resend API setup

---

## 🎯 Success Criteria

By end of Day 3, you should be able to:

1. ✅ Create assignment rule: "Financial reports → Sarah"
2. ✅ Submit test report with category=Financial
3. ✅ See report auto-assigned to Sarah within seconds
4. ✅ See SLA deadline calculated (24h for critical)
5. ✅ View workflow history showing auto-assignment
6. ✅ Manually escalate report to manager
7. ✅ See workflow indicators in report list
8. ✅ Configure SLA policy in dashboard

**If all 8 work: SHIP IT!** 🚀

---

## 📞 How We'll Work Together

### Workflow:
1. **You**: Run Lovable/Cursor prompt
2. **You**: Test the result
3. **You**: DM me: "Lovable Credit 1 done - schema created"
4. **Me**: Review code, test, fix issues
5. **Me**: DM you: "Looks good! ✅ Proceed to Credit 2" OR "Found issue with X, fix applied ✅"
6. **Repeat** until done

### Communication:
- **Quick updates**: Just ping "Credit X done"
- **Blockers**: "Credit X failed with error: [paste error]"
- **Questions**: "Should sla_deadline be nullable?"

---

**Ready to start?** Run Lovable Credit 1 and ping me when it's done! 🚀
