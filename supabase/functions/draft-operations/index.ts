/**
 * SECURE DRAFT OPERATIONS EDGE FUNCTION
 *
 * This edge function handles all draft operations with proper security:
 * - Rate limiting (10 operations per 5 minutes per IP)
 * - Server-side draft_code verification
 * - Audit logging
 * - Input validation
 *
 * Supported operations:
 * - save: Create new draft
 * - resume: Retrieve draft by code
 * - update: Update existing draft
 * - delete: Delete draft
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Ratelimit } from "https://esm.sh/@upstash/ratelimit@1.0.0"
import { Redis } from "https://esm.sh/@upstash/redis@1.25.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Rate limiter for draft operations: 10 per 5 minutes per IP
const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
})

const draftRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "5 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/draft",
})

// Encryption functions using Web Crypto API (AES-256-GCM)
async function deriveKey(draftCode: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(draftCode),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('disclosurely-draft-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptData(
  data: string,
  draftCode: string
): Promise<{ encrypted: string; hash: string; iv: string }> {
  const encoder = new TextEncoder()
  const key = await deriveKey(draftCode)

  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  )

  const encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  const ivBase64 = btoa(String.fromCharCode(...iv))

  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(draftCode))
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer.slice(0, 16))))

  return { encrypted, hash, iv: ivBase64 }
}

async function decryptData(
  encrypted: string,
  iv: string,
  draftCode: string
): Promise<string> {
  const key = await deriveKey(draftCode)

  const encryptedBuffer = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0))

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// Audit logging
async function logAudit(supabase: any, operation: string, draftId: string | null, ip: string, success: boolean, error?: string) {
  try {
    await supabase.from('system_logs').insert({
      timestamp: new Date().toISOString(),
      level: success ? 'info' : 'error',
      context: 'draft_operations',
      message: `Draft ${operation}: ${success ? 'success' : 'failed'}`,
      data: JSON.stringify({
        operation,
        draft_id: draftId,
        ip_address: ip,
        error: error || null,
      }),
      created_at: new Date().toISOString()
    })
  } catch (logError) {
    console.error('Failed to log audit event:', logError)
  }
}

serve(async (req) => {
  console.log('draft-operations: request start')

  // Handle CORS preflight requests FIRST - with explicit status 200
  if (req.method === 'OPTIONS') {
    console.log('draft-operations: Handling OPTIONS preflight request')
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }
  
  try {

    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "anonymous"
    const rateLimitResult = await draftRateLimiter.limit(clientIp)
    
    if (!rateLimitResult.success) {
      console.warn('⚠️ Rate limit exceeded for draft operations')
      return new Response(
        JSON.stringify({
          error: "Too many draft operations. Please try again later.",
          reset: rateLimitResult.reset,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()
    const { operation, ...params } = body

    // Initialize Supabase with service role (bypasses RLS)
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

    // clientIp already defined above for rate limiting

    // Handle different operations
    switch (operation) {
      case 'save': {
        const { organizationId, formData, fileMetadata, currentStep, language } = params

        if (!organizationId || !formData) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Generate draft code
        const { data: draftCode, error: codeError } = await supabase.rpc('generate_draft_code')
        if (codeError || !draftCode) {
          await logAudit(supabase, 'save', null, clientIp, false, 'Failed to generate draft code')
          return new Response(
            JSON.stringify({ error: 'Failed to generate draft code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Encrypt content
        const draftData = { formData, fileMetadata: fileMetadata || [] }
        const { encrypted, hash, iv } = await encryptData(JSON.stringify(draftData), draftCode)

        // Calculate expiration
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 48)

        // Insert draft
        const { error: insertError } = await supabase
          .from('report_drafts')
          .insert({
            organization_id: organizationId,
            draft_code: draftCode,
            encrypted_content: encrypted,
            encryption_key_hash: hash,
            iv: iv,
            current_step: currentStep || 0,
            language: language || 'en',
            file_metadata: fileMetadata || [],
            expires_at: expiresAt.toISOString(),
          })

        if (insertError) {
          await logAudit(supabase, 'save', null, clientIp, false, insertError.message)
          return new Response(
            JSON.stringify({ error: 'Failed to save draft' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        await logAudit(supabase, 'save', draftCode, clientIp, true)

        return new Response(
          JSON.stringify({
            success: true,
            draftCode: draftCode,
            expiresAt: expiresAt.toISOString(),
            message: 'Draft saved successfully',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'resume': {
        const { draftCode } = params

        if (!draftCode) {
          return new Response(
            JSON.stringify({ error: 'Draft code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Fetch draft - server-side verification of draft_code
        const { data, error } = await supabase
          .from('report_drafts')
          .select('*')
          .eq('draft_code', draftCode)
          .maybeSingle()

        if (error || !data) {
          await logAudit(supabase, 'resume', null, clientIp, false, 'Draft not found')
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Draft not found or expired',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check expiration
        if (new Date(data.expires_at) < new Date()) {
          await logAudit(supabase, 'resume', data.id, clientIp, false, 'Draft expired')
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Draft has expired',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check IV exists
        if (!data.iv) {
          await logAudit(supabase, 'resume', data.id, clientIp, false, 'Missing IV')
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Draft was created with an older version and cannot be decrypted',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        try {
          // Decrypt content
          const decryptedContent = await decryptData(data.encrypted_content, data.iv, draftCode)
          const draftData = JSON.parse(decryptedContent)

          await logAudit(supabase, 'resume', data.id, clientIp, true)

          return new Response(
            JSON.stringify({
              success: true,
              formData: draftData.formData,
              currentStep: data.current_step,
              language: data.language,
              fileMetadata: draftData.fileMetadata,
              expiresAt: data.expires_at,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (decryptError) {
          await logAudit(supabase, 'resume', data.id, clientIp, false, 'Decryption failed - invalid code')
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to resume draft. The code may be incorrect.',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'update': {
        const { draftCode, formData, fileMetadata, currentStep, language } = params

        if (!draftCode || !formData) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify draft exists and code is correct
        const { data: existingDraft, error: fetchError } = await supabase
          .from('report_drafts')
          .select('id, save_count, expires_at')
          .eq('draft_code', draftCode)
          .maybeSingle()

        if (fetchError || !existingDraft) {
          await logAudit(supabase, 'update', null, clientIp, false, 'Draft not found')
          return new Response(
            JSON.stringify({ error: 'Draft not found or code incorrect' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Encrypt new content
        const draftData = { formData, fileMetadata: fileMetadata || [] }
        const { encrypted, hash, iv } = await encryptData(JSON.stringify(draftData), draftCode)

        const newSaveCount = (existingDraft.save_count || 0) + 1

        // Update draft
        const { error: updateError } = await supabase
          .from('report_drafts')
          .update({
            encrypted_content: encrypted,
            encryption_key_hash: hash,
            iv: iv,
            current_step: currentStep,
            language: language,
            file_metadata: fileMetadata || [],
            updated_at: new Date().toISOString(),
            save_count: newSaveCount,
          })
          .eq('draft_code', draftCode)

        if (updateError) {
          await logAudit(supabase, 'update', existingDraft.id, clientIp, false, updateError.message)
          return new Response(
            JSON.stringify({ error: 'Failed to update draft' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        await logAudit(supabase, 'update', existingDraft.id, clientIp, true)

        return new Response(
          JSON.stringify({
            success: true,
            draftCode: draftCode,
            expiresAt: existingDraft.expires_at,
            message: 'Draft updated successfully',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { draftCode } = params

        if (!draftCode) {
          return new Response(
            JSON.stringify({ error: 'Draft code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify draft exists before deletion
        const { data: existingDraft } = await supabase
          .from('report_drafts')
          .select('id')
          .eq('draft_code', draftCode)
          .maybeSingle()

        if (!existingDraft) {
          await logAudit(supabase, 'delete', null, clientIp, false, 'Draft not found')
          return new Response(
            JSON.stringify({ success: false, message: 'Draft not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete draft
        const { error: deleteError } = await supabase
          .from('report_drafts')
          .delete()
          .eq('draft_code', draftCode)

        if (deleteError) {
          await logAudit(supabase, 'delete', existingDraft.id, clientIp, false, deleteError.message)
          return new Response(
            JSON.stringify({ success: false, message: 'Failed to delete draft' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        await logAudit(supabase, 'delete', existingDraft.id, clientIp, true)

        return new Response(
          JSON.stringify({ success: true, message: 'Draft deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in draft-operations:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
