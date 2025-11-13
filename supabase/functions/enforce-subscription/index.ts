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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header", allowed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Authentication failed", allowed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;

    // Get user's organization_id from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !profile?.organization_id) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: "User is not associated with an organization" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check subscription status by organization_id
    const { data: subscriber, error: subError } = await supabaseClient
      .from("subscribers")
      .select("subscribed, subscription_end, subscription_status, grace_period_ends_at")
      .eq("organization_id", profile.organization_id)
      .maybeSingle();

    if (subError || !subscriber) {
      return new Response(JSON.stringify({ allowed: false, reason: "No subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const now = new Date();
    const subscriptionEnd = subscriber.subscription_end ? new Date(subscriber.subscription_end) : null;
    const gracePeriodEnds = subscriber.grace_period_ends_at ? new Date(subscriber.grace_period_ends_at) : null;
    
    // Check if subscription is expired
    const isExpired = subscriptionEnd ? subscriptionEnd < now : false;
    const isInGracePeriod = gracePeriodEnds ? gracePeriodEnds > now : false;
    
    // Determine access level
    let allowed = false;
    let accessLevel: 'full' | 'readonly' | 'blocked' = 'blocked';
    
    if (subscriber.subscription_status === 'active' || subscriber.subscription_status === 'trialing') {
      if (!isExpired || isInGracePeriod) {
        allowed = true;
        accessLevel = isInGracePeriod ? 'readonly' : 'full';
      }
    } else if (subscriber.subscription_status === 'past_due') {
      allowed = true;
      accessLevel = 'readonly';
    } else if (isInGracePeriod) {
      allowed = true;
      accessLevel = 'readonly';
    }

    return new Response(JSON.stringify({ 
      allowed,
      accessLevel,
      subscription_status: subscriber.subscription_status,
      isInGracePeriod,
      isExpired: isExpired && !isInGracePeriod
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

