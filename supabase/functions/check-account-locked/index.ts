import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for public endpoints - allow all origins to support custom domains
// Security is handled by the link token or other authentication mechanisms
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

interface AccountLockedRequest {
  email: string;
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
    const body: AccountLockedRequest = await req.json();
    const { email, organization_id } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'email is required' }),
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
    const { data, error } = await supabase.rpc('is_account_locked', {
      p_email: email,
      p_organization_id: organization_id || null,
    });

    if (error) {
      console.error('[check-account-locked] RPC error:', error);
      // Return false (not locked) on error to allow login to proceed
      return new Response(
        JSON.stringify({ locked: false, error: error.message }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ locked: data === true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[check-account-locked] Unexpected error:', error);
    // Return false (not locked) on error to allow login to proceed
    return new Response(
      JSON.stringify({ 
        locked: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

