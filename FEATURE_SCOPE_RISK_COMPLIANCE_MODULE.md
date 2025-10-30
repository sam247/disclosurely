# Risk & Compliance Module for Disclosurely
## Feature Scope & Technical Specification

**Version**: 1.0  
**Date**: October 30, 2025  
**Status**: Planning Phase

---

## Executive Summary

Extend Disclosurely into a **comprehensive compliance management hub** by adding a Risk & Compliance module. This module reuses existing infrastructure (authentication, dashboard, AI systems, encryption) while adding four critical compliance tools: Policy Tracker, Risk Register, Compliance Calendar, and AI Insights Dashboard.

### Key Value Propositions
- **Unified Platform**: One system for incidents, policies, risks, and compliance
- **AI-Powered Insights**: Analyze patterns across incidents and risks
- **Evidence Management**: Centralized, encrypted document storage
- **Audit Trail**: Complete traceability for compliance audits
- **Deadline Management**: Never miss a policy review or audit date

---

## 1. Architecture Overview

### 1.1 System Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  Existing Disclosurely Core                  │
│                                                              │
│  • Authentication (Supabase Auth)                            │
│  • Multi-tenant Organizations                                │
│  • Encrypted Storage (AES-GCM)                               │
│  • Role-Based Access Control                                 │
│  • Audit Logging                                             │
│  • AI Integration (DeepSeek/AI Gateway)                      │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ EXTENDS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            NEW: Risk & Compliance Module                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Policy Tracker│  │Risk Register │  │Compliance Cal│      │
│  │              │  │              │  │              │      │
│  │ • Upload     │  │ • Risk Matrix│  │ • Key Dates  │      │
│  │ • Categorize │  │ • Mitigations│  │ • Reminders  │      │
│  │ • Version    │  │ • Status     │  │ • Calendar   │      │
│  │ • Owners     │  │ • Tracking   │  │   Sync       │      │
│  │ • Link to    │  │ • Risk Score │  │ • Email      │      │
│  │   Incidents  │  │   Trends     │  │   Alerts     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          AI Insights Dashboard                        │   │
│  │                                                       │   │
│  │  • Incident-Risk Correlation                         │   │
│  │  • Trend Analysis (time series)                      │   │
│  │  • Risk Clustering (ML-based)                        │   │
│  │  • Quarterly Executive Summaries                     │   │
│  │  • Predictive Risk Scoring                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Shared Infrastructure                        │   │
│  │                                                       │   │
│  │  • Encrypted Evidence Uploads (reuse existing)       │   │
│  │  • Global Search (policies, risks, incidents)        │   │
│  │  • Advanced Filters (multi-dimensional)              │   │
│  │  • Audit Trail (reuse existing logging)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Navigation Structure

Add new section to existing sidebar:

```
Dashboard
├── Reports (Existing)
├── Analytics (Existing)
└── Risk & Compliance (NEW)
    ├── Policy Tracker
    ├── Risk Register
    ├── Compliance Calendar
    ├── AI Insights
    └── Evidence Library

Settings
├── Organization (Existing)
├── Team Management (Existing)
└── Compliance Settings (NEW)
    ├── Risk Matrix Configuration
    ├── Compliance Frameworks (ISO 27001, SOC 2, GDPR)
    ├── Notification Preferences
    └── Integration Settings
```

---

## 2. Feature Specifications

## 2.1 Policy Tracker

### Purpose
Centralize policy management with version control, ownership, and incident linking.

### User Stories

**As a Compliance Manager, I want to:**
- Upload and store all organizational policies
- Categorize policies by type (e.g., HR, Security, Financial)
- Track policy versions with change history
- Assign policy owners and reviewers
- Set review schedules and get automatic reminders
- Link policies to related incidents/risks
- Search policies by keyword, category, or owner

### Database Schema

```sql
-- Policy categories (customizable per organization)
CREATE TABLE policy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- lucide icon name
  color TEXT,  -- hex color for UI
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, name)
);

-- Main policies table
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Basic info
  title TEXT NOT NULL,
  policy_number TEXT,  -- e.g., "POL-HR-001"
  category_id UUID REFERENCES policy_categories(id),
  description TEXT,
  
  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0',
  effective_date DATE NOT NULL,
  review_date DATE NOT NULL,
  next_review_date DATE,
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  approver_id UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, active, under_review, archived
  
  -- Content (encrypted)
  content_type TEXT,  -- 'text', 'pdf', 'docx', 'url'
  content_text TEXT,  -- for text policies
  document_url TEXT,  -- for uploaded files (Supabase Storage)
  encrypted_content TEXT,  -- if contains sensitive data
  encryption_key_hash TEXT,
  
  -- Metadata
  tags TEXT[],
  compliance_frameworks TEXT[],  -- e.g., ["ISO27001", "SOC2", "GDPR"]
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  INDEX idx_org_status (organization_id, status),
  INDEX idx_next_review (next_review_date) WHERE status = 'active'
);

-- Policy version history
CREATE TABLE policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changes_summary TEXT,
  content_snapshot JSONB,  -- Full policy content at this version
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_policy_version (policy_id, created_at DESC)
);

-- Link policies to incidents (many-to-many)
CREATE TABLE policy_incident_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  relationship_type TEXT,  -- 'violation', 'reference', 'related'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(policy_id, report_id)
);

-- Link policies to risks
CREATE TABLE policy_risk_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,  -- defined below
  relationship_type TEXT,  -- 'mitigates', 'governs', 'related'
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(policy_id, risk_id)
);

-- Policy review tracking
CREATE TABLE policy_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  review_date DATE NOT NULL,
  outcome TEXT,  -- 'approved', 'needs_revision', 'rejected'
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  INDEX idx_policy_reviews (policy_id, review_date DESC)
);

-- Enable RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's policies"
ON policies FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Org admins can manage policies"
ON policies FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'org_admin') 
      AND is_active = true
  )
);
```

