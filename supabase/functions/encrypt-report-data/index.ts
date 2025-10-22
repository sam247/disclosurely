import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function started')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing POST request')
    
    const body = await req.json()
    console.log('Request body parsed:', Object.keys(body || {}))
    
    const { reportData, organizationId } = body
    console.log('Extracted data:', { organizationId, hasReportData: !!reportData })
    
    // Test CryptoJS import
    console.log('Testing CryptoJS import...')
    const CryptoJS = await import('https://esm.sh/crypto-js@4.2.0')
    console.log('CryptoJS imported successfully')
    
    // Test basic encryption
    console.log('Testing basic encryption...')
    const testData = 'test data'
    const testKey = 'test key'
    const encrypted = CryptoJS.AES.encrypt(testData, testKey)
    console.log('Basic encryption test passed')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Function working correctly',
        encryptedTest: encrypted.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Function error', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})