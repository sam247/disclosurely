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
    
    // Test CryptoJS import
    console.log('📦 Importing CryptoJS...')
    const CryptoJS = await import('https://esm.sh/crypto-js@4.2.0')
    console.log('✅ CryptoJS imported successfully')
    
    // Use server-side salt (protected from client access)
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT') || 'disclosurely-server-salt-2024-secure'
    console.log('🔑 Using encryption salt:', ENCRYPTION_SALT.substring(0, 20) + '...')
    
    // Create organization-specific key
    const keyMaterial = organizationId + ENCRYPTION_SALT
    console.log('🔐 Key material created, length:', keyMaterial.length)
    
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString()
    console.log('✅ Organization key generated')
    
    // Stringify the data
    const dataString = JSON.stringify(reportData)
    console.log('📊 Data stringified, length:', dataString.length)
    
    // Encrypt using AES
    console.log('🔐 Starting AES encryption...')
    const encrypted = CryptoJS.AES.encrypt(dataString, organizationKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    console.log('✅ AES encryption completed')
    
    const encryptedData = encrypted.toString()
    const keyHash = CryptoJS.SHA256(organizationKey).toString()
    console.log('🎉 Encryption process completed successfully')
    
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