### UI Components

**PolicyTracker.tsx**
```typescript
interface PolicyTrackerProps {
  organizationId: string;
}

const PolicyTracker: React.FC<PolicyTrackerProps> = ({ organizationId }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [view, setView] = useState<'grid' | 'list' | 'timeline'>('list');
  const [filter, setFilter] = useState({
    category: 'all',
    status: 'all',
    framework: 'all'
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Policy Tracker</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2" /> New Policy
        </Button>
      </div>

      {/* Filters and Search */}
      <PolicyFilters filter={filter} onFilterChange={setFilter} />

      {/* View Switcher */}
      <ViewToggle view={view} onViewChange={setView} />

      {/* Policy List/Grid/Timeline */}
      {view === 'list' && <PolicyList policies={filteredPolicies} />}
      {view === 'grid' && <PolicyGrid policies={filteredPolicies} />}
      {view === 'timeline' && <PolicyTimeline policies={filteredPolicies} />}

      {/* Create/Edit Modal */}
      <PolicyModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSave={handleSavePolicy}
      />
    </div>
  );
};
```

**Features**:
- Drag-and-drop file upload (PDF, DOCX, TXT)
- Rich text editor for inline policies
- Automatic version control with diff viewer
- Smart review date calculator (e.g., "Annual review = 1 year from effective date")
- Bulk actions (archive, export, assign owner)
- Policy templates (pre-fill common policies)

---

## 2.2 Risk Register

### Purpose
Track and manage organizational risks with impact/likelihood scoring, mitigations, and status monitoring.

### User Stories

**As a Risk Manager, I want to:**
- Log risks across categories (operational, financial, reputational, regulatory)
- Assess risk using a standard risk matrix (Impact × Likelihood)
- Track risk status (identified, assessed, mitigated, closed)
- Assign risk owners and mitigation plans
- Link risks to incidents and policies
- View risk trends over time
- Export risk register for audits

### Database Schema

```sql
-- Risk categories
CREATE TABLE risk_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, name)
);

-- Main risks table
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Identification
  risk_number TEXT,  -- e.g., "RISK-2025-001"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES risk_categories(id),
  
  -- Risk Assessment (1-5 scale typical)
  impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 1 AND 5),
  likelihood_score INTEGER NOT NULL CHECK (likelihood_score BETWEEN 1 AND 5),
  inherent_risk_score INTEGER GENERATED ALWAYS AS (impact_score * likelihood_score) STORED,
  
  -- After mitigation
  residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
  residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_risk_score INTEGER GENERATED ALWAYS AS (residual_impact * residual_likelihood) STORED,
  
  -- Risk metadata
  risk_type TEXT,  -- operational, financial, reputational, regulatory, strategic
  status TEXT NOT NULL DEFAULT 'identified',  -- identified, assessed, mitigated, accepted, closed
  priority TEXT,  -- critical, high, medium, low
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Mitigation
  mitigation_strategy TEXT,
  mitigation_status TEXT,  -- not_started, in_progress, completed
  mitigation_cost_estimate DECIMAL(12, 2),
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Dates
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_date DATE,
  next_review_date DATE,
  
  -- Metadata
  tags TEXT[],
  compliance_frameworks TEXT[],
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  INDEX idx_org_status (organization_id, status),
  INDEX idx_risk_score (inherent_risk_score DESC),
  INDEX idx_next_review (next_review_date) WHERE status NOT IN ('closed', 'accepted')
);

-- Risk history (track score changes over time)
CREATE TABLE risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  
  impact_score INTEGER,
  likelihood_score INTEGER,
  risk_score INTEGER,
  status TEXT,
  
  change_reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  
  INDEX idx_risk_history (risk_id, changed_at DESC)
);

-- Link risks to incidents
CREATE TABLE risk_incident_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  relationship_type TEXT,  -- 'realized', 'near_miss', 'related'
  impact_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(risk_id, report_id)
);

-- Risk mitigation actions
CREATE TABLE risk_mitigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  
  action_title TEXT NOT NULL,
  action_description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, cancelled
  due_date DATE,
  completed_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_risk_actions (risk_id, status)
);

-- Enable RLS
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_mitigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's risks"
ON risks FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Org admins can manage risks"
ON risks FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'org_admin') 
      AND is_active = true
  )
);
```

### UI Components

**RiskRegister.tsx**
```typescript
const RiskRegister: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [view, setView] = useState<'matrix' | 'list' | 'heatmap'>('matrix');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Risk Register</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <AlertTriangle className="mr-2" /> Log New Risk
        </Button>
      </div>

      {/* Summary Cards */}
      <RiskSummaryCards risks={risks} />

      {/* View Switcher */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <RiskMatrix risks={risks} onRiskClick={handleRiskClick} />
        </TabsContent>

        <TabsContent value="list">
          <RiskList 
            risks={risks} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="heatmap">
          <RiskHeatmap risks={risks} />
        </TabsContent>
      </Tabs>

      {/* Risk Detail Modal */}
      <RiskDetailModal 
        risk={selectedRisk}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};
```

