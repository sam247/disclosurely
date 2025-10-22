import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Missing access token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid user session' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = userData.user.id;

    const { reportId } = await req.json();
    if (!reportId) {
      return new Response(JSON.stringify({ error: 'reportId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, organization_id, deleted_at, deleted_by')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load user profile and verify permissions using user_roles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, 
        organization_id, 
        is_active,
        user_roles!left(role, is_active)
      `)
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('Profile query error:', profileError);
      console.log('Profile data:', profile);
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const allowedRoles = ['admin', 'case_handler', 'org_admin'];
    const userRole = profile.user_roles?.find((ur: any) => ur.is_active)?.role;
    if (!profile.is_active || profile.organization_id !== report.organization_id || !userRole || !allowedRoles.includes(userRole)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Idempotent: already deleted
    if (report.deleted_at) {
      return new Response(JSON.stringify({ success: true, alreadyDeleted: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 1: set deleted_by
    const { error: setByError } = await supabaseAdmin
      .from('reports')
      .update({ deleted_by: userId, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .is('deleted_at', null);

    if (setByError) {
      console.error('Failed to set deleted_by:', setByError);
      return new Response(JSON.stringify({ error: 'Failed to update report (deleter step)', details: setByError }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 2: set deleted_at
    const { error: setAtError } = await supabaseAdmin
      .from('reports')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .is('deleted_at', null);

    if (setAtError) {
      console.error('Failed to set deleted_at:', setAtError);
      return new Response(JSON.stringify({ error: 'Failed to delete report', details: setAtError }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('soft-delete-report error:', err);
    // Ensure we always return JSON
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});