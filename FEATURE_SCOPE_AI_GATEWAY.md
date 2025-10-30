# Private AI Gateway for Disclosurely
## Feature Scope & Technical Specification

**Version**: 1.0  
**Date**: October 30, 2025  
**Status**: Planning Phase

---

## Executive Summary

Build a **Private AI Gateway** microservice that sits between Disclosurely and all AI model vendors, ensuring complete data privacy, security, and compliance when using LLMs. This gateway will enable Disclosurely to market itself as "Use AI with confidence — your data never leaves our system."

### Key Value Propositions
- **Zero Data Retention**: No conversation logs stored by external vendors
- **PII Protection**: Deterministic pseudonymization before data leaves system
- **Multi-Vendor Support**: Unified API for multiple AI providers
- **Self-Hosted Options**: Support for vLLM, llama.cpp deployments
- **Full Auditability**: Comprehensive logging and metrics
- **Policy Engine**: Flexible, declarative rules for routing and security

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Disclosurely App                         │
│  (React Frontend + Supabase Edge Functions)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS/TLS 1.3
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Private AI Gateway (Microservice)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API Layer  │  │Policy Engine │  │  PII Redactor│      │
│  │ /generate    │  │  (YAML/JSON) │  │(spaCy/Presidio)│    │
│  │ /embed       │  └──────────────┘  └──────────────┘      │
│  └──────────────┘                                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Router/LoadBal│  │ Metrics/Logs │  │  Vector DB   │      │
│  │              │  │(Prometheus)  │  │ (Per-Tenant) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────┬───────────────────┬────────────────────┬────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│  Managed    │    │ Self-Hosted │     │   Private   │
│  Vendors    │    │   Models    │     │  Managed    │
│             │    │             │     │             │
│ • OpenAI    │    │ • vLLM      │     │ • Azure     │
│ • Anthropic │    │ • llama.cpp │     │ • AWS       │
│ • Gemini    │    │ • Ollama    │     │ • Vertex    │
└─────────────┘    └─────────────┘     └─────────────┘
```

### 1.2 Technology Stack

**Core Service**
- **Runtime**: Node.js 20 LTS + TypeScript OR Python 3.11+
- **Framework**: Express/Fastify (Node) OR FastAPI (Python)
- **Deployment**: Docker + Kubernetes OR Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (shared Supabase instance)

**AI & ML**
- **PII Detection**: spaCy + Presidio (Python) OR Microsoft Presidio-Anonymizer
- **Text Processing**: tiktoken (token counting), langchain (optional)
- **Vector Storage**: pgvector (PostgreSQL extension) OR Qdrant/Weaviate

**Observability**
- **Metrics**: Prometheus + Grafana
- **Logging**: Structured JSON logs → Supabase `system_logs` table
- **Tracing**: OpenTelemetry (optional)

---

## 2. API Specifications

### 2.1 `/generate` Endpoint

**Purpose**: Generate text completions with privacy guarantees

```typescript
POST /api/v1/generate

Headers:
  Authorization: Bearer <supabase_service_role_key>
  X-Organization-Id: <org_id>
  X-Tenant-Id: <tenant_id>
  Content-Type: application/json

Request Body:
{
  "messages": [
    { "role": "system", "content": "You are a compliance assistant..." },
    { "role": "user", "content": "Analyze this report about John Doe..." }
  ],
  "model": "gpt-4o",  // optional, uses policy default
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false,
  "preserve_pii": false,  // if true, skip redaction (requires policy permission)
  "context": {
    "purpose": "case_analysis",  // used for policy routing
    "report_id": "uuid-here"
  }
}

Response (Success):
{
  "id": "req_abc123",
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Analysis of report concerning [PERSON_1]..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  },
  "metadata": {
    "pii_redacted": true,
    "redaction_map": {
      "John Doe": "PERSON_1",
      "john.doe@company.com": "EMAIL_1"
    },
    "vendor": "openai",
    "latency_ms": 1234
  }
}

