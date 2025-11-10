# Pull Request: Workflow Automation System

## 🚀 Overview

This PR implements **complete workflow automation** for Disclosurely, including auto-assignment rules, SLA policies, escalation workflows, and comprehensive audit logging. This brings us to feature parity with competitors like NAVEX, FaceUp, and WhistleB.

**Status**: ✅ Ready for deployment (requires manual Supabase deployment steps)

---

## 📊 What's Included

### Backend (Database + Edge Functions)

#### 1. **Database Schema** (`20251108210000_add_workflow_automation.sql`)
- **assignment_rules** - Auto-assignment rules based on conditions
- **sla_policies** - SLA response time policies per priority level
- **case_escalations** - Escalation audit trail
- **workflow_logs** - Complete automation event audit log
- Added columns to **reports**: `assigned_to`, `assigned_at`, `sla_deadline`
- Full RLS policies for multi-tenant security
- Performance indexes for efficient queries

#### 2. **Edge Function** (`case-workflow-engine`)
Three actions:
- **auto_assign** - Matches reports against rules (by category, urgency, keywords)
- **calculate_sla** - Calculates SLA deadlines based on priority
- **escalate** - Escalates cases with full audit trail

#### 3. **Integration** (`submit-anonymous-report` updated)
- Auto-assignment triggered on report creation
- SLA calculation triggered on report creation
- Non-blocking (failures don't block submissions)
- Comprehensive logging for debugging

### Frontend (React UI)

#### 1. **Assignment Rules Management**
- Create/edit/delete assignment rules
- Configure conditions: category, urgency, keywords
- Priority-based rule evaluation (higher priority checked first)
- Enable/disable rules
- Visual rule cards with condition badges

**Components**:
- `AssignmentRulesList.tsx` - List view with drag handles
- `AssignmentRuleModal.tsx` - Create/edit modal with form

#### 2. **SLA Policies Management**
- Configure response times per priority (Critical/High/Medium/Low)
- Auto-escalation settings
- Default policy per organization
- Visual time display (hours/days)

**Components**:
- `SLAPoliciesList.tsx` - Policy cards with time breakdown
- `SLAPolicyModal.tsx` - Create/edit modal with time inputs

#### 3. **Workflow History**
- Complete audit log of automation events
- Timeline view with icons
- Filter by report or view organization-wide
- Action types: auto_assigned, sla_calculated, escalated, etc.

**Component**:
- `WorkflowHistory.tsx` - Timeline view with filters

#### 4. **Report Integration**
- Show assignment status on reports
- Display SLA deadline and status
- Visual indicators (on-track ✅ / warning ⚠️ / breached ❌)
- Per-report workflow history

**Component**:
- `ReportWorkflowCard.tsx` - Status card for report details page

#### 5. **Main Page & Navigation**
- Workflows page at `/dashboard/workflows`
- Tabs: Assignment Rules | SLA Policies | History
- Added to sidebar navigation (admin-only, "NEW" badge)

**Component**:
- `WorkflowsPage.tsx` - Main tabbed interface

---

## 🎯 Key Features

### 1. Auto-Assignment Rules

**How it works**:
1. Admin creates rule: "If category=financial AND urgency=high → Assign to Sarah"
2. New report submitted with those conditions
3. Workflow engine matches rule (checks priority order)
4. Report auto-assigned to Sarah
5. Logged in `workflow_logs`

**Matching Logic**:
- Category (exact match or "any")
- Urgency (1-4 priority mapping or "any")
- Keywords (report must contain at least one keyword)
- All conditions must match (AND logic)

**Priority**:
- Rules checked in descending priority order
- First matching rule wins
- Higher priority = checked first

### 2. SLA Policies

**How it works**:
1. Admin configures response times:
   - Critical: 24h
   - High: 48h
   - Medium: 120h (5 days)
   - Low: 240h (10 days)
2. New report created with priority=4 (Critical)
3. SLA deadline calculated: `created_at + 24 hours`
4. Deadline stored in `reports.sla_deadline`

**Escalation**:
- Optional auto-escalation when deadline breached
- Escalate to specified admin
- Logged in `case_escalations` table

### 3. Workflow Audit Log

**Events Tracked**:
- `auto_assigned` - Rule matched and report assigned
- `sla_calculated` - SLA deadline set
- `sla_warning` - Approaching deadline (future: hourly cron job)
- `sla_breached` - Deadline exceeded (future: hourly cron job)
- `escalated` - Case escalated to another user
- `manually_reassigned` - User manually changed assignment

**Details Stored** (JSON):
- Rule ID and name (for auto_assigned)
- Hours and deadline (for sla_calculated)
- Reason and users (for escalated)

---

## 📂 Files Changed

### New Files (10)
```
src/types/workflow.ts
src/pages/dashboard/WorkflowsPage.tsx
src/components/dashboard/workflows/AssignmentRulesList.tsx
src/components/dashboard/workflows/AssignmentRuleModal.tsx
src/components/dashboard/workflows/SLAPoliciesList.tsx
src/components/dashboard/workflows/SLAPolicyModal.tsx
src/components/dashboard/workflows/WorkflowHistory.tsx
src/components/dashboard/workflows/ReportWorkflowCard.tsx
supabase/migrations/20251108210000_add_workflow_automation.sql
supabase/functions/case-workflow-engine/index.ts
```

### Modified Files (3)
```
src/App.tsx - Added /dashboard/workflows route
src/components/dashboard/DashboardSidebar.tsx - Added Workflows nav item
supabase/functions/submit-anonymous-report/index.ts - Integrated workflow calls
```

### Documentation (2)
```
WORKFLOW_DEPLOYMENT_INSTRUCTIONS.md - Step-by-step deployment guide
LOVABLE_CURSOR_BUILD_PLAN.md - Alternative build strategy (reference only)
```

---

## 🚀 Deployment Steps

### **IMPORTANT**: Manual deployment required

The Supabase CLI couldn't be installed in the development environment, so deployment must be done manually via the Supabase Dashboard. **This takes ~10 minutes total**.

### Step 1: Deploy Database Migration (5 min)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Open `supabase/migrations/20251108210000_add_workflow_automation.sql`
5. Copy the entire SQL content
6. Paste into Supabase SQL Editor
7. Click **Run**
8. Verify success: Go to **Database** → **Tables** and confirm these exist:
   - `assignment_rules`
   - `sla_policies`
   - `case_escalations`
   - `workflow_logs`

### Step 2: Deploy Edge Function (5 min)

1. Navigate to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name: `case-workflow-engine`
4. Open `supabase/functions/case-workflow-engine/index.ts`
5. Copy the entire TypeScript content
6. Paste into function editor
7. Click **Deploy**
8. Test: Click **Invoke** and send:
   ```json
   {
     "action": "auto_assign",
     "reportId": "test-id",
     "organizationId": "test-org"
   }
   ```
9. Should get response (even if error - that's expected without real data)

### Step 3: Verify Integration

1. Go to **Edge Functions** → **submit-anonymous-report**
2. Check recent deployments (should be auto-deployed from commit)
3. If not, redeploy `supabase/functions/submit-anonymous-report/index.ts`

### Step 4: Test End-to-End

1. Login to dashboard
2. Navigate to **Workflows** (in sidebar)
3. Create an Assignment Rule:
   - Name: "Test Rule"
   - Category: Any
   - Urgency: Any
   - Assign to: Yourself
4. Create SLA Policy:
   - Name: "Default Policy"
   - Set times (use defaults)
   - Mark as default
5. Submit a test report via `/report`
6. Check dashboard - report should be auto-assigned
7. Open report details - should show SLA deadline
8. Go to Workflows → History - should see events

---

## ✅ Testing Checklist

### Assignment Rules
- [ ] Can create rule with category filter
- [ ] Can create rule with urgency filter
- [ ] Can create rule with keywords
- [ ] Can set priority
- [ ] Can enable/disable rule
- [ ] Can edit existing rule
- [ ] Can delete rule
- [ ] Rules appear in order (highest priority first)

### SLA Policies
- [ ] Can create SLA policy
- [ ] Can set different times per priority
- [ ] Can enable auto-escalation
- [ ] Can set escalation target
- [ ] Can mark as default
- [ ] Only one default policy allowed
- [ ] Can edit existing policy

### Workflow History
- [ ] Shows auto-assignment events
- [ ] Shows SLA calculation events
- [ ] Shows escalation events (manual testing needed)
- [ ] Displays report tracking IDs
- [ ] Shows relative timestamps ("2 hours ago")
- [ ] Per-report filtering works

### Report Integration
- [ ] Submit new report → auto-assigned if rule matches
- [ ] Submit new report → SLA deadline calculated
- [ ] Report details shows assignment status
- [ ] Report details shows SLA status
- [ ] SLA visual indicator correct (on-track/warning/breached)
- [ ] Workflow history appears on report page

### Navigation
- [ ] Workflows appears in sidebar (admins only)
- [ ] "NEW" badge shows
- [ ] Route `/dashboard/workflows` works
- [ ] Tabs switch correctly
- [ ] Non-admins see locked icon

---

## 📈 Impact & Business Value

### Competitive Parity
✅ Now matches NAVEX, FaceUp, WhistleB on workflow automation

### Time Savings
- **Before**: Manual assignment (~5 min per report)
- **After**: Instant auto-assignment (0 min)
- **Savings**: 5 min × 100 reports/month = **8.3 hours/month saved**

### Compliance
- SLA tracking ensures regulatory compliance
- Audit log provides complete evidence trail
- Escalation prevents missed deadlines

### User Experience
- Faster response times (immediate assignment)
- Clear accountability (assigned user visible)
- Proactive deadline management

---

## 🔮 Future Enhancements

### Day 2 (Planned but not in this PR)
- [ ] SLA Checker cron job (runs hourly)
- [ ] Email notifications on SLA warnings
- [ ] Email notifications on auto-assignment
- [ ] Manual reassignment UI
- [ ] Escalation modal in report details

### Week 2 (Advanced Features)
- [ ] Team-based assignment (not just individual users)
- [ ] Custom escalation chains
- [ ] Business hours vs calendar hours
- [ ] Pause SLA during investigation
- [ ] SLA analytics dashboard

---

## 🐛 Known Limitations

1. **No SLA monitoring yet**: Hourly cron job not included (Day 2)
2. **No email notifications**: Planned for Day 2
3. **No manual reassignment UI**: Can be done via database, UI coming Day 2
4. **Workflows admin-only**: Intentional (org_admin role required)
5. **Single default SLA policy**: Multi-policy support planned for Week 2

---

## 🔒 Security Considerations

### Row Level Security (RLS)
- ✅ All tables have RLS policies
- ✅ Users can only see their org's data
- ✅ Service role bypasses RLS (for edge functions)
- ✅ Audit logs are read-only for users

### Data Privacy
- ✅ No PII in workflow tables
- ✅ Assignment rules don't expose report content
- ✅ Workflow logs reference reports by ID only

### Authorization
- ✅ Workflows page requires `org_admin` role
- ✅ Non-admins see locked state in sidebar
- ✅ Edge functions use service role key

---

## 📊 Database Schema Reference

### assignment_rules
```sql
id                  UUID PRIMARY KEY
organization_id     UUID (FK → organizations)
name                TEXT
priority            INTEGER (default 0)
enabled             BOOLEAN (default true)
conditions          JSONB (category, urgency, keywords)
assign_to_user_id   UUID (FK → profiles)
assign_to_team      TEXT (future use)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### sla_policies
```sql
id                        UUID PRIMARY KEY
organization_id           UUID (FK → organizations)
name                      TEXT
critical_response_time    INTEGER (hours, default 24)
high_response_time        INTEGER (hours, default 48)
medium_response_time      INTEGER (hours, default 120)
low_response_time         INTEGER (hours, default 240)
escalate_after_breach     BOOLEAN (default true)
escalate_to_user_id       UUID (FK → profiles)
is_default                BOOLEAN (default false)
created_at                TIMESTAMPTZ
updated_at                TIMESTAMPTZ
```

### case_escalations
```sql
id                UUID PRIMARY KEY
report_id         UUID (FK → reports)
escalated_from    UUID (FK → profiles, nullable)
escalated_to      UUID (FK → profiles)
reason            TEXT (nullable)
sla_breached      BOOLEAN (default false)
created_at        TIMESTAMPTZ
```

### workflow_logs
```sql
id          UUID PRIMARY KEY
report_id   UUID (FK → reports)
action      TEXT (enum: auto_assigned, sla_calculated, etc.)
details     JSONB (action-specific data)
created_at  TIMESTAMPTZ
```

### reports (new columns)
```sql
assigned_to    UUID (FK → profiles, nullable)
assigned_at    TIMESTAMPTZ (nullable)
sla_deadline   TIMESTAMPTZ (nullable)
```

---

## 🎓 How to Use (Admin Guide)

### Creating Your First Assignment Rule

1. **Login** as an admin
2. **Navigate** to Workflows (sidebar)
3. **Click** "New Rule"
4. **Fill out**:
   - Name: "Financial Reports to Finance Team"
   - Priority: 100 (high priority)
   - Category: Financial
   - Urgency: Any
   - Keywords: fraud, embezzlement, money
   - Assign to: Sarah (Finance Lead)
5. **Save** and enable
6. **Test**: Submit a financial report → should auto-assign to Sarah

### Creating Your First SLA Policy

1. **Navigate** to Workflows → SLA Policies tab
2. **Click** "Create Policy"
3. **Fill out**:
   - Name: "Standard SLA"
   - Critical: 24h
   - High: 48h
   - Medium: 120h (5 days)
   - Low: 240h (10 days)
   - Auto-escalate: Yes
   - Escalate to: You (as admin)
   - Is default: Yes
4. **Save**
5. **Test**: Submit any report → should have SLA deadline calculated

### Viewing Workflow History

1. **Navigate** to Workflows → History tab
2. **See** timeline of all automation events
3. **Click** report tracking ID to jump to report
4. **Or** view history on individual report pages

---

## 🔗 Related Documents

- **Deployment Guide**: `WORKFLOW_DEPLOYMENT_INSTRUCTIONS.md`
- **Day 1 Checklist**: `DAY_1_CHECKLIST.md`
- **20-Day Sprint Plan**: `20_DAY_SPRINT_PLAN.md`
- **UX Design**: `WORKFLOW_AUTOMATION_UX_DESIGN.md`
- **Alternative Build Strategy**: `LOVABLE_CURSOR_BUILD_PLAN.md`

---

## ✨ Screenshots

_To be added after deployment:_
- [ ] Assignment Rules list
- [ ] Assignment Rule modal
- [ ] SLA Policy card
- [ ] Workflow History timeline
- [ ] Report with SLA status
- [ ] Sidebar with Workflows item

---

## 🚦 Deployment Status

**Current**: ✅ Code complete, ready for manual deployment

**Deployment Steps**:
1. ⏳ Run migration in Supabase SQL Editor
2. ⏳ Deploy case-workflow-engine edge function
3. ⏳ Verify submit-anonymous-report redeployed
4. ⏳ Test end-to-end workflow

**Estimated Time**: 15 minutes

---

**Branch**: `claude/whistleblowing-feature-roadmap-011CUtVb77xMdFcqQBajYmKw`

**Commits**:
- `827b5e0` - Add complete workflow automation feature (frontend + backend integration)
- `ffaa3a6` - Add Day 1 workflow automation backend
- `28ef75c` - Add Lovable/Cursor build plan for accelerated workflow UI development

**Ready to merge after deployment and testing** ✅
