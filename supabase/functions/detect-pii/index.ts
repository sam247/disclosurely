/**
 * PII Detection Edge Function
 * Uses OpenRedaction.com API for accurate PII detection
 * Called from client-side preview modal
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENREDACT_API_URL = 'https://openredaction-api.onrender.com';
const OPENREDACT_API_KEY = Deno.env.get('OPENREDACT_API_KEY');

/**
 * Call OpenRedaction.com API for PII detection and redaction
 */
async function callOpenRedactAPI(text: string, enableAI: boolean = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Log API key status (without exposing the actual key)
  if (OPENREDACT_API_KEY) {
    headers['x-api-key'] = OPENREDACT_API_KEY;
    console.log('[Detect PII] API key is set, length:', OPENREDACT_API_KEY.length);
  } else {
    console.warn('[Detect PII] WARNING: OPENREDACT_API_KEY environment variable is not set!');
    console.warn('[Detect PII] API calls may fail without a valid API key.');
  }

  const apiUrl = `${OPENREDACT_API_URL}/v1/ai-detect`;
  const requestBody = {
    text,
    enable_ai: enableAI,
  };

  console.log('[Detect PII] Calling OpenRedaction API:', apiUrl);
  console.log('[Detect PII] Request body length:', text.length, 'chars');
  console.log('[Detect PII] Enable AI:', enableAI);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('[Detect PII] Response status:', response.status);
    console.log('[Detect PII] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Detect PII] API error response:', errorText);
      throw new Error(`OpenRedact API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[Detect PII] API response keys:', Object.keys(data));
    console.log('[Detect PII] Entities count:', data.entities?.length || 0);
    console.log('[Detect PII] Has redacted_text:', !!data.redacted_text);
    console.log('[Detect PII] AI used:', data.aiUsed);
    console.log('[Detect PII] Full API response:', JSON.stringify(data, null, 2));
    
    // Map API response entities to detections format
    // API returns: { entities: [...], aiUsed: boolean, redacted_text?: string }
    const detections = (data.entities || []).map((entity: any) => ({
      type: entity.type,
      value: entity.value,
      position: { start: entity.start, end: entity.end },
      confidence: entity.confidence,
    }));
    
    return {
      redacted_text: data.redacted_text || null, // API may not always return this
      detections,
      aiUsed: data.aiUsed || false,
    };
  } catch (error: any) {
    console.error('[Detect PII] Full API call error:', error);
    console.error('[Detect PII] Error message:', error.message);
    console.error('[Detect PII] Error stack:', error.stack);
    throw error;
  }
}

import { getAllowedOrigin, getCorsHeaders as getSharedCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Default CORS headers for error responses
  const defaultCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Create Supabase client for CORS checks
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Handle CORS preflight FIRST - before any other code
    if (req.method === 'OPTIONS') {
      try {
        const origin = req.headers.get('origin');
        console.log('[Detect PII] OPTIONS request from origin:', origin);
        const allowedOrigin = await getAllowedOrigin(req, supabase);
        console.log('[Detect PII] Allowed origin:', allowedOrigin);
        const corsHeaders = getSharedCorsHeaders(req, allowedOrigin);
        corsHeaders['Content-Type'] = 'application/json';
        return new Response('ok', { status: 200, headers: corsHeaders });
      } catch (error) {
        console.error('[Detect PII] CORS preflight error:', error);
        // Fallback CORS headers if getCorsHeaders fails
        return new Response('ok', { 
          status: 200, 
          headers: defaultCorsHeaders
        });
      }
    }
    
    // Get proper CORS headers for the request
    const origin = req.headers.get('origin');
    console.log('[Detect PII] Request from origin:', origin);
    let corsHeaders;
    try {
      const allowedOrigin = await getAllowedOrigin(req, supabase);
      console.log('[Detect PII] Allowed origin:', allowedOrigin);
      corsHeaders = getSharedCorsHeaders(req, allowedOrigin);
      corsHeaders['Content-Type'] = 'application/json';
    } catch (error) {
      console.error('[Detect PII] CORS error:', error);
      corsHeaders = defaultCorsHeaders;
    }

    // Parse request
    console.log('[Detect PII] Request received, method:', req.method);
    console.log('[Detect PII] Request headers:', Object.fromEntries(req.headers.entries()));
    
    let body;
    try {
      const bodyText = await req.text();
      console.log('[Detect PII] Request body text length:', bodyText.length);
      body = JSON.parse(bodyText);
      console.log('[Detect PII] Request body keys:', Object.keys(body));
    } catch (parseError: any) {
      console.error('[Detect PII] Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { text, enable_ai = true } = body;

    if (!text || typeof text !== 'string') {
      console.error('[Detect PII] Invalid text input:', typeof text, text?.substring(0, 50));
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[Detect PII] Processing text, length:', text.length);
    console.log('[Detect PII] Text preview (first 200 chars):', text.substring(0, 200));
    console.log('[Detect PII] Text preview (last 200 chars):', text.substring(Math.max(0, text.length - 200)));
    console.log('[Detect PII] Full text being sent to API:', JSON.stringify(text));

    // Send full text to API (don't extract description - API needs full context)
    const apiResult = await callOpenRedactAPI(text, enable_ai);
    console.log('[Detect PII] API result received, detections:', apiResult.detections?.length || 0);
    console.log('[Detect PII] Full API result:', JSON.stringify(apiResult, null, 2));

    // Use redacted_text from API if available, otherwise build from detections
    let redactedText = apiResult.redacted_text || text;
    
    // Transform to match client-side format
    const detections = (apiResult.detections || []).map((det, idx) => {
      const placeholder = `[${det.type.toUpperCase()}_${idx + 1}]`;
      const start = det.position?.start || 0;
      const end = det.position?.end || 0;
      
      return {
        original: det.value || text.substring(start, end),
        placeholder,
        type: det.type.toLowerCase(),
        start,
        end,
      };
    });

    // Build redaction map
    const redactionMap: Record<string, string> = {};
    detections.forEach((det) => {
      redactionMap[det.original] = det.placeholder;
    });

    // Build stats
    const stats: Record<string, number> = {};
    detections.forEach((det) => {
      const type = det.type.toUpperCase();
      stats[type] = (stats[type] || 0) + 1;
    });

    // If API didn't return redacted_text, build it from detections
    if (!apiResult.redacted_text && detections.length > 0) {
      redactedText = text;
      detections
        .sort((a, b) => b.start - a.start) // Sort descending to maintain indices
        .forEach((det) => {
          redactedText = 
            redactedText.slice(0, det.start) + 
            det.placeholder + 
            redactedText.slice(det.end);
        });
    }

    return new Response(
      JSON.stringify({
        redactedText,
        detections,
        piiCount: detections.length,
        stats,
        redactionMap,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Detect PII] Top-level error caught:');
    console.error('[Detect PII] Error type:', error?.constructor?.name);
    console.error('[Detect PII] Error message:', error?.message);
    console.error('[Detect PII] Error stack:', error?.stack);
    
    try {
      console.error('[Detect PII] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (stringifyError) {
      console.error('[Detect PII] Could not stringify error:', stringifyError);
    }
    
    // Try to get CORS headers for error response
    let errorCorsHeaders;
    try {
      const allowedOrigin = await getAllowedOrigin(req, supabase);
      errorCorsHeaders = getSharedCorsHeaders(req, allowedOrigin);
      errorCorsHeaders['Content-Type'] = 'application/json';
    } catch {
      errorCorsHeaders = defaultCorsHeaders;
    }
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to detect PII',
        errorDetails: error?.stack || String(error),
        redactedText: '',
        detections: [],
        piiCount: 0,
        stats: {},
        redactionMap: {},
      }),
      { status: 500, headers: errorCorsHeaders }
    );
  }
});
