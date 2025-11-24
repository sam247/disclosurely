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

