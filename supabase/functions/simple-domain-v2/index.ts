import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

console.log('[simple-domain-v2] Loaded');

// Domain validation - basic format check
function isValidDomain(domain: string): boolean {
  // RFC-compliant domain regex (allows subdomains, hyphens, but not underscores or spaces)
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

// Domain parsing helper - handles apex domains and multi-level subdomains
function parseDomain(fullDomain: string): { subdomain: string; rootDomain: string } {
  const parts = fullDomain.split('.');
  
  // Handle apex domains (e.g., "example.com")
  if (parts.length === 2) {
    return {
      subdomain: '@', // @ represents apex/root
      rootDomain: fullDomain,
    };
  }
  
  // Handle subdomains (e.g., "app.example.com", "team.app.example.com")
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const rootDomain = parts.slice(1).join('.');
    return { subdomain, rootDomain };
  }
  
  // Fallback for single-part domains (shouldn't happen but be safe)
  return {
    subdomain: fullDomain,
    rootDomain: fullDomain,
  };
}

// Vercel API helper
class VercelClient {
  private token: string;
  private projectId: string;

  constructor() {
    this.token = Deno.env.get('VERCEL_API_TOKEN') || '';
    this.projectId = Deno.env.get('VERCEL_PROJECT_ID') || '';
  }

  async addDomain(domain: string) {
    const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    const data = await response.json();
    return { success: response.ok, verification: data.verification, error: data.error?.message };
  }

  async verifyDomain(domain: string) {
    const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains/${encodeURIComponent(domain)}/verify`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return { success: response.ok, verified: data.verified, error: data.error?.message };
  }

  async deleteDomain(domain: string) {
    const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains/${encodeURIComponent(domain)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return { success: response.ok || response.status === 404 };
  }

  async getDomainConfig(domain: string) {
    const url = `https://api.vercel.com/v10/projects/${this.projectId}/domains/${encodeURIComponent(domain)}/config`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return { success: response.ok, config: data, error: data.error?.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { status: 200, headers: corsHeaders });
  }

  // 🔒 Rate limiting: 10 domain operations per 10 seconds per IP
  const rateLimit = await checkRateLimit(req, rateLimiters.domainOperations)
  if (!rateLimit.success) {
    console.warn('⚠️ Rate limit exceeded for domain operations')
    return rateLimitResponse(rateLimit, corsHeaders)
  }

  try {
    const body = await req.json();
    const { action, domain } = body;
    console.log(`[${action}] for ${domain}`);

    const vercel = new VercelClient();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, supabaseKey);

