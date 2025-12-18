import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeadersWithDomainCheck } from '../_shared/cors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { linkId, linkToken } = await req.json();

    if (!linkId && !linkToken) {
      throw new Error('Missing required parameter: linkId or linkToken');
    }

    // Get IP and user agent from request
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const referrer = req.headers.get('referer') || null;

    // If linkToken provided, look up linkId
    let finalLinkId = linkId;
    if (!finalLinkId && linkToken) {
      const { data: linkData, error: linkError } = await supabase
        .from('organization_links')
        .select('id')
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        throw new Error('Link not found or inactive');
      }

      finalLinkId = linkData.id;
    }

    // Insert impression into link_analytics
    const { data, error } = await supabase
      .from('link_analytics')
      .insert({
        link_id: finalLinkId,
        event_type: 'view',
        ip_address: clientIP || null,
        user_agent: userAgent,
        referrer: referrer,
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting link impression:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Link impression tracking error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to track link impression',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
