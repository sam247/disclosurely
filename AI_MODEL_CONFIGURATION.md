# AI Model Configuration Guide
## Multi-Model Setup for Disclosurely AI Gateway

**Last Updated**: October 30, 2025  
**Current Model**: DeepSeek (Connected & Working)

---

## Overview

The AI Gateway is designed to support **multiple models simultaneously**, with intelligent routing based on:
- **Use case** (case analysis, content generation, embeddings)
- **Cost optimization** (cheaper models for simple tasks)
- **Fallback resilience** (if one vendor is down, use another)
- **Privacy requirements** (self-hosted for sensitive data)

### Current Setup: DeepSeek ✅

You already have DeepSeek connected. The gateway will **keep this working** and add more options alongside it.

---

## Recommended Multi-Model Strategy

### Tier 1: Keep DeepSeek as Primary (Current)
```yaml
# Your existing DeepSeek connection stays exactly as is
vendors:
  deepseek:
    enabled: true
    api_key_ref: "secret:DEEPSEEK_API_KEY"  # Already configured
    base_url: "https://api.deepseek.com/v1"
    default: true  # Default for case analysis
    models:
      - deepseek-chat
      - deepseek-coder
```

**Use Cases**:
- ✅ Case analysis (primary - already working)
- ✅ Content generation (blog posts, etc.)
- ✅ Risk assessment summaries

**Why Keep It**: 
- Already integrated and working
- Cost-effective ($0.14 per 1M input tokens)
- Good performance on your workloads

---

### Tier 2: Add OpenAI for Embeddings (RAG Support)
```yaml
vendors:
  openai:
    enabled: true
    api_key_ref: "secret:OPENAI_API_KEY"
    models:
      - text-embedding-3-small  # For document search
      - text-embedding-3-large  # For higher accuracy
```

**Use Cases**:
- ✅ Document embeddings (policy search, risk correlation)
- ✅ Semantic search across incidents
- ✅ RAG (Retrieval-Augmented Generation)

**Why Add It**:
- OpenAI embeddings are industry-standard for RAG
- Good quality-to-cost ratio
- Only used for embeddings, not text generation (keeps costs low)

**Cost**: ~$0.02 per 1M tokens (embeddings only)

---

### Tier 3: Optional - Anthropic Claude (High-Quality Fallback)
```yaml
vendors:
  anthropic:
    enabled: false  # Optional, enable if needed
    api_key_ref: "secret:ANTHROPIC_API_KEY"
    models:
      - claude-3-5-sonnet-20241022
```

**Use Cases**:
- Executive summaries (high-quality writing)
- Complex case analysis (when extra accuracy needed)
- Fallback if DeepSeek has issues

**Why Optional**:
- More expensive ($3 per 1M input tokens)
- Only enable when you need premium quality

---

## Model Routing Configuration

### Smart Routing by Use Case

```yaml
routing:
  # Case analysis: Use DeepSeek (your current setup)
  case_analysis:
    model: "deepseek-chat"
    max_tokens: 4000
    temperature: 0.3
    fallback: "claude-3-5-sonnet"  # If DeepSeek fails
  
  # Content generation: Use DeepSeek (existing)
  content_generation:
    model: "deepseek-chat"
    max_tokens: 2000
    temperature: 0.7
  
  # Embeddings: Use OpenAI (NEW - for RAG)
  embeddings:
    model: "text-embedding-3-small"
    vendor: "openai"
  
  # Risk summaries: Use DeepSeek (NEW feature)
  risk_summary:
    model: "deepseek-chat"
    max_tokens: 1500
    temperature: 0.5
```

### Cost-Optimized Routing

```yaml
routing:
  # Simple tasks: Use cheaper model
  simple_classification:
    model: "deepseek-chat"  # $0.14 per 1M tokens
  
  # Complex analysis: Use premium model (if enabled)
  complex_analysis:
    model: "claude-3-5-sonnet"  # $3 per 1M tokens
    only_if_enabled: true  # Respect feature flag
```

---

## Implementation Plan

### Phase 1: DeepSeek Only (Current State) ✅
```typescript
// What you have now - KEEP THIS
const analyzeCase = async (reportContent: string) => {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a case analyst...' },
        { role: 'user', content: reportContent }
      ]
    })
  });
  return await response.json();
};
```

