
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { organization_id } = await req.json();
    
    if (!organization_id) {
      throw new Error("Organization ID is required");
    }

    // Get organization's admin user to check their subscription
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('role', 'org_admin')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const adminUserId = profiles[0].id;

    // Get user from auth.users to get their email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(adminUserId);
    
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Find customer by email
    const customers = await stripe.customers.list({ 
      email: user.email,
      limit: 1 
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const tier = subscription.metadata.tier || 'tier1';

    return new Response(JSON.stringify({
      subscribed: true,
      subscription_tier: tier,
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in check-subscription-by-org:', error);
    return new Response(JSON.stringify({ 
      subscribed: false,
      subscription_tier: null,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
