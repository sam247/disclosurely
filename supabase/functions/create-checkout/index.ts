
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
    
    // Log environment check (without exposing secrets)
    const hasStripeKey = !!Deno.env.get("STRIPE_SECRET_KEY");
    logStep("Environment check", { 
      hasStripeKey,
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseAnonKey: !!Deno.env.get("SUPABASE_ANON_KEY")
    });

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
        // Auth header provided but invalid - fall back to unauthenticated checkout
        // Use email from body if provided, otherwise let Stripe collect it
        if (email) {
          userEmail = email;
          logStep("Invalid auth, using email from body", { email: userEmail });
        } else {
          // No email provided - Stripe will collect it during checkout
          userEmail = ''; // Will be set by Stripe
          logStep("Invalid auth and no email - Stripe will collect email during checkout");
        }
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

    // Validate Stripe secret key before creating Stripe instance
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    
    // Validate key format (should start with sk_)
    if (!stripeSecretKey.startsWith("sk_")) {
      logStep("ERROR: STRIPE_SECRET_KEY has invalid format", { 
        keyPrefix: stripeSecretKey.substring(0, 10) + "..." 
      });
      throw new Error("STRIPE_SECRET_KEY has invalid format (should start with sk_)");
    }
    
    logStep("Stripe key validated", { keyPrefix: stripeSecretKey.substring(0, 10) + "..." });

    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: "2023-10-16" 
    });
    
    logStep("Stripe instance created successfully");

    // Check if customer exists (only if we have an email)
    let customerId;
    if (userEmail && userEmail.trim() !== '') {
      try {
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          logStep("Existing customer found", { customerId });
        } else {
          logStep("No existing customer found, will create in checkout");
        }
      } catch (stripeError: any) {
        logStep("Error checking for existing customer (non-fatal)", { error: stripeError.message });
        // Continue without customer ID - Stripe will create one during checkout
      }
    } else {
      logStep("No email provided, Stripe will collect email during checkout");
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

    // Get origin from request headers, with fallback to default domain
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "https://app.disclosurely.com";
    const successUrl = `${origin}/dashboard?subscription=success`;
    const cancelUrl = `${origin}/pricing?subscription=cancelled`;
    
    logStep("Checkout URLs", { successUrl, cancelUrl, origin });

    // Prepare checkout session parameters
    const sessionParams: any = {
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId || '',
        email: userEmail || '',
        organization_id: organizationId || '',
        tier: tier,
        employee_count: employee_count.toString(),
        interval: interval === 'year' || interval === 'annual' ? 'year' : 'month',
        rdt_cid: rdt_cid || '',
        referral_code: referral_code || '',
        source: 'website'
      }
    };

    // Only set customer or customer_email if we have valid values
    if (customerId) {
      sessionParams.customer = customerId;
      logStep("Using existing customer", { customerId });
    } else if (userEmail && userEmail.trim() !== '') {
      sessionParams.customer_email = userEmail;
      logStep("Setting customer email", { email: userEmail });
    } else {
      logStep("No customer or email - Stripe will collect email during checkout");
    }

    logStep("Stripe session params", { 
      hasCustomer: !!sessionParams.customer,
      hasCustomerEmail: !!sessionParams.customer_email,
      priceId,
      mode: sessionParams.mode
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Log full error details for debugging
    logStep("ERROR in create-checkout", { 
      message: errorMessage,
      errorType: error?.constructor?.name,
      stack: error?.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    
    // Return detailed error (but don't expose sensitive info in production)
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error?.type || error?.code || undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
