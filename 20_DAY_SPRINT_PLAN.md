# 🚀 Disclosurely: 20-Day Sprint Plan
## Closing Critical Gaps vs NAVEX/FaceUp/WhistleB

**Timeline**: November 8 - November 28, 2025 (20 days)
**Goal**: Ship enterprise-critical features to compete with NAVEX EthicsPoint and FaceUp

---

## 📊 What We Can Realistically Ship in 20 Days

Given the timeline, we need to **ruthlessly prioritize**. Here's what's achievable:

### ✅ **WILL SHIP** (High Impact, Realistic Timeline)
1. **Workflow Automation** (Days 1-8) - 🔴 CRITICAL for enterprise
2. **Team Collaboration** (Days 9-12) - 🟡 HIGH impact, builds on workflow
3. **Language Expansion** (Days 13-15) - 🟡 HIGH impact, mostly translation work
4. **Advanced Analytics Foundation** (Days 16-18) - 🟢 MEDIUM impact, sets up future
5. **PWA Mobile** (Days 19-20) - 🟢 QUICK WIN, better than nothing

### ⏸️ **DEFER TO NEXT SPRINT** (Not enough time)
- HRIS Integrations (Merge.dev integration = 6-8 weeks)
- Native Mobile Apps (10-12 weeks)
- Advanced AI (risk scoring, triage = 4-5 weeks)
- External API (3-4 weeks)

---

## 📅 Day-by-Day Implementation Plan

### **WEEK 1: Workflow Automation** (Days 1-8)
**Goal**: Ship auto-assignment, SLA tracking, and escalation rules

#### **Day 1-2: Database Schema & Backend**
- [ ] Create `assignment_rules` table
- [ ] Create `sla_policies` table
- [ ] Create `case_escalations` table
- [ ] Create `workflow_logs` table
- [ ] Write RLS policies for all tables
- [ ] Create edge function: `case-workflow-engine`

