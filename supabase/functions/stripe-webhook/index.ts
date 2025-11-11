import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        
        if (!customerId || !subscriptionId) {
          console.error('[STRIPE-WEBHOOK] Missing customer or subscription ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const amount = price?.unit_amount || 0;
        
        // Determine tier
        const tier = amount <= 1999 ? 'basic' : 'pro';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Get user_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .maybeSingle();

        // Update or create subscriber record
        await supabaseClient.from("subscribers").upsert({
          email: customer.email,
          user_id: profile?.id || null,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status === 'trialing' ? 'trialing' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        console.log(`[STRIPE-WEBHOOK] Updated subscription for ${customer.email}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        
        if (!customerId || !subscriptionId) {
          console.error('[STRIPE-WEBHOOK] Missing customer or subscription ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const amount = price?.unit_amount || 0;
        
        // Determine tier
        const tier = amount <= 1999 ? 'basic' : 'pro';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Get user_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .maybeSingle();

        // Update subscriber record
        await supabaseClient.from("subscribers").upsert({
          email: customer.email,
          user_id: profile?.id || null,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status === 'trialing' ? 'trialing' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        console.log(`[STRIPE-WEBHOOK] Renewed subscription for ${customer.email}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        
        if (!customerId) {
          console.error('[STRIPE-WEBHOOK] Missing customer ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        // Update subscriber to past_due status
        await supabaseClient.from("subscribers").update({
          subscription_status: 'past_due',
          last_payment_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('email', customer.email);

        console.log(`[STRIPE-WEBHOOK] Marked subscription as past_due for ${customer.email}`);
        
        // TODO: Send email notification
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        
        if (!customerId) {
          console.error('[STRIPE-WEBHOOK] Missing customer ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        // Set grace period (7 days from now)
        const gracePeriodEnds = new Date();
        gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 7);

        // Update subscriber to canceled status with grace period
        await supabaseClient.from("subscribers").update({
          subscribed: false,
          subscription_status: 'canceled',
          grace_period_ends_at: gracePeriodEnds.toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('email', customer.email);

        console.log(`[STRIPE-WEBHOOK] Canceled subscription for ${customer.email}, grace period until ${gracePeriodEnds.toISOString()}`);
        
        // TODO: Send email notification
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        
        if (!customerId) {
          console.error('[STRIPE-WEBHOOK] Missing customer ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        // Get subscription details
        const priceId = subscription.items.data[0]?.price.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const amount = price?.unit_amount || 0;
        
        // Determine tier
        const tier = amount <= 1999 ? 'basic' : 'pro';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Update subscriber record
        await supabaseClient.from("subscribers").update({
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' : 
                               subscription.status === 'past_due' ? 'past_due' : 
                               subscription.status === 'canceled' ? 'canceled' : 'active',
          updated_at: new Date().toISOString(),
        }).eq('email', customer.email);

        console.log(`[STRIPE-WEBHOOK] Updated subscription for ${customer.email}`);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        
        if (!customerId) {
          console.error('[STRIPE-WEBHOOK] Missing customer ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        console.log(`[STRIPE-WEBHOOK] Trial ending soon for ${customer.email}`);
        
        // TODO: Send email notification about trial ending
        break;
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        
        if (!customerId) {
          console.error('[STRIPE-WEBHOOK] Missing customer ID');
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('deleted' in customer || !customer.email) {
          console.error('[STRIPE-WEBHOOK] Invalid customer');
          break;
        }

        console.log(`[STRIPE-WEBHOOK] Payment action required for ${customer.email}`);
        
        // TODO: Send email notification with payment link
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[STRIPE-WEBHOOK] Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