**RiskMatrix.tsx** - Interactive 5×5 matrix
```typescript
const RiskMatrix: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-4">
      {/* Y-axis: Impact */}
      <div className="col-span-1 flex flex-col-reverse gap-2">
        {[5, 4, 3, 2, 1].map(impact => (
          <div key={impact} className="h-24 flex items-center justify-center font-semibold">
            {impact}
          </div>
        ))}
        <div className="h-24 flex items-center justify-center text-sm">Impact</div>
      </div>

      {/* Matrix cells */}
      <div className="col-span-5 grid grid-cols-5 gap-2">
        {[5, 4, 3, 2, 1].map(impact => (
          [1, 2, 3, 4, 5].map(likelihood => {
            const score = impact * likelihood;
            const cellRisks = risks.filter(
              r => r.impact_score === impact && r.likelihood_score === likelihood
            );
            
            const bgColor = score >= 15 ? 'bg-red-100' : 
                           score >= 10 ? 'bg-orange-100' : 
                           score >= 6 ? 'bg-yellow-100' : 'bg-green-100';

            return (
              <div 
                key={`${impact}-${likelihood}`}
                className={`${bgColor} h-24 rounded border-2 border-gray-300 p-2 relative hover:shadow-lg transition-shadow cursor-pointer`}
              >
                <span className="absolute top-1 left-1 text-xs font-bold">{score}</span>
                <div className="flex flex-col gap-1 mt-4">
                  {cellRisks.map(risk => (
                    <Badge 
                      key={risk.id} 
                      variant="secondary" 
                      className="text-xs cursor-pointer"
                      onClick={() => onRiskClick(risk)}
                    >
                      {risk.risk_number}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })
        ))}
      </div>

      {/* X-axis: Likelihood */}
      <div className="col-span-6 flex gap-2 justify-end">
        <div className="w-24 flex items-center justify-center text-sm">Likelihood</div>
        {[1, 2, 3, 4, 5].map(likelihood => (
          <div key={likelihood} className="w-24 flex items-center justify-center font-semibold">
            {likelihood}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Features**:
- Interactive 5×5 risk matrix with color coding
- Risk trend charts (score over time)
- Mitigation action tracker with due dates
- Automated risk scoring
- Export to CSV/PDF for audits
- Link risks to incidents with one click
- Risk templates for common scenarios

---

## 2.3 Compliance Calendar

### Purpose
Never miss a compliance deadline with a centralized calendar for policy reviews, audits, training, and certifications.

### User Stories

**As a Compliance Manager, I want to:**
- View all compliance deadlines in one calendar
- Set reminders for policy reviews, audits, and training
- Sync calendar to Outlook/Google Calendar
- Receive email alerts for upcoming deadlines
- Mark tasks as complete with notes
- Filter by category (policy reviews, audits, training, certifications)
- Generate compliance reports for specific time periods

### Database Schema

```sql
-- Compliance event types
CREATE TYPE compliance_event_type AS ENUM (
  'policy_review',
  'audit',
  'training',
  'certification',
  'assessment',
  'renewal',
  'other'
);

-- Main calendar events
CREATE TABLE compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type compliance_event_type NOT NULL,
  category TEXT,  -- e.g., "ISO 27001", "SOC 2", "GDPR"
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,  -- for multi-day events
  due_date DATE,
  completed_date DATE,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,  -- RRULE format (RFC 5545)
  parent_event_id UUID REFERENCES compliance_events(id),  -- for recurring instances
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  owner_id UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, overdue, cancelled
  priority TEXT,  -- critical, high, medium, low
  
  -- Reminders
  reminder_days_before INTEGER[],  -- [30, 14, 7, 1] = reminders at 30d, 14d, 7d, 1d before
  last_reminder_sent TIMESTAMPTZ,
  
  -- Links
  policy_id UUID REFERENCES policies(id),
  risk_id UUID REFERENCES risks(id),
  report_id UUID REFERENCES reports(id),
  
  -- Metadata
  tags TEXT[],
  external_calendar_id TEXT,  -- for synced events
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_org_dates (organization_id, start_date),
  INDEX idx_assigned (assigned_to, status),
  INDEX idx_due_date (due_date) WHERE status NOT IN ('completed', 'cancelled')
);

-- Event completion tracking
CREATE TABLE compliance_event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES compliance_events(id) ON DELETE CASCADE,
  
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  completion_notes TEXT,
  evidence_urls TEXT[],  -- links to uploaded evidence
  
  INDEX idx_event_completions (event_id, completed_at DESC)
);

-- Notification preferences
CREATE TABLE compliance_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  email_enabled BOOLEAN DEFAULT true,
  email_daily_digest BOOLEAN DEFAULT false,
  email_weekly_summary BOOLEAN DEFAULT true,
  
  slack_enabled BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  
  calendar_sync_enabled BOOLEAN DEFAULT false,
  calendar_provider TEXT,  -- 'google', 'outlook'
  calendar_credentials JSONB,  -- encrypted
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_event_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's events"
ON compliance_events FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can manage assigned events"
ON compliance_events FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
  AND (assigned_to = auth.uid() OR owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
        AND organization_id = compliance_events.organization_id
        AND role IN ('admin', 'org_admin')
    ))
);
```

### UI Components

**ComplianceCalendar.tsx**
```typescript
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from './CalendarEvent';

const ComplianceCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');
  const [events, setEvents] = useState<ComplianceEvent[]>([]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compliance Calendar</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncCalendar}>
            <RefreshCw className="mr-2" /> Sync Calendar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2" /> New Event
          </Button>
        </div>
      </div>

      {/* View Switcher */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <MonthView date={date} events={events} onDateChange={setDate} />
        </TabsContent>

        <TabsContent value="week">
          <WeekView date={date} events={events} onDateChange={setDate} />
        </TabsContent>

        <TabsContent value="agenda">
          <AgendaView events={events} />
        </TabsContent>
      </Tabs>

      {/* Upcoming Deadlines Widget */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming Deadlines (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingDeadlinesList events={upcomingEvents} />
        </CardContent>
      </Card>

      {/* Create/Edit Event Modal */}
      <EventModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveEvent}
      />
    </div>
  );
};
```

**Features**:
- Full calendar view (month/week/day)
- Drag-and-drop event rescheduling
- Recurring event support (RRULE standard)
- Color-coded by event type
- Email reminders (30d, 14d, 7d, 1d before)
- iCal export for external calendars
- Google Calendar / Outlook sync (OAuth)
- Overdue event highlighting
- Bulk event creation (import CSV)

### Calendar Sync Implementation

```typescript
// Supabase Edge Function: calendar-sync
import { google } from 'googleapis';

