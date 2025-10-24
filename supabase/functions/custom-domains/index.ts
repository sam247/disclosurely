import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CustomDomain {
  id: string
  organization_id: string
  domain_name: string
  subdomain: string
  root_domain: string
  status: 'pending' | 'verifying' | 'verified' | 'active' | 'failed' | 'suspended'
  verification_token?: string
  verification_method: 'dns' | 'file'
  dns_record_type: string
  dns_record_value: string
  created_at: string
  verified_at?: string
  activated_at?: string
  last_checked_at?: string
  error_message?: string
  is_active: boolean
  is_primary: boolean
  created_by?: string
  updated_at: string
}

interface DomainVerificationResult {
  success: boolean
  message: string
  dns_record?: {
    type: string
    name: string
    value: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: 'No organization found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is org admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', profile.organization_id)
      .eq('is_active', true)
      .single()

    if (!userRole || userRole.role !== 'org_admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (method) {
      case 'GET':
        return await handleGetDomains(supabaseClient, profile.organization_id, path)
      
      case 'POST':
        return await handleAddDomain(supabaseClient, profile.organization_id, user.id, req)
      
      case 'PUT':
        return await handleUpdateDomain(supabaseClient, profile.organization_id, path, req)
      
      case 'DELETE':
        return await handleDeleteDomain(supabaseClient, profile.organization_id, path)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in custom-domains function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetDomains(supabaseClient: any, organizationId: string, path: string) {
  if (path === 'verify') {
    // Handle domain verification check
    const url = new URL(supabaseClient.supabaseUrl)
    const domainId = url.searchParams.get('domainId')
    
    if (!domainId) {
      return new Response(
        JSON.stringify({ error: 'Domain ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return await verifyDomain(supabaseClient, organizationId, domainId)
  }

  // Get all domains for organization
  const { data: domains, error } = await supabaseClient
    .from('custom_domains')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ domains }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAddDomain(supabaseClient: any, organizationId: string, userId: string, req: Request) {
  const { domain_name } = await req.json()

  if (!domain_name) {
    return new Response(
      JSON.stringify({ error: 'Domain name is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
  if (!domainRegex.test(domain_name)) {
    return new Response(
      JSON.stringify({ error: 'Invalid domain format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Parse domain into subdomain and root domain
  const parts = domain_name.split('.')
  if (parts.length < 2) {
    return new Response(
      JSON.stringify({ error: 'Domain must have at least a subdomain and root domain' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const subdomain = parts[0]
  const root_domain = parts.slice(1).join('.')

  // Check if domain already exists
  const { data: existingDomain } = await supabaseClient
    .from('custom_domains')
    .select('id')
    .eq('domain_name', domain_name)
    .single()

  if (existingDomain) {
    return new Response(
      JSON.stringify({ error: 'Domain already exists' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate verification token
  const verification_token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Insert new domain
  const { data: newDomain, error } = await supabaseClient
    .from('custom_domains')
    .insert({
      organization_id: organizationId,
      domain_name,
      subdomain,
      root_domain,
      verification_token,
      verification_method: 'dns',
      dns_record_type: 'CNAME',
      dns_record_value: 'secure.disclosurely.com',
      created_by: userId,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      domain: newDomain,
      dns_instructions: {
        type: 'CNAME',
        name: domain_name,
        value: 'secure.disclosurely.com',
        ttl: 300
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateDomain(supabaseClient: any, organizationId: string, path: string, req: Request) {
  const domainId = path
  const updates = await req.json()

  if (!domainId) {
    return new Response(
      JSON.stringify({ error: 'Domain ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update domain
  const { data: updatedDomain, error } = await supabaseClient
    .from('custom_domains')
    .update(updates)
    .eq('id', domainId)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ domain: updatedDomain }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteDomain(supabaseClient: any, organizationId: string, path: string) {
  const domainId = path

  if (!domainId) {
    return new Response(
      JSON.stringify({ error: 'Domain ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Delete domain
  const { error } = await supabaseClient
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('organization_id', organizationId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyDomain(supabaseClient: any, organizationId: string, domainId: string): Promise<Response> {
  // Get domain details
  const { data: domain, error: fetchError } = await supabaseClient
    .from('custom_domains')
    .select('*')
    .eq('id', domainId)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !domain) {
    return new Response(
      JSON.stringify({ error: 'Domain not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Check DNS record
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain.domain_name}&type=CNAME`)
    const dnsData = await dnsResponse.json()

    let isVerified = false
    let errorMessage = ''

    if (dnsData.Answer && dnsData.Answer.length > 0) {
      const cnameRecord = dnsData.Answer.find((record: any) => record.type === 5)
      if (cnameRecord && cnameRecord.data === domain.dns_record_value) {
        isVerified = true
      } else {
        errorMessage = 'CNAME record does not point to correct value'
      }
    } else {
      errorMessage = 'CNAME record not found'
    }

    // Update domain status
    const updateData: any = {
      last_checked_at: new Date().toISOString(),
      status: isVerified ? 'verified' : 'failed',
      error_message: isVerified ? null : errorMessage
    }

    if (isVerified) {
      updateData.verified_at = new Date().toISOString()
    }

    const { data: updatedDomain, error: updateError } = await supabaseClient
      .from('custom_domains')
      .update(updateData)
      .eq('id', domainId)
      .select()
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        verified: isVerified,
        message: isVerified ? 'Domain verified successfully' : errorMessage,
        domain: updatedDomain
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('DNS verification error:', error)
    
    // Update domain with error
    await supabaseClient
      .from('custom_domains')
      .update({
        last_checked_at: new Date().toISOString(),
        status: 'failed',
        error_message: 'DNS verification failed'
      })
      .eq('id', domainId)

    return new Response(
      JSON.stringify({ 
        verified: false,
        message: 'DNS verification failed',
        error: 'Unable to verify DNS record'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
