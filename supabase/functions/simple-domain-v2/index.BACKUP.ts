import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

console.log('[simple-domain-v2] Loaded');

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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { status: 200, headers: corsHeaders });
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
      console.log(`Adding domain ${domain} to Vercel project...`);
      const result = await vercel.addDomain(domain);
      console.log(`Vercel result:`, JSON.stringify(result, null, 2));
      
      // If domain already exists, that's OK - we just need the verification records
      if (!result.success && result.error && !result.error.includes('already exists')) {
        const errorMsg = result.error || 'Failed to add domain to Vercel';
        console.error(`Domain addition failed: ${errorMsg}`);
        return new Response(
          JSON.stringify({ success: false, message: errorMsg }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract records from verification (will exist even if domain already exists)
      const records = [];
      const verification = result.verification;
      
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
        
        // Handle CNAME
        if (verification.cname) {
          records.push({
            type: 'CNAME',
            name: domain.split('.')[0],
            value: 'cname.vercel-dns.com',
          });
        }
      }
      
      if (records.length === 0) {
        records.push({
          type: 'CNAME',
          name: domain.split('.')[0],
          value: 'cname.vercel-dns.com',
        });
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
              
              // Parse subdomain and root domain
              const domainParts = domain.split('.');
              const subdomain = domainParts[0];
              const rootDomain = domainParts.slice(1).join('.');
              
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
                console.error('Database error:', dbError);
              } else {
                console.log('Domain saved successfully:', savedDomain);
              }
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: result.verified, message: result.verified ? 'Domain verified and activated!' : 'Verification pending' }),
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

