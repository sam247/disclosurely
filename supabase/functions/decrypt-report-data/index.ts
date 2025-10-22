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

    // Server-side decryption using CryptoJS
    const CryptoJS = await import('https://esm.sh/crypto-js@4.2.0')
    
    // Try multiple salt combinations for backward compatibility
    const saltOptions = [
      // New server-side salt
      Deno.env.get('ENCRYPTION_SALT') || 'disclosurely-server-salt-2024-secure',
      // Legacy salts from original client-side encryption
      'disclosurely-salt-2024-enhanced',
      'disclosurely-salt-2024'
    ]
    
    let decryptedData = null
    let decryptionError = null
    
    // Try each salt option
    for (const salt of saltOptions) {
      try {
        let keyMaterial
        let organizationKey
        
        if (salt === 'disclosurely-salt-2024-enhanced') {
          // Enhanced salt with daily timestamp rotation (original implementation)
          const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
          keyMaterial = organizationId + salt + timestamp.toString()
        } else {
          // Standard salt
          keyMaterial = organizationId + salt
        }
        
        organizationKey = CryptoJS.SHA256(keyMaterial).toString()
        
        // Decrypt using AES
        const decrypted = CryptoJS.AES.decrypt(encryptedData, organizationKey, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })
        
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
        
        if (decryptedString && decryptedString.length > 0) {
          decryptedData = JSON.parse(decryptedString)
          console.log('Successfully decrypted using salt:', salt.substring(0, 20) + '...')
          break
        }
      } catch (error) {
        decryptionError = error
        console.log('Failed to decrypt with salt:', salt.substring(0, 20) + '...')
        continue
      }
    }
    
    if (!decryptedData) {
      throw new Error('Decryption failed with all salt options - data may be corrupted or encrypted with unknown key')
    }

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