import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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

// ⚠️ CRITICAL: Verify ENCRYPTION_SALT on module load (startup check)
const ENCRYPTION_SALT_STARTUP = Deno.env.get('ENCRYPTION_SALT');
if (!ENCRYPTION_SALT_STARTUP) {
  console.error('🚨 CRITICAL: ENCRYPTION_SALT is missing on startup!');
  console.error('🚨 This will cause all decryption operations to fail!');
  console.error('🚨 Check Supabase Edge Function Secrets immediately!');
  console.error('🚨 Location: Supabase Dashboard > Settings > Edge Functions > Secrets');
  // Don't throw here - let individual requests fail with proper error messages
  // This allows the function to deploy but will fail on actual use
} else {
  console.log('✅ ENCRYPTION_SALT verified on startup (length:', ENCRYPTION_SALT_STARTUP.length, 'chars)');
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { encryptedData, organizationId } = await req.json()

    // Validate inputs
    if (!encryptedData || typeof encryptedData !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid encrypted data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!organizationId || typeof organizationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid organization ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user has access to this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this organization data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Server-side decryption using Web Crypto API (same as anonymous-report-messaging)
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT');
    if (!ENCRYPTION_SALT) {
      console.error('❌ ENCRYPTION_SALT environment variable is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const keyMaterial = organizationId + ENCRYPTION_SALT;
    
    // Hash the key material using Web Crypto API
    const keyBuffer = new TextEncoder().encode(keyMaterial);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
    const organizationKey = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Decrypt using AES-GCM (same as anonymous-report-messaging)
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encryptedDataBytes = combined.slice(12);
    
    const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encryptedDataBytes
    );
    
    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    const decryptedData = JSON.parse(decryptedString);
    
    console.log('Successfully decrypted report data for user:', user.id.substring(0, 8))

    return new Response(
      JSON.stringify({ decryptedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Decryption error:', error)
    return new Response(
      JSON.stringify({ error: 'Decryption failed', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})