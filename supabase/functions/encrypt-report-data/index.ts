import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const { reportData, organizationId } = await req.json()

    // Validate inputs
    if (!reportData || typeof reportData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid report data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!organizationId || typeof organizationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid organization ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Server-side encryption using CryptoJS
    const CryptoJS = await import('https://esm.sh/crypto-js@4.2.0')
    
    // Use server-side salt (protected from client access)
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT') || 'disclosurely-server-salt-2024-secure'
    
    // Create organization-specific key
    const keyMaterial = organizationId + ENCRYPTION_SALT
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString()
    
    // Stringify the data
    const dataString = JSON.stringify(reportData)
    
    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(dataString, organizationKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    const encryptedData = encrypted.toString()
    const keyHash = CryptoJS.SHA256(organizationKey).toString()

    console.log('Successfully encrypted report data')

    return new Response(
      JSON.stringify({ encryptedData, keyHash }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Encryption error:', error)
    return new Response(
      JSON.stringify({ error: 'Encryption failed', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})