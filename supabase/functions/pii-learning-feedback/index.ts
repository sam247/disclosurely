// PII Learning Feedback Endpoint
// Purpose: Collect user feedback to improve PII detection accuracy
// Stores false positives and false negatives for OpenRedact learning

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { feedback_type, original_text, detected_type, context, organization_id } = body;

    // Validate input
    if (!feedback_type || !original_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: feedback_type, original_text' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['false_positive', 'false_negative'].includes(feedback_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid feedback_type. Must be "false_positive" or "false_negative"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's organization if not provided
    let orgId = organization_id;
    if (!orgId) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (userRole) {
        orgId = userRole.organization_id;
      }
    }

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert learning feedback
    const { data, error } = await supabase
      .from('pii_learning_feedback')
      .insert({
        organization_id: orgId,
        feedback_type,
        original_text,
        detected_type: detected_type || null,
        context: context || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[PII Learning] Error inserting feedback:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Update local learning store if OpenRedact is enabled for this organization
    // This will be implemented once OpenRedact is published and integrated

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        message: 'Feedback saved successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[PII Learning] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

