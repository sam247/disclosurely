import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { organizationId, invitationId } = await req.json();

    if (!organizationId || !invitationId) {
      return new Response(JSON.stringify({ error: "Missing organizationId or invitationId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get organization admin's subscription
    const { data: orgAdmins } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("role", "org_admin")
      .eq("is_active", true)
      .limit(1);

    if (!orgAdmins || orgAdmins.length === 0) {
      return new Response(JSON.stringify({ allowed: false, reason: "No organization admin found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const adminUserId = orgAdmins[0].user_id;

    // Get admin's profile to get email
    const { data: adminProfile } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("id", adminUserId)
      .single();

    if (!adminProfile?.email) {
      return new Response(JSON.stringify({ allowed: false, reason: "Admin profile not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get subscription tier
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("subscription_tier, subscribed")
      .eq("email", adminProfile.email)
      .maybeSingle();

    if (!subscriber || !subscriber.subscribed) {
      return new Response(JSON.stringify({ allowed: false, reason: "No active subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Determine max team members based on tier
    const maxTeamMembers = subscriber.subscription_tier === 'basic' ? 5 : 
                          subscriber.subscription_tier === 'pro' ? 20 : 0;

    // Count current team members
    const { count: currentTeamCount } = await supabaseClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    // Count pending invitations (excluding the current one being accepted)
    const { count: pendingInvitationsCount } = await supabaseClient
      .from("user_invitations")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .neq("id", invitationId);

    const totalTeamSize = (currentTeamCount || 0) + (pendingInvitationsCount || 0);

    const allowed = maxTeamMembers === 0 || totalTeamSize < maxTeamMembers;

    return new Response(JSON.stringify({ 
      allowed,
      currentTeamCount: currentTeamCount || 0,
      pendingInvitationsCount: pendingInvitationsCount || 0,
      totalTeamSize,
      maxTeamMembers,
      subscriptionTier: subscriber.subscription_tier
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage, allowed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