Response (Error):
{
  "error": {
    "type": "policy_violation",
    "message": "Request exceeds token limit for this organization",
    "code": "TOKEN_LIMIT_EXCEEDED"
  }
}
```

### 2.2 `/embed` Endpoint

**Purpose**: Generate embeddings for RAG with privacy guarantees

```typescript
POST /api/v1/embed

Request Body:
{
  "input": ["Text chunk 1 about John Doe...", "Text chunk 2..."],
  "model": "text-embedding-3-small",
  "redact_pii": true,
  "context": {
    "purpose": "rag_indexing",
    "document_id": "doc_xyz"
  }
}

Response:
{
  "id": "emb_abc123",
  "model": "text-embedding-3-small",
  "data": [
    {
      "embedding": [0.123, -0.456, ...],  // 1536 dimensions
      "index": 0,
      "redacted_text": "Text chunk 1 about [PERSON_1]..."
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "total_tokens": 50
  },
  "metadata": {
    "pii_redacted": true,
    "vendor": "openai"
  }
}
```

### 2.3 Admin Endpoints

```typescript
// Health check
GET /health
Response: { "status": "healthy", "models": [...], "uptime": 86400 }

// Metrics endpoint (Prometheus format)
GET /metrics
Response: (Prometheus text format)

// Policy validation
POST /api/v1/policies/validate
Body: { "policy": {...} }
Response: { "valid": true, "errors": [] }

// Model status
GET /api/v1/models
Response: [
  {
    "id": "gpt-4o",
    "vendor": "openai",
    "status": "available",
    "latency_p95": 1200,
    "error_rate": 0.01
  }
]
```

---

## 3. Policy Engine

### 3.1 Policy Schema (YAML)

```yaml
version: "1.0"
organization_id: "org_uuid"

# Model routing rules
routing:
  default_model: "gpt-4o-mini"
  
  purpose_routing:
    case_analysis:
      model: "gpt-4o"
      max_tokens: 4000
      temperature: 0.3
    
    content_generation:
      model: "deepseek-chat"
      max_tokens: 2000
      temperature: 0.7
    
    embeddings:
      model: "text-embedding-3-small"

# Token limits (per organization)
limits:
  daily_tokens: 1000000
  per_request_max_tokens: 4000
  concurrent_requests: 10
  rate_limit:
    requests_per_minute: 100
    tokens_per_minute: 50000

# PII protection rules
pii_protection:
  enabled: true
  redaction_level: "strict"  # strict | moderate | minimal
  
  entity_types:
    - PERSON
    - EMAIL_ADDRESS
    - PHONE_NUMBER
    - CREDIT_CARD
    - IBAN_CODE
    - US_SSN
    - DATE_OF_BIRTH
    - ORGANIZATION
    - LOCATION
  
  # Deterministic pseudonymization
  pseudonymization:
    enabled: true
    salt: "org_specific_salt_from_db"
    format: "[{ENTITY_TYPE}_{INDEX}]"
  
  # Whitelist patterns (won't be redacted)
  whitelist:
    - pattern: "Disclosurely"
      type: "ORGANIZATION"
    - pattern: "GDPR"
      type: "REGULATION"

# Vendor configuration
vendors:
  openai:
    enabled: true
    api_key_ref: "secret:openai_api_key"
    base_url: "https://api.openai.com/v1"
    timeout_seconds: 30
    retry_attempts: 3
    data_retention: "zero"  # verified via DPA
    models:
      - gpt-4o
      - gpt-4o-mini
      - text-embedding-3-small
  
  azure_openai:
    enabled: false
    deployment_name: "gpt-4-deployment"
    endpoint: "https://your-resource.openai.azure.com"
    api_key_ref: "secret:azure_openai_key"
  
  anthropic:
    enabled: true
    api_key_ref: "secret:anthropic_api_key"
    models:
      - claude-3-5-sonnet-20241022
  
  self_hosted:
    vllm:
      enabled: false
      endpoint: "http://vllm-server:8000"
      models:
        - mistral-7b-instruct
        - llama-3-8b-instruct

# Audit and logging
audit:
  log_level: "structured"  # structured | detailed | minimal
  log_retention_days: 90
  
  log_fields:
    - request_id
    - organization_id
    - model
    - token_usage
    - latency
    - pii_detected
    - error_type
  
  # Never log these fields
  excluded_fields:
    - prompt_content
    - completion_content
    - api_keys

# RAG configuration (per-tenant)
rag:
  enabled: true
  vector_db: "pgvector"
  collection_prefix: "org_{org_id}_"
  embedding_model: "text-embedding-3-small"
  chunk_size: 500
  chunk_overlap: 50
  similarity_threshold: 0.7
```

### 3.2 Policy Loading & Validation

```typescript
// Policy management interface
interface PolicyEngine {
  // Load policy from database
  loadPolicy(organizationId: string): Promise<Policy>;
  
  // Validate policy schema
  validatePolicy(policy: Policy): ValidationResult;
  
  // Check if request complies with policy
  checkCompliance(request: GenerateRequest, policy: Policy): ComplianceResult;
  
  // Route request to appropriate model
  routeRequest(request: GenerateRequest, policy: Policy): ModelEndpoint;
  
  // Check rate limits
  checkRateLimit(organizationId: string): Promise<RateLimitResult>;
}

// Store policies in database
CREATE TABLE ai_gateway_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  policy_version TEXT NOT NULL,
  policy_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, policy_version)
);
```

---

## 4. PII Redaction & Pseudonymization

### 4.1 Detection Pipeline

```python
# Using Presidio + spaCy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

