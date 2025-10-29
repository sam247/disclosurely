// Updated with debugging - v3 (Fixed Vercel API endpoints)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI Logging Helper
async function logToAI(context: string, message: string, data?: any) {
  try {
    const logData = {
      context,
      message,
      data: data || {},
      timestamp: new Date().toISOString(),
      function: 'simple-domain'
    }
    
    console.log('🤖 AI LOG [' + context + ']: ' + message, data ? JSON.stringify(data, null, 2) : '')
    
    // Store in system_logs table for AI analysis
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/system_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        context: context,
        message: message,
        data: data || {},
        level: 'info',
        source: 'edge-function',
        function_name: 'simple-domain'
      })
    })
  } catch (error) {
    console.error('Failed to log to AI:', error)
  }
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

interface DeleteRequest {
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
      const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains`;
      
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
      const url = `https://api.vercel.com/v6/domains/${domain}/config`;
      
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

  async getDomainDNSRecords(domain: string): Promise<{ success: boolean; records?: any[]; error?: string }> {
    try {
      const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains/${domain}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, records: data.records || [] };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to get domain DNS records' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async getDomainInfo(domain: string): Promise<{ success: boolean; domain?: any; error?: string }> {
    try {
      const url = `https://api.vercel.com/v10/domains/${domain}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, domain: data };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to get domain info' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async getProjectDomains(): Promise<{ success: boolean; domains?: any[]; error?: string }> {
    try {
      const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, domains: data.domains || [] };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to get project domains' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async verifyDomain(domain: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const url = `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}/verify`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Domain verified successfully!' };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Failed to verify domain' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async deleteDomain(domain: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // URL encode the domain for the API path
      const encodedDomain = encodeURIComponent(domain);
      const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains/${encodedDomain}`;
      
      console.log(`Deleting domain from Vercel: ${domain} (URL: ${url})`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Vercel DELETE may return 204 No Content for successful deletions
      if (response.status === 204 || response.ok) {
        console.log(`Domain ${domain} successfully deleted from Vercel`);
        return { success: true, message: 'Domain deleted successfully from Vercel!' };
      }
      
      // Try to parse error response
      let errorMessage = 'Failed to delete domain';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error(`Failed to delete domain from Vercel: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage
      };
    } catch (error: any) {
      console.error(`Exception deleting domain from Vercel: ${error.message}`);
      return { 
        success: false, 
        error: error.message || 'Network error while deleting domain'
      };
    }
  }
}

async function handleGenerateRecords(request: GenerateRequest): Promise<{ success: boolean; records?: DNSRecord[]; message?: string }> {
  const { domain } = request;

  console.log('handleGenerateRecords called with:', { domain });
  await logToAI('GENERATE_START', `Starting record generation for domain: ${domain}`)

  if (!domain) {
    console.log('Domain is missing');
    await logToAI('GENERATE_ERROR', 'Domain is missing from request')
    return { success: false, message: 'Domain is required' };
  }

  console.log('Creating Vercel client...');
  const vercelClient = new SimpleVercelClient();

              try {
                // Step 1: Add domain to Vercel project (or get existing domain info)
                console.log(`Adding domain ${domain} to Vercel project...`);
                const addResult = await vercelClient.addDomainToProject(domain);
                console.log('Add domain result:', JSON.stringify(addResult));
                
                // Handle different error cases
                if (!addResult.success) {
                  if (addResult.error?.includes('already in use') || addResult.error?.includes('linked to another Vercel account')) {
                    console.log('Domain already exists or linked to another account - continuing with verification records');
                  } else {
                    console.log('Failed to add domain:', addResult.error);
                    // Don't return error immediately - try to continue and get DNS records
                    console.log('Continuing despite add domain failure...');
                  }
                }

                // Step 2: Get project domains to find verification records
                console.log(`Getting project domains to find verification records...`);
                const projectDomainsResult = await vercelClient.getProjectDomains();
                console.log('Project domains result:', JSON.stringify(projectDomainsResult));
                
                let domainInfoResult = null;
                if (addResult.success) {
                  console.log(`Getting domain info for ${domain}...`);
                  domainInfoResult = await vercelClient.getDomainInfo(domain);
                  console.log('Domain info result:', JSON.stringify(domainInfoResult));
                } else {
                  console.log('Skipping domain info check since domain already exists');
                }

                // Step 3: Get domain configuration for verification records
                console.log(`Getting verification config for ${domain}...`);
                const configResult = await vercelClient.getDomainConfig(domain);
                console.log('Config result:', JSON.stringify(configResult));
                
                // Step 3.5: Get DNS records from Vercel project domains
                console.log(`Getting DNS records for ${domain}...`);
                const dnsRecordsResult = await vercelClient.getDomainDNSRecords(domain);
                console.log('DNS records result:', JSON.stringify(dnsRecordsResult));
                
                // Also try to get the domain from project domains
                console.log(`Getting domain from project domains...`);
                const projectDomainResult = projectDomainsResult.success && projectDomainsResult.domains 
                  ? projectDomainsResult.domains.find(d => d.name === domain)
                  : null;
                console.log('Project domain result:', JSON.stringify(projectDomainResult));
                
                if (!configResult.success) {
                  console.log('Failed to get domain config:', configResult.error);
                  return { 
                    success: false, 
                    message: `Failed to get domain config: ${configResult.error}` 
                  };
                }

                // Step 4: Generate DNS records
                console.log('Generating DNS records...');
                const records: DNSRecord[] = [];

                // Add CNAME record from Vercel DNS records
                console.log('Vercel config response:', JSON.stringify(configResult.config, null, 2));
                console.log('Vercel DNS records response:', JSON.stringify(dnsRecordsResult, null, 2));
                
                // Extract subdomain and root domain from full domain
                // e.g., 'links.yourdomain.com' -> subdomain: 'links', root: 'yourdomain.com'
                const domainParts = domain.split('.');
                const subdomain = domainParts[0];
                const rootDomain = domainParts.slice(1).join('.');
                
                // Look for CNAME record from Vercel API (this is the correct source for multi-tenant SaaS)
                let cnameValue = null;
                
                // Primary source: Vercel API v6 recommendedCNAME field
                if (configResult.config?.recommendedCNAME) {
                  cnameValue = configResult.config.recommendedCNAME;
                  console.log('Found CNAME from Vercel API recommendedCNAME:', cnameValue);
                }
                
                // Secondary source: Check project domain result
                if (!cnameValue && projectDomainResult?.cname) {
                  cnameValue = projectDomainResult.cname;
                  console.log('Found CNAME in project domain:', cnameValue);
                }
                
                // Tertiary source: Check DNS records
                if (!cnameValue && dnsRecordsResult.success && dnsRecordsResult.records && Array.isArray(dnsRecordsResult.records)) {
                  const cnameRecord = dnsRecordsResult.records.find((record: any) => record.type === 'CNAME');
                  if (cnameRecord) {
                    cnameValue = cnameRecord.value;
                    console.log('Found CNAME record in DNS records:', cnameRecord);
                  }
                }
                
                // Use found CNAME or provide error
                if (cnameValue) {
                  console.log('Adding CNAME record from Vercel API');
                  // Use full domain name for CNAME record (e.g., 'links.yourdomain.com')
                  records.push({
                    type: 'CNAME',
                    name: domain,
                    value: cnameValue,
                    ttl: 300
                  });
                } else {
                  console.log('No CNAME record found - this is a critical error for multi-tenant SaaS');
                  return { 
                    success: false, 
                    message: `Failed to get CNAME record for ${domain}. This is required for multi-tenant SaaS operation.` 
                  };
                }

                // Add TXT verification record from project domains (this is the correct source)
                if (projectDomainsResult.success && projectDomainsResult.domains) {
                  const existingDomain = projectDomainsResult.domains.find(d => d.name === domain);
                  console.log('Existing domain verification:', JSON.stringify(existingDomain?.verification));
                  
                  if (existingDomain?.verification && Array.isArray(existingDomain.verification)) {
                    // Handle array of verification records
                    existingDomain.verification.forEach((verification: any) => {
                      if (verification.type === 'TXT') {
                        // Extract string value from potential {rank, value} structure
                        let verificationValue = verification.value;
                        if (typeof verificationValue === 'object' && verificationValue.value) {
                          verificationValue = verificationValue.value;
                        }
                        
                        console.log('Adding TXT verification record from project domains');
                        records.push({
                          type: 'TXT',
                          name: verification.domain || '_vercel',
                          value: String(verificationValue || ''),
                          ttl: 300
                        });
                      }
                    });
                  } else if (existingDomain?.verification?.value) {
                    // Handle single verification record
                    // Extract string value from potential {rank, value} structure
                    let verificationValue = existingDomain.verification.value;
                    if (typeof verificationValue === 'object' && verificationValue.value) {
                      verificationValue = verificationValue.value;
                    }
                    
                    console.log('Adding single TXT verification record from project domains');
                    records.push({
                      type: 'TXT',
                      name: '_vercel',
                      value: String(verificationValue || ''),
                      ttl: 300
                    });
                  }
                }

                // Add TXT verification record from config (fallback)
                if (configResult.config?.verification) {
                  // Extract string value from potential {rank, value} structure
                  let verificationValue = configResult.config.verification.value;
                  if (typeof verificationValue === 'object' && verificationValue.value) {
                    verificationValue = verificationValue.value;
                  }
                  
                  console.log('Adding TXT verification record from config (fallback)');
                  records.push({
                    type: 'TXT',
                    name: domain,
                    value: String(verificationValue || ''),
                    ttl: 300
                  });
                }

                // Add TXT verification record from domain info (fallback)
                if (domainInfoResult?.domain?.verification) {
                  // Extract string value from potential {rank, value} structure
                  let verificationValue = domainInfoResult.domain.verification.value;
                  if (typeof verificationValue === 'object' && verificationValue.value) {
                    verificationValue = verificationValue.value;
                  }
                  
                  console.log('Adding TXT verification record from domain info (fallback)');
                  records.push({
                    type: 'TXT',
                    name: domain,
                    value: String(verificationValue || ''),
                    ttl: 300
                  });
                }

                // If no verification records found, check if domain is already verified
                if (records.length === 1) {
                  console.log('No verification records found - checking if domain is already verified');
                  
                  // Check if domain is already verified by trying to get its status
                  const domainStatusResult = await vercelClient.getDomainInfo(domain);
                  if (domainStatusResult?.domain?.verified) {
                    console.log('Domain is already verified - no TXT record needed');
                    records.push({
                      type: 'TXT',
                      name: '_vercel',
                      value: 'Domain already verified - no TXT record needed',
                      ttl: 300
                    });
                  } else {
                    console.log('Domain not verified - may need manual verification');
                    records.push({
                      type: 'TXT',
                      name: '_vercel',
                      value: 'Domain verification required - check Vercel dashboard for TXT record',
                      ttl: 300
                    });
                  }
                }

    console.log(`Generated ${records.length} DNS records for ${domain}:`, JSON.stringify(records));
    
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
    await logToAI('VERIFY_ERROR', 'Domain is required for verification')
    return { success: false, message: 'Domain is required' };
  }

  await logToAI('VERIFY_STEP1', `Starting Vercel API verification for domain: ${domain}`)
    console.log('Attempting to verify domain ' + domain + ' with Vercel API...');
  const vercelClient = new SimpleVercelClient();
  const vercelVerifyResult = await vercelClient.verifyDomain(domain);

  if (!vercelVerifyResult.success) {
    await logToAI('VERIFY_ERROR', `Vercel API verification failed for domain: ${domain}`, { error: vercelVerifyResult.error })
    console.error('Vercel API verification failed:', vercelVerifyResult.error);
    return {
      success: false,
      message: `Vercel verification failed: ${vercelVerifyResult.error}. Please ensure all DNS records are added correctly and try again.`
    };
  }
  
  await logToAI('VERIFY_SUCCESS', `Vercel API verification successful for domain: ${domain}`)
  console.log('Vercel API verification successful.');
  
  return {
    success: true,
    message: `Domain ${domain} is properly configured and ready to use!`
  };
}

async function handleDeleteDomain(request: DeleteRequest): Promise<{ success: boolean; message: string }> {
  const { domain } = request;

  if (!domain) {
    await logToAI('DELETE_ERROR', 'Domain is required for deletion')
    return { success: false, message: 'Domain is required' };
  }

  await logToAI('DELETE_START', `Starting domain deletion for domain: ${domain}`)
  console.log('Attempting to delete domain ' + domain + ' from Vercel...');
  
  const vercelClient = new SimpleVercelClient();
  
  // Step 1: Delete from Vercel
  const vercelDeleteResult = await vercelClient.deleteDomain(domain);
  
  if (!vercelDeleteResult.success) {
    // If domain doesn't exist in Vercel, continue with database cleanup
    if (vercelDeleteResult.error?.includes('not found') || vercelDeleteResult.error?.includes('does not exist')) {
      await logToAI('DELETE_WARNING', `Domain not found in Vercel, continuing with database cleanup: ${domain}`, { error: vercelDeleteResult.error })
      console.log('Domain not found in Vercel, continuing with database cleanup...');
    } else {
      await logToAI('DELETE_ERROR', `Vercel API deletion failed for domain: ${domain}`, { error: vercelDeleteResult.error })
      console.error('Vercel API deletion failed:', vercelDeleteResult.error);
      return {
        success: false,
        message: `Failed to delete domain from Vercel: ${vercelDeleteResult.error}`
      };
    }
  } else {
    await logToAI('DELETE_VERCEL_SUCCESS', `Domain successfully deleted from Vercel: ${domain}`)
    console.log('Domain successfully deleted from Vercel.');
  }
  
  // Step 2: Delete from database
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use domain_name column (as per database schema)
    const encodedDomain = encodeURIComponent(domain);
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/custom_domains?domain_name=eq.${encodedDomain}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      await logToAI('DELETE_ERROR', `Database deletion failed for domain: ${domain}`, { status: deleteResponse.status, error: errorText })
      console.error('Database deletion failed:', deleteResponse.status, errorText);
      return {
        success: false,
        message: `Domain removed from Vercel but failed to remove from database. Please contact support.`
      };
    }
    
    const deletedData = await deleteResponse.json();
    console.log(`Deleted ${deletedData?.length || 0} record(s) from database for domain: ${domain}`);
    
    await logToAI('DELETE_SUCCESS', `Domain successfully deleted: ${domain}`)
    console.log('Domain successfully deleted from both Vercel and database.');
    
    return {
      success: true,
      message: `Domain ${domain} has been completely removed from the system!`
    };
    
  } catch (error) {
    await logToAI('DELETE_ERROR', `Database deletion error for domain: ${domain}`, { error: error.message })
    console.error('Database deletion error:', error);
    return {
      success: false,
      message: `Domain removed from Vercel but database cleanup failed: ${error.message}`
    };
  }
}

async function checkCnameRecord(domain: string): Promise<boolean> {
  try {
    console.log(`Checking CNAME record for secure.${domain}`);
    
    // Try multiple DNS providers for better reliability
    const dnsProviders = [
      `https://dns.google/resolve?name=secure.${domain}&type=CNAME`,
      `https://cloudflare-dns.com/dns-query?name=secure.${domain}&type=CNAME`,
      `https://dns.quad9.net:5053/dns-query?name=secure.${domain}&type=CNAME`
    ];
    
    for (const url of dnsProviders) {
      try {
        console.log(`Trying DNS provider: ${url}`);
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/dns-json'
          }
        });
        const data = await response.json();
        
        console.log(`DNS response from ${url}:`, JSON.stringify(data));
        
        if (data.Answer && data.Answer.length > 0) {
          const cnameValue = data.Answer[0].data;
          console.log(`Found CNAME value: ${cnameValue}`);
          
          // Check if it points to our target (with or without trailing dot)
          if (cnameValue === 'secure.disclosurely.com.' || cnameValue === 'secure.disclosurely.com') {
            console.log('CNAME record found and correct!');
            return true;
          }
        }
      } catch (providerError) {
        console.log(`DNS provider ${url} failed:`, providerError.message);
        continue;
      }
    }
    
    console.log('No DNS provider found the CNAME record');
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
    console.log('Simple domain function called');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { action, domain } = body;
    
    await logToAI('REQUEST_START', `Processing ${action} for domain: ${domain}`, { action, domain })

    if (action === 'generate') {
      console.log('Handling generate action');
      await logToAI('GENERATE_START', `Starting record generation for domain: ${domain}`)
      const result = await handleGenerateRecords(body);
      console.log('Generate result:', JSON.stringify(result));
      await logToAI('GENERATE_COMPLETE', `Record generation completed for domain: ${domain}`, result)
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'verify') {
      console.log('Handling verify action');
      await logToAI('VERIFY_START', `Starting domain verification for domain: ${domain}`)
      const result = await handleVerifyDomain(body);
      console.log('Verify result:', JSON.stringify(result));
      await logToAI('VERIFY_COMPLETE', `Domain verification completed for domain: ${domain}`, result)
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'delete') {
      console.log('Handling delete action');
      await logToAI('DELETE_START', `Starting domain deletion for domain: ${domain}`)
      const result = await handleDeleteDomain(body);
      console.log('Delete result:', JSON.stringify(result));
      await logToAI('DELETE_COMPLETE', `Domain deletion completed for domain: ${domain}`, result)
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Invalid action:', action);
    await logToAI('ERROR', `Invalid action received: ${action}`, { action, domain })
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    await logToAI('ERROR', `Unexpected error in simple-domain function`, { error: error.message, stack: error.stack })
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
