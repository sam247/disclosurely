import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VercelDNSRecord {
  id: string
  name: string
  type: string
  value: string
  ttl: number
  created_at: string
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

  constructor(apiToken: string, teamId: string) {
    this.apiToken = apiToken
    this.teamId = teamId
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
      throw new Error(`Vercel API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  async addDomain(domainName: string): Promise<VercelDomain> {
    const payload = {
      name: domainName,
      ...(this.teamId && { teamId: this.teamId })
    }

    return this.makeRequest('/v10/domains', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getDomain(domainName: string): Promise<VercelDomain> {
    return this.makeRequest(`/v10/domains/${domainName}${this.teamId ? `?teamId=${this.teamId}` : ''}`)
  }

  async addDNSRecord(domainName: string, record: {
    type: string
    name: string
    value: string
    ttl?: number
  }): Promise<VercelDNSRecord> {
    const payload = {
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl || 300,
      ...(this.teamId && { teamId: this.teamId })
    }

    return this.makeRequest(`/v10/domains/${domainName}/records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getDNSRecords(domainName: string): Promise<VercelDNSRecord[]> {
    const response = await this.makeRequest(`/v10/domains/${domainName}/records${this.teamId ? `?teamId=${this.teamId}` : ''}`)
    return response.records || []
  }

  async deleteDNSRecord(domainName: string, recordId: string): Promise<void> {
    await this.makeRequest(`/v10/domains/${domainName}/records/${recordId}${this.teamId ? `?teamId=${this.teamId}` : ''}`, {
      method: 'DELETE',
    })
  }

  async verifyDomain(domainName: string): Promise<boolean> {
    try {
      const domain = await this.getDomain(domainName)
      return domain.status === 'verified'
    } catch (error) {
      console.error('Domain verification error:', error)
      return false
    }
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

    // Initialize Vercel DNS Manager
    const vercelToken = Deno.env.get('VERCEL_API_TOKEN')
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID')
    
    if (!vercelToken) {
      return new Response(
        JSON.stringify({ error: 'Vercel integration not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vercelDNS = new VercelDNSManager(vercelToken, vercelTeamId || '')

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
    // Step 1: Check if domain already exists in Vercel
    console.log(`Checking if domain ${domain.domain_name} exists in Vercel...`)
    let vercelDomain
    try {
      vercelDomain = await vercelDNS.getDomain(domain.domain_name)
      console.log(`Domain already exists in Vercel:`, vercelDomain)
    } catch (error) {
      // Domain doesn't exist, add it
      console.log(`Adding domain ${domain.domain_name} to Vercel...`)
      vercelDomain = await vercelDNS.addDomain(domain.domain_name)
      console.log(`Domain added to Vercel:`, vercelDomain)
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
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Domain configured in Vercel successfully. SSL certificate will be provisioned automatically.',
        domain: updatedDomain,
        vercel_domain: vercelDomain
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
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
    
    // Get DNS records to verify CNAME
    const records = await vercelDNS.getDNSRecords(domain.domain_name)
    const cnameRecord = records.find(record => 
      record.type === 'CNAME' && 
      record.name === domain.domain_name &&
      record.value === 'secure.disclosurely.com'
    )

    const isCNAMEValid = !!cnameRecord
    const overallStatus = isVerified && isCNAMEValid

    // Update domain status
    const updateData: any = {
      last_checked_at: new Date().toISOString(),
      status: overallStatus ? 'verified' : 'failed',
      error_message: overallStatus ? null : 'Domain verification or CNAME record not found'
    }

    if (overallStatus) {
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
        verified: overallStatus,
        message: overallStatus ? 'Domain verified successfully' : 'Domain verification failed',
        domain: updatedDomain,
        vercel_verified: isVerified,
        cname_valid: isCNAMEValid,
        records: records
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