class PIIRedactor:
    def __init__(self, policy: dict):
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
        self.policy = policy
        
    def detect_and_redact(self, text: str, org_salt: str) -> RedactionResult:
        # Analyze text for PII
        results = self.analyzer.analyze(
            text=text,
            language='en',
            entities=self.policy['pii_protection']['entity_types']
        )
        
        # Create deterministic pseudonyms
        operators = {}
        redaction_map = {}
        
        for result in results:
            entity_text = text[result.start:result.end]
            
            # Generate deterministic pseudonym using HMAC
            pseudonym = self._generate_pseudonym(
                entity_text, 
                result.entity_type,
                org_salt
            )
            
            operators[result.entity_type] = OperatorConfig(
                "replace", 
                {"new_value": pseudonym}
            )
            
            redaction_map[entity_text] = pseudonym
        
        # Apply anonymization
        anonymized = self.anonymizer.anonymize(
            text=text,
            analyzer_results=results,
            operators=operators
        )
        
        return RedactionResult(
            original_text=text,
            redacted_text=anonymized.text,
            redaction_map=redaction_map,
            pii_detected=len(results) > 0
        )
    
    def _generate_pseudonym(self, text: str, entity_type: str, salt: str) -> str:
        """Generate deterministic pseudonym: [PERSON_1], [EMAIL_2], etc."""
        import hmac
        import hashlib
        
        # Create deterministic hash
        hash_input = f"{text.lower()}:{entity_type}:{salt}"
        hash_hex = hmac.new(
            salt.encode(), 
            hash_input.encode(), 
            hashlib.sha256
        ).hexdigest()
        
        # Convert to integer for indexing
        index = int(hash_hex[:8], 16) % 9999
        
        return f"[{entity_type}_{index}]"
```

### 4.2 Reversibility (Optional)

Store redaction maps in database for authorized users to "de-pseudonymize" results:

```sql
CREATE TABLE ai_gateway_redaction_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  redaction_map JSONB NOT NULL,  -- {"John Doe": "PERSON_1"}
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,  -- auto-delete after X days
  
  INDEX idx_request_id (request_id),
  INDEX idx_expires_at (expires_at)
);
```

---

## 5. Vendor Integration

### 5.1 Unified Vendor Interface

```typescript
interface AIVendor {
  name: string;
  
  // Generate text completion
  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  
  // Generate embeddings
  generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  
  // Check model availability
  checkHealth(): Promise<HealthStatus>;
  
  // Verify zero retention policy
  verifyDataRetention(): Promise<RetentionPolicy>;
}

// Implementations
class OpenAIVendor implements AIVendor {
  private client: OpenAI;
  
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    // Set zero retention headers
    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    }, {
      headers: {
        'OpenAI-Organization': 'org-disclosurely',
        // Note: Zero retention must be configured in OpenAI dashboard
      }
    });
    
    return this.transformResponse(response);
  }
}

