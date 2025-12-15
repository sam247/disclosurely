/**
 * PII Detection Edge Function
 * Uses OpenRedaction.com API for accurate PII detection
 * Called from client-side preview modal
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callOpenRedactAPI } from '../_shared/openredact-api.ts';

// CORS handling - same pattern as ai-gateway-generate
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

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
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      });
    }
  }
  
  const corsHeaders = getCorsHeaders(req);

  try {
    // Parse request
    const { text, enable_ai = true } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call OpenRedaction API
    const apiResult = await callOpenRedactAPI({
      text,
      enable_ai,
    });

    // Use redacted_text from API if available, otherwise build from detections
    let redactedText = apiResult.redacted_text || text;
    
    // Transform to match client-side format
    const detections = (apiResult.detections || []).map((det, idx) => {
      const placeholder = `[${det.type.toUpperCase()}_${idx + 1}]`;
      return {
        original: det.value || text.substring(det.position?.start || 0, det.position?.end || 0),
        placeholder,
        type: det.type.toLowerCase(),
        start: det.position?.start || 0,
        end: det.position?.end || 0,
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
    console.error('[Detect PII] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to detect PII',
        redactedText: '',
        detections: [],
        piiCount: 0,
        stats: {},
        redactionMap: {},
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