**Schema**:
```sql
-- Assignment Rules
CREATE TABLE assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,

  -- Conditions (JSON for flexibility)
  conditions JSONB DEFAULT '{}'::jsonb,
  -- Example: {"category": "financial", "urgency": "critical", "keywords": ["fraud"]}

  -- Actions
  assign_to_user_id UUID REFERENCES profiles(id),
  assign_to_team TEXT, -- "finance", "legal", "hr", etc.

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SLA Policies
CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,

  -- SLA thresholds (in hours)
  critical_response_time INTEGER DEFAULT 24,
  high_response_time INTEGER DEFAULT 48,
  medium_response_time INTEGER DEFAULT 120, -- 5 days
  low_response_time INTEGER DEFAULT 240, -- 10 days

  -- Escalation settings
  escalate_after_breach BOOLEAN DEFAULT true,
  escalate_to_user_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Case Escalations (audit trail)
CREATE TABLE case_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  escalated_from UUID REFERENCES profiles(id),
  escalated_to UUID REFERENCES profiles(id),
  reason TEXT,
  sla_breached BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Logs (audit trail)
CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- "auto_assigned", "sla_warning", "escalated"
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### **Day 3-4: Auto-Assignment Engine**
- [ ] Implement rule matching algorithm in edge function
- [ ] Priority-based rule execution (highest priority wins)
- [ ] Support for conditions: category, urgency, keywords, department
- [ ] Automatic assignment on report creation
- [ ] Workflow logging for all assignments

**Edge Function Logic**:
```typescript
// supabase/functions/case-workflow-engine/index.ts
async function autoAssignReport(reportId: string, reportData: any) {
  // 1. Fetch active assignment rules for organization (ordered by priority)
  const rules = await getAssignmentRules(reportData.organization_id);

  // 2. Evaluate rules against report
  for (const rule of rules) {
    if (matchesConditions(reportData, rule.conditions)) {
      // 3. Assign to user or team
      await assignReport(reportId, rule.assign_to_user_id);

      // 4. Log action
      await logWorkflow(reportId, 'auto_assigned', { rule_id: rule.id });

      return; // First match wins
    }
  }

  // 5. No rule matched - assign to default handler
  await assignToDefault(reportId);
}
```

#### **Day 5-6: SLA Tracking & Warnings**
- [ ] Calculate SLA deadlines based on priority
- [ ] Background job (cron) to check SLA breaches every hour
- [ ] Email notifications for upcoming SLA deadlines (24h, 12h, 6h warnings)
- [ ] Visual SLA indicators in dashboard (red = breached, yellow = warning, green = ok)

**Cron Job** (runs every hour):
```typescript
// supabase/functions/sla-checker/index.ts
Deno.cron("Check SLA breaches", "0 * * * *", async () => {
  const reports = await getActiveReports();

  for (const report of reports) {
    const slaPolicy = await getSLAPolicy(report.organization_id);
    const deadline = calculateDeadline(report, slaPolicy);
    const timeRemaining = deadline - new Date();

    if (timeRemaining < 0) {
      // SLA breached - escalate
      await escalateReport(report.id, slaPolicy.escalate_to_user_id);
      await sendSLABreachNotification(report);
    } else if (timeRemaining < 24 * 60 * 60 * 1000) {
      // 24h warning
      await sendSLAWarningNotification(report, timeRemaining);
    }
  }
});
```

#### **Day 7-8: Escalation Workflows + UI**
- [ ] Manual escalation UI (button in report details)
- [ ] Auto-escalation on SLA breach
- [ ] Escalation audit trail
- [ ] Dashboard UI for assignment rules management
- [ ] Dashboard UI for SLA policy configuration

**UI Components**:
- `src/components/dashboard/AssignmentRules.tsx` - Manage assignment rules
- `src/components/dashboard/SLAPolicies.tsx` - Configure SLA thresholds
- `src/components/dashboard/CaseEscalation.tsx` - Escalate button + modal
- `src/components/dashboard/WorkflowLogs.tsx` - View workflow history

---

### **WEEK 2: Team Collaboration** (Days 9-12)
**Goal**: Multi-investigator support, internal notes, task management

#### **Day 9-10: Multi-Investigator Support**
- [ ] Create `case_investigators` table (many-to-many)
- [ ] Assign multiple users to a case (primary + secondary + observers)
- [ ] Role-based permissions (primary can close, secondary can comment)
- [ ] UI to add/remove investigators

**Schema**:
```sql
CREATE TABLE case_investigators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'secondary', -- 'primary', 'secondary', 'observer'
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES profiles(id),
  UNIQUE(report_id, user_id)
);
```

#### **Day 11: Internal Notes System**
- [ ] Create `internal_notes` table
- [ ] Rich text editor for internal notes (TipTap or similar)
- [ ] @mentions support (notify tagged users)
- [ ] Only visible to investigators, not whistleblower
- [ ] UI component for internal notes thread

**Schema**:
```sql
CREATE TABLE internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **Day 12: Task Management**
- [ ] Create `case_tasks` table
- [ ] Assign tasks within a case ("Interview witness", "Review documents")
- [ ] Task status tracking (pending, in_progress, completed)
- [ ] Task assignment to specific investigators
- [ ] Simple Kanban UI for tasks

**Schema**:
```sql
CREATE TABLE case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

---

### **WEEK 3: Language Expansion** (Days 13-15)
**Goal**: Expand from 12 to 50+ languages

#### **Day 13: Add 38 New Languages (Technical Setup)**
- [ ] Update `progressiveFormTranslations.ts` with 38 new language keys
- [ ] Add language options to all language selectors
- [ ] Test RTL support for Arabic, Hebrew, Persian
- [ ] Update language selector UI (searchable dropdown for 50+ languages)

**Languages to Add**:
```typescript
// Asia-Pacific (7)
'zh', 'ja', 'ko', 'hi', 'th', 'vi', 'id'

// Eastern Europe (8)
'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'sr'