Deno.serve(async (req) => {
  const { action, events } = await req.json();

  if (action === 'sync_to_google') {
    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET'),
      Deno.env.get('GOOGLE_REDIRECT_URI')
    );

    oauth2Client.setCredentials({
      refresh_token: userRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    for (const event of events) {
      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: { date: event.start_date },
          end: { date: event.end_date || event.start_date },
          reminders: {
            useDefault: false,
            overrides: event.reminder_days_before.map(days => ({
              method: 'email',
              minutes: days * 24 * 60
            }))
          }
        }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

---

## 2.4 AI Insights Dashboard

### Purpose
Leverage AI to analyze patterns across incidents, risks, and policies, providing actionable intelligence for compliance teams.

### User Stories

**As a Compliance Manager, I want to:**
- See trends in incident types over time
- Identify correlations between incidents and risks
- Get AI-generated executive summaries for quarterly board reports
- Discover risk clusters (e.g., all risks related to data security)
- Predict which risks are likely to materialize based on incident history
- Compare compliance metrics against industry benchmarks

### Database Schema

```sql
-- AI analysis jobs
CREATE TABLE ai_insights_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  job_type TEXT NOT NULL,  -- 'trend_analysis', 'risk_correlation', 'executive_summary', 'clustering'
  status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
  
  parameters JSONB,  -- { date_range: [...], filters: {...} }
  result JSONB,  -- AI-generated insights
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_org_jobs (organization_id, created_at DESC)
);

-- Saved insights (user-bookmarked)
CREATE TABLE saved_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,
  insight_type TEXT,
  content JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  INDEX idx_user_insights (user_id, created_at DESC)
);

-- Enable RLS
ALTER TABLE ai_insights_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's insights"
ON ai_insights_jobs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can create insights jobs"
ON ai_insights_jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND organization_id = ai_insights_jobs.organization_id
      AND role IN ('admin', 'org_admin')
  )
);
```

### AI Analysis Types

#### 1. Trend Analysis
```typescript
// Supabase Edge Function: analyze-compliance-trends
Deno.serve(async (req) => {
  const { organizationId, dateRange, category } = await req.json();

  // Fetch incidents and risks from date range
  const { data: incidents } = await supabase
    .from('reports')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const { data: risks } = await supabase
    .from('risks')
    .select('*')
    .eq('organization_id', organizationId);

  // Use AI Gateway to analyze
  const analysisPrompt = `
    Analyze the following compliance data and identify trends:
    
    Incidents (${incidents.length} total):
    ${JSON.stringify(incidents.map(i => ({ 
      category: i.category, 
      date: i.created_at,
      severity: i.severity 
    })))}
    
    Risks (${risks.length} total):
    ${JSON.stringify(risks.map(r => ({ 
      type: r.risk_type,
      score: r.inherent_risk_score,
      status: r.status
    })))}
    
    Provide:
    1. Top 3 incident trends
    2. Risk score changes over time
    3. Emerging risk areas
    4. Recommended actions
  `;

  const aiResponse = await fetch(`${AI_GATEWAY_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'X-Organization-Id': organizationId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a compliance analytics expert.' },
        { role: 'user', content: analysisPrompt }
      ],
      context: { purpose: 'trend_analysis' }
    })
  });

  const insights = await aiResponse.json();

  return new Response(JSON.stringify({
    trends: parseTrendsFromAI(insights),
    rawAnalysis: insights.choices[0].message.content
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### 2. Risk-Incident Correlation
```sql
-- Find incidents that match risks
WITH risk_patterns AS (
  SELECT 
    r.id,
    r.title,
    r.risk_type,
    r.inherent_risk_score,
    COUNT(ril.report_id) AS incident_count,
    AVG(rep.severity_score) AS avg_incident_severity
  FROM risks r
  LEFT JOIN risk_incident_links ril ON r.id = ril.risk_id
  LEFT JOIN reports rep ON ril.report_id = rep.id
  WHERE r.organization_id = $1
  GROUP BY r.id
)
SELECT 
  title,
  risk_type,
  inherent_risk_score,
  incident_count,
  avg_incident_severity,
  CASE 
    WHEN incident_count > 0 THEN 'Materialized'
    WHEN inherent_risk_score >= 15 THEN 'High Priority'
    ELSE 'Monitoring'
  END AS status
FROM risk_patterns
ORDER BY inherent_risk_score DESC, incident_count DESC;
```

Send results to AI for natural language summary:
```
"Analysis shows that [RISK_TYPE] risks have materialized [X] times in the past [Y] months, 
with average severity of [Z]. Recommend prioritizing mitigation for [TOP_3_RISKS]."
```

#### 3. Executive Summary Generator
```typescript
// Generate quarterly board report
const generateExecutiveSummary = async (organizationId: string, quarter: string) => {
  // Gather all data
  const incidentStats = await getIncidentStats(organizationId, quarter);
  const riskStats = await getRiskStats(organizationId, quarter);
  const policyStats = await getPolicyStats(organizationId, quarter);
  const complianceEvents = await getComplianceEvents(organizationId, quarter);

  const prompt = `
    Generate an executive summary for the board based on this compliance data for ${quarter}:
    
    Incidents:
    - Total: ${incidentStats.total}
    - Critical: ${incidentStats.critical}
    - Resolved: ${incidentStats.resolved}
    - Average resolution time: ${incidentStats.avgResolutionDays} days
    
    Risks:
    - Total active: ${riskStats.active}
    - High-priority: ${riskStats.highPriority}
    - Mitigated this quarter: ${riskStats.mitigated}
    - Top risk categories: ${riskStats.topCategories.join(', ')}
    
    Policies:
    - Total active: ${policyStats.active}
    - Reviewed this quarter: ${policyStats.reviewed}
    - Due for review: ${policyStats.dueForReview}
    
    Compliance Events:
    - Completed: ${complianceEvents.completed}
    - Upcoming: ${complianceEvents.upcoming}
    - Overdue: ${complianceEvents.overdue}
    
    Format as a professional executive summary with:
    1. Overview (2-3 sentences)
    2. Key Highlights (bullet points)
    3. Areas of Concern (if any)
    4. Recommendations (3-5 action items)
    5. Conclusion
    
    Keep it concise (max 500 words).
  `;

  const response = await callAIGateway(prompt, organizationId);
  return response.choices[0].message.content;
};
```

#### 4. Risk Clustering (ML-based)
```python
# Optional: Python microservice for advanced ML
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

def cluster_risks(risks: list[dict]) -> dict:
    """
    Cluster risks by description similarity using K-means
    """
    # Extract risk descriptions
    descriptions = [r['description'] + ' ' + r['title'] for r in risks]
    
    # Vectorize text
    vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    X = vectorizer.fit_transform(descriptions)
    
    # Cluster (automatically determine optimal k using elbow method)
    optimal_k = find_optimal_clusters(X, max_k=10)
    kmeans = KMeans(n_clusters=optimal_k, random_state=42)
    clusters = kmeans.fit_predict(X)
    
    # Assign clusters to risks
    risk_clusters = {}
    for i, risk in enumerate(risks):
        cluster_id = int(clusters[i])
        if cluster_id not in risk_clusters:
            risk_clusters[cluster_id] = []
        risk_clusters[cluster_id].append(risk)
    
    # Generate cluster names using AI
    cluster_names = {}
    for cluster_id, cluster_risks in risk_clusters.items():
        sample_titles = [r['title'] for r in cluster_risks[:5]]
        cluster_names[cluster_id] = generate_cluster_name(sample_titles)
    
    return {
        'clusters': risk_clusters,
        'cluster_names': cluster_names,
        'optimal_k': optimal_k
    }
```

### UI Components

**AIInsightsDashboard.tsx**
```typescript
const AIInsightsDashboard: React.FC = () => {
  const [activeInsight, setActiveInsight] = useState<string>('trends');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">AI Insights Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <InsightCard 
          title="Incident Trend"
          value="-12%"
          subtitle="vs last quarter"
          trend="down"
          icon={<TrendingDown />}
        />
        <InsightCard 
          title="High Risks"
          value="8"
          subtitle="requiring attention"
          trend="up"
          icon={<AlertTriangle />}
        />
        <InsightCard 
          title="Policy Reviews"
          value="23"
          subtitle="due this month"
          trend="neutral"
          icon={<FileText />}
        />
        <InsightCard 
          title="Compliance Score"
          value="94%"
          subtitle="+2% improvement"
          trend="up"
          icon={<BarChart3 />}
        />
      </div>

      {/* Insight Tabs */}
      <Tabs value={activeInsight} onValueChange={setActiveInsight}>
        <TabsList>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="correlations">Risk Correlations</TabsTrigger>
          <TabsTrigger value="clustering">Risk Clusters</TabsTrigger>
          <TabsTrigger value="summaries">Executive Summaries</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <TrendAnalysisView />
        </TabsContent>

        <TabsContent value="correlations">
          <RiskCorrelationView />
        </TabsContent>

        <TabsContent value="clustering">
          <RiskClusteringView />
        </TabsContent>

        <TabsContent value="summaries">
          <ExecutiveSummaryView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

**TrendAnalysisView.tsx**
```typescript
const TrendAnalysisView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('90d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    const response = await fetch('/api/analyze-trends', {
      method: 'POST',
      body: JSON.stringify({ organizationId, timeRange })
    });
    
    const data = await response.json();
    setInsights(data);
    setIsAnalyzing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trend Analysis</span>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <><Loader2 className="mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="mr-2" /> Run Analysis</>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights ? (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <IncidentTrendChart data={insights.incidentTrends} />
              <RiskScoreChart data={insights.riskScores} />
            </div>

            {/* AI-Generated Insights */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Generated Insights
              </h3>
              <div className="prose prose-sm">
                {insights.naturalLanguageSummary}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Recommended Actions</h3>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Click "Run Analysis" to generate AI insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 3. Shared Infrastructure

### 3.1 Evidence Library

Extend existing file upload system to support compliance documents.

```sql
-- Evidence files (reuse existing attachment pattern)
CREATE TABLE compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  
  -- Link to entities
  policy_id UUID REFERENCES policies(id),
  risk_id UUID REFERENCES risks(id),
  report_id UUID REFERENCES reports(id),
  event_id UUID REFERENCES compliance_events(id),
  
  -- Encryption (for sensitive documents)
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key_hash TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[],
  
  INDEX idx_org_evidence (organization_id, uploaded_at DESC)
);

-- Enable RLS
ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's evidence"
ON compliance_evidence FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);
```

**EvidenceLibrary.tsx**
```typescript
const EvidenceLibrary: React.FC = () => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [filter, setFilter] = useState({ type: 'all', linkedTo: 'all' });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Evidence Library</h1>

      {/* Upload Area */}
      <FileUpload 
        onUpload={handleUpload}
        accept=".pdf,.docx,.xlsx,.png,.jpg"
        maxSize={50 * 1024 * 1024}  // 50MB
      />

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {filteredFiles.map(file => (
          <EvidenceCard 
            key={file.id}
            file={file}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onLink={handleLinkToEntity}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3.2 Global Search

Implement full-text search across all compliance entities.

```sql
-- Add full-text search indexes
CREATE INDEX idx_policies_search ON policies USING gin(
  to_tsvector('english', title || ' ' || description || ' ' || COALESCE(content_text, ''))
);

CREATE INDEX idx_risks_search ON risks USING gin(
  to_tsvector('english', title || ' ' || description || ' ' || COALESCE(mitigation_strategy, ''))
);

-- Global search function
CREATE OR REPLACE FUNCTION search_compliance(
  org_id UUID,
  search_query TEXT,
  entity_types TEXT[] DEFAULT ARRAY['policy', 'risk', 'incident', 'event']
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  snippet TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  
  -- Search policies
  SELECT 
    'policy'::TEXT,
    id,
    title,
    LEFT(description, 200) AS snippet,
    ts_rank(to_tsvector('english', title || ' ' || description), plainto_tsquery(search_query)) AS relevance
  FROM policies
  WHERE organization_id = org_id
    AND 'policy' = ANY(entity_types)
    AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery(search_query)
  
  UNION ALL
  
  -- Search risks
  SELECT 
    'risk'::TEXT,
    id,
    title,
    LEFT(description, 200),
    ts_rank(to_tsvector('english', title || ' ' || description), plainto_tsquery(search_query))
  FROM risks
  WHERE organization_id = org_id
    AND 'risk' = ANY(entity_types)
    AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery(search_query)
  
  UNION ALL
  
  -- Search incidents (reports)
  SELECT 
    'incident'::TEXT,
    id,
    category AS title,
    LEFT(content, 200),
    ts_rank(to_tsvector('english', category || ' ' || content), plainto_tsquery(search_query))
  FROM reports
  WHERE organization_id = org_id
    AND 'incident' = ANY(entity_types)
    AND to_tsvector('english', category || ' ' || content) @@ plainto_tsquery(search_query)
  
  ORDER BY relevance DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**GlobalSearch.tsx**
```typescript
const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setIsSearching(true);
    
    const { data, error } = await supabase.rpc('search_compliance', {
      org_id: organizationId,
      search_query: searchQuery,
      entity_types: ['policy', 'risk', 'incident', 'event']
    });

    setResults(data || []);
    setIsSearching(false);
  };

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search policies, risks, incidents..." 
        value={query}
        onValueChange={setQuery}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Policies">
          {results.filter(r => r.entity_type === 'policy').map(result => (
            <CommandItem key={result.entity_id}>
              <FileText className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-gray-500">{result.snippet}</div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Risks">
          {results.filter(r => r.entity_type === 'risk').map(result => (
            <CommandItem key={result.entity_id}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-gray-500">{result.snippet}</div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
```

### 3.3 Advanced Filters

**FilterPanel.tsx**
```typescript
interface FilterConfig {
  dateRange?: { start: Date; end: Date };
  categories?: string[];
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  tags?: string[];
  complianceFrameworks?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterConfig>({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div>
          <Label>Date Range</Label>
          <DateRangePicker 
            value={filters.dateRange}
            onChange={(range) => updateFilter('dateRange', range)}
          />
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <MultiSelect 
            options={statusOptions}
            value={filters.status}
            onChange={(status) => updateFilter('status', status)}
          />
        </div>

        {/* Priority */}
        <div>
          <Label>Priority</Label>
          <MultiSelect 
            options={priorityOptions}
            value={filters.priority}
            onChange={(priority) => updateFilter('priority', priority)}
          />
        </div>

        {/* Compliance Frameworks */}
        <div>
          <Label>Frameworks</Label>
          <MultiSelect 
            options={frameworkOptions}
            value={filters.complianceFrameworks}
            onChange={(fw) => updateFilter('complianceFrameworks', fw)}
          />
        </div>

        <Button onClick={() => onFilterChange(filters)} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};
```

---

## 4. Implementation Plan

### Phase 1: Database & Backend (Weeks 1-2)

**Week 1: Schema & Migrations**
- [ ] Create all database tables (policies, risks, compliance_events)
- [ ] Set up RLS policies for tenant isolation
- [ ] Create database functions (search, filtering)
- [ ] Set up indexes for performance
- [ ] Write migration scripts

**Week 2: API Endpoints**
- [ ] CRUD endpoints for policies (create, read, update, delete)
- [ ] CRUD endpoints for risks
- [ ] CRUD endpoints for compliance events
- [ ] Policy versioning logic
- [ ] Risk scoring calculations
- [ ] Search and filter endpoints

### Phase 2: Policy Tracker (Week 3)

- [ ] `PolicyTracker.tsx` main component
- [ ] Policy list/grid/timeline views
- [ ] Policy creation modal with file upload
- [ ] Policy version history viewer
- [ ] Link policies to incidents
- [ ] Policy review workflow
- [ ] Reminder system for reviews

### Phase 3: Risk Register (Week 4)

- [ ] `RiskRegister.tsx` main component
- [ ] Risk matrix (5×5 interactive grid)
- [ ] Risk creation/edit forms
- [ ] Risk scoring calculator
- [ ] Risk trend charts (Chart.js)
- [ ] Mitigation action tracker
- [ ] Link risks to incidents/policies

### Phase 4: Compliance Calendar (Week 5)

- [ ] `ComplianceCalendar.tsx` main component
- [ ] Month/week/agenda views
- [ ] Event creation with recurrence support
- [ ] Reminder system (email + in-app)
- [ ] Calendar sync (Google/Outlook OAuth)
- [ ] iCal export
- [ ] Overdue event handling

### Phase 5: AI Insights Dashboard (Weeks 6-7)

**Week 6: Data Analysis**
- [ ] Trend analysis Edge Function
- [ ] Risk-incident correlation queries
- [ ] Executive summary generator
- [ ] Integration with AI Gateway

**Week 7: UI & Visualizations**
- [ ] `AIInsightsDashboard.tsx`
- [ ] Trend charts and visualizations
- [ ] Natural language insight display
- [ ] Save/bookmark insights
- [ ] Export insights as PDF/PPT

### Phase 6: Shared Infrastructure (Week 8)

- [ ] Evidence library (file storage)
- [ ] Global search implementation
- [ ] Advanced filtering UI
- [ ] Audit trail integration
- [ ] Notification system extensions

### Phase 7: Testing & Polish (Week 9)

- [ ] End-to-end testing
- [ ] Load testing (1000+ entities)
- [ ] Security audit (Semgrep)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Mobile responsiveness
- [ ] Browser compatibility

### Phase 8: Documentation & Launch (Week 10)

- [ ] User guide (policies, risks, calendar)
- [ ] Admin guide (setup, configuration)
- [ ] API documentation
- [ ] Video tutorials (Loom recordings)
- [ ] Migration guide (for existing customers)
- [ ] Launch announcement blog post

---

## 5. Integration Points with Existing Features

### 5.1 Reports/Incidents Module

**Existing**: Whistleblower reports with encrypted messaging  
**New**: Link incidents to policies and risks

```typescript
// Enhanced report detail view
const ReportDetail: React.FC<{ reportId: string }> = ({ reportId }) => {
  return (
    <div>
      {/* Existing report content */}
      <ReportContentDisplay report={report} />
      
      {/* NEW: Linked Policies */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Related Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkedPoliciesList reportId={reportId} />
          <Button onClick={handleLinkPolicy}>
            <Link className="mr-2" /> Link to Policy
          </Button>
        </CardContent>
      </Card>

      {/* NEW: Linked Risks */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Related Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkedRisksList reportId={reportId} />
          <Button onClick={handleLinkRisk}>
            <AlertTriangle className="mr-2" /> Link to Risk
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 5.2 Dashboard

**Existing**: Report statistics and charts  
**New**: Add compliance metrics

```typescript
const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Existing: Report Stats */}
      <DashboardStats />

      {/* NEW: Compliance Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Active Policies"
              value={policyStats.active}
              trend="neutral"
            />
            <StatCard 
              title="Open Risks"
              value={riskStats.open}
              trend="down"
            />
            <StatCard 
              title="Upcoming Deadlines"
              value={eventStats.upcoming}
              trend="up"
            />
            <StatCard 
              title="Compliance Score"
              value="92%"
              trend="up"
            />
          </div>
        </CardContent>
      </Card>

      {/* NEW: Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/risk-compliance/policies/new')}>
              <FileText className="mr-2" /> New Policy
            </Button>
            <Button onClick={() => navigate('/risk-compliance/risks/new')}>
              <AlertTriangle className="mr-2" /> Log Risk
            </Button>
            <Button onClick={() => navigate('/risk-compliance/calendar/new')}>
              <Calendar className="mr-2" /> Add Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 5.3 Settings

**Existing**: Organization settings, user management  
**New**: Compliance configuration

```typescript
// src/pages/Settings.tsx
const Settings: React.FC = () => {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>  {/* NEW */}
      </TabsList>

      {/* Existing tabs... */}

      <TabsContent value="compliance">
        <ComplianceSettings />
      </TabsContent>
    </Tabs>
  );
};

// src/components/ComplianceSettings.tsx
const ComplianceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Risk Matrix Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskMatrixConfigurator />
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Frameworks</CardTitle>
          <CardDescription>
            Select the frameworks your organization follows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Checkbox label="ISO 27001" />
            <Checkbox label="SOC 2" />
            <Checkbox label="GDPR" />
            <Checkbox label="HIPAA" />
            <Checkbox label="PCI DSS" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationPreferences />
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 6. Security Considerations

### 6.1 Data Protection

- **Encryption**: Reuse existing AES-GCM encryption for sensitive policy/risk data
- **RLS Policies**: Strict tenant isolation at database level
- **Audit Logging**: All CRUD operations logged to `audit_logs` table
- **Access Control**: Role-based permissions (org_admin, case_handler)

### 6.2 File Uploads

```typescript
// Secure file upload with virus scanning
const handleFileUpload = async (file: File) => {
  // 1. Validate file type and size
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > 50 * 1024 * 1024) {  // 50MB limit
    throw new Error('File too large');
  }

  // 2. Upload to Supabase Storage (with RLS)
  const filePath = `${organizationId}/evidence/${uuidv4()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('compliance-evidence')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // 3. Create database record
  const { data: evidence } = await supabase
    .from('compliance_evidence')
    .insert({
      organization_id: organizationId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: filePath,
      uploaded_by: userId
    })
    .select()
    .single();

  return evidence;
};
```

---

## 7. Cost Estimation

### 7.1 Development Cost

**10 weeks × $150/hour × 40 hours/week = $60,000**

### 7.2 Infrastructure Cost (Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| Database Storage | $0 | Use existing Supabase instance |
| File Storage | $25-100 | Supabase Storage (dependent on usage) |
| AI Gateway Usage | Variable | ~$0.50 per analysis |
| Email Notifications | $10 | Resend (existing) |
| **Total** | **$35-110** | |

---

## 8. Success Metrics

### 8.1 Technical Metrics

- **Performance**: Page load < 1 second for all views
- **Reliability**: 99.9% uptime
- **Data Integrity**: Zero data loss, full audit trail
- **Scalability**: Support 10,000+ policies/risks per organization

### 8.2 Business Metrics

- **User Adoption**: 80% of org admins use compliance module within 30 days
- **Time Savings**: Reduce compliance reporting time by 50%
- **Audit Readiness**: Generate audit report in < 5 minutes
- **Customer Satisfaction**: NPS score > 50 for compliance features

---

## 9. Future Enhancements (Post-Launch)

### Phase 9+ (Months 4-6)

- **Mobile App**: Native iOS/Android app for on-the-go compliance management
- **Workflow Automation**: Zapier integration for automated workflows
- **Advanced Analytics**: Predictive modeling for risk scoring
- **Benchmarking**: Compare metrics against industry standards
- **Compliance Templates**: Pre-built policy/risk/event templates for common frameworks
- **Training Module**: Online training courses with completion tracking
- **Third-Party Integrations**: 
  - Jira (risk/issue tracking)
  - Slack (notifications)
  - Microsoft Teams (notifications)
  - Salesforce (customer data)
- **Custom Reporting**: Drag-and-drop report builder
- **Multi-language Support**: Full i18n for global organizations

---

## 10. Documentation Deliverables

1. **User Guide**: Step-by-step instructions for all features
2. **Admin Guide**: Configuration and best practices
3. **API Documentation**: OpenAPI spec for programmatic access
4. **Video Tutorials**: 10-15 minute walkthrough for each module
5. **Migration Guide**: How to import existing data
6. **Compliance Framework Guides**: Specific guidance for ISO 27001, SOC 2, GDPR
7. **FAQ Document**: Common questions and troubleshooting

---

## Appendix A: Database ERD

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  policies    │       │    risks     │       │compliance_   │
│              │       │              │       │   events     │
│ • title      │       │ • title      │       │ • title      │
│ • version    │       │ • impact     │       │ • start_date │
│ • status     │       │ • likelihood │       │ • due_date   │
│ • owner_id   │       │ • status     │       │ • status     │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       │                      │                      │
       └──────────┬───────────┴──────────┬───────────┘
                  │                      │
           ┌──────▼──────┐        ┌──────▼──────┐
           │   reports   │        │  evidence   │
           │ (existing)  │        │   library   │
           │             │        │             │
           │ • category  │        │ • file_name │
           │ • status    │        │ • storage   │
           │ • encrypted │        │ • links     │
           └─────────────┘        └─────────────┘
```

---

## Appendix B: Example Policy Document

See `docs/sample-policies/` for:
- Information Security Policy
- Data Retention Policy
- Incident Response Policy
- Business Continuity Policy

---

## Appendix C: Risk Matrix Template

```
Impact    │  1     2     3     4     5
──────────┼─────────────────────────────
    5     │  5    10    15    20    25
    4     │  4     8    12    16    20
    3     │  3     6     9    12    15
    2     │  2     4     6     8    10
    1     │  1     2     3     4     5
──────────┴─────────────────────────────
          Likelihood →

Color Coding:
• 1-5:   Low Risk (Green)
• 6-9:   Medium Risk (Yellow)
• 10-14: High Risk (Orange)
• 15-25: Critical Risk (Red)
```

---

**Document Status**: Draft for Review  
**Next Steps**: Review with team → Approve architecture → Begin Phase 1 implementation  
**Estimated Completion**: 10 weeks from start date  
**Budget**: $60,000 development + $35-110/month infrastructure  
**Dependencies**: Requires Private AI Gateway (Feature 1) for full AI Insights functionality