class AzureOpenAIVendor implements AIVendor {
  // Uses private Azure endpoints with guaranteed data residency
}

class SelfHostedVLLMVendor implements AIVendor {
  // Connects to self-hosted vLLM instance
  private endpoint: string;
  
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(`${this.endpoint}/v1/completions`, {
      method: 'POST',
      body: JSON.stringify({
        model: request.model,
        prompt: this.messagesToPrompt(request.messages),
        temperature: request.temperature,
        max_tokens: request.max_tokens,
      })
    });
    
    return this.transformResponse(await response.json());
  }
}
```

### 5.2 Vendor Registry

```typescript
class VendorRegistry {
  private vendors: Map<string, AIVendor> = new Map();
  
  registerVendor(name: string, vendor: AIVendor): void {
    this.vendors.set(name, vendor);
  }
  
  getVendor(modelName: string, policy: Policy): AIVendor {
    // Route based on model name and policy
    if (modelName.startsWith('gpt-')) {
      return this.vendors.get('openai')!;
    } else if (modelName.startsWith('claude-')) {
      return this.vendors.get('anthropic')!;
    } else if (policy.vendors.self_hosted?.vllm?.enabled) {
      return this.vendors.get('vllm')!;
    }
    
    throw new Error(`No vendor available for model: ${modelName}`);
  }
}
```

---

## 6. RAG Support (Per-Tenant Vector DB)

### 6.1 Vector Storage Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Per-tenant document storage
CREATE TABLE ai_gateway_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  document_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, document_id)
);

-- Vector embeddings (chunks)
CREATE TABLE ai_gateway_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ai_gateway_documents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  redacted_text TEXT,  -- PII-redacted version
  embedding vector(1536),  -- Adjust dimension based on model
  metadata JSONB,
  
  INDEX idx_org_embedding ON ai_gateway_embeddings 
    USING ivfflat (embedding vector_cosine_ops)
    WHERE organization_id IS NOT NULL
);

-- Ensure tenant isolation
ALTER TABLE ai_gateway_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for embeddings"
ON ai_gateway_embeddings
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);
```

### 6.2 RAG Query API

```typescript
POST /api/v1/rag/query

Request:
{
  "query": "What are the policies about expense reporting?",
  "collection": "company_policies",
  "top_k": 5,
  "similarity_threshold": 0.7,
  "redact_pii": true
}

Response:
{
  "results": [
    {
      "document_id": "policy_expense_001",
      "chunk_index": 3,
      "similarity_score": 0.89,
      "text": "Expense reports must be submitted within...",
      "metadata": {
        "title": "Expense Policy 2024",
        "section": "Submission Guidelines"
      }
    }
  ],
  "query_embedding_tokens": 15
}
```

---

## 7. Observability & Monitoring

### 7.1 Prometheus Metrics

```typescript
// Define custom metrics
const aiGatewayMetrics = {
  // Request metrics
  requestsTotal: new Counter({
    name: 'ai_gateway_requests_total',
    help: 'Total number of AI requests',
    labelNames: ['organization_id', 'model', 'vendor', 'status']
  }),
  
  requestDuration: new Histogram({
    name: 'ai_gateway_request_duration_seconds',
    help: 'Request duration in seconds',
    labelNames: ['model', 'vendor'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  // Token usage
  tokensUsed: new Counter({
    name: 'ai_gateway_tokens_used_total',
    help: 'Total tokens consumed',
    labelNames: ['organization_id', 'model', 'type']  // type: prompt|completion
  }),
  
  // PII metrics
  piiDetected: new Counter({
    name: 'ai_gateway_pii_detected_total',
    help: 'Number of PII entities detected',
    labelNames: ['organization_id', 'entity_type']
  }),
  
  // Error metrics
  errorsTotal: new Counter({
    name: 'ai_gateway_errors_total',
    help: 'Total errors',
    labelNames: ['vendor', 'error_type']
  }),
  
  // Cost tracking
  estimatedCost: new Counter({
    name: 'ai_gateway_estimated_cost_usd',
    help: 'Estimated cost in USD',
    labelNames: ['organization_id', 'model']
  })
};
```

