# AI Gateway & Risk Compliance - Master Guide

**Project**: Disclosurely Private AI Gateway + Risk & Compliance Module  
**Status**: Phase 1 Deployed ✅ | Phase 2 Ready to Build  
**Last Updated**: October 30, 2025

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Current Status](#current-status)
3. [AI Gateway (Phase 1)](#ai-gateway-phase-1)
4. [Risk & Compliance Module (Phase 2)](#risk-compliance-module-phase-2)
5. [Testing & Rollout](#testing--rollout)
6. [Monitoring](#monitoring)
7. [Emergency Procedures](#emergency-procedures)
8. [Protected Systems](#protected-systems)

---

## 🚀 Quick Start

### What's Live Right Now

✅ **Feature Flag System** - Central kill switch for all features  
✅ **AI Gateway Infrastructure** - Database + Edge Function (disabled)  
✅ **Zero Impact** - Existing features untouched and working  

### Test Organization

**Name**: Test  
**ID**: `2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c`  
**Domain**: test

### Enable AI Gateway (When Ready)

```sql
-- In Supabase SQL Editor
SELECT enable_feature_for_org(
  'ai_gateway', 
  '2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c'::UUID,
  true
);
```

### Quick Test

```bash
curl -X POST \
  https://cxmuzperkittvibslnff.supabase.co/functions/v1/ai-gateway-generate \
  -H "Authorization: Bearer YOUR_SUPABASE_KEY" \
  -H "X-Organization-Id: 2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Test"}]}'
```

---

## 📊 Current Status

### Deployed (Live Production)

| Component | Status | Details |
|-----------|--------|---------|
| Feature Flags | ✅ Active | 7 flags, all disabled |
| AI Gateway Tables | ✅ Created | 5 tables with RLS |
| Edge Function | ✅ Deployed | `ai-gateway-generate` (feature-flagged) |
| Helper Functions | ✅ Active | 4 SQL functions |
| Admin UI | 📦 Ready | `FeatureFlagManager.tsx` (not integrated) |

### Feature Flags

All disabled by default (0% rollout):

```
✓ ai_gateway                  - Private AI with PII redaction
✓ ai_gateway_multi_model      - Multi-model support (OpenAI/Anthropic)
✓ risk_compliance_module      - Full compliance hub
✓ policy_tracker              - Policy management
✓ risk_register               - Risk assessment  
✓ compliance_calendar         - Deadlines & reminders
✓ ai_insights                 - AI analytics
```

### Database Tables

**Feature Management**:
- `feature_flags` - Central feature toggle system

**AI Gateway**:
- `ai_gateway_policies` - Per-org AI policies (YAML/JSON)
- `ai_gateway_logs` - Audit trail (NO sensitive data stored)
- `ai_gateway_redaction_maps` - PII mappings (24h auto-expire)
- `ai_gateway_token_usage` - Billing & limits tracking

**Risk & Compliance** (Phase 2 - Not Built Yet):
- `compliance_policies` - Policy tracker
- `risk_assessments` - Risk register
- `compliance_deadlines` - Calendar & reminders
- `compliance_evidence` - Shared evidence uploads

---

## 🔐 AI Gateway (Phase 1)

### Architecture

```
Client → AI Gateway Edge Function → Privacy Layer → DeepSeek/OpenAI/Anthropic
                ↓                        ↓
         Feature Flag Check      PII Detection/Redaction
                ↓                        ↓
         Policy Enforcement       Audit Logging (Safe)
                ↓                        ↓
         Token Limits            Redaction Map Storage
```

### Core Features

**1. Privacy-First Design**
- Zero data retention at AI vendor
- PII detection & pseudonymization
- Deterministic redaction (reversible within 24h)
- Structured logs only (no prompts/completions stored)

**2. Policy Engine**
- Per-organization YAML/JSON policies
- Model routing by purpose (case_analysis, content_gen, etc.)
- Token limits (daily caps)
- Temperature/max_tokens control

**3. Multi-Model Support**
- **Primary**: DeepSeek (existing integration)
- **Optional**: OpenAI (embeddings), Anthropic (premium)
- Automatic failover
- Cost tracking per model

**4. Security & Compliance**
- Row Level Security (RLS) on all tables
- Complete audit trail
- Automatic PII map expiry (24h)
- Tamper-evident logging

### API Specification

#### POST `/functions/v1/ai-gateway-generate`

**Headers**:
```
Authorization: Bearer <supabase-key>
X-Organization-Id: <org-uuid>
Content-Type: application/json
```

**Request Body**:
```json
{
  "messages": [
    {"role": "user", "content": "Analyze this case..."}
  ],
  "model": "deepseek-chat",           // Optional
  "temperature": 0.7,                 // Optional
  "max_tokens": 2000,                 // Optional
  "preserve_pii": false,              // Optional (default: false)
  "context": {
    "purpose": "case_analysis",       // Optional
    "report_id": "uuid"               // Optional
  }
}
```

**Response**:
```json
{
  "id": "request-uuid",
  "model": "deepseek-chat",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Analysis..."
    }
  }],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 800,
    "total_tokens": 950
  },
  "metadata": {
    "pii_redacted": true,
    "redaction_map": {
      "john@email.com": "[EMAIL_1]",
      "555-1234": "[PHONE_1]"
    },
    "vendor": "deepseek",
    "latency_ms": 1250
  }
}
```

**Error Responses**:
```json
// Feature disabled
{
  "error": "AI Gateway not enabled for this organization",
  "code": "FEATURE_DISABLED"
}

// Token limit exceeded
{
  "error": "Daily token limit exceeded",
  "code": "TOKEN_LIMIT_EXCEEDED"
}

// Model error
{
  "error": "AI model error",
  "details": "..."
}
```

### PII Detection (MVP)

**Current**: Simple regex-based detection
- Email addresses
- Phone numbers
- SSN patterns

**Phase 2**: Presidio/spaCy integration
- Names (PERSON entities)
- Addresses (LOCATION)
- Organizations
- Custom entity types
- Multi-language support

### Default Policy

When no policy exists for an organization:
```json
{
  "routing": {
    "default_model": "deepseek-chat",
    "purpose_routing": {
      "case_analysis": {
        "model": "deepseek-chat",
        "temperature": 0.3,
        "max_tokens": 4000
      }
    }
  },
  "limits": {
    "daily_tokens": 1000000,
    "per_request_max_tokens": 4000
  },
  "pii_protection": {
    "enabled": true,
    "redaction_level": "strict"
  },
  "vendors": {
    "deepseek": {
      "enabled": true,
      "models": ["deepseek-chat", "deepseek-coder"]
    }
  }
}
```

### Cost Analysis

**DeepSeek** (Primary):
- Input: $0.14 per 1M tokens
- Output: $0.28 per 1M tokens
- **Current usage**: ~$0.70/month

**OpenAI** (Optional):
- Embeddings: $0.013 per 1M tokens
- GPT-4: $0.03 per 1K tokens (if needed)

**Anthropic** (Optional):
- Claude 3 Sonnet: $3 per 1M input tokens
- Claude 3 Haiku: $0.25 per 1M tokens

**AI Gateway Infrastructure**: $0 (included in Supabase plan)

---

## 📋 Risk & Compliance Module (Phase 2)

### Overview

Extend Disclosurely into a full compliance management hub with:
1. **Policy Tracker** - Upload, version, assign policies
2. **Risk Register** - Track risks with mitigations
3. **Compliance Calendar** - Deadlines, reviews, training
4. **AI Insights Dashboard** - Risk trends, clusters, summaries

### Database Schema (Not Built Yet)

```sql
-- Policy Tracker
CREATE TABLE compliance_policies (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  policy_number TEXT,
  category TEXT,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  owner_id UUID REFERENCES profiles(id),
  file_url TEXT,
  next_review_date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Risk Register
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  risk_type TEXT, -- operational, reputational, financial, regulatory
  likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status TEXT DEFAULT 'open',
  mitigation_plan TEXT,
  owner_id UUID REFERENCES profiles(id),
  linked_policy_id UUID REFERENCES compliance_policies(id),
  linked_incident_id UUID REFERENCES reports(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Compliance Calendar
CREATE TABLE compliance_deadlines (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  deadline_type TEXT, -- policy_review, audit, training, submission
  due_date DATE NOT NULL,
  recurrence TEXT, -- none, monthly, quarterly, annual
  assigned_to UUID REFERENCES profiles(id),
  linked_policy_id UUID REFERENCES compliance_policies(id),
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shared Evidence
CREATE TABLE compliance_evidence (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  encrypted_url TEXT,
  linked_policy_id UUID REFERENCES compliance_policies(id),
  linked_risk_id UUID REFERENCES risk_assessments(id),
  linked_incident_id UUID REFERENCES reports(id),
  uploaded_by UUID REFERENCES profiles(id),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Features

**Policy Tracker**:
- Upload policies (PDF, DOCX)
- Version control with change tracking
- Assign policy owners
- Link to incidents/risks
- Auto-reminders for reviews
- Global search across policies

**Risk Register**:
- CRUD operations for risks
- 5x5 risk matrix (likelihood × impact)
- Status tracking (open, mitigating, closed)
- Mitigation plan tracking
- Link to policies and incidents
- Risk score calculation

**Compliance Calendar**:
- Key dates visualization
- Policy review reminders
- Audit schedules
- Training deadlines
- Email/in-app notifications
- Calendar sync (iCal export)

**AI Insights Dashboard**:
- Incident trend analysis
- Risk clustering
- Quarterly summaries
- Pattern detection
- Compliance gap analysis
- Automated reporting

### Implementation Timeline

**Week 1-2**: Database schema + Basic CRUD
**Week 3-4**: Policy Tracker UI
**Week 5-6**: Risk Register UI
**Week 7-8**: Compliance Calendar
**Week 9-10**: AI Insights Dashboard
**Week 11-12**: Testing & refinement
**Week 13-14**: Gradual rollout

---

## 🧪 Testing & Rollout

### Phase 1: Feature Flag Verification (NOW)

Test that kill switch works:
```bash
# Should return: "AI Gateway not enabled for this organization"
curl -X POST https://cxmuzperkittvibslnff.supabase.co/functions/v1/ai-gateway-generate \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "X-Organization-Id: 2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

✅ **Pass Criteria**: Returns `FEATURE_DISABLED` error

### Phase 2: Enable for Test Org

```sql
-- Enable AI Gateway
SELECT enable_feature_for_org(
  'ai_gateway', 
  '2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c'::UUID,
  true
);

-- Verify
SELECT is_feature_enabled('ai_gateway', '2cc2aed1-2be1-4b7f-a5d7-844daa99cb4c'::UUID);
-- Should return: true
```

Test with real case analysis in Test org. Verify:
- Request succeeds
- PII detected (if present)
- Logs created
- Token usage tracked

### Phase 3: Gradual Rollout

```sql
-- 5% rollout (deterministic by org hash)
UPDATE feature_flags
SET is_enabled = true, rollout_percentage = 5
WHERE feature_name = 'ai_gateway';

-- Monitor for 24-48h, then increase
UPDATE feature_flags
SET rollout_percentage = 25
WHERE feature_name = 'ai_gateway';

-- If stable, 100%
UPDATE feature_flags
SET rollout_percentage = 100
WHERE feature_name = 'ai_gateway';
```

**Timeline**:
- Day 1-7: Test org only
- Day 8-14: 5% rollout
- Day 15-21: 25% rollout
- Day 22+: 100% (if no issues)

### Integration with Existing Code

Replace direct DeepSeek calls:

**Before**:
```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ model: 'deepseek-chat', messages })
});
```

**After**:
```typescript
// Check feature flag
const { data: gatewayEnabled } = await supabase.rpc('is_feature_enabled', {
  p_feature_name: 'ai_gateway',
  p_organization_id: organizationId
});

if (gatewayEnabled) {
  // Use AI Gateway
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/ai-gateway-generate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'X-Organization-Id': organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        messages,
        context: { purpose: 'case_analysis' }
      })
    }
  );
} else {
  // Fallback to direct DeepSeek (existing code)
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', ...);
}
```

---

## 📈 Monitoring

### Daily Health Check

```sql
-- AI Gateway activity today
SELECT 
  COUNT(*) as total_requests,
  SUM(total_tokens) as tokens_used,
  AVG(latency_ms) as avg_latency_ms,
  COUNT(CASE WHEN error_type IS NOT NULL THEN 1 END) as errors,
  COUNT(CASE WHEN pii_detected THEN 1 END) as pii_detections
FROM ai_gateway_logs
WHERE created_at >= CURRENT_DATE;
```

### Token Usage by Organization

```sql
SELECT 
  o.name,
  SUM(usage.total_tokens) as tokens,
  SUM(usage.total_requests) as requests,
  ROUND(SUM(usage.total_cost_usd)::NUMERIC, 4) as cost_usd
FROM ai_gateway_token_usage usage
JOIN organizations o ON usage.organization_id = o.id
WHERE usage.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY o.name
ORDER BY tokens DESC;
```

### Error Rate

```sql
SELECT 
  error_type,
  COUNT(*) as error_count,
  MAX(created_at) as last_occurrence
FROM ai_gateway_logs
WHERE error_type IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY error_count DESC;
```

### PII Detection Trends

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN pii_detected THEN 1 END) as pii_detected,
  ROUND(
    COUNT(CASE WHEN pii_detected THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 
    2
  ) as detection_rate_percent
FROM ai_gateway_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚨 Emergency Procedures

### Instant Disable (< 1 Second)

**Disable AI Gateway Globally**:
```sql
UPDATE feature_flags
SET is_enabled = false, rollout_percentage = 0
WHERE feature_name = 'ai_gateway';
```

**Disable for Specific Org**:
```sql
SELECT enable_feature_for_org('ai_gateway', 'ORG_ID'::UUID, false);
```

**Nuclear Option (All Features)**:
```sql
UPDATE feature_flags
SET is_enabled = false, rollout_percentage = 0;
```

### Verify Rollback

```bash
curl -X POST https://cxmuzperkittvibslnff.supabase.co/functions/v1/ai-gateway-generate \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "X-Organization-Id: ANY_ORG" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'

# Should return: {"error": "AI Gateway not enabled...", "code": "FEATURE_DISABLED"}
```

### Recovery Time

- Feature flag disable: **< 1 second**
- No code deploy needed
- Automatic fallback to existing DeepSeek integration
- Zero data loss

---

## 🔒 Protected Systems (DO NOT TOUCH)

These systems are **WORKING** and must **NOT** be modified:

### 1. Secure Link System
```typescript
// PROTECTED: /secure/tool/submit/:linkToken
// Files: DynamicSubmissionForm.tsx, organization_links table
// Status: WORKING - DO NOT MODIFY
```

### 2. Encrypted Messaging
```typescript
// PROTECTED: anonymous-report-messaging Edge Function
// Files: SecureReportMessaging.tsx, WhistleblowerMessaging.tsx
// Status: WORKING - DO NOT MODIFY
```

### 3. Custom Domain (CNAME)
```typescript
// PROTECTED: simple-domain Edge Function, custom_domains table
// Files: CustomDomainSettings.tsx, SubdomainRedirect.tsx
// Status: WORKING - DO NOT MODIFY
```

### 4. Report Encryption/Decryption
```typescript
// PROTECTED: encrypt-report-data, decrypt-report-data Edge Functions
// Status: WORKING - DO NOT MODIFY
```

### 5. Team Member Invite Flow
```typescript
// PROTECTED: send-team-invitation, accept-team-invitation Edge Functions
// Files: UserManagement.tsx, AcceptInvite.tsx, user_invitations table
// Status: WORKING - DO NOT MODIFY
```

### 6. Email Notifications System
```typescript
// PROTECTED: send-notification-emails, process-notifications-to-emails
// Files: NotificationSystem.tsx, email_notifications table
// Status: WORKING - DO NOT MODIFY
```

### Safe Implementation Strategy

✅ **Build new features as add-ons**:
- New Edge Functions (don't modify existing)
- New tables (don't alter existing)
- Parallel UI components (don't replace working ones)
- Feature flags for enable/disable

✅ **Never modify**:
- Existing Edge Functions that work
- Core database tables
- Authentication flows
- Encryption implementations

---

## 📂 Files & Locations

### Database Migrations
- `supabase/migrations/20251030120000_feature_flags.sql`
- `supabase/migrations/20251030120001_ai_gateway_schema.sql`

### Edge Functions
- `supabase/functions/ai-gateway-generate/index.ts`
- `supabase/config.toml`

### Frontend Components
- `src/hooks/useFeatureFlag.ts` - React hook for feature flags
- `src/components/admin/FeatureFlagManager.tsx` - Admin UI

### Documentation
- `AI_GATEWAY_MASTER.md` - This file (comprehensive guide)
- `README.md` - Main project readme
- `SYSTEM_ARCHITECTURE.md` - Overall architecture
- `SECURITY_POLICIES.md` - Security documentation

---

## 🎯 Next Steps

### Immediate
1. ✅ **Deployment Complete** - Phase 1 live
2. ⏳ **Add Admin UI** - Integrate FeatureFlagManager
3. ⏳ **Test with Test Org** - Enable & verify

### This Week
4. **Verify Existing Features** - Ensure nothing broken
5. **Integration Work** - Update AI calls to use gateway
6. **Monitoring Setup** - Create dashboard views

### Next 2 Weeks
7. **Risk & Compliance Schema** - Create tables
8. **Policy Tracker UI** - Build first module
9. **Gradual Rollout** - 5% → 25% → 100%

### Month 2
10. **Risk Register** - Complete implementation
11. **Compliance Calendar** - With reminders
12. **AI Insights Dashboard** - Analytics & trends

---

## 💡 Tips & Best Practices

1. **Always use feature flags** for new functionality
2. **Test with Test org first** before wider rollout
3. **Monitor logs daily** during rollout phase
4. **Keep existing features untouched** - build parallel
5. **Document any changes** to this master file
6. **Backup before major changes** (Supabase auto-backups)
7. **Use RLS policies** for all new tables
8. **Encrypt sensitive data** at application level
9. **Audit everything** - comprehensive logging
10. **Gradual rollout** - never go 0% to 100%

---

## 🆘 Support

**Issues or Questions?**
- Check this file first (comprehensive)
- Review deployment logs in Supabase Dashboard
- Check `ai_gateway_logs` table for errors
- Feature flags can be disabled instantly if needed

**Contact**:
- Email: sam@disclosurely.com
- GitHub: https://github.com/sam247/disclosurely

---

**Last Updated**: October 30, 2025  
**Version**: 1.0  
**Status**: AI Gateway Phase 1 Deployed | Phase 2 Ready to Build

