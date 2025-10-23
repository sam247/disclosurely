import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { reportId } = await req.json();

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch status changes from audit logs
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
        JSON.stringify({ error: 'Failed to fetch status changes' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
