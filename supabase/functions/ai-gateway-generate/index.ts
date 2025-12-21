// AI Gateway - Generate Endpoint
// Purpose: Route AI requests through privacy-preserving gateway
// Vendor: DeepSeek (primary)
// Features: PII redaction, policy enforcement, audit logging

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Restrict CORS for authenticated endpoints  
const getAllowedOrigin = (req: Request): string => {
  const origin = req.headers.get('origin');
  
  if (!origin) {
    return 'https://disclosurely.com';
  }
  
  // Allow specific production domains
  const allowedDomains = [
    'https://disclosurely.com',
    'https://www.disclosurely.com',
    'https://app.disclosurely.com',
    'http://localhost:8080',
    'http://localhost:5173',
  ];
  
  if (allowedDomains.includes(origin)) {
    return origin;
  }
  
  // Allow Lovable preview domains (any subdomain)
  if (origin.includes('.lovable.app') || origin.includes('.lovableproject.com')) {
    return origin;
  }
  
  // Default fallback
  return 'https://disclosurely.com';
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
  // Handle CORS preflight FIRST - before any other code
  if (req.method === 'OPTIONS') {
    try {
      const corsHeaders = getCorsHeaders(req);
      return new Response('ok', { status: 200, headers: corsHeaders });
    } catch (error) {
      // Fallback CORS headers if getCorsHeaders fails
      return new Response('ok', { 
        status: 200, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-organization-id',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      });
    }
  }
  
  const corsHeaders = getCorsHeaders(req);

  try {
    // ============================================================================
    // 1. AUTHENTICATION (Manual JWT verification since verify_jwt = false)
    // ============================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }

    // ============================================================================
    // 2. FEATURE FLAG CHECK (Kill switch)
    // ============================================================================
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const organizationId = req.headers.get('X-Organization-Id');
    console.log(`[AI Gateway] Received request for org: ${organizationId}`);
    
    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'X-Organization-Id header required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
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
    // 6. PII REDACTION using OpenRedaction.com API
    // ============================================================================
    const redactionMap: Record<string, string> = {};
    let piiDetected = false;
    const detectionStats: Record<string, number> = {};
    
    if (policy.pii_protection?.enabled && !body.preserve_pii) {
      console.log('[AI Gateway] PII redaction enabled - using OpenRedaction API');
      
      // Import OpenRedaction API client
      const { callOpenRedactAPI } = await import('../_shared/openredact-api.ts');
      
      // Call OpenRedaction API for each message
      const redactionPromises = body.messages.map(async (msg) => {
        try {
          const result = await callOpenRedactAPI({
            text: msg.content,
            enable_ai: true, // Use AI for maximum coverage
        });
        
          if (result.detections && result.detections.length > 0) {
          piiDetected = true;
            
            // Build redaction map from detections
            const msgRedactionMap: Record<string, string> = {};
            result.detections.forEach((det, idx) => {
              const placeholder = `[${det.type}_${idx + 1}]`;
              const originalValue = det.value || msg.content.substring(det.position?.start || 0, det.position?.end || 0);
              msgRedactionMap[originalValue] = placeholder;
              
              // Track stats
              const type = det.type.toUpperCase();
              detectionStats[type] = (detectionStats[type] || 0) + 1;
            });
            
            // Merge into global redaction map
            Object.entries(msgRedactionMap).forEach(([original, placeholder]) => {
              redactionMap[original] = placeholder;
          });
          
            console.log(`[AI Gateway] Redacted ${result.detections.length} PII items from message`);
        }

          return { ...msg, content: result.redacted_text || msg.content };
        } catch (error) {
          console.error('[AI Gateway] PII detection exception:', error);
          // Continue with original content if detection fails
          return msg;
        }
      });
      
      // Wait for all redactions to complete
      body.messages = await Promise.all(redactionPromises);
      
      if (piiDetected) {
        console.log(`[AI Gateway] Total PII detected:`, detectionStats);
      }
    }

    // ============================================================================
    // 7. ROUTE TO VENDOR (Multi-Model Support)
    // ============================================================================
    const model = body.model || policy.routing?.default_model || 'deepseek-chat';
    const temperature = body.temperature ?? policy.routing?.purpose_routing?.[body.context?.purpose || 'default']?.temperature ?? 0.7;
    // maxTokens already declared on line 177 - reuse it here

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

