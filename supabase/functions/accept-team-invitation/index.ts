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

  console.log('accept-team-invitation function invoked');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, userId } = await req.json();

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: 'Token and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and validate invitation
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Invalid invitation token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate invitation status
    if (invitation.accepted_at) {
      return new Response(
        JSON.stringify({ error: 'Invitation has already been accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user email to verify it matches invitation (retry for eventual consistency)
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    let userData: any = null;
    let userError: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const res = await supabaseClient.auth.admin.getUserById(userId);
      userData = res.data;
      userError = res.error;
      console.log(`getUserById attempt ${attempt}`, { hasUser: !!userData?.user, error: userError?.message });
      if (userData?.user && !userError) break;
      await wait(400 * attempt);
    }

    if (!userData?.user) {
      console.error('Error fetching user after retries:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userData.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Email does not match invitation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user profile with organization and role
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        organization_id: invitation.organization_id,
        role: invitation.role,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabaseClient
      .from('user_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (acceptError) {
      console.error('Error marking invitation as accepted:', acceptError);
    }

    console.log('Invitation accepted successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        organizationId: invitation.organization_id,
        role: invitation.role 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in accept-team-invitation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
