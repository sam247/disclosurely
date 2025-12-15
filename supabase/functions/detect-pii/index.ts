/**
 * PII Detection Edge Function
 * Uses OpenRedaction.com API for accurate PII detection
 * Called from client-side preview modal
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callOpenRedactAPI } from '../_shared/openredact-api.ts';

const OPENREDACT_API_URL = 'https://openredaction-api.onrender.com';
const OPENREDACT_API_KEY = Deno.env.get('OPENREDACT_API_KEY');

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: getCorsHeaders(req.headers.get('origin'))
    });
  }

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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

    // Transform to match client-side format
    const detections = (apiResult.detections || []).map((det, idx) => ({
      original: det.value || det.text || '',
      placeholder: `[${det.type}_${idx + 1}]`,
      type: det.type.toLowerCase(),
      start: det.position?.start || 0,
      end: det.position?.end || 0,
    }));

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

    // Apply redactions to text
    let redactedText = text;
    detections
      .sort((a, b) => b.start - a.start) // Sort descending to maintain indices
      .forEach((det) => {
        redactedText = 
          redactedText.slice(0, det.start) + 
          det.placeholder + 
          redactedText.slice(det.end);
      });

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
