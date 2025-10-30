// AI Gateway - Generate Endpoint
// Purpose: Route AI requests through privacy-preserving gateway
// Vendor: DeepSeek (primary)
// Features: PII redaction, policy enforcement, audit logging

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-organization-id',
};

interface GenerateRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  preserve_pii?: boolean;
  context?: {
    purpose?: string;
    report_id?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ============================================================================
    // 1. FEATURE FLAG CHECK (Kill switch)
    // ============================================================================
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const organizationId = req.headers.get('X-Organization-Id');
    console.log(`[AI Gateway] Received request for org: ${organizationId}`);
    
    // Check if AI Gateway is enabled
    const { data: isEnabled, error: flagError } = await supabase.rpc('is_feature_enabled', {
      p_feature_name: 'ai_gateway',
      p_organization_id: organizationId
    });

    console.log(`[AI Gateway] Feature flag check: isEnabled=${isEnabled}, error=${flagError}`);

    if (!isEnabled) {
      console.error(`[AI Gateway] REJECTED - Feature disabled for org ${organizationId}`);
      return new Response(
        JSON.stringify({ 
          error: 'AI Gateway not enabled for this organization',
          code: 'FEATURE_DISABLED',
          organizationId: organizationId,
          debug: { isEnabled, flagError }
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`[AI Gateway] ACCEPTED - Processing request for org ${organizationId}`);

    // ============================================================================
    // 2. AUTHENTICATION & AUTHORIZATION
    // ============================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'X-Organization-Id header required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ============================================================================
    // 3. PARSE REQUEST
    // ============================================================================
    const body: GenerateRequest = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ============================================================================
    // 4. LOAD ORGANIZATION POLICY
    // ============================================================================
    const { data: policyData, error: policyError } = await supabase.rpc(
      'get_active_ai_policy',
      { p_organization_id: organizationId }
    );

    if (policyError) {
      console.error('Error loading policy:', policyError);
      return new Response(
        JSON.stringify({ error: 'Failed to load policy' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const policy = policyData as any;
    
    // ============================================================================
    // 5. CHECK TOKEN LIMITS
    // ============================================================================
    const estimatedTokens = body.messages.reduce((sum, msg) => 
      sum + Math.ceil(msg.content.length / 4), 0
    ) + (body.max_tokens || 2000);

    const { data: withinLimit } = await supabase.rpc('check_token_limit', {
      p_organization_id: organizationId,
      p_requested_tokens: estimatedTokens
    });

    if (!withinLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily token limit exceeded',
          code: 'TOKEN_LIMIT_EXCEEDED'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ============================================================================
    // 6. PII REDACTION (Simple regex-based for MVP)
    // ============================================================================
    let redactionMap: Record<string, string> = {};
    let piiDetected = false;
    
    if (policy.pii_protection?.enabled && !body.preserve_pii) {
      // Simple PII detection patterns (MVP - will be enhanced with Presidio)
      const piiPatterns = [
        { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
        { type: 'PHONE', regex: /\b(\+\d{1,3}[- ]?)?\d{10,}\b/g },
        { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
      ];

      body.messages = body.messages.map(msg => {
        let redactedContent = msg.content;
        
        piiPatterns.forEach(({ type, regex }) => {
          const matches = msg.content.match(regex);
          if (matches) {
            piiDetected = true;
            matches.forEach((match, index) => {
              const placeholder = `[${type}_${index + 1}]`;
              redactionMap[match] = placeholder;
              redactedContent = redactedContent.replace(match, placeholder);
            });
          }
        });

        return { ...msg, content: redactedContent };
      });
    }

    // ============================================================================
    // 7. ROUTE TO VENDOR (DeepSeek)
    // ============================================================================
    const model = body.model || policy.routing?.default_model || 'deepseek-chat';
    const temperature = body.temperature ?? policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.temperature ?? 0.7;
    const maxTokens = body.max_tokens || policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.max_tokens || 2000;

    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'AI model error',
          details: errorText
        }),
        { 
          status: deepseekResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await deepseekResponse.json();
    const latency = Date.now() - startTime;

    // ============================================================================
    // 8. STORE REDACTION MAP (if PII detected)
    // ============================================================================
    if (piiDetected && Object.keys(redactionMap).length > 0) {
      await supabase.from('ai_gateway_redaction_maps').insert({
        request_id: requestId,
        organization_id: organizationId,
        redaction_map: redactionMap,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      });
    }

    // ============================================================================
    // 9. LOG REQUEST (NO sensitive data)
    // ============================================================================
    await supabase.from('ai_gateway_logs').insert({
      request_id: requestId,
      organization_id: organizationId,
      model,
      vendor: 'deepseek',
      purpose: body.context?.purpose,
      prompt_tokens: result.usage?.prompt_tokens || 0,
      completion_tokens: result.usage?.completion_tokens || 0,
      total_tokens: result.usage?.total_tokens || 0,
      latency_ms: latency,
      pii_detected: piiDetected,
      pii_entity_count: Object.keys(redactionMap).length,
      redaction_applied: piiDetected,
    });

    // ============================================================================
    // 10. UPDATE TOKEN USAGE (for billing/limits)
    // ============================================================================
    const totalTokens = result.usage?.total_tokens || 0;
    const costPerMillion = 0.14; // DeepSeek input cost
    const estimatedCost = (totalTokens / 1000000) * costPerMillion;

    await supabase.rpc('upsert_token_usage', {
      p_organization_id: organizationId,
      p_date: new Date().toISOString().split('T')[0],
      p_model: model,
      p_tokens: totalTokens,
      p_cost: estimatedCost
    }).catch(err => console.error('Error updating token usage:', err));

    // ============================================================================
    // 11. RETURN RESPONSE
    // ============================================================================
    return new Response(
      JSON.stringify({
        id: requestId,
        model,
        choices: result.choices,
        usage: result.usage,
        metadata: {
          pii_redacted: piiDetected,
          redaction_map: piiDetected ? redactionMap : undefined,
          vendor: 'deepseek',
          latency_ms: latency,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('AI Gateway error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function (will be added to database)
// This is a placeholder - the actual function is in the migration
async function upsertTokenUsage() {
  // Implemented in database as RPC
}

