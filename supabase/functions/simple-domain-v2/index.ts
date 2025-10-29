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
      const result = await vercel.addDomain(domain);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, message: result.error || 'Failed to add domain' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract records from verification
      const records = [];
      if (result.verification) {
        for (const [key, value] of Object.entries(result.verification)) {
          if (key === 'type' || key === 'domain' || key === 'reason') continue;
          
          const recordValue = typeof value === 'object' && value !== null && 'value' in value 
            ? String((value as any).value) 
            : String(value);
          
          records.push({
            type: key.toUpperCase(),
            name: domain,
            value: recordValue,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, records, message: 'Records generated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VERIFY DOMAIN
    if (action === 'verify') {
      const result = await vercel.verifyDomain(domain);
      
      if (result.success && result.verified) {
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
              await db.from('custom_domains').upsert({
                domain_name: domain,
                organization_id: profile.organization_id,
                status: 'active',
                is_active: true,
                is_primary: true,
                verified_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: result.verified, message: result.verified ? 'Domain verified!' : 'Verification pending' }),
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

