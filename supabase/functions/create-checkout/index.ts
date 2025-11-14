
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // interval can be 'month', 'monthly', 'year', or 'annual' (frontend sends 'monthly' or 'annual')
    const { tier, employee_count, rdt_cid, interval = 'month', email, organization_id, referral_code } = await req.json();
    if (!tier || !employee_count) {
      throw new Error("Missing required fields: tier and employee_count");
    }

    // Check for authentication (optional - can be unauthenticated for new signups)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string;
    let userId: string | null = null;

    let organizationId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        userEmail = data.user.email;
        userId = data.user.id;
        logStep("User authenticated", { userId, email: userEmail });
        
        // Get user's organization_id
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("organization_id")
          .eq("id", userId)
          .eq("is_active", true)
          .maybeSingle();
        
        // Try to get organization_id from request body first (for new signups), then profile
        if (organization_id && organization_id !== '') {
          organizationId = organization_id;
          logStep("Organization ID provided in request", { organizationId });
        } else {
          organizationId = profile?.organization_id || null;
          if (organizationId) {
            logStep("User organization found in profile", { organizationId });
          } else {
            logStep("User has no organization - subscription will require organization setup", { userId });
          }
        }
      } else {
        // Auth header provided but invalid - use email from body if provided
        if (!email) throw new Error("Invalid authentication and no email provided");
        userEmail = email;
        logStep("Invalid auth, using email from body", { email: userEmail });
      }
    } else {
      // No auth header - email optional (Stripe will collect it during checkout)
      if (email) {
        userEmail = email;
        logStep("Unauthenticated checkout with email", { email: userEmail });
      } else {
        // No email provided - Stripe will collect it during checkout
        userEmail = ''; // Will be set by Stripe
        logStep("Unauthenticated checkout - Stripe will collect email");
      }
    }

    logStep("Request data", { tier, employee_count, rdt_cid, interval, email: userEmail, userId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Will create new customer in Stripe checkout");
    }

    // Map tier and interval to Stripe price IDs
    // VERIFIED: All price IDs are correctly configured in Stripe Dashboard
    // Monthly: 
    //   tier1 = price_1SPigrL0ZFRbQvFnV3TSt0DR (£19.99/month = 1999 pence) ✅ VERIFIED
    //   tier2 = price_1SPigsL0ZFRbQvFnI1TzxUCT (£39.99/month = 3999 pence) ✅ VERIFIED
    // Annual:
    //   tier1 = price_1SSb33L0ZFRbQvFnwwvZzyR0 (£199.90/year = 19990 pence) ✅ VERIFIED
    //   tier2 = price_1SSb37L0ZFRbQvFnKKobOXBU (£399.90/year = 39990 pence) ✅ VERIFIED
    // Note: Stripe price IDs already have the interval (month/year) configured in Stripe,
    // so we don't need to set recurring.interval in the checkout session
    let priceId: string;
    let tierName: string;
    
    // Handle both 'year'/'annual' and 'month'/'monthly' for flexibility
    if (interval === 'year' || interval === 'annual') {
      // Annual pricing - VERIFIED: Annual billing is fully implemented
      switch (tier) {
        case 'tier1':
          priceId = 'price_1SSb33L0ZFRbQvFnwwvZzyR0'; // £199.90/year
          tierName = 'Starter';
          break;
        case 'tier2':
          priceId = 'price_1SSb37L0ZFRbQvFnKKobOXBU'; // £399.90/year
          tierName = 'Pro';
          break;
        default:
          throw new Error("Invalid tier selected");
      }
    } else {
      // Monthly pricing (default)
      switch (tier) {
        case 'tier1':
          priceId = 'price_1SPigrL0ZFRbQvFnV3TSt0DR'; // £19.99/month
          tierName = 'Starter';
          break;
        case 'tier2':
          priceId = 'price_1SPigsL0ZFRbQvFnI1TzxUCT'; // £39.99/month
          tierName = 'Pro';
          break;
        default:
          throw new Error("Invalid tier selected");
      }
    }

    logStep("Creating checkout session", { priceId, tierName, interval, trialDays: 7 });

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : (userEmail || undefined),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/pricing?subscription=cancelled`,
      metadata: {
        user_id: userId || '',
        email: userEmail,
        organization_id: organizationId || '',
        tier: tier,
        employee_count: employee_count.toString(),
        interval: interval === 'year' || interval === 'annual' ? 'year' : 'month',
        rdt_cid: rdt_cid || null,
        referral_code: referral_code || '',
        source: 'website'
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
