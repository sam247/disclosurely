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
    
    console.log('🎉 SIMPLE SUCCESS TEST - Function is working!')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        encryptedData: 'test-encrypted-data',
        keyHash: 'test-key-hash',
        message: 'Function is working - ready for proper encryption'
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
