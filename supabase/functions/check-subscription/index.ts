
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not configured, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        message: "Stripe not configured" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication failed", { error: userError.message });
      return new Response(JSON.stringify({ error: "Authentication failed", subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("User not authenticated or email not available");
      return new Response(JSON.stringify({ error: "User not authenticated", subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // First check if we have an existing customer record in our database
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id, subscribed, subscription_tier")
      .eq("email", user.email)
      .single();
    
    logStep("Existing subscriber record", existingSubscriber);

    // Look for Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for ALL subscription statuses (active, trialing, past_due)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all", // Check all statuses
      limit: 10, // Get more subscriptions to be thorough
    });
    
    logStep("All subscriptions found", { 
      count: subscriptions.data.length,
      subscriptions: subscriptions.data.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end
      }))
    });

    // Look for active, trialing, or past_due subscriptions
    const activeSubscription = subscriptions.data.find((sub: any) => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );
    
    const hasActiveSub = !!activeSubscription;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    if (hasActiveSub && activeSubscription) {
      subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { 
        subscriptionId: activeSubscription.id, 
        status: activeSubscription.status,
        endDate: subscriptionEnd 
      });
      
      // Determine subscription tier from price
      const priceId = activeSubscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      logStep("Price details", { priceId, amount, currency: price.currency });
      
      // Updated pricing logic to match your tiers
      if (amount <= 1999) { // £19.99 or less
        subscriptionTier = "basic";
      } else if (amount >= 2000) { // £20.00 or more (£49.99)
        subscriptionTier = "pro";
      } else {
        subscriptionTier = "basic"; // Default fallback
      }
      
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    // Always update the database with the latest info
    const updateData = {
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    };

    await supabaseClient.from("subscribers").upsert(updateData, { onConflict: 'email' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    
    const responseData = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    };
    
    logStep("Returning response", responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
