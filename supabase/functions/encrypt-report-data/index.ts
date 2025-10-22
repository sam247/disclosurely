import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    console.log('🔍 ENCRYPT FUNCTION STARTED')
    
    const body = await req.json()
    console.log('📦 Request body received:', Object.keys(body || {}))
    
    const { reportData, organizationId } = body
    console.log('🔑 Organization ID:', organizationId)
    console.log('📊 Report data keys:', Object.keys(reportData || {}))
    
    // Test CryptoJS import
    console.log('📦 Importing CryptoJS...')
    const CryptoJS = await import('https://esm.sh/crypto-js@4.2.0')
    console.log('✅ CryptoJS imported successfully')
    
    // Simple test encryption
    console.log('🔐 Testing encryption...')
    const testString = JSON.stringify(reportData || { test: 'data' })
    const testKey = 'test-key-123'
    const encrypted = CryptoJS.AES.encrypt(testString, testKey)
    console.log('✅ Encryption test successful')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        encryptedData: encrypted.toString(),
        keyHash: CryptoJS.SHA256(testKey).toString(),
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
