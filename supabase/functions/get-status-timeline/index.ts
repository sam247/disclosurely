import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// Restrict CORS for authenticated endpoints
const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedExact = [
    'https://disclosurely.com',
    'https://www.disclosurely.com',
    'http://localhost:8080',
    'http://localhost:5173',
  ];
  if (allowedExact.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return host.endsWith('.lovable.app') || host.endsWith('.lovableproject.com');
  } catch {
    return false;
  }
};

const getAllowedOrigin = (req: Request): string => {
  const origin = req.headers.get('origin');
  return isAllowedOrigin(origin) ? (origin as string) : 'https://disclosurely.com';
};

const getCorsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

// UUID validation helper
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reportId } = await req.json();

    // Validate UUID format
    if (!reportId || !isValidUUID(reportId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to this report through organization membership
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, organization_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Report access check failed:', reportError);
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is member of report's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('id', user.id)
      .eq('organization_id', report.organization_id)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      console.error('Organization membership check failed:', profileError);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch status changes from audit logs - now protected by RLS
    const { data: statusChanges, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        event_type,
        action,
        summary,
        description,
        metadata,
        created_at,
        actor_type
      `)
      .eq('event_type', 'status_change')
      .eq('target_type', 'report')
      .eq('target_id', reportId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching status changes:', error);
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data for the frontend
    const timeline = statusChanges?.map(change => ({
      id: change.id,
      old_status: change.metadata?.old_status || '',
      new_status: change.metadata?.new_status || '',
      changed_at: change.created_at,
      actor_type: change.actor_type,
      summary: change.summary
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true,
        timeline 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-status-timeline:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
