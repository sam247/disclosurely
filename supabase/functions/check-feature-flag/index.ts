import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers helper
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
});

interface FeatureFlagRequest {
  feature_name: string;
  organization_id?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight FIRST
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: getCorsHeaders(req) });
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    // Parse request body
    const body: FeatureFlagRequest = await req.json();
    const { feature_name, organization_id } = body;

    if (!feature_name) {
      return new Response(
        JSON.stringify({ error: 'feature_name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key for RPC access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Call the RPC function
    const { data, error } = await supabase.rpc('is_feature_enabled', {
      p_feature_name: feature_name,
      p_organization_id: organization_id || null,
    });

    if (error) {
      console.error('[check-feature-flag] RPC error:', error);
      return new Response(
        JSON.stringify({ error: error.message, enabled: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ enabled: data === true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[check-feature-flag] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        enabled: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

