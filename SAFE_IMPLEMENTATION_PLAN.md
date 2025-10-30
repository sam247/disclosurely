# Safe Implementation Plan - Risk-Minimized Approach
## Protecting Existing Critical Infrastructure

**Last Updated**: October 30, 2025  
**Priority**: DO NOT BREAK existing secure links, messaging, CNAME functionality

---

## 🚨 Critical Systems to Protect (DO NOT TOUCH)

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
// PROTECTED: send-notification-emails, process-notifications-to-emails Edge Functions
// Files: NotificationSystem.tsx, email_notifications table, notifications table
// Status: WORKING - DO NOT MODIFY
```

---

## ✅ Safe Implementation Strategy

### Principle: **Add, Don't Modify**

All new features will be:
1. **Separate Edge Functions** (not modifying existing ones)
2. **New Database Tables** (not touching existing schemas)
3. **New React Components** (parallel to existing UI)
4. **Feature Flags** (can be disabled instantly if issues arise)

---

## Phase 1: Private AI Gateway (Weeks 1-4)

### Week 1: Foundation (Zero Risk)

**Step 1.1: Database Schema (Additive Only)**

```sql
-- NEW tables only, no ALTER on existing tables
CREATE TABLE ai_gateway_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  policy_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_gateway_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  pii_detected BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NO FOREIGN KEYS to existing critical tables initially
-- Will add soft links only (organization_id as reference, no cascade)
```

✅ **Risk Level**: ZERO - New tables only, existing system unaffected

**Step 1.2: Create Isolated Edge Function**

```bash
# NEW function, doesn't touch existing functions
supabase/functions/ai-gateway-generate/index.ts
```

```typescript
// This function is COMPLETELY SEPARATE from existing case analysis
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Feature flag check - can disable immediately
  const FEATURE_ENABLED = Deno.env.get('AI_GATEWAY_ENABLED') === 'true';
  if (!FEATURE_ENABLED) {
    return new Response('Feature not enabled', { status: 503 });
  }

  // Implementation...
  // Does NOT call any existing Edge Functions
  // Does NOT query critical tables (reports, organization_links, etc.)
});
```

✅ **Risk Level**: ZERO - Isolated function, feature flag controlled

### Week 2: PII Detection (Standalone Testing)

**Step 2.1: Separate Python Service (Optional)**

If using Python for Presidio, deploy as completely separate service:

```yaml
# docker-compose.yml (separate from main app)
version: '3.8'
services:
  pii-detector:
    build: ./pii-service
    ports:
      - "3002:3002"  # Different port from main app
    environment:
      - ENABLE_REDACTION=true
```

✅ **Risk Level**: ZERO - Separate Docker container, no connection to existing services

**Step 2.2: Test PII Detection in Isolation**

```typescript
// Test standalone, NOT integrated yet
const testPII = async () => {
  const testText = "John Doe at john.doe@example.com reported an issue";
  const response = await fetch('http://localhost:3002/detect', {
    method: 'POST',
    body: JSON.stringify({ text: testText })
  });
  
  const result = await response.json();
  console.log('Redacted:', result.redacted_text);
  // Expected: "[PERSON_1] at [EMAIL_1] reported an issue"
};
```

✅ **Risk Level**: ZERO - Testing only, no production integration

### Week 3: Integration Point (Careful Connection)

**Step 3.1: Add NEW Edge Function for AI Case Analysis**

```typescript
// supabase/functions/ai-case-analysis-v2/index.ts
// This is a NEW function, parallel to existing analyze-case-with-ai