### 7.2 Structured Logging

```typescript
interface AIGatewayLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  request_id: string;
  organization_id: string;
  user_id?: string;
  
  // Request details (no sensitive data)
  model: string;
  vendor: string;
  purpose?: string;
  
  // Metrics
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  
  latency_ms: number;
  
  // PII detection
  pii_detected: boolean;
  pii_entity_count: number;
  redaction_applied: boolean;
  
  // Errors
  error_type?: string;
  error_message?: string;
  
  // NEVER logged
  // - prompt_content
  // - completion_content
  // - api_keys
}

// Store in Supabase
async function logToDatabase(log: AIGatewayLog) {
  await supabase.from('ai_gateway_logs').insert({
    ...log,
    log_type: 'ai_gateway',
    metadata: {
      version: '1.0',
      environment: process.env.NODE_ENV
    }
  });
}
```

---

## 8. Admin UI

### 8.1 Dashboard Components

Create React components in `src/components/ai-gateway/`:

```
src/components/ai-gateway/
  ├── AIGatewayDashboard.tsx       # Main dashboard
  ├── PolicyEditor.tsx             # Visual policy editor
  ├── ModelHealthStatus.tsx        # Real-time model status
  ├── TokenUsageChart.tsx          # Token usage visualization
  ├── PIIDetectionMetrics.tsx      # PII detection stats
  ├── CostEstimator.tsx            # Cost tracking and forecasting
  └── AuditLogViewer.tsx           # View gateway audit logs
```

### 8.2 Dashboard Features

**Policy Management**
- Visual policy editor with YAML preview
- Policy validation before saving
- Version history and rollback
- A/B testing for different policies

**Model Health**
- Real-time availability status (green/yellow/red)
- Latency p50, p95, p99
- Error rates by vendor
- Automatic failover testing

**Usage Analytics**
- Token usage by model/user/purpose
- Cost breakdown by organization
- Daily/weekly/monthly trends
- Budget alerts and limits

**Security Monitoring**
- PII detection rate over time
- Redaction effectiveness
- Policy violations
- Suspicious patterns (e.g., excessive API calls)

---

## 9. Implementation Plan

### Phase 1: Core Gateway (Weeks 1-3)

**Week 1: Foundation**
- [ ] Set up microservice structure (Docker + TypeScript)
- [ ] Implement `/generate` endpoint (OpenAI integration)
- [ ] Basic policy engine (load from JSON)
- [ ] Database schema (policies, logs, metrics)
- [ ] Authentication (Supabase service role)

**Week 2: PII Protection**
- [ ] Integrate Presidio + spaCy
- [ ] Implement deterministic pseudonymization
- [ ] Redaction map storage
- [ ] Test with sample PII data
- [ ] Whitelist/blacklist support

**Week 3: Multi-Vendor**
- [ ] Anthropic integration (Claude)
- [ ] Azure OpenAI integration
- [ ] Vendor abstraction layer
- [ ] Automatic failover logic
- [ ] Health checks for all vendors

### Phase 2: RAG & Embeddings (Weeks 4-5)

**Week 4: Vector DB**
- [ ] Set up pgvector in Supabase
- [ ] Document ingestion API
- [ ] Chunking strategy implementation
- [ ] Embedding generation pipeline
- [ ] Tenant isolation RLS policies

**Week 5: RAG Queries**
- [ ] `/embed` endpoint
- [ ] Similarity search with pgvector
- [ ] Context retrieval for prompts
- [ ] RAG evaluation metrics
- [ ] Integration with existing case analysis

### Phase 3: Observability (Week 6)

- [ ] Prometheus metrics integration
- [ ] Structured logging to database
- [ ] Grafana dashboard templates
- [ ] Alerting rules (Prometheus Alertmanager)
- [ ] Log retention policies

### Phase 4: Admin UI (Weeks 7-8)

**Week 7: Policy Editor**
- [ ] Visual policy editor component
- [ ] YAML validation and preview
- [ ] Policy versioning UI
- [ ] Test policy against sample data