### Phase 2: Add AI Gateway (Route DeepSeek Through It)
```typescript
// NEW: Route DeepSeek through gateway for PII protection
const analyzeCase = async (reportContent: string, organizationId: string) => {
  // AI Gateway handles PII redaction, then calls DeepSeek
  const response = await fetch(`${AI_GATEWAY_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'X-Organization-Id': organizationId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a case analyst...' },
        { role: 'user', content: reportContent }
      ],
      // AI Gateway automatically routes to DeepSeek (your default)
      context: { purpose: 'case_analysis' }
    })
  });
  
  const result = await response.json();
  // result.metadata.pii_redacted = true (automatic)
  // result.choices[0].message.content = analysis
  return result;
};
```

**Key Points**:
- ✅ DeepSeek still does the actual analysis
- ✅ Gateway just adds PII protection layer
- ✅ Same API, same quality, same cost (DeepSeek pricing)
- ✅ Added benefit: PII automatically redacted

### Phase 3: Add OpenAI for Embeddings (Optional)
```typescript
// NEW: For document search/RAG features
const embedDocuments = async (documents: string[]) => {
  const response = await fetch(`${AI_GATEWAY_URL}/api/v1/embed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'X-Organization-Id': organizationId
    },
    body: JSON.stringify({
      input: documents,
      model: 'text-embedding-3-small',  // OpenAI
      redact_pii: true
    })
  });
  
  const result = await response.json();
  // Store embeddings in pgvector for semantic search
  return result.data.map(d => d.embedding);
};
```

---

## Configuration File Example

### Default Policy (DeepSeek Primary)
```yaml
# supabase/ai-gateway-policies/default.yaml
version: "1.0"
organization_id: "default"

routing:
  default_model: "deepseek-chat"
  
  purpose_routing:
    case_analysis:
      model: "deepseek-chat"
      vendor: "deepseek"
      max_tokens: 4000
      temperature: 0.3
    
    content_generation:
      model: "deepseek-chat"
      vendor: "deepseek"
      max_tokens: 2000
      temperature: 0.7
    
    embeddings:
      model: "text-embedding-3-small"
      vendor: "openai"
      # Only if OpenAI is configured

vendors:
  deepseek:
    enabled: true
    api_key_ref: "secret:DEEPSEEK_API_KEY"
    base_url: "https://api.deepseek.com/v1"
    timeout_seconds: 30
    retry_attempts: 3
    models:
      - deepseek-chat
      - deepseek-coder
  
  openai:
    enabled: false  # Enable when you want RAG
    api_key_ref: "secret:OPENAI_API_KEY"
    base_url: "https://api.openai.com/v1"
    models:
      - text-embedding-3-small
      - text-embedding-3-large
  
  anthropic:
    enabled: false  # Optional premium tier
    api_key_ref: "secret:ANTHROPIC_API_KEY"
    models:
      - claude-3-5-sonnet-20241022

pii_protection:
  enabled: true
  redaction_level: "strict"
  entity_types:
    - PERSON
    - EMAIL_ADDRESS
    - PHONE_NUMBER
    - CREDIT_CARD
    - LOCATION
  
  pseudonymization:
    enabled: true
    format: "[{ENTITY_TYPE}_{INDEX}]"

limits:
  daily_tokens: 1000000  # 1M tokens per day
  per_request_max_tokens: 4000
  rate_limit:
    requests_per_minute: 100
```

---

## Migration Path (Zero Downtime)

### Step 1: Keep Existing DeepSeek (Week 1)
```typescript
// Current code - NO CHANGES
const analysis = await callDeepSeek(reportContent);
```

### Step 2: Add Gateway Alongside (Week 2)
```typescript
// Feature flag: try gateway for some organizations
const useGateway = await checkFeatureFlag(orgId, 'ai_gateway');

if (useGateway) {
  // Route through gateway (still uses DeepSeek underneath)
  const analysis = await callAIGateway(reportContent, orgId);
} else {
  // Original direct DeepSeek call
  const analysis = await callDeepSeek(reportContent);
}
```

### Step 3: Gradual Rollout (Weeks 3-4)
- Day 1-3: Test with 1 organization (gateway → DeepSeek)
- Day 4-7: Enable for 5 organizations
- Day 8-14: Enable for 50% of organizations
- Day 15+: Enable for all (with instant rollback option)

### Step 4: Add More Models (Week 5+)
Once gateway is stable with DeepSeek, optionally add:
- OpenAI for embeddings
- Anthropic for premium analysis

---

## Cost Comparison

### Current (DeepSeek Only)
```
Case analysis: 1000 requests/month
Average tokens per request: 3000 input + 1000 output

Monthly cost:
- Input: 3M tokens × $0.14/1M = $0.42
- Output: 1M tokens × $0.28/1M = $0.28
Total: $0.70/month
```

### With AI Gateway (DeepSeek + PII Protection)
```
Same usage, same model (DeepSeek):
- Input: 3M tokens × $0.14/1M = $0.42
- Output: 1M tokens × $0.28/1M = $0.28
- Gateway infrastructure: $10-20/month
Total: ~$11-21/month

Added value:
✅ PII automatically redacted
✅ Complete audit trail
✅ Policy-based routing
✅ Rate limiting
✅ Token usage analytics
```

### With Multiple Models (DeepSeek + OpenAI Embeddings)
```
Case analysis: 1000 requests/month (DeepSeek)
Document embeddings: 500 docs/month (OpenAI)

Monthly cost:
- DeepSeek: $0.70 (same as above)
- OpenAI embeddings: 500K tokens × $0.02/1M = $0.01
- Gateway infrastructure: $10-20/month
Total: ~$11-21/month

Added value:
✅ All previous benefits
✅ Semantic document search
✅ RAG for policy/risk queries
✅ Better incident correlation
```

**Conclusion**: Multi-model adds <$1 in AI costs, ~$10-20 in infrastructure, but massive capability increase.

---

## Admin UI: Model Selection

```typescript
// src/components/ai-gateway/ModelConfiguration.tsx
export const ModelConfiguration = () => {
  const [models, setModels] = useState({
    deepseek: { enabled: true, primary: true },
    openai: { enabled: false, embeddingsOnly: true },
    anthropic: { enabled: false, premium: true }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DeepSeek - Always enabled */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <h3 className="font-semibold">DeepSeek</h3>
            <p className="text-sm text-gray-500">
              Primary model for case analysis
            </p>
            <Badge variant="secondary">Currently Active</Badge>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">$0.14 / 1M tokens</p>
            <p className="text-xs text-gray-500">Input</p>
          </div>
        </div>

        {/* OpenAI - Optional */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <h3 className="font-semibold">OpenAI</h3>
            <p className="text-sm text-gray-500">
              For embeddings & semantic search
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">$0.02 / 1M tokens</p>
              <p className="text-xs text-gray-500">Embeddings only</p>
            </div>
            <Switch 
              checked={models.openai.enabled}
              onCheckedChange={(checked) => 
                setModels(prev => ({
                  ...prev,
                  openai: { ...prev.openai, enabled: checked }
                }))
              }
            />
          </div>
        </div>

        {/* Anthropic - Premium */}
        <div className="flex items-center justify-between p-4 border rounded bg-purple-50">
          <div>
            <h3 className="font-semibold">Anthropic Claude</h3>
            <p className="text-sm text-gray-500">
              Premium model for complex analysis
            </p>
            <Badge variant="outline">Premium</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">$3.00 / 1M tokens</p>
              <p className="text-xs text-gray-500">Higher quality</p>
            </div>
            <Switch 
              checked={models.anthropic.enabled}
              disabled={!isPremiumPlan}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Vendor Abstraction Layer

```typescript
// src/utils/aiVendors.ts
interface AIVendor {
  name: string;
  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  generateEmbeddings?(request: EmbeddingRequest): Promise<EmbeddingResponse>;
}

class DeepSeekVendor implements AIVendor {
  name = 'deepseek';
  
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'deepseek-chat',
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.max_tokens
      })
    });
    
    const data = await response.json();
    return this.normalizeResponse(data);
  }
  
  private normalizeResponse(data: any): CompletionResponse {
    // Normalize DeepSeek response to standard format
    return {
      id: data.id,
      model: data.model,
      choices: data.choices.map(c => ({
        message: c.message,
        finish_reason: c.finish_reason
      })),
      usage: data.usage
    };
  }
}

