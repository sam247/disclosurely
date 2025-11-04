// encrypt-report-data - Uses built-in Deno.serve and Web Crypto API

console.log('encrypt-report-data module import')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ⚠️ CRITICAL: Verify ENCRYPTION_SALT on module load (startup check)
const ENCRYPTION_SALT_STARTUP = Deno.env.get('ENCRYPTION_SALT');
if (!ENCRYPTION_SALT_STARTUP) {
  console.error('🚨 CRITICAL: ENCRYPTION_SALT is missing on startup!');
  console.error('🚨 This will cause all encryption operations to fail!');
  console.error('🚨 Check Supabase Edge Function Secrets immediately!');
  console.error('🚨 Location: Supabase Dashboard > Settings > Edge Functions > Secrets');
  // Don't throw here - let individual requests fail with proper error messages
  // This allows the function to deploy but will fail on actual use
} else {
  console.log('✅ ENCRYPTION_SALT verified on startup (length:', ENCRYPTION_SALT_STARTUP.length, 'chars)');
}

Deno.serve(async (req: Request) => {
  console.log('encrypt-report-data request received')
  
  try {
    console.log('🔍 ENCRYPT FUNCTION STARTED')
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request')
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Processing POST request')
    
    const body = await req.json().catch(() => null)
    console.log('Request body parsed:', Object.keys(body || {}))
    
    const { reportData, organizationId } = body || {}
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
    
    // Use Deno's built-in Web Crypto API for encryption
    console.log('🔐 Using Deno Web Crypto API for encryption...')
    
    // Use server-side salt (protected from client access)
    let ENCRYPTION_SALT: string | undefined
    try {
      ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT') ?? undefined
    } catch (e) {
      // If permission to read env is blocked, surface a specific error
      console.error('❌ Unable to read environment variables:', String(e))
      return new Response(
        JSON.stringify({ error: 'Server configuration error: env access denied' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!ENCRYPTION_SALT) {
      console.error('❌ ENCRYPTION_SALT environment variable is not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('🔑 Encryption salt configured')
    
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
    
    // Encrypt using Web Crypto API
    console.log('🔐 Starting AES-GCM encryption...')
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // Import the key for encryption
    const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    
    // Encrypt the data
    const dataBuffer = new TextEncoder().encode(dataString)
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      dataBuffer
    )
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)
    
    // Convert to base64 using chunked approach to avoid huge argument lists
    // (this avoids potential stack/argument limits for very large arrays)
    const CHUNK = 0x8000 // 32KB chunks
    let binary = ''
    for (let i = 0; i < combined.length; i += CHUNK) {
      const slice = combined.subarray(i, Math.min(i + CHUNK, combined.length))
      binary += String.fromCharCode.apply(null, Array.from(slice))
    }
    const encryptedData = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
    const keyHash = organizationKey
    console.log('✅ AES-GCM encryption completed')
    console.log('🎉 Encryption process completed successfully')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        encryptedData,
        keyHash,
        message: 'Report data encrypted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ERROR IN ENCRYPT FUNCTION:', error)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Encryption failed. Please try again or contact support.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
