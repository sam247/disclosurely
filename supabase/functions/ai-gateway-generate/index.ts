// AI Gateway - Generate Endpoint
// Purpose: Route AI requests through privacy-preserving gateway
// Vendor: DeepSeek (primary)
// Features: PII redaction, policy enforcement, audit logging

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { redactPII } from '../_shared/pii-detector.ts';

// Restrict CORS for authenticated endpoints
const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedExact = [
    'https://disclosurely.com',
    'https://www.disclosurely.com',
    'http://localhost:8080',
    'http://localhost:5173',
  ];
  if (allowedExact.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return host.endsWith('.lovable.app') || host.endsWith('.lovableproject.com');
  } catch {
    return false;
  }
};

const getAllowedOrigin = (req: Request): string => {
  const origin = req.headers.get('origin');
  return isAllowedOrigin(origin) ? (origin as string) : 'https://disclosurely.com';
};

const getCorsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-organization-id',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

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
  const corsHeaders = getCorsHeaders(req);
  
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
    
    // Check if AI Gateway feature is enabled for this organization
    const { data: featureEnabled, error: featureError } = await supabase
      .rpc('is_feature_enabled', {
        p_feature_name: 'ai_gateway',
        p_organization_id: organizationId
      });
    
    if (featureError) {
      console.error('[AI Gateway] Feature flag check error:', featureError);
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!featureEnabled) {
      console.log(`[AI Gateway] Feature disabled for org: ${organizationId}`);
      return new Response(
        JSON.stringify({ error: 'AI Gateway not enabled for this organization' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
    // 4. LOAD AI POLICY
    // ============================================================================
    const { data: policy, error: policyError } = await supabase
      .rpc('get_active_ai_policy', { p_organization_id: organizationId });
    
    if (policyError || !policy) {
      console.error('[AI Gateway] Policy load error:', policyError);
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // ============================================================================
    // 5. CHECK TOKEN LIMITS
    // ============================================================================
    const maxTokens = body.max_tokens || policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.max_tokens || 2000;
    
    const { data: hasCapacity, error: limitError } = await supabase
      .rpc('check_token_limit', {
        p_organization_id: organizationId,
        p_requested_tokens: maxTokens
      });
    
    if (limitError) {
      console.error('[AI Gateway] Token limit check error:', limitError);
      return new Response(
        JSON.stringify({ error: 'Service error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!hasCapacity) {
      console.log(`[AI Gateway] Token limit exceeded for org: ${organizationId}`);
      return new Response(
        JSON.stringify({ error: 'Daily token limit exceeded' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ============================================================================
    // 6. ENHANCED PII REDACTION (20+ patterns with validation)
    // ============================================================================
    let redactionMap: Record<string, string> = {};
    let piiDetected = false;
    let detectionStats: Record<string, number> = {};
    
    if (policy.pii_protection?.enabled && !body.preserve_pii) {
      console.log('[AI Gateway] PII redaction enabled - using enhanced detector');
      
      body.messages = body.messages.map(msg => {
        // Use enhanced PII detector with validation
        const redactionResult = redactPII(msg.content);
        
        if (redactionResult.piiDetected) {
          piiDetected = true;
          // Merge redaction maps (handle duplicates across messages)
          Object.entries(redactionResult.redactionMap).forEach(([original, placeholder]) => {
            redactionMap[original] = placeholder;
          });
          
          // Merge detection stats
          Object.entries(redactionResult.detectionStats).forEach(([type, count]) => {
            detectionStats[type] = (detectionStats[type] || 0) + count;
          });
          
          console.log(`[AI Gateway] Redacted ${Object.keys(redactionResult.redactionMap).length} PII items from message`);
        }

        return { ...msg, content: redactionResult.redactedContent };
      });
      
      if (piiDetected) {
        console.log(`[AI Gateway] Total PII detected:`, detectionStats);
      }
    }

    // ============================================================================
    // 7. ROUTE TO VENDOR (Multi-Model Support)
    // ============================================================================
    const model = body.model || policy.routing?.default_model || 'deepseek-chat';
    const temperature = body.temperature ?? policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.temperature ?? 0.7;
    const maxTokens = body.max_tokens || policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.max_tokens || 2000;

    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // MODEL ROUTING - provision for future models
    let apiEndpoint: string;
    let apiKey: string;
    let requestBody: any;

    // Route based on model (currently only DeepSeek, but structured for future expansion)
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      // OpenAI (future)
      apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      apiKey = Deno.env.get('OPENAI_API_KEY') || '';
      requestBody = {
        model,
        messages: body.messages,
        temperature,
        max_tokens: maxTokens,
      };
    } else if (model.startsWith('claude-')) {
      // Anthropic (future)
      apiEndpoint = 'https://api.anthropic.com/v1/messages';
      apiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
      requestBody = {
        model,
        messages: body.messages,
        max_tokens: maxTokens,
        temperature,
      };
    } else {
      // DeepSeek (current default)
      apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
      apiKey = Deno.env.get('DEEPSEEK_API_KEY') || '';
      requestBody = {
        model: 'deepseek-chat',
        messages: body.messages,
        temperature,
        max_tokens: maxTokens,
      };
    }

    const deepseekResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
    // 10. TRACK TOKEN USAGE
    // ============================================================================
    await supabase.rpc('upsert_token_usage', {
      p_organization_id: organizationId,
      p_date: new Date().toISOString().split('T')[0],
      p_model: model,
      p_tokens: result.usage?.total_tokens || 0,
      p_cost: 0 // Cost calculation can be added based on model pricing
    });
    
    console.log(`[AI Gateway] Completed successfully - ${result.usage?.total_tokens || 0} tokens`);

    // ============================================================================
    // 12. RETURN RESPONSE
    // ============================================================================
    return new Response(
      JSON.stringify({
        id: requestId,
        model,
        choices: result.choices,
        usage: result.usage,
        metadata: {
          pii_redacted: piiDetected,
          pii_stats: piiDetected ? detectionStats : undefined,
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

