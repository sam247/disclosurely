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
    const body = await req.json()

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

    // Route based on action in body
    const { action } = body || {}

    switch (action) {
      case 'list':
        return await handleGetDomains(supabaseClient, profile.organization_id)
      
      case 'add':
        return await handleAddDomain(supabaseClient, profile.organization_id, user.id, body)
      
      case 'update':
        return await handleUpdateDomain(supabaseClient, profile.organization_id, body)
      
      case 'delete':
        return await handleDeleteDomain(supabaseClient, profile.organization_id, body)
      
      case 'verify':
        return await handleVerifyDomain(supabaseClient, profile.organization_id, body)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

async function handleGetDomains(supabaseClient: any, organizationId: string) {
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

async function handleAddDomain(supabaseClient: any, organizationId: string, userId: string, body: any) {
  const { domain_name } = body

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

async function handleUpdateDomain(supabaseClient: any, organizationId: string, body: any) {
  const { domainId, updates } = body

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

async function handleDeleteDomain(supabaseClient: any, organizationId: string, body: any) {
  const { domainId } = body

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

async function handleVerifyDomain(supabaseClient: any, organizationId: string, body: any): Promise<Response> {
  const { domainId } = body

  if (!domainId) {
    return new Response(
      JSON.stringify({ error: 'Domain ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

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
    // Log verification attempt
    await supabaseClient.functions.invoke('ai-logger', {
      body: {
        level: 'info',
        context: 'custom-domains',
        message: `Starting DNS verification for domain: ${domain.domain_name}`,
        data: {
          domainId: domain.id,
          domainName: domain.domain_name,
          organizationId: organizationId
        }
      }
    });

    // Check DNS record using multiple methods for better compatibility
    const verificationResults = await Promise.allSettled([
      checkCnameRecordViaGoogleDNS(domain.domain_name, 'secure.disclosurely.com'),
      checkCnameRecordViaCloudflareDNS(domain.domain_name, 'secure.disclosurely.com'),
      checkCnameRecordViaQuad9DNS(domain.domain_name, 'secure.disclosurely.com')
    ]);

    // Check if any verification method succeeded
    const successfulVerifications = verificationResults
      .filter(result => result.status === 'fulfilled' && result.value === true)
      .length;

    const isVerified = successfulVerifications > 0;
    let errorMessage = '';

    if (!isVerified) {
      const failureReasons = verificationResults
        .map((result, index) => {
          if (result.status === 'rejected') {
            return `Method ${index + 1}: ${result.reason}`;
          } else if (result.value === false) {
            return `Method ${index + 1}: CNAME record not found or incorrect`;
          }
          return null;
        })
        .filter(Boolean);

      errorMessage = `CNAME record not found. Please ensure the record points to secure.disclosurely.com. Checked ${verificationResults.length} DNS methods.`;
      
      // Log verification failure with details
      await supabaseClient.functions.invoke('ai-logger', {
        body: {
          level: 'warn',
          context: 'custom-domains',
          message: `Domain verification failed: ${domain.domain_name}`,
          data: { 
            domainId, 
            domainName: domain.domain_name, 
            failureReasons,
            successfulMethods: successfulVerifications
          }
        }
      });
    } else {
                // Log successful verification
                await supabaseClient.functions.invoke('ai-logger', {
                  body: {
                    level: 'info',
                    context: 'custom-domains',
                    message: `Domain verification successful: ${domain.domain_name}`,
                    data: { domainId, domainName: domain.domain_name, successfulMethods: successfulVerifications }
                  }
                });

                // Automatically add verified domain to Vercel
                try {
                  await supabaseClient.functions.invoke('ai-logger', {
                    body: {
                      level: 'info',
                      context: 'custom-domains',
                      message: `Calling vercel-dns function for domain: ${domain.domain_name}`,
                      data: { domainId, domainName: domain.domain_name }
                    }
                  });

                  const vercelResponse = await supabaseClient.functions.invoke('vercel-dns', {
                    body: { domainId: domainId }
                  });
                  
                  await supabaseClient.functions.invoke('ai-logger', {
                    body: {
                      level: 'info',
                      context: 'custom-domains',
                      message: `Vercel DNS automation successful: ${domain.domain_name}`,
                      data: { domainId, domainName: domain.domain_name, vercelResponse }
                    }
                  });
                } catch (vercelError) {
                  console.error('Failed to add domain to Vercel:', vercelError);
                  await supabaseClient.functions.invoke('ai-logger', {
                    body: {
                      level: 'error',
                      context: 'custom-domains',
                      message: `Vercel DNS automation failed: ${domain.domain_name}`,
                      data: { domainId, domainName: domain.domain_name, error: vercelError.message, stack: vercelError.stack }
                    }
                  });
                }
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

// DNS verification functions for multiple providers
async function checkCnameRecordViaGoogleDNS(domainName: string, expectedTarget: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domainName}&type=CNAME`)
    const data = await response.json()
    
    if (data.Answer && data.Answer.length > 0) {
      const cnameRecord = data.Answer.find((record: any) => record.type === 5)
      if (cnameRecord) {
        const target = cnameRecord.data.replace(/\.$/, '') // Remove trailing dot
        return target === expectedTarget
      }
    }
    return false
  } catch (error) {
    console.error('Google DNS check failed:', error)
    return false
  }
}

async function checkCnameRecordViaCloudflareDNS(domainName: string, expectedTarget: string): Promise<boolean> {
  try {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domainName}&type=CNAME`, {
      headers: {
        'Accept': 'application/dns-json'
      }
    })
    const data = await response.json()
    
    if (data.Answer && data.Answer.length > 0) {
      const cnameRecord = data.Answer.find((record: any) => record.type === 5)
      if (cnameRecord) {
        const target = cnameRecord.data.replace(/\.$/, '') // Remove trailing dot
        return target === expectedTarget
      }
    }
    return false
  } catch (error) {
    console.error('Cloudflare DNS check failed:', error)
    return false
  }
}

async function checkCnameRecordViaQuad9DNS(domainName: string, expectedTarget: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.quad9.net:5053/dns-query?name=${domainName}&type=CNAME`, {
      headers: {
        'Accept': 'application/dns-json'
      }
    })
    const data = await response.json()
    
    if (data.Answer && data.Answer.length > 0) {
      const cnameRecord = data.Answer.find((record: any) => record.type === 5)
      if (cnameRecord) {
        const target = cnameRecord.data.replace(/\.$/, '') // Remove trailing dot
        return target === expectedTarget
      }
    }
    return false
  } catch (error) {
    console.error('Quad9 DNS check failed:', error)
    return false
  }
}
