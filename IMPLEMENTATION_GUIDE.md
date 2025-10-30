# Implementation Guide
## Developer Quick-Start for New Features

**Last Updated**: October 30, 2025  
**For**: Development team implementing AI Gateway and Risk & Compliance Module

---

## Prerequisites

Before starting, ensure you have:

✅ **Development Environment**
- Node.js 20+ LTS
- Deno 1.40+ (for Edge Functions)
- PostgreSQL 15+ (via Supabase)
- Docker Desktop (optional, for local AI Gateway)
- Git configured with branch protection

✅ **Access & Credentials**
- Supabase project access (database + auth + storage)
- Vercel deployment access
- OpenAI API key (for testing AI Gateway)
- Resend API key (for email notifications)

✅ **Tooling**
- VS Code with TypeScript, ESLint, Prettier extensions
- Supabase CLI (`npm install -g supabase`)
- k6 or Artillery (for load testing)
- Semgrep (for security scanning)

---

## Project Structure

```
disclosurely/
├── src/
│   ├── components/
│   │   ├── ai-gateway/          # NEW: AI Gateway UI components
│   │   │   ├── AIGatewayDashboard.tsx
│   │   │   ├── PolicyEditor.tsx
│   │   │   ├── ModelHealthStatus.tsx
│   │   │   └── TokenUsageChart.tsx
│   │   └── risk-compliance/      # NEW: Risk & Compliance components
│   │       ├── PolicyTracker.tsx
│   │       ├── RiskRegister.tsx
│   │       ├── RiskMatrix.tsx
│   │       ├── ComplianceCalendar.tsx
│   │       ├── AIInsightsDashboard.tsx
│   │       └── EvidenceLibrary.tsx
│   ├── pages/
│   │   ├── AIGatewaySettings.tsx # NEW
│   │   └── RiskCompliance.tsx    # NEW
│   └── utils/
│       ├── aiGatewayClient.ts    # NEW: AI Gateway API client
│       └── riskComplianceUtils.ts # NEW: Utility functions
│
├── supabase/
│   ├── functions/
│   │   ├── ai-gateway-generate/  # NEW: AI generation proxy
│   │   ├── ai-gateway-embed/     # NEW: Embedding generation
│   │   ├── analyze-trends/       # NEW: Trend analysis
│   │   └── generate-summary/     # NEW: Executive summaries
│   └── migrations/
│       ├── 20251030_ai_gateway_schema.sql      # NEW
│       └── 20251030_risk_compliance_schema.sql # NEW
│
└── ai-gateway/                    # NEW: Separate microservice (optional)
    ├── Dockerfile
    ├── docker-compose.yml
    ├── src/
    │   ├── api/
    │   │   ├── generate.ts
    │   │   └── embed.ts
    │   ├── pii/
    │   │   ├── detector.ts
    │   │   └── pseudonymizer.ts
    │   ├── policy/
    │   │   └── engine.ts
    │   └── vendors/
    │       ├── openai.ts
    │       ├── anthropic.ts
    │       └── azure.ts
    └── tests/
```

---

## Step-by-Step Implementation

## Phase 1: AI Gateway

### Step 1.1: Database Setup

Create migration file: `supabase/migrations/20251030_ai_gateway_schema.sql`

```sql
-- Run this migration first
\i supabase/migrations/20251030_ai_gateway_schema.sql

-- Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'ai_gateway%';
```

Expected output:
```
ai_gateway_policies
ai_gateway_logs
ai_gateway_redaction_maps
ai_gateway_token_usage
ai_gateway_documents
ai_gateway_embeddings
```

### Step 1.2: Set Up Environment Variables

```bash
# .env.local (for frontend)
VITE_AI_GATEWAY_URL=http://localhost:3001  # or production URL
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase secrets (for Edge Functions)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set AI_GATEWAY_URL=https://your-gateway.com
```

### Step 1.3: Deploy AI Gateway Microservice

**Option A: Supabase Edge Functions** (Recommended for MVP)

```bash
cd supabase/functions
supabase functions deploy ai-gateway-generate
supabase functions deploy ai-gateway-embed
```

**Option B: Separate Docker Service** (For production scale)

```bash
cd ai-gateway
docker-compose up -d

# Verify health
curl http://localhost:3001/health
```

### Step 1.4: Test AI Gateway Locally

```bash
# Test generation endpoint
curl -X POST http://localhost:3001/api/v1/generate \
  -H "Authorization: Bearer YOUR_SUPABASE_KEY" \
  -H "X-Organization-Id: YOUR_ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Analyze this report about John Doe at john.doe@example.com"}
    ],
    "model": "gpt-4o",
    "context": {"purpose": "case_analysis"}
  }'

# Expected response should show PII redacted:
# "Analyze this report about [PERSON_1] at [EMAIL_1]"
```