serve(async (req) => {
  const { reportId, organizationId } = await req.json();

  // SAFE: Only READ from existing tables, never WRITE or UPDATE
  const { data: report } = await supabase
    .from('reports')
    .select('encrypted_content, encryption_key_hash')
    .eq('id', reportId)
    .single();

  if (!report) {
    return new Response('Report not found', { status: 404 });
  }

  // Decrypt using EXISTING function (don't modify it)
  const decryptResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/decrypt-report-data`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      body: JSON.stringify({ 
        encryptedData: report.encrypted_content,
        keyHash: report.encryption_key_hash,
        organizationId 
      })
    }
  );

  const decryptedReport = await decryptResponse.json();

  // NEW: Send to AI Gateway with PII redaction
  const aiResponse = await fetch('http://ai-gateway:3001/api/v1/generate', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a case analyst...' },
        { role: 'user', content: decryptedReport.content }
      ],
      organizationId,
      context: { purpose: 'case_analysis', report_id: reportId }
    })
  });

  // Return analysis
  return new Response(JSON.stringify(await aiResponse.json()), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

✅ **Risk Level**: LOW
- Only READS from existing tables
- Uses existing decrypt function (doesn't modify it)
- Separate Edge Function (doesn't replace existing one)

**Step 3.2: Add UI Toggle (Feature Flag in Dashboard)**

```typescript
// src/components/admin/AIGatewaySettings.tsx (NEW file)
export const AIGatewaySettings = () => {
  const [useNewAI, setUseNewAI] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Gateway (Beta)</CardTitle>
        <CardDescription>
          Enable private AI with PII redaction for case analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Use AI Gateway</h3>
            <p className="text-sm text-gray-500">
              Route AI requests through privacy-preserving gateway
            </p>
          </div>
          <Switch 
            checked={useNewAI}
            onCheckedChange={setUseNewAI}
          />
        </div>
        
        {useNewAI && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              AI Gateway is enabled. All PII will be redacted before sending to AI models.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
```

✅ **Risk Level**: ZERO - New component, doesn't affect existing UI

### Week 4: Gradual Rollout

**Step 4.1: Parallel Testing**

```typescript
// In existing case analysis component, add option
const analyzeCase = async (reportId: string) => {
  const useAIGateway = organizationSettings?.ai_gateway_enabled;

  if (useAIGateway) {
    // NEW path (opt-in only)
    return await analyzeWithGateway(reportId);
  } else {
    // EXISTING path (default, unchanged)
    return await analyzeWithDirectAI(reportId);
  }
};
```

**Rollout Strategy**:
1. Week 4.1: Enable for 1 test organization only
2. Week 4.2: Monitor for 3 days - any issues → instant rollback
3. Week 4.3: Enable for 5 friendly customers (ask permission)
4. Week 4.4: If no issues → offer as opt-in to all customers

✅ **Risk Level**: LOW - Opt-in only, easy rollback via feature flag

---

## Phase 2: Risk & Compliance Module (Weeks 5-10)

### Week 5: Database Schema (Completely Isolated)

```sql
-- NEW tables with NO foreign keys to critical tables initially
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,  -- Soft reference only
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,  -- Soft reference only
  title TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NO FOREIGN KEYS to reports table yet
-- Will add optional linking later after testing
```

✅ **Risk Level**: ZERO - Separate tables, no impact on existing reports/messaging

### Week 6-7: UI Components (Parallel Routes)

```typescript
// NEW route, doesn't modify existing routes
<Route path="/risk-compliance" element={<RiskCompliance />}>
  <Route path="policies" element={<PolicyTracker />} />
  <Route path="risks" element={<RiskRegister />} />
</Route>

// Existing routes UNCHANGED
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/reports" element={<ReportsManagement />} />
<Route path="/secure/tool/submit/:linkToken" element={<DynamicSubmissionForm />} />
```

✅ **Risk Level**: ZERO - New routes only, existing navigation untouched

### Week 8: Optional Linking (Soft References)

Only after Risk & Compliance is stable, add OPTIONAL linking:

```sql
-- Add optional link between risks and reports
CREATE TABLE risk_incident_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  report_id UUID NOT NULL,  -- Soft reference (no FK constraint initially)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Later, after testing, can add FK with NO CASCADE
ALTER TABLE risk_incident_links
  ADD CONSTRAINT fk_report_id 
  FOREIGN KEY (report_id) 
  REFERENCES reports(id)
  ON DELETE SET NULL;  -- Won't cascade delete
```

✅ **Risk Level**: LOW - Soft reference, won't affect existing reports

---

## Emergency Rollback Procedures

### Instant Rollback (No Code Deploy)

**1. Disable AI Gateway**
```bash
# Set environment variable
supabase secrets set AI_GATEWAY_ENABLED=false
```

**2. Disable Risk Module UI**
```typescript
// In feature flags table
UPDATE feature_flags 
SET is_enabled = false 
WHERE feature_name = 'risk_compliance_module';
```

### Database Rollback

```sql
-- Can drop new tables without affecting existing system
DROP TABLE IF EXISTS ai_gateway_policies CASCADE;
DROP TABLE IF EXISTS ai_gateway_logs CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS risks CASCADE;

-- Critical tables remain untouched:
-- ✅ reports
-- ✅ organization_links
-- ✅ report_messages
-- ✅ custom_domains
```

---

## Testing Strategy (Non-Invasive)

### 1. Parallel Testing Environment

```bash
# Create separate test database
createdb disclosurely_test

# Run migrations on test DB only
supabase db push --db-url postgresql://localhost/disclosurely_test

# Test new features without touching production
```

### 2. Canary Deployment

```typescript
// Route only 5% of traffic to new features initially
const shouldUseNewFeature = () => {
  return Math.random() < 0.05; // 5% of requests
};

if (shouldUseNewFeature() && aiGatewayEnabled) {
  // Use new AI Gateway
} else {
  // Use existing direct AI
}
```

### 3. Monitoring (Non-Invasive)

```sql
-- Add monitoring without modifying existing tables
CREATE TABLE system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  status TEXT NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Monitor critical functions
INSERT INTO system_health_checks (check_name, status)
VALUES 
  ('secure_links_working', 'healthy'),
  ('messaging_working', 'healthy'),
  ('cname_working', 'healthy');
```

---

## Go/No-Go Criteria for Each Phase

### AI Gateway (Phase 1)
✅ GO if:
- [ ] All existing tests still pass
- [ ] Secure link submission works normally
- [ ] Encrypted messaging works normally
- [ ] CNAME redirects work normally
- [ ] PII detection accuracy > 95%
- [ ] AI Gateway latency < 2 seconds

❌ NO-GO if ANY of above fail

### Risk & Compliance (Phase 2)
✅ GO if:
- [ ] Phase 1 GO criteria still met
- [ ] New tables don't slow down existing queries
- [ ] UI renders without performance degradation
- [ ] No impact on existing dashboard load times

❌ NO-GO if ANY of above fail

---

## Communication Plan

### Internal Team
- **Daily standups**: Report any issues immediately
- **Slack alerts**: Automated monitoring → #disclosurely-alerts
- **Weekly demos**: Show progress, get feedback

### Customers
- **Soft launch**: "We're testing a new AI privacy feature"
- **Opt-in beta**: "Would you like to try our new Risk module?"
- **Clear expectations**: "This is beta - existing features unchanged"

---

## Estimated Timelines (Conservative)

| Phase | Optimistic | Realistic | Conservative |
|-------|-----------|-----------|--------------|
| AI Gateway | 4 weeks | 6 weeks | 8 weeks |
| Risk Module | 6 weeks | 8 weeks | 10 weeks |
| **Total** | **10 weeks** | **14 weeks** | **18 weeks** |

Recommend: **Use Realistic timeline (14 weeks)** to account for careful testing

---

## Next Immediate Steps (This Week)

### Day 1-2: Setup
- [ ] Create feature flag table
- [ ] Set up separate test environment
- [ ] Create AI Gateway database migration (test only)
- [ ] Review existing Edge Functions (don't modify, just document)

### Day 3-4: Isolated Development
- [ ] Build ai-gateway-generate Edge Function (isolated)
- [ ] Test PII detection standalone
- [ ] Write comprehensive tests

### Day 5: First Integration Test
- [ ] Deploy to test organization only
- [ ] Manual testing: secure links, messaging, CNAME still work
- [ ] Run automated test suite
- [ ] If ALL pass → proceed to Week 2
- [ ] If ANY fail → debug before proceeding

---

## Success Metrics (Must Maintain)

### Critical Metrics (Cannot Degrade)
- ✅ Secure link submission success rate: 99.9%
- ✅ Message encryption/decryption success rate: 100%
- ✅ CNAME redirect success rate: 99.9%
- ✅ Average page load time: < 1 second

### New Metrics (For New Features)
- PII detection accuracy: > 95%
- AI Gateway uptime: > 99.5%
- Risk module page load: < 1 second
- Zero data leaks (PII to external vendors)

---

**Bottom Line**: We add new capabilities alongside existing infrastructure, never replacing or modifying what works. Every step is reversible with a feature flag.

**Commitment**: If ANYTHING breaks existing secure links, messaging, or CNAME → immediate rollback, no exceptions.