    // GENERATE RECORDS
    if (action === 'generate') {
      // Validate domain format
      if (!isValidDomain(domain)) {
        console.error(`Invalid domain format: ${domain}`);
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid domain format. Please enter a valid domain (e.g., app.example.com)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get user's organization to check domain ownership
      const authHeader = req.headers.get('Authorization');
      let userOrgId: string | null = null;
      
      if (authHeader) {
        const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await authClient.auth.getUser();
        
        if (user) {
          const { data: profile } = await authClient.from('profiles').select('organization_id').eq('id', user.id).single();
          userOrgId = profile?.organization_id || null;
        }
      }
      
      // Check if domain already exists and belongs to a different organization
      const { data: existingDomain, error: domainCheckError } = await db
        .from('custom_domains')
        .select('id, organization_id')
        .eq('domain_name', domain)
        .maybeSingle();
      
      // If domain exists and belongs to a different organization, reject
      if (existingDomain && userOrgId && existingDomain.organization_id !== userOrgId) {
        console.error(`Domain ${domain} already registered to another organization`);
        return new Response(
          JSON.stringify({ success: false, message: 'This domain is already registered to another organization. Please use a different domain.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If domain exists for this organization, allow regeneration (user might need to update DNS records)
      if (existingDomain && userOrgId && existingDomain.organization_id === userOrgId) {
        console.log(`Domain ${domain} already exists for this organization, allowing record regeneration`);
      }
      
      console.log(`Adding domain ${domain} to Vercel project...`);
      const result = await vercel.addDomain(domain);
      console.log(`Vercel result:`, JSON.stringify(result, null, 2));
      
      // Extract records from verification (will exist even if domain already exists or if there's an error)
      const records = [];
      let verification = result.verification;
      
      // If domain already exists in Vercel, try to get verification from domain config
      if (!result.success && result.error && result.error.includes('already exists')) {
        console.log(`Domain already exists in Vercel, fetching config for verification data...`);
        try {
          const configResult = await vercel.getDomainConfig(domain);
          if (configResult.success && configResult.config) {
            // Use config data if verification wasn't returned
            if (!verification && configResult.config.verification) {
              verification = configResult.config.verification;
            }
          }
        } catch (configError) {
          console.warn('Could not fetch domain config:', configError);
        }
      }
      
      // Try to get domain config to retrieve actual CNAME value
      let cnameValue: string | null = null;
      try {
        const configResult = await vercel.getDomainConfig(domain);
        if (configResult.success && configResult.config?.recommendedCNAME) {
          cnameValue = configResult.config.recommendedCNAME;
          console.log(`Found CNAME from domain config: ${cnameValue}`);
        }
      } catch (configError) {
        console.warn('Could not fetch domain config, will use fallback CNAME:', configError);
      }
      
      if (verification) {
        // Handle TXT record
        if (verification.txt) {
          const txtValue = typeof verification.txt === 'object' && verification.txt.value 
            ? verification.txt.value 
            : verification.txt;
          records.push({
            type: 'TXT',
            name: '_vercel',
            value: txtValue,
          });
        }
        
        // Handle A record
        if (verification.value) {
          records.push({
            type: 'A',
            name: '@',
            value: verification.value,
          });
        }
        
        // Handle CNAME - use actual value from config if available, otherwise use verification.cname or fallback
        if (verification.cname || cnameValue) {
          const subdomain = domain.split('.')[0];
          const finalCnameValue = cnameValue || (typeof verification.cname === 'string' ? verification.cname : 'cname.vercel-dns.com');
          records.push({
            type: 'CNAME',
            name: subdomain,
            value: finalCnameValue,
          });
          console.log(`Added CNAME record: ${subdomain} -> ${finalCnameValue}`);
        }
      }
      
      // Always generate at least a CNAME record, even if Vercel API fails or returns no verification
      // This allows users to manually configure DNS even if the domain can't be added to Vercel yet
      if (records.length === 0) {
        const subdomain = domain.split('.')[0];
        const fallbackCname = cnameValue || 'cname.vercel-dns.com';
        records.push({
          type: 'CNAME',
          name: subdomain,
          value: fallbackCname,
        });
        console.log(`Generated fallback CNAME record for ${subdomain} -> ${fallbackCname}`);
      }
      
      // If domain addition failed and it's not because it already exists, log warning but still return records
      if (!result.success && result.error && !result.error.includes('already exists')) {
        const errorMsg = result.error || 'Failed to add domain to Vercel';
        console.warn(`Domain addition failed: ${errorMsg}, but returning records for manual configuration`);
        // Don't return error - still provide records so user can configure DNS manually
      }

      return new Response(
        JSON.stringify({ success: true, records, message: 'Records generated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VERIFY DOMAIN
    if (action === 'verify') {
      console.log(`Verifying domain ${domain} with Vercel...`);
      const result = await vercel.verifyDomain(domain);
      console.log(`Vercel verification result:`, JSON.stringify(result, null, 2));
      
      if (result.success && result.verified) {
        console.log('Domain verified! Updating database...');
        // Update database
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } },
          });
          const { data: { user } } = await authClient.auth.getUser();
          
          if (user) {
            const { data: profile } = await authClient.from('profiles').select('organization_id').eq('id', user.id).single();
            
            if (profile?.organization_id) {
              console.log(`Saving domain for organization ${profile.organization_id}`);
              
              // Check if there are any other primary domains
              const { data: existingPrimary } = await db
                .from('custom_domains')
                .select('id')
                .eq('organization_id', profile.organization_id)
                .eq('is_primary', true)
                .neq('domain_name', domain)
                .single();
              
              const isPrimary = !existingPrimary; // Only set as primary if no other primary exists
              
              // Parse subdomain and root domain using helper function
              const { subdomain, rootDomain } = parseDomain(domain);
              
              const { data: savedDomain, error: dbError } = await db.from('custom_domains').upsert({
                domain_name: domain,
                subdomain: subdomain,
                root_domain: rootDomain,
                organization_id: profile.organization_id,
                status: 'active',
                is_active: true,
                is_primary: isPrimary,
                verified_at: new Date().toISOString(),
              }, {
                onConflict: 'domain_name',
                ignoreDuplicates: false
              }).select().single();
              
              if (dbError) {
                console.error('Database save failed, rolling back from Vercel:', dbError);
                // ROLLBACK: Delete from Vercel since DB save failed
                await vercel.deleteDomain(domain);
                return new Response(
                  JSON.stringify({ success: false, message: 'Failed to save domain configuration. Please try again.' }),
                  { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              } else {
                console.log('Domain saved successfully:', savedDomain);
              }
            }
          }
        }
      }

      // Provide more specific error message when verification fails
      const message = result.verified 
        ? 'Domain verified and activated!' 
        : (result.error || 'Records not detected. Please ensure DNS records are correctly configured and wait 5-10 minutes for DNS propagation.');

      return new Response(
        JSON.stringify({ success: result.verified, message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE DOMAIN
    if (action === 'delete') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify ownership
      const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: profile } = await authClient.from('profiles').select('organization_id').eq('id', user.id).single();
      if (!profile?.organization_id) {
        return new Response(
          JSON.stringify({ success: false, message: 'No organization found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete from Vercel
      await vercel.deleteDomain(domain);

      // Delete from database
      await db.from('custom_domains').delete().eq('domain_name', domain).eq('organization_id', profile.organization_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Domain deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIST DOMAINS
    if (action === 'list-domains') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: profile } = await authClient.from('profiles').select('organization_id').eq('id', user.id).single();
      if (!profile?.organization_id) {
        return new Response(
          JSON.stringify({ success: false, domains: [], organizationId: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: domains } = await db.from('custom_domains')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({ success: true, domains: domains || [], organizationId: profile.organization_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