### Step 1.5: Build Admin UI

```typescript
// src/pages/AIGatewaySettings.tsx
import React from 'react';
import { AIGatewayDashboard } from '@/components/ai-gateway/AIGatewayDashboard';
import { PolicyEditor } from '@/components/ai-gateway/PolicyEditor';

export default function AIGatewaySettings() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Gateway Settings</h1>
      
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AIGatewayDashboard />
        </TabsContent>

        <TabsContent value="policies">
          <PolicyEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 1.6: Integration Testing

```typescript
// tests/ai-gateway.test.ts
import { describe, it, expect } from 'vitest';
import { AIGatewayClient } from '@/utils/aiGatewayClient';

describe('AI Gateway', () => {
  it('should redact PII before sending to vendor', async () => {
    const client = new AIGatewayClient();
    const response = await client.generate({
      messages: [
        { role: 'user', content: 'Contact John Doe at john.doe@example.com' }
      ],
      organizationId: 'test-org-id'
    });

    expect(response.metadata.pii_redacted).toBe(true);
    expect(response.metadata.redaction_map).toHaveProperty('John Doe');
    expect(response.metadata.redaction_map).toHaveProperty('john.doe@example.com');
  });

  it('should enforce token limits', async () => {
    const client = new AIGatewayClient();
    
    try {
      await client.generate({
        messages: [{ role: 'user', content: 'x'.repeat(100000) }],
        organizationId: 'test-org-id'
      });
      expect.fail('Should have thrown token limit error');
    } catch (error) {
      expect(error.message).toContain('TOKEN_LIMIT_EXCEEDED');
    }
  });
});
```

Run tests:
```bash
npm test -- ai-gateway.test.ts
```

---

## Phase 2: Risk & Compliance Module

### Step 2.1: Database Setup

```bash
# Apply migration
supabase db push

