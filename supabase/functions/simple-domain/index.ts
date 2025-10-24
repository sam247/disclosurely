import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

interface GenerateRequest {
  domain: string;
}

interface VerifyRequest {
  domain: string;
}

// Simple Vercel API client
class SimpleVercelClient {
  private apiToken: string;
  private projectId: string;

  constructor() {
    this.apiToken = Deno.env.get('VERCEL_API_TOKEN') || '';
    this.projectId = Deno.env.get('VERCEL_PROJECT_ID') || '';
  }

  async addDomainToProject(domain: string): Promise<{ success: boolean; verification?: any; error?: string }> {
    try {
      const url = `https://api.vercel.com/v6/projects/${this.projectId}/domains?teamId=${Deno.env.get('VERCEL_TEAM_ID') || ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          verification: data.verification 
        };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to add domain to Vercel' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async getDomainConfig(domain: string): Promise<{ success: boolean; config?: any; error?: string }> {
    try {
      const url = `https://api.vercel.com/v6/domains/${domain}/config?teamId=${Deno.env.get('VERCEL_TEAM_ID') || ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, config: data };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to get domain config' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

async function handleGenerateRecords(request: GenerateRequest): Promise<{ success: boolean; records?: DNSRecord[]; message?: string }> {
  const { domain } = request;

  if (!domain) {
    return { success: false, message: 'Domain is required' };
  }

  const vercelClient = new SimpleVercelClient();

  try {
    // Step 1: Add domain to Vercel project
    console.log(`Adding domain ${domain} to Vercel project...`);
    const addResult = await vercelClient.addDomainToProject(domain);
    
    if (!addResult.success) {
      return { 
        success: false, 
        message: `Failed to add domain to Vercel: ${addResult.error}` 
      };
    }

    // Step 2: Get domain configuration for verification records
    console.log(`Getting verification config for ${domain}...`);
    const configResult = await vercelClient.getDomainConfig(domain);
    
    if (!configResult.success) {
      return { 
        success: false, 
        message: `Failed to get domain config: ${configResult.error}` 
      };
    }

    // Step 3: Generate DNS records
    const records: DNSRecord[] = [
      {
        type: 'CNAME',
        name: 'secure',
        value: 'secure.disclosurely.com',
        ttl: 300
      }
    ];

    // Add TXT verification record if available
    if (configResult.config?.verification) {
      records.push({
        type: 'TXT',
        name: domain,
        value: configResult.config.verification.value,
        ttl: 300
      });
    }

    console.log(`Generated ${records.length} DNS records for ${domain}`);
    
    return {
      success: true,
      records: records
    };

  } catch (error) {
    console.error('Error generating records:', error);
    return { 
      success: false, 
      message: `Error generating records: ${error.message}` 
    };
  }
}

async function handleVerifyDomain(request: VerifyRequest): Promise<{ success: boolean; message: string }> {
  const { domain } = request;

  if (!domain) {
    return { success: false, message: 'Domain is required' };
  }

  try {
    // Simple DNS check - verify CNAME record
    const cnameRecord = await checkCnameRecord(domain);
    
    if (cnameRecord) {
      return {
        success: true,
        message: `Domain ${domain} is properly configured and ready to use!`
      };
    } else {
      return {
        success: false,
        message: `CNAME record not found for ${domain}. Please ensure you've added the DNS records correctly.`
      };
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    return {
      success: false,
      message: `Error verifying domain: ${error.message}`
    };
  }
}

async function checkCnameRecord(domain: string): Promise<boolean> {
  try {
    // Use Google DNS to check CNAME record
    const response = await fetch(`https://dns.google/resolve?name=secure.${domain}&type=CNAME`);
    const data = await response.json();
    
    if (data.Answer && data.Answer.length > 0) {
      const cnameValue = data.Answer[0].data;
      return cnameValue === 'secure.disclosurely.com.';
    }
    
    return false;
  } catch (error) {
    console.error('DNS check error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'generate') {
      const result = await handleGenerateRecords(body);
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'verify') {
      const result = await handleVerifyDomain(body);
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