**Week 8: Analytics Dashboard**
- [ ] Token usage charts (Chart.js)
- [ ] Model health indicators
- [ ] PII detection metrics
- [ ] Cost estimator
- [ ] Export reports (PDF/CSV)

### Phase 5: Self-Hosted Models (Week 9)

- [ ] vLLM integration
- [ ] llama.cpp integration
- [ ] Model deployment guide (Docker Compose)
- [ ] Performance benchmarks
- [ ] Cost comparison calculator

### Phase 6: Testing & Hardening (Week 10)

- [ ] End-to-end integration tests
- [ ] Load testing (simulate 1000 req/min)
- [ ] Security audit (Semgrep)
- [ ] PII detection accuracy validation
- [ ] Failover scenario testing
- [ ] Documentation completion

---

## 10. Database Schema

```sql
-- AI Gateway Policies
CREATE TABLE ai_gateway_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  policy_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, policy_version)
);

-- Request logs (structured, no sensitive data)
CREATE TABLE ai_gateway_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  model TEXT NOT NULL,
  vendor TEXT NOT NULL,
  purpose TEXT,
  
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  
  latency_ms INTEGER NOT NULL,
  
  pii_detected BOOLEAN DEFAULT false,
  pii_entity_count INTEGER DEFAULT 0,
  redaction_applied BOOLEAN DEFAULT false,
  
  error_type TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  INDEX idx_org_created (organization_id, created_at DESC),
  INDEX idx_request_id (request_id)
);

-- Redaction maps (temporary storage, auto-expire)
CREATE TABLE ai_gateway_redaction_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  redaction_map JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  INDEX idx_request_id (request_id),
  INDEX idx_expires_at (expires_at)
);

-- Token usage tracking (for billing/limits)
CREATE TABLE ai_gateway_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  date DATE NOT NULL,
  model TEXT NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
  
  UNIQUE(organization_id, date, model)
);

-- Vector documents (for RAG)
CREATE TABLE ai_gateway_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  document_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, document_id)
);

-- Vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_gateway_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ai_gateway_documents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  redacted_text TEXT,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_org_embedding ON ai_gateway_embeddings 
  USING ivfflat (embedding vector_cosine_ops);

-- Auto-delete expired redaction maps
CREATE OR REPLACE FUNCTION delete_expired_redaction_maps()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_gateway_redaction_maps
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Run cleanup daily
SELECT cron.schedule(
  'cleanup-redaction-maps',
  '0 2 * * *',  -- 2 AM daily
  'SELECT delete_expired_redaction_maps();'
);
```

---

## 11. Security Considerations

### 11.1 Authentication & Authorization

- **API Keys**: Service-to-service authentication using Supabase service role key
- **Tenant Isolation**: All queries filtered by `organization_id`
- **RLS Policies**: Database-level access control
- **Rate Limiting**: Per-organization limits enforced

### 11.2 Data Protection

- **TLS 1.3**: All connections encrypted in transit
- **No Prompt Storage**: Never log actual prompt/completion content
- **Redaction Maps**: Auto-expire after 24-48 hours
- **Audit Trail**: Complete logging of all operations

### 11.3 Compliance

- **GDPR Compliance**: Data minimization, right to erasure
- **SOC 2 Alignment**: Audit logging, access controls
- **ISO 27001**: Security controls documented
- **Zero Retention**: Verified with vendor DPAs

---

## 12. Cost Estimation

### 12.1 Infrastructure Costs (Monthly)

| Component | Estimated Cost | Notes |
|-----------|---------------|-------|
| Compute (Kubernetes) | $200-400 | 2-4 pods, auto-scaling |
| Database (Supabase) | $0 | Use existing instance |
| Prometheus/Grafana | $50-100 | Managed service OR self-hosted |
| Vector DB (pgvector) | $0 | PostgreSQL extension |
| **Total Infrastructure** | **$250-500** | |

### 12.2 AI Vendor Costs (Variable)

Depends on usage, but gateway adds **$0 overhead** (pure pass-through).

Estimated token costs:
- OpenAI GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens
- Anthropic Claude 3.5 Sonnet: $3 per 1M input, $15 per 1M output
- Self-hosted (vLLM): GPU instance cost (~$0.50-2/hour)

