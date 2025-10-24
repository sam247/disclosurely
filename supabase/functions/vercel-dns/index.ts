import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// AI Logger utility
async function logToAI(level: string, message: string, context: any = {}) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    await supabaseClient.functions.invoke('ai-logger', {
      body: {
        level,
        message,
        context: {
          service: 'vercel-dns',
          timestamp: new Date().toISOString(),
          ...context
        }
      }
    })
  } catch (error) {
    console.error('Failed to log to AI:', error)
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VercelDomain {
  id: string
  name: string
  status: string
  created_at: string
}

class VercelDNSManager {
  private apiToken: string
  private teamId: string
  private projectId: string

  constructor(apiToken: string, teamId: string, projectId: string) {
    this.apiToken = apiToken
    this.teamId = teamId
    this.projectId = projectId
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.vercel.com${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Vercel API error: ${response.status} ${error}`)
      throw new Error(`Vercel API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  async addDomainToProject(domainName: string): Promise<VercelDomain> {
    const payload = {
      name: domainName
    }

    const queryParams = new URLSearchParams()
    if (this.teamId) queryParams.append('teamId', this.teamId)

    return this.makeRequest(`/v6/projects/${this.projectId}/domains?${queryParams.toString()}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getProjectDomains(): Promise<VercelDomain[]> {
    const queryParams = new URLSearchParams()
    if (this.teamId) queryParams.append('teamId', this.teamId)

    const response = await this.makeRequest(`/v6/projects/${this.projectId}/domains?${queryParams.toString()}`)
    return response.domains || []
  }

  async getDomain(domainName: string): Promise<VercelDomain> {
    const queryParams = new URLSearchParams()
    if (this.teamId) queryParams.append('teamId', this.teamId)

    return this.makeRequest(`/v6/domains/${domainName}?${queryParams.toString()}`)
  }

  async getDomainConfig(domainName: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (this.teamId) queryParams.append('teamId', this.teamId)

    return this.makeRequest(`/v6/domains/${domainName}/config?${queryParams.toString()}`)
  }

  async verifyDomain(domainName: string): Promise<{ verified: boolean, config?: any }> {
    try {
      const domain = await this.getDomain(domainName)
      const config = await this.getDomainConfig(domainName)
      
      return {
        verified: domain.status === 'verified',
        config: config
      }
    } catch (error) {
      console.error('Domain verification error:', error)
      return { verified: false }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  await logToAI('info', 'Vercel DNS function called', { method: req.method, url: req.url })

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
      await logToAI('error', 'Authentication failed', { error: authError?.message })
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await logToAI('info', 'User authenticated', { userId: user.id })

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

    // Initialize Vercel DNS Manager
    const vercelToken = Deno.env.get('VERCEL_API_TOKEN')
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID')
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID')
    
    await logToAI('info', 'Vercel configuration check', { 
      hasToken: !!vercelToken, 
      hasTeamId: !!vercelTeamId, 
      hasProjectId: !!vercelProjectId,
      projectId: vercelProjectId 
    })
    
    if (!vercelToken || !vercelProjectId) {
      await logToAI('error', 'Vercel integration not configured', { 
        missingToken: !vercelToken, 
        missingProjectId: !vercelProjectId 
      })
      return new Response(
        JSON.stringify({ error: 'Vercel integration not configured. Missing VERCEL_API_TOKEN or VERCEL_PROJECT_ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vercelDNS = new VercelDNSManager(vercelToken, vercelTeamId || '', vercelProjectId)
    await logToAI('info', 'Vercel DNS Manager initialized', { projectId: vercelProjectId })

    switch (method) {
      case 'POST':
        return await handleAutomatedDNS(supabaseClient, profile.organization_id, vercelDNS, req)
      
      case 'GET':
        return await handleCheckDNS(supabaseClient, profile.organization_id, vercelDNS, path)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in vercel-dns function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleAutomatedDNS(supabaseClient: any, organizationId: string, vercelDNS: VercelDNSManager, req: Request) {
  const { domainId } = await req.json()

  await logToAI('info', 'Starting automated DNS process', { domainId, organizationId })

  if (!domainId) {
    await logToAI('error', 'Domain ID missing from request')
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
    await logToAI('error', 'Domain not found in database', { domainId, fetchError: fetchError?.message })
    return new Response(
      JSON.stringify({ error: 'Domain not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  await logToAI('info', 'Domain found in database', { domainName: domain.domain_name, domainStatus: domain.status })

  try {
    // Step 1: Check if domain already exists in project
    console.log(`Checking if domain ${domain.domain_name} exists in Vercel project...`)
    let vercelDomain
    let domainConfig
    
    try {
      await logToAI('info', 'Checking existing project domains', { domainName: domain.domain_name })
      const projectDomains = await vercelDNS.getProjectDomains()
      await logToAI('info', 'Retrieved project domains', { domainCount: projectDomains.length, domains: projectDomains.map(d => d.name) })
      
      const existingDomain = projectDomains.find(d => d.name === domain.domain_name)
      
      if (existingDomain) {
        await logToAI('info', 'Domain already exists in Vercel project', { domainName: domain.domain_name, domainId: existingDomain.id })
        console.log(`Domain already exists in Vercel project:`, existingDomain)
        vercelDomain = existingDomain
      } else {
        // Domain doesn't exist, try to add it to project
        await logToAI('info', 'Adding domain to Vercel project', { domainName: domain.domain_name })
        console.log(`Adding domain ${domain.domain_name} to Vercel project...`)
        
        try {
          vercelDomain = await vercelDNS.addDomainToProject(domain.domain_name)
          await logToAI('info', 'Domain successfully added to Vercel project', { domainName: domain.domain_name, vercelDomain })
          console.log(`Domain added to Vercel project:`, vercelDomain)
        } catch (addError: any) {
          // Check if it's a domain ownership error
          if (addError.message?.includes('Not authorized to use') || addError.message?.includes('forbidden')) {
            await logToAI('info', 'Domain ownership verification required', { domainName: domain.domain_name, error: addError.message })
            
            // Return verification required response
            return new Response(
              JSON.stringify({ 
                success: false,
                message: 'Domain ownership verification required',
                domain: domain,
                verification_required: true,
                verification_config: {
                  cname: {
                    type: 'CNAME',
                    name: 'secure',
                    value: 'secure.disclosurely.com'
                  },
                  txt: {
                    type: 'TXT',
                    name: domain.domain_name,
                    value: 'Please add a TXT record for domain verification. The exact value will be provided by Vercel after domain ownership is verified.'
                  }
                },
                instructions: 'Please add both CNAME and TXT records to verify domain ownership, then try again.'
              }),
              { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } else {
            // Re-throw other errors
            throw addError
          }
        }
      }
      
      // Step 2: Get domain configuration to check verification status
      await logToAI('info', 'Getting domain configuration', { domainName: domain.domain_name })
      const verificationResult = await vercelDNS.verifyDomain(domain.domain_name)
      domainConfig = verificationResult.config
      
      await logToAI('info', 'Domain verification status', { 
        domainName: domain.domain_name, 
        verified: verificationResult.verified,
        config: domainConfig 
      })
      
      if (!verificationResult.verified) {
        // Domain needs verification - provide instructions to user
        await logToAI('info', 'Domain requires verification', { domainName: domain.domain_name, config: domainConfig })
        
        return new Response(
          JSON.stringify({ 
            success: false,
            message: 'Domain added to Vercel but requires verification',
            domain: domain,
            verification_required: true,
            verification_config: domainConfig,
            instructions: 'Please add the required DNS records to verify domain ownership, then try again.'
          }),
          { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
    } catch (error) {
      await logToAI('error', 'Error checking/adding domain to Vercel', { domainName: domain.domain_name, error: error.message })
      console.error('Error checking/adding domain:', error)
      throw error
    }

    // Step 2: Update domain status to active (since Vercel will handle SSL)
    const { data: updatedDomain, error: updateError } = await supabaseClient
      .from('custom_domains')
      .update({
        status: 'active',
        is_active: true,
        last_checked_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', domainId)
      .select()
      .single()

    if (updateError) {
      await logToAI('error', 'Failed to update domain status in database', { domainId, updateError: updateError.message })
      throw updateError
    }

    await logToAI('info', 'Domain successfully configured in Vercel', { 
      domainName: domain.domain_name, 
      domainId, 
      vercelDomainId: vercelDomain.id 
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Domain configured in Vercel successfully. SSL certificate will be provisioned automatically.',
        domain: updatedDomain,
        vercel_domain: vercelDomain,
        verification_config: domainConfig
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    await logToAI('error', 'Vercel DNS automation failed', { 
      domainId, 
      domainName: domain?.domain_name, 
      error: error.message,
      stack: error.stack 
    })
    console.error('Vercel DNS automation error:', error)
    
    // Update domain with error
    await supabaseClient
      .from('custom_domains')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'DNS automation failed',
        last_checked_at: new Date().toISOString()
      })
      .eq('id', domainId)

    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'DNS automation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCheckDNS(supabaseClient: any, organizationId: string, vercelDNS: VercelDNSManager, path: string) {
  const domainId = path

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
    // Check domain verification status in Vercel
    const isVerified = await vercelDNS.verifyDomain(domain.domain_name)

    // Update domain status
    const updateData: any = {
      last_checked_at: new Date().toISOString(),
      status: isVerified ? 'verified' : 'failed',
      error_message: isVerified ? null : 'Domain verification failed'
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
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        verified: isVerified,
        message: isVerified ? 'Domain verified successfully' : 'Domain verification failed',
        domain: updatedDomain,
        vercel_verified: isVerified
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('DNS check error:', error)
    
    // Update domain with error
    await supabaseClient
      .from('custom_domains')
      .update({
        last_checked_at: new Date().toISOString(),
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'DNS check failed'
      })
      .eq('id', domainId)

    return new Response(
      JSON.stringify({ 
        verified: false,
        message: 'DNS check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
