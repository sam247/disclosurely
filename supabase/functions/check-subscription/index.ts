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

// Cache TTL: 10 minutes (600 seconds)
const CACHE_TTL_SECONDS = 600;

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

    // ===== PHASE 2: SERVER-SIDE CACHE CHECK =====
    // Check if we have fresh cached data (< 10 minutes old)
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle();
    
    logStep("Existing subscriber record", existingSubscriber);

    // Calculate cache age in seconds
    const now = new Date();
    let cacheAgeSeconds = Infinity;
    
    if (existingSubscriber?.stripe_data_cached_at) {
      const cacheTimestamp = new Date(existingSubscriber.stripe_data_cached_at);
      cacheAgeSeconds = (now.getTime() - cacheTimestamp.getTime()) / 1000;
      logStep("Cache age calculated", { 
        cacheAgeSeconds, 
        cacheTimestamp: cacheTimestamp.toISOString(),
        isFresh: cacheAgeSeconds < CACHE_TTL_SECONDS 
      });
    } else {
      logStep("No cache timestamp found - cache miss");
    }

    // If cache is fresh (< 10 minutes), return existing data without calling Stripe
    if (cacheAgeSeconds < CACHE_TTL_SECONDS && existingSubscriber) {
      logStep("✅ CACHE HIT - Returning cached data without Stripe API call", {
        cacheAgeSeconds,
        subscriptionTier: existingSubscriber.subscription_tier,
        subscriptionStatus: existingSubscriber.subscription_status
      });

      // Calculate grace period status from cached data
      const subscriptionEnd = existingSubscriber.subscription_end 
        ? new Date(existingSubscriber.subscription_end) 
        : null;
      const gracePeriodEnds = existingSubscriber.grace_period_ends_at 
        ? new Date(existingSubscriber.grace_period_ends_at) 
        : null;
      
      const isInGracePeriod = gracePeriodEnds ? gracePeriodEnds > now : false;
      
      return new Response(JSON.stringify({
        subscribed: existingSubscriber.subscribed || isInGracePeriod,
        subscription_tier: existingSubscriber.subscription_tier,
        subscription_end: existingSubscriber.subscription_end,
        subscription_status: existingSubscriber.subscription_status,
        grace_period_ends_at: existingSubscriber.grace_period_ends_at,
        cached: true, // Flag to indicate this was served from cache
        cache_age_seconds: Math.round(cacheAgeSeconds)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ===== CACHE MISS OR STALE - FETCH FROM STRIPE API =====
    logStep("❌ CACHE MISS or STALE - Calling Stripe API", { cacheAgeSeconds });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

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
        stripe_data_cached_at: now.toISOString(), // Set cache timestamp
        updated_at: now.toISOString(),
      }, { onConflict: 'organization_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_status: 'expired',
        cached: false
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
      status: "all",
      limit: 10,
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
      
      // Map price IDs to tiers
      if (priceId === 'price_1SPigrL0ZFRbQvFnV3TSt0DR' || priceId === 'price_1SSb33L0ZFRbQvFnwwvZzyR0') {
        subscriptionTier = "basic";
      } else if (priceId === 'price_1SPigsL0ZFRbQvFnI1TzxUCT' || priceId === 'price_1SSb37L0ZFRbQvFnKKobOXBU') {
        subscriptionTier = "pro";
      } else {
        // Fallback to amount-based logic
        if (interval === 'year') {
          subscriptionTier = amount <= 19990 ? "basic" : "pro";
        } else {
          subscriptionTier = amount <= 1999 ? "basic" : "pro";
        }
      }
      
      logStep("Determined subscription tier", { priceId, amount, interval, subscriptionTier });
      
      // Check if subscription is expired and set grace period
      const endDate = new Date(subscriptionEnd);
      if (endDate < now && subscriptionStatus === 'active') {
        subscriptionStatus = 'expired';
        const graceEnd = new Date(endDate);
        graceEnd.setDate(graceEnd.getDate() + 7);
        gracePeriodEndsAt = graceEnd.toISOString();
      }
    } else {
      logStep("No active subscription found");
      subscriptionStatus = 'expired';
    }

    // Update database with fresh Stripe data AND cache timestamp
    const updateData: any = {
      organization_id: organizationId,
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus,
      stripe_data_cached_at: now.toISOString(), // ⭐ SET CACHE TIMESTAMP
      updated_at: now.toISOString(),
    };
    
    if (gracePeriodEndsAt) {
      updateData.grace_period_ends_at = gracePeriodEndsAt;
    }

    // Upsert by organization_id
    await supabaseClient.from("subscribers").upsert(updateData, { onConflict: 'organization_id' });

    logStep("✅ Updated database with fresh Stripe data + cache timestamp", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      subscriptionStatus,
      cacheTimestamp: now.toISOString()
    });
    
    // Calculate grace period status
    const isInGracePeriod = gracePeriodEndsAt ? new Date(gracePeriodEndsAt) > now : false;
    
    const responseData = {
      subscribed: hasActiveSub || isInGracePeriod,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus,
      grace_period_ends_at: gracePeriodEndsAt,
      cached: false, // Flag to indicate this was fresh from Stripe
      cache_age_seconds: 0
    };
    
    logStep("Returning fresh response from Stripe API", responseData);
    
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
