
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
        subscription_status: 'expired',
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

    // Get user's organization_id from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !profile?.organization_id) {
      logStep("User has no organization", { error: profileError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        subscription_status: 'expired',
        message: "User is not associated with an organization"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const organizationId = profile.organization_id;
    logStep("User organization found", { organizationId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if we have an existing subscription for this organization
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id, subscribed, subscription_tier, email, user_id")
      .eq("organization_id", organizationId)
      .maybeSingle();
    
    logStep("Existing subscriber record", existingSubscriber);

    // Look for Stripe customer by email (use existing subscriber's email if available, otherwise user's email)
    const customerEmail = existingSubscriber?.email || user.email;
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      // Upsert subscription record for organization (no Stripe customer yet)
      await supabaseClient.from("subscribers").upsert({
        organization_id: organizationId,
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        subscription_status: 'expired',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id' });
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_status: 'expired'
      }), {
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
    let subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired' = 'active';
    let gracePeriodEndsAt: string | null = null;
    
    if (hasActiveSub && activeSubscription) {
      subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
      subscriptionStatus = activeSubscription.status as any;
      
      logStep("Active subscription found", { 
        subscriptionId: activeSubscription.id, 
        status: activeSubscription.status,
        endDate: subscriptionEnd 
      });
      
      // Determine subscription tier from price ID
      const priceId = activeSubscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      const interval = price.recurring?.interval || 'month';
      
      logStep("Price details", { priceId, amount, currency: price.currency, interval });
      
      // Map price IDs to tiers (more reliable than amount-based logic)
      // Monthly: tier1 = price_1SPigrL0ZFRbQvFnV3TSt0DR (£19.99), tier2 = price_1SPigsL0ZFRbQvFnI1TzxUCT (£39.99)
      // Annual: tier1 = price_1SSb33L0ZFRbQvFnwwvZzyR0 (£199.90), tier2 = price_1SSb37L0ZFRbQvFnKKobOXBU (£399.90)
      if (priceId === 'price_1SPigrL0ZFRbQvFnV3TSt0DR' || priceId === 'price_1SSb33L0ZFRbQvFnwwvZzyR0') {
        // Starter tier (monthly or annual)
        subscriptionTier = "basic";
      } else if (priceId === 'price_1SPigsL0ZFRbQvFnI1TzxUCT' || priceId === 'price_1SSb37L0ZFRbQvFnKKobOXBU') {
        // Pro tier (monthly or annual)
        subscriptionTier = "pro";
      } else {
        // Fallback to amount-based logic for any other prices
        if (interval === 'year') {
          // Annual: £199.90 or less = basic, more = pro
          subscriptionTier = amount <= 19990 ? "basic" : "pro";
        } else {
          // Monthly: £19.99 or less = basic, more = pro
          subscriptionTier = amount <= 1999 ? "basic" : "pro";
        }
      }
      
      logStep("Determined subscription tier", { priceId, amount, interval, subscriptionTier });
      
      // Check if subscription is expired and set grace period
      const now = new Date();
      const endDate = new Date(subscriptionEnd);
      if (endDate < now && subscriptionStatus === 'active') {
        subscriptionStatus = 'expired';
        // Set grace period to 7 days from expiration
        const graceEnd = new Date(endDate);
        graceEnd.setDate(graceEnd.getDate() + 7);
        gracePeriodEndsAt = graceEnd.toISOString();
      }
    } else {
      logStep("No active subscription found");
      subscriptionStatus = 'expired';
    }

    // Always update the database with the latest info
    const updateData: any = {
      organization_id: organizationId,
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    };
    
    if (gracePeriodEndsAt) {
      updateData.grace_period_ends_at = gracePeriodEndsAt;
    }

    // Upsert by organization_id (one subscription per organization)
    await supabaseClient.from("subscribers").upsert(updateData, { onConflict: 'organization_id' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier, subscriptionStatus });
    
    // Calculate grace period status
    const now = new Date();
    const isInGracePeriod = gracePeriodEndsAt ? new Date(gracePeriodEndsAt) > now : false;
    const isExpired = subscriptionEnd ? new Date(subscriptionEnd) < now && !isInGracePeriod : false;
    
    const responseData = {
      subscribed: hasActiveSub || isInGracePeriod,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus,
      grace_period_ends_at: gracePeriodEndsAt,
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