# Seed initial data (optional)
psql $DATABASE_URL < supabase/seed/risk_categories.sql
```

### Step 2.2: Create API Endpoints

```typescript
// supabase/functions/create-risk/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { riskData, organizationId } = await req.json();

  // Validate
  if (!riskData.title || !riskData.impact_score || !riskData.likelihood_score) {
    return new Response('Missing required fields', { status: 400 });
  }

  // Insert with RLS
  const { data, error } = await supabase
    .from('risks')
    .insert({
      organization_id: organizationId,
      ...riskData,
      created_by: req.headers.get('X-User-Id'),
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Deploy:
```bash
supabase functions deploy create-risk
supabase functions deploy get-risks
supabase functions deploy update-risk
```

### Step 2.3: Build UI Components

**Priority Order**:
1. ✅ Policy Tracker (Week 1)
2. ✅ Risk Register (Week 2)
3. ✅ Compliance Calendar (Week 3)
4. ✅ AI Insights Dashboard (Week 4)

**Start with Policy Tracker**:

```typescript
// src/components/risk-compliance/PolicyTracker.tsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';

export const PolicyTracker: React.FC = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*, policy_categories(*)')
      .order('created_at', { ascending: false });

    if (!error) {
      setPolicies(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Policy Tracker</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search policies..." 
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Policy List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Step 2.4: Add Navigation

```typescript
// src/App.tsx (or your router file)
import { RiskCompliance } from '@/pages/RiskCompliance';

// Add route
<Route path="/risk-compliance" element={<RiskCompliance />}>
  <Route path="policies" element={<PolicyTracker />} />
  <Route path="risks" element={<RiskRegister />} />
  <Route path="calendar" element={<ComplianceCalendar />} />
  <Route path="insights" element={<AIInsightsDashboard />} />
</Route>
```

Update sidebar:
```typescript
// src/components/Sidebar.tsx
const menuItems = [
  // ... existing items
  {
    label: 'Risk & Compliance',
    icon: Shield,
    children: [
      { label: 'Policy Tracker', path: '/risk-compliance/policies' },
      { label: 'Risk Register', path: '/risk-compliance/risks' },
      { label: 'Compliance Calendar', path: '/risk-compliance/calendar' },
      { label: 'AI Insights', path: '/risk-compliance/insights' },
    ]
  }
];
```

### Step 2.5: Test Compliance Features

```typescript
// tests/risk-register.test.ts
import { describe, it, expect } from 'vitest';
import { createRisk, calculateRiskScore } from '@/utils/riskComplianceUtils';

describe('Risk Register', () => {
  it('should calculate risk score correctly', () => {
    const score = calculateRiskScore(5, 5); // Impact × Likelihood
    expect(score).toBe(25);
  });

  it('should classify risk priority', () => {
    expect(classifyRiskPriority(25)).toBe('critical');
    expect(classifyRiskPriority(15)).toBe('high');
    expect(classifyRiskPriority(8)).toBe('medium');
    expect(classifyRiskPriority(3)).toBe('low');
  });

  it('should link risk to incident', async () => {
    const linkResult = await linkRiskToIncident('risk-123', 'incident-456');
    expect(linkResult.success).toBe(true);
  });
});
```

---

## Development Workflow

### Git Branching Strategy

```
main (production)
  └── develop (staging)
        ├── feature/ai-gateway-core
        ├── feature/ai-gateway-pii
        ├── feature/risk-register
        └── feature/compliance-calendar
```

**Branch Naming**:
- `feature/ai-gateway-*` for AI Gateway features
- `feature/risk-compliance-*` for Risk & Compliance features
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for docs

**Commit Messages**:
```
feat(ai-gateway): add PII redaction with Presidio
fix(risk-register): correct risk score calculation
docs(readme): add AI Gateway setup instructions
test(compliance): add integration tests for calendar sync
```

### Code Review Checklist

Before submitting PR, verify:

- [ ] **Security**: Ran Semgrep scan (`semgrep --config auto .`)
- [ ] **Tests**: All tests pass (`npm test`)
- [ ] **Linting**: No ESLint errors (`npm run lint`)
- [ ] **Types**: TypeScript builds without errors (`npm run build`)
- [ ] **Performance**: Page load < 1s, no memory leaks
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Documentation**: Updated relevant docs
- [ ] **Audit Logging**: All database mutations logged

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Feature Checklist
- [ ] AI Gateway functionality
- [ ] Risk & Compliance module
- [ ] Other (specify)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Security
- [ ] Semgrep scan passed
- [ ] No sensitive data exposed in logs
- [ ] RLS policies enforced
- [ ] Input validation implemented

## Screenshots (if UI changes)
[Attach screenshots]

## Additional Notes
Any additional context or notes for reviewers
```

---

## Testing Strategy

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- risk-register.test.ts

# Run with coverage
npm test -- --coverage
```

Target: **>80% code coverage**

### Integration Tests

```bash
# Test API endpoints
npm run test:integration

# Test database migrations
supabase db test
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load/ai-gateway.js

# Example test script (tests/load/ai-gateway.js)
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const response = http.post('http://localhost:3001/api/v1/generate', JSON.stringify({
    messages: [{ role: 'user', content: 'Test prompt' }],
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-key',
      'X-Organization-Id': 'test-org',
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

### Security Testing

```bash
# Run Semgrep security scan
semgrep --config auto src/ supabase/

# Scan for secrets
gitleaks detect --source .

# Dependency vulnerability check
npm audit

# SQL injection test (manual)
# Try: ' OR '1'='1 in form inputs
```

---

## Monitoring & Debugging

### Logging Best Practices

```typescript
// Good: Structured logging
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  event: 'risk_created',
  risk_id: riskId,
  organization_id: orgId,
  user_id: userId,
}));

// Bad: Unstructured logging
console.log('Created risk:', riskId);

// NEVER log sensitive data
// ❌ console.log('User content:', userMessage);
// ✅ console.log('Message received, length:', userMessage.length);
```

### Supabase Dashboard

Monitor in real-time:
- **Database**: Queries, slow queries, indexes
- **Auth**: Active users, sign-ups, errors
- **Storage**: Upload stats, bandwidth
- **Edge Functions**: Invocations, errors, latency

### Prometheus Metrics (AI Gateway)

```bash
# View metrics endpoint
curl http://localhost:3001/metrics

# Expected metrics:
# ai_gateway_requests_total{model="gpt-4o",status="success"} 1234
# ai_gateway_tokens_used_total{org_id="abc",model="gpt-4o"} 56789
# ai_gateway_pii_detected_total{entity_type="PERSON"} 42
```

---

## Common Issues & Solutions

### Issue 1: RLS Policy Blocking Queries

**Symptom**: `new row violates row-level security policy`

**Solution**:
```sql
-- Check active policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'your_table';

-- Test as specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM your_table;
```

### Issue 2: PII Detection False Positives

**Symptom**: Valid business terms redacted (e.g., "ACME Corp" → [ORGANIZATION_1])

**Solution**:
```yaml
# Add to policy whitelist
pii_protection:
  whitelist:
    - pattern: "ACME Corp"
      type: "ORGANIZATION"
    - pattern: "Disclosurely"
      type: "ORGANIZATION"
```

### Issue 3: Slow Risk Matrix Queries

**Symptom**: Risk matrix loads slowly with >1000 risks

**Solution**:
```sql
-- Add composite index
CREATE INDEX idx_risks_matrix ON risks (organization_id, impact_score, likelihood_score)
WHERE status NOT IN ('closed', 'archived');

-- Use materialized view for aggregations
CREATE MATERIALIZED VIEW risk_matrix_summary AS
SELECT 
  organization_id,
  impact_score,
  likelihood_score,
  COUNT(*) as risk_count
FROM risks
WHERE status = 'active'
GROUP BY organization_id, impact_score, likelihood_score;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY risk_matrix_summary;
```

### Issue 4: Calendar Sync Failing

**Symptom**: Google Calendar sync returns 401

**Solution**:
```typescript
// Refresh OAuth token
const refreshToken = async (refreshToken: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  const data = await response.json();
  return data.access_token;
};
```

---

## Performance Optimization

### Database Optimization

```sql
-- Enable query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Analyze and vacuum tables
ANALYZE risks;
VACUUM ANALYZE policies;
```

### Frontend Optimization

```typescript
// Use React.memo for expensive components
export const RiskMatrix = React.memo(({ risks }: RiskMatrixProps) => {
  // Component implementation
});

// Lazy load heavy components
const AIInsightsDashboard = lazy(() => import('@/components/risk-compliance/AIInsightsDashboard'));

// Virtualize long lists
import { FixedSizeList } from 'react-window';

const PolicyList = ({ policies }: { policies: Policy[] }) => (
  <FixedSizeList
    height={600}
    itemCount={policies.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <PolicyCard policy={policies[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Security scan clean
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Monitoring dashboards set up
- [ ] Documentation updated
- [ ] Rollback plan documented

### Deployment Steps

```bash
# 1. Deploy database migrations
supabase db push --project-ref your-project-ref

# 2. Deploy Edge Functions
supabase functions deploy --project-ref your-project-ref

# 3. Deploy frontend (Vercel)
vercel --prod

# 4. Verify deployment
curl https://your-app.com/health
```

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Monitoring shows normal metrics
- [ ] No errors in logs (first 15 minutes)
- [ ] Performance benchmarks met
- [ ] Customer-facing announcement sent

---

## Support & Resources

### Internal Documentation
- **System Architecture**: `SYSTEM_ARCHITECTURE.md`
- **Security Policies**: `SECURITY_POLICIES.md`
- **Feature Scopes**: 
  - `FEATURE_SCOPE_AI_GATEWAY.md`
  - `FEATURE_SCOPE_RISK_COMPLIANCE_MODULE.md`
- **API Documentation**: `docs/API.md` (to be created)

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Presidio Documentation](https://microsoft.github.io/presidio/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [React Performance Guide](https://react.dev/learn/render-and-commit)

### Team Communication
- **Slack**: #disclosurely-dev
- **Standup**: Daily 10am
- **Sprint Planning**: Bi-weekly Mondays
- **Demo**: Bi-weekly Fridays
- **On-Call**: Rotation schedule in PagerDuty

---

## Quick Reference

### Useful Commands

```bash
# Database
supabase db reset                    # Reset local database
supabase db diff -f migration_name   # Create migration from changes
supabase db push                     # Apply migrations

# Edge Functions
supabase functions serve             # Run functions locally
supabase functions deploy func-name  # Deploy specific function
supabase logs --type functions       # View function logs

# Testing
npm test                             # Run tests
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report

# Linting
npm run lint                         # Run ESLint
npm run lint:fix                     # Auto-fix issues
npm run type-check                   # TypeScript check

# Build
npm run build                        # Production build
npm run preview                      # Preview build locally
```

### API Endpoints (Production)

```
POST /api/v1/generate               # AI text generation
POST /api/v1/embed                  # AI embeddings
GET  /api/v1/models                 # Available models
GET  /health                        # Health check

POST /api/risks                     # Create risk
GET  /api/risks                     # List risks
PUT  /api/risks/:id                 # Update risk
DELETE /api/risks/:id               # Delete risk

POST /api/policies                  # Create policy
GET  /api/policies                  # List policies
PUT  /api/policies/:id              # Update policy
POST /api/policies/:id/versions     # Create new version

POST /api/compliance-events         # Create event
GET  /api/compliance-events         # List events
PUT  /api/compliance-events/:id     # Update event
```

---

**Questions?** Contact:
- **Technical Lead**: [Name] ([email])
- **Product Manager**: [Name] ([email])
- **DevOps**: [Name] ([email])

**Last Updated**: October 30, 2025

