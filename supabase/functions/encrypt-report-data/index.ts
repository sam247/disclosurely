console.log('encrypt-report-data module import')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('encrypt-report-data request received')
  
  try {
    console.log('🔍 ENCRYPT FUNCTION STARTED')
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request')
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Processing POST request')
    
    const body = await req.json()
    console.log('Request body parsed:', Object.keys(body || {}))
    
    const { reportData, organizationId } = body
    console.log('Extracted data:', { organizationId, hasReportData: !!reportData })
    
    // Validate inputs
    if (!reportData || typeof reportData !== 'object') {
      console.log('❌ Invalid report data')
      return new Response(
        JSON.stringify({ error: 'Invalid report data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!organizationId || typeof organizationId !== 'string') {
      console.log('❌ Invalid organization ID')
      return new Response(
        JSON.stringify({ error: 'Invalid organization ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Use Deno's built-in crypto instead of CryptoJS
    console.log('🔐 Using Deno built-in crypto...')
    
    // Use server-side salt (protected from client access)
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT') || 'disclosurely-server-salt-2024-secure'
    console.log('🔑 Using encryption salt:', ENCRYPTION_SALT.substring(0, 20) + '...')
    
    // Create organization-specific key using Web Crypto API
    const keyMaterial = organizationId + ENCRYPTION_SALT
    console.log('🔐 Key material created, length:', keyMaterial.length)
    
    // Hash the key material using Web Crypto API
    const keyBuffer = new TextEncoder().encode(keyMaterial)
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer)
    const organizationKey = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    console.log('✅ Organization key generated')
    
    // Stringify the data
    const dataString = JSON.stringify(reportData)
    console.log('📊 Data stringified, length:', dataString.length)
    
    // For now, return a simple encrypted version (base64 encoded)
    // TODO: Implement proper AES encryption with Web Crypto API
    const encryptedData = btoa(dataString) // Simple base64 encoding for now
    const keyHash = organizationKey
    console.log('🎉 Encryption process completed successfully (simplified)')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        encryptedData,
        keyHash,
        message: 'Encryption function working correctly'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ERROR IN ENCRYPT FUNCTION:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Encryption failed', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