class OpenAIVendor implements AIVendor {
  name = 'openai';
  
  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    // Similar to DeepSeek but with OpenAI endpoint
  }
  
  async generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'text-embedding-3-small',
        input: request.input
      })
    });
    
    return await response.json();
  }
}

// Vendor registry
const vendors = {
  deepseek: new DeepSeekVendor(),
  openai: new OpenAIVendor(),
  // anthropic: new AnthropicVendor(), // Optional
};

export const getVendor = (vendorName: string): AIVendor => {
  const vendor = vendors[vendorName];
  if (!vendor) {
    throw new Error(`Vendor ${vendorName} not configured`);
  }
  return vendor;
};
```

---

## Summary

### Current Setup ✅
- **DeepSeek connected and working**
- No changes needed to existing integration

### AI Gateway Adds (Phase 2)
- **PII redaction** before data leaves your system
- **Policy-based routing** (still uses DeepSeek by default)
- **Complete audit trail**
- **Rate limiting** and cost controls

### Optional Additions (Phase 3+)
- **OpenAI embeddings** for RAG (semantic search)
- **Anthropic Claude** for premium analysis (optional)
- **Self-hosted models** (vLLM, llama.cpp) for maximum privacy

### Bottom Line
✅ Keep DeepSeek as primary (it's working great)  
✅ Add gateway layer for PII protection (same cost, added security)  
✅ Optionally add other models for specific use cases  
✅ All routing controlled by simple YAML config  

**Next step**: Set up AI Gateway with DeepSeek as the only configured vendor (keeps everything working exactly as is, just with PII protection).

Ready to proceed?