// Middle East (4)
'ar', 'he', 'fa', 'tr'

// Africa (3)
'sw', 'am', 'ha'

// Americas (2)
'pt-BR', 'fr-CA'

// Others (14)
'fi', 'et', 'lv', 'lt', 'uk', 'ka', 'sq', 'mk', 'bs',
'is', 'mt', 'cy', 'ga', 'bn'
```

#### **Day 14-15: Translation Work**
- [ ] Use GPT-4 to generate initial translations for all 38 languages
- [ ] Hire Upwork translators for human review ($50-100 per language)
- [ ] Focus on critical strings first (form labels, buttons, errors)
- [ ] Create translation management script

**Translation Script**:
```typescript
// scripts/translate.ts
// Uses OpenAI API to batch-translate from English to all languages
const baseTranslations = progressiveFormTranslations.en;

for (const lang of NEW_LANGUAGES) {
  const translated = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `You are a professional translator. Translate the following JSON to ${lang}. Preserve all placeholders like {current}, {total}.`
    }, {
      role: 'user',
      content: JSON.stringify(baseTranslations)
    }]
  });

  // Save to file
  writeFileSync(`src/i18n/translations/${lang}.json`, translated.choices[0].message.content);
}
```

---

### **WEEK 3: Advanced Analytics Foundation** (Days 16-18)
**Goal**: Customizable dashboard with trend analysis

#### **Day 16-17: Analytics Engine**
- [ ] Create aggregated views for common queries (reports by category, by month, by status)
- [ ] Implement trend analysis (month-over-month, year-over-year)
- [ ] Add chart library (Recharts or Chart.js)
- [ ] Create reusable chart components

**Components**:
- `src/components/dashboard/analytics/TrendChart.tsx` - Line chart for trends
- `src/components/dashboard/analytics/CategoryBreakdown.tsx` - Pie chart
- `src/components/dashboard/analytics/ResolutionTimeMetrics.tsx` - Bar chart
- `src/components/dashboard/analytics/HeatMap.tsx` - Time/day heatmap

#### **Day 18: Customizable Dashboard**
- [ ] Widget system (drag-and-drop or preset layouts)
- [ ] Save dashboard preferences per user
- [ ] Export charts as PNG/PDF
- [ ] Scheduled email reports (daily/weekly summary)

---

### **WEEK 3: PWA Mobile** (Days 19-20)
**Goal**: Make web app installable on mobile

#### **Day 19: PWA Setup**
- [ ] Create `manifest.json` with app metadata
- [ ] Add service worker for offline caching
- [ ] Add "Add to Home Screen" prompt
- [ ] Test on iOS Safari and Android Chrome
- [ ] Add push notification setup (basic)

**Manifest**:
```json
{
  "name": "Disclosurely",
  "short_name": "Disclosurely",
  "description": "Secure Whistleblowing Platform",
  "start_url": "/report",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### **Day 20: Mobile Polish**
- [ ] Test PWA on real devices
- [ ] Fix any mobile-specific issues
- [ ] Add offline draft save (IndexedDB)
- [ ] Push notification for new messages

---

## 🎯 Success Metrics (What "Done" Looks Like)

### Workflow Automation ✅
- [ ] Admin can create assignment rules in dashboard
- [ ] New reports auto-assign based on rules
- [ ] SLA deadlines calculated and tracked
- [ ] Email notifications sent for SLA warnings
- [ ] Auto-escalation works on SLA breach
- [ ] Workflow logs visible in report details

### Team Collaboration ✅
- [ ] Multiple investigators can be assigned to one case
- [ ] Internal notes thread works (not visible to whistleblower)
- [ ] @mentions notify tagged users
- [ ] Tasks can be created and assigned
- [ ] Simple Kanban board shows task status

### Language Expansion ✅
- [ ] 50 languages available in language selector
- [ ] All UI strings translated (at least machine-translated)
- [ ] RTL languages (Arabic, Hebrew) display correctly
- [ ] Users can select language from welcome page
- [ ] Admin can set default language per org link

### Advanced Analytics ✅
- [ ] Dashboard shows trend charts (line, bar, pie)
- [ ] Month-over-month comparison available
- [ ] Category breakdown pie chart
- [ ] Resolution time metrics
- [ ] Charts exportable as PNG

### PWA Mobile ✅
- [ ] App installable on iOS and Android
- [ ] Works offline (basic functionality)
- [ ] Push notifications configured
- [ ] "Add to Home Screen" prompt appears
- [ ] App icon shows on home screen

---

## 📊 Comparison After 20 Days

### Before (Nov 8)
- ❌ No workflow automation
- ❌ Single investigator only
- ❌ 12 languages
- ❌ Basic charts only
- ❌ Mobile web only

### After (Nov 28)
- ✅ Auto-assignment + SLA tracking + escalation
- ✅ Multi-investigator + internal notes + tasks
- ✅ 50 languages (covers 95%+ of global workforce)
- ✅ Trend analysis + customizable charts
- ✅ PWA installable on mobile

### Competitive Position
| Feature | Disclosurely (Nov 8) | Disclosurely (Nov 28) | NAVEX | FaceUp |
|---------|---------------------|----------------------|-------|--------|
| Workflow Automation | ❌ | ✅ | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ | ✅ | ✅ |
| Languages | 12 | 50 | 150+ | 100+ |
| Analytics | Basic | Advanced | Advanced | Advanced |
| Mobile | Web | PWA | Native | Native |
| Progressive Form | ✅ | ✅ | ❌ | ❌ |
| Draft Save | ✅ | ✅ | ❌ | ❌ |

**Result**: We close the critical gap on workflow/collaboration, narrow the gap on languages, and maintain our UX advantages.

---

## 💰 Budget Estimate (20 Days)

### Development Time
- **2 engineers x 20 days** = $40,000 - $60,000 (assuming $100-150/hour)

### External Costs
- **Translations**: $50-100 per language x 38 languages = $1,900 - $3,800
- **Translation review** (spot check): $500
- **Total External**: ~$2,500 - $4,500

### **Total 20-Day Budget**: $42,500 - $64,500

---

## 🚀 Next Steps (Immediate Actions)

### Today (Nov 8)
1. ✅ Review and approve this plan
2. ✅ Commit to 20-day sprint
3. ✅ Assign 2 engineers full-time
4. ✅ Set up daily standups

### Tomorrow (Nov 9) - Sprint Day 1
1. Create all database migrations (assignment_rules, sla_policies, etc.)
2. Run migrations in dev/staging
3. Start implementing case-workflow-engine edge function
4. Set up project board with all tasks

### End of Week 1 (Nov 15)
- ✅ Workflow automation shipped to production
- ✅ Auto-assignment working
- ✅ SLA tracking operational

### End of Week 2 (Nov 22)
- ✅ Team collaboration features live
- ✅ Internal notes and tasks functional

### End of Week 3 (Nov 28)
- ✅ 50 languages live
- ✅ Advanced analytics deployed
- ✅ PWA installable on mobile

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| **Translation quality issues** | High | Use GPT-4 + human review, focus on critical strings first |
| **SLA cron job failures** | Medium | Use Supabase's pg_cron, add monitoring/alerts |
| **Scope creep** | Medium | Ruthlessly cut features, defer to next sprint |
| **Testing time underestimated** | Medium | Test continuously, not just at end |
| **PWA browser compatibility** | Low | Test early on iOS Safari and Android Chrome |

---

## 🎊 Why This Plan Works

1. **Realistic Timeline**: Each feature sized for 2-4 days max
2. **High Impact**: Every feature closes a critical competitive gap
3. **Incremental**: Can ship each week independently
4. **Deferrable**: PWA and analytics can be cut if time runs short
5. **Measurable**: Clear success criteria for each feature

**Ready to start? Let's ship these features and compete with the big players!** 🚀
