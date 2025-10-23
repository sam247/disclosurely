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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Create clients for different operations
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);

    const { token, userId } = await req.json();
    console.log('accept-team-invitation function invoked with:', { token, userId });

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: 'Token and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and validate invitation using service client to bypass RLS safely
    const { data: invitation, error: invitationError } = await supabaseServiceClient
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let resolvedUserId: string | null = null;
    let userData: any = null;
    let userError: any = null;

    for (let attempt = 1; attempt <= 10; attempt++) {
      const res = await supabaseServiceClient.auth.admin.getUserById(userId);
      userData = res.data;
      userError = res.error;
      console.log('getUserById attempt', attempt, { hasUser: !!userData?.user, error: userError?.message });
      if (userData?.user && !userError) {
        resolvedUserId = userData.user.id;
        break;
      }
      await wait(500 * attempt);
    }

    if (!resolvedUserId) {
      console.warn('Falling back to resolve user via profiles by email');
      const { data: existingProfile, error: profileLookupError } = await supabaseServiceClient
        .from('profiles')
        .select('id, email')
        .eq('email', invitation.email)
        .maybeSingle();

      if (profileLookupError) {
        console.error('Profile lookup error (fallback):', profileLookupError);
      }

      if (existingProfile?.id) {
        resolvedUserId = existingProfile.id;
      } else if (uuidRegex.test(userId)) {
        // Last resort: trust that the provided ID is a valid UUID (token already verified)
        resolvedUserId = userId;
      } else {
        return new Response(
          JSON.stringify({ error: 'Unable to resolve user for invitation' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If we have user data, verify email matches the invitation as an integrity check
    if (userData?.user?.email && (userData.user.email.toLowerCase() !== invitation.email.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Email does not match invitation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert user profile with organization (service role bypasses RLS)
    const { error: profileError } = await supabaseServiceClient
      .from('profiles')
      .upsert({
        id: resolvedUserId,
        email: invitation.email,
        organization_id: invitation.organization_id,
        is_active: true,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating user role entry for:', {
      userId: resolvedUserId,
      organizationId: invitation.organization_id,
      role: invitation.role
    });

    // Create user role entry (handle existing roles)
    const { error: roleError } = await supabaseServiceClient
      .from('user_roles')
      .upsert({
        user_id: resolvedUserId,
        organization_id: invitation.organization_id,
        role: invitation.role,
        is_active: true,
        granted_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,role,organization_id',
        ignoreDuplicates: false 
      });

    console.log('User role creation result:', { roleError });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark invitation as accepted (using service client for admin operations)
    const { error: acceptError } = await supabaseServiceClient
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