### 12.3 Development Cost

**10 weeks × $150/hour × 40 hours/week = $60,000**

---

## 13. Success Metrics

### 13.1 Technical Metrics

- **Latency**: p95 < 2 seconds (including PII redaction)
- **Availability**: 99.9% uptime
- **PII Detection Accuracy**: >95% recall, <5% false positives
- **Token Throughput**: >100 requests/minute
- **Cost Efficiency**: <5% overhead vs direct API calls

### 13.2 Business Metrics

- **Data Privacy**: 100% of prompts redacted before leaving system
- **Vendor Independence**: Support 3+ vendors by launch
- **Audit Compliance**: 100% of requests logged and traceable
- **Customer Confidence**: "Zero retention" verified and documented

---

## 14. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| PII false negatives | High | Medium | Multi-layer detection (spaCy + regex + custom rules) |
| Vendor API changes | Medium | Medium | Abstraction layer + regular testing |
| Performance bottleneck | High | Low | Load testing + auto-scaling + caching |
| Cost overruns | Medium | Medium | Token limits + budget alerts + usage dashboards |
| Security vulnerability | Critical | Low | Regular audits + dependency scanning + penetration testing |

---

## 15. Future Enhancements

### Phase 7+ (Post-Launch)

- **Fine-tuned Models**: Train custom models on redacted Disclosurely data
- **Prompt Templates**: Library of pre-approved, tested prompts
- **A/B Testing**: Compare different models/prompts for same task
- **Semantic Caching**: Cache embeddings for common queries
- **Multi-modal Support**: Image/PDF analysis with OCR + PII redaction
- **Real-time Streaming**: WebSocket support for streaming completions
- **Compliance Certifications**: SOC 2 Type II, ISO 27001 for gateway itself

---

## 16. Integration with Existing Disclosurely Features

### 16.1 Case Analysis (Existing Feature)

**Current**: Uses DeepSeek directly from Edge Function  
**New**: Route through AI Gateway

```typescript
// Before
const response = await fetch('https://api.deepseek.com/chat/completions', {
  body: JSON.stringify({ messages })
});

// After
const response = await fetch('https://ai-gateway.disclosurely.com/api/v1/generate', {
  headers: { 
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'X-Organization-Id': organizationId
  },
  body: JSON.stringify({ 
    messages,
    context: { purpose: 'case_analysis', report_id: reportId }
  })
});
```

### 16.2 Content Generation

Modify `AIContentGenerator.tsx` to use gateway:

```typescript
// src/utils/aiGatewayClient.ts
export class AIGatewayClient {
  private baseUrl = process.env.VITE_AI_GATEWAY_URL;
  
  async generateContent(prompt: string, purpose: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'X-Organization-Id': organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a content generator...' },
          { role: 'user', content: prompt }
        ],
        context: { purpose }
      })
    });
    
    return response.json();
  }
}
```

---

## 17. Documentation Deliverables

1. **API Documentation** (OpenAPI/Swagger spec)
2. **Policy Configuration Guide** (YAML examples)
3. **Self-Hosting Guide** (Docker Compose + Kubernetes)
4. **Vendor Setup Instructions** (OpenAI, Anthropic, Azure)
5. **PII Detection Tuning Guide** (Custom entity types)
6. **Security Audit Report** (Semgrep + manual review)
7. **Grafana Dashboard Templates** (JSON exports)
8. **Integration Examples** (TypeScript + Python)

---

## Appendix A: Example Policy Files

See separate files:
- `policies/default-policy.yaml`
- `policies/strict-pii-policy.yaml`
- `policies/self-hosted-only-policy.yaml`

---

## Appendix B: Performance Benchmarks

To be completed during implementation with:
- Load testing results (k6 or Artillery)
- PII detection latency measurements
- Token throughput under various loads
- Cost comparison tables

---

**Document Status**: Draft for Review  
**Next Steps**: Review with team → Approve architecture → Begin Phase 1 implementation  
**Estimated Completion**: 10 weeks from start date  
**Budget**: $60,000 development + $250-500/month infrastructure

