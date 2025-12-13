import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { createOrUpdatePartneroCustomer, trackPartneroTransaction } from "../_shared/partnero.ts";

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
        const interval = price?.recurring?.interval || 'month';
        
        // Determine tier using price IDs (more reliable than amount)
        let tier: string;
        if (priceId === 'price_1SPigrL0ZFRbQvFnV3TSt0DR' || priceId === 'price_1SSb33L0ZFRbQvFnwwvZzyR0') {
          tier = 'basic';
        } else if (priceId === 'price_1SPigsL0ZFRbQvFnI1TzxUCT' || priceId === 'price_1SSb37L0ZFRbQvFnKKobOXBU') {
          tier = 'pro';
        } else {
          // Fallback to amount-based logic
          tier = interval === 'year' ? (amount <= 19990 ? 'basic' : 'pro') : (amount <= 1999 ? 'basic' : 'pro');
        }
        
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Check if user exists, create if not
        let userId: string | null = null;
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .maybeSingle();

        if (profile) {
          userId = profile.id;
          console.log(`[STRIPE-WEBHOOK] Found existing user: ${userId}`);
        } else {
          // User doesn't exist - create account
          // Get user_id from metadata if available (from authenticated checkout)
          const metadataUserId = session.metadata?.user_id;
          
          if (metadataUserId && metadataUserId !== '') {
            // User was authenticated during checkout
            userId = metadataUserId;
            console.log(`[STRIPE-WEBHOOK] Using user_id from metadata: ${userId}`);
          } else {
            // Create new user account via Supabase Auth Admin API
            // Generate a random password - user will need to reset it
            const randomPassword = crypto.getRandomValues(new Uint8Array(32))
              .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            
            const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
              email: customer.email,
              password: randomPassword,
              email_confirm: true, // Auto-confirm email since they've completed checkout
              user_metadata: {
                first_name: customer.name?.split(' ')[0] || '',
                last_name: customer.name?.split(' ').slice(1).join(' ') || '',
              }
            });

            if (authError) {
              console.error(`[STRIPE-WEBHOOK] Error creating user: ${authError.message}`);
              // Continue anyway - we'll create profile later
            } else if (authData.user) {
              userId = authData.user.id;
              console.log(`[STRIPE-WEBHOOK] Created new user account: ${userId}`);
              
              // Create profile
              await supabaseClient.from("profiles").insert({
                id: userId,
                email: customer.email,
                organization_id: null, // Will be set during onboarding
                is_active: true
              });
              
              // Send password reset email so user can set their password
              const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
                type: 'recovery',
                email: customer.email,
              });
              
              if (linkError) {
                console.error(`[STRIPE-WEBHOOK] Error generating password reset link: ${linkError.message}`);
              } else {
                console.log(`[STRIPE-WEBHOOK] Password reset link generated for ${customer.email}`);
              }
            }
          }
        }

        // Get organization_id - try metadata first (from checkout), then user's profile
        let organizationId: string | null = null;
        
        // Check metadata from checkout session (set during signup)
        const metadataOrgId = session.metadata?.organization_id;
        if (metadataOrgId && metadataOrgId !== '') {
          organizationId = metadataOrgId;
          console.log(`[STRIPE-WEBHOOK] Using organization_id from metadata: ${organizationId}`);
        } else if (userId) {
          // Fallback: get from user's profile
          const { data: userProfile } = await supabaseClient
            .from("profiles")
            .select("organization_id")
            .eq("id", userId)
            .eq("is_active", true)
            .maybeSingle();
          organizationId = userProfile?.organization_id || null;
          if (organizationId) {
            console.log(`[STRIPE-WEBHOOK] Using organization_id from profile: ${organizationId}`);
          }
        }

        if (!organizationId) {
          console.error(`[STRIPE-WEBHOOK] User ${userId} has no organization, cannot create subscription`);
          break;
        }

        // Update or create subscriber record by organization_id
        await supabaseClient.from("subscribers").upsert({
          organization_id: organizationId,
          email: customer.email,
          user_id: userId,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status === 'trialing' ? 'trialing' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' });

        console.log(`[STRIPE-WEBHOOK] Updated subscription for ${customer.email} (user: ${userId || 'pending'})`);

        // Track referral in Partnero if referral code exists
        const referralCode = session.metadata?.referral_code;
        if (referralCode && referralCode !== '') {
          try {
            // Create/update customer in Partnero
            const partneroCustomer = await createOrUpdatePartneroCustomer(
              customer.email,
              {
                firstName: customer.name?.split(' ')[0],
                lastName: customer.name?.split(' ').slice(1).join(' '),
                customerKey: userId || customerId,
              }
            );

            // Track transaction with referral code
            await trackPartneroTransaction({
              customer: partneroCustomer,
              amount: amount / 100, // Convert from cents to currency unit
              currency: price?.currency?.toUpperCase() || 'GBP',
              transaction_id: subscriptionId,
              transaction_date: new Date().toISOString(),
              metadata: {
                referral_code: referralCode,
                stripe_customer_id: customerId,
                subscription_id: subscriptionId,
                tier: tier,
                interval: interval,
              },
            });

            console.log(`[STRIPE-WEBHOOK] Tracked referral transaction in Partnero for ${customer.email}`);
          } catch (partneroError) {
            console.error('[STRIPE-WEBHOOK] Error tracking referral in Partnero:', partneroError);
            // Don't fail the webhook if Partnero tracking fails
          }
        }
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

        // Get user_id and organization_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id, organization_id")
          .eq("email", customer.email)
          .eq("is_active", true)
          .maybeSingle();

        if (!profile?.organization_id) {
          console.error(`[STRIPE-WEBHOOK] User ${profile?.id} has no organization, cannot update subscription`);
          break;
        }

        // Update subscriber record by organization_id
        await supabaseClient.from("subscribers").upsert({
          organization_id: profile.organization_id,
          email: customer.email,
          user_id: profile.id,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status === 'trialing' ? 'trialing' : 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' });

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

        // Get organization_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("organization_id")
          .eq("email", customer.email)
          .eq("is_active", true)
          .maybeSingle();

        if (profile?.organization_id) {
          // Update subscriber to past_due status by organization_id
          await supabaseClient.from("subscribers").update({
            subscription_status: 'past_due',
            last_payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('organization_id', profile.organization_id);
        }

        console.log(`[STRIPE-WEBHOOK] Marked subscription as past_due for ${customer.email}`);
        
        // Send email notification about payment failure
        try {
          const { Resend } = await import('https://esm.sh/resend@4.0.0');
          const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
          
          await resend.emails.send({
            from: 'Disclosurely <support@disclosurely.com>',
            to: [customer.email],
            subject: 'Payment Failed - Action Required',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1>Payment Failed</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p>Hello,</p>
                  <p>We were unable to process your payment for your Disclosurely subscription. Your subscription is now past due.</p>
                  <p>To avoid service interruption, please update your payment method as soon as possible.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://app.disclosurely.com/dashboard/settings?tab=subscription" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Update Payment Method
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`[STRIPE-WEBHOOK] Payment failure email sent to ${customer.email}`);
        } catch (emailError) {
          console.error('[STRIPE-WEBHOOK] Failed to send payment failure email:', emailError);
        }
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

        // Get organization_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("organization_id")
          .eq("email", customer.email)
          .eq("is_active", true)
          .maybeSingle();

        if (profile?.organization_id) {
          // Update subscriber to canceled status with grace period by organization_id
          await supabaseClient.from("subscribers").update({
            subscribed: false,
            subscription_status: 'canceled',
            grace_period_ends_at: gracePeriodEnds.toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('organization_id', profile.organization_id);
        }

        console.log(`[STRIPE-WEBHOOK] Canceled subscription for ${customer.email}, grace period until ${gracePeriodEnds.toISOString()}`);
        
        // Send email notification about subscription cancellation
        try {
          const { Resend } = await import('https://esm.sh/resend@4.0.0');
          const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
          
          await resend.emails.send({
            from: 'Disclosurely <support@disclosurely.com>',
            to: [customer.email],
            subject: 'Subscription Canceled - Grace Period Active',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
                  <h1>Subscription Canceled</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p>Hello,</p>
                  <p>Your Disclosurely subscription has been canceled. You have a 7-day grace period until ${new Date(gracePeriodEnds).toLocaleDateString()} to continue using the service.</p>
                  <p>After the grace period ends, your account will be downgraded to the free tier.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://app.disclosurely.com/dashboard/settings?tab=subscription" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Reactivate Subscription
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`[STRIPE-WEBHOOK] Cancellation email sent to ${customer.email}`);
        } catch (emailError) {
          console.error('[STRIPE-WEBHOOK] Failed to send cancellation email:', emailError);
        }
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

        // Get user_id and organization_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id, organization_id")
          .eq("email", customer.email)
          .eq("is_active", true)
          .maybeSingle();

        if (!profile?.organization_id) {
          console.error(`[STRIPE-WEBHOOK] User ${profile?.id} has no organization, cannot update subscription`);
          break;
        }

        // Get subscription details
        const priceId = subscription.items.data[0]?.price.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const amount = price?.unit_amount || 0;
        
        // Determine tier using price IDs (more reliable)
        let tier: string;
        if (priceId === 'price_1SPigrL0ZFRbQvFnV3TSt0DR' || priceId === 'price_1SSb33L0ZFRbQvFnwwvZzyR0') {
          tier = 'basic';
        } else if (priceId === 'price_1SPigsL0ZFRbQvFnI1TzxUCT' || priceId === 'price_1SSb37L0ZFRbQvFnKKobOXBU') {
          tier = 'pro';
        } else {
          // Fallback to amount-based logic
          tier = amount <= 1999 ? 'basic' : 'pro';
        }
        
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Handle trial end - if subscription moves from trialing to active
        let gracePeriodEndsAt: string | null = null;
        if (subscription.status === 'active' && subscription.trial_end) {
          // Trial just ended, subscription is now active
          // No grace period needed for successful trial conversion
        } else if (subscription.status === 'canceled') {
          // Set grace period for canceled subscriptions
          const graceEnd = new Date();
          graceEnd.setDate(graceEnd.getDate() + 7);
          gracePeriodEndsAt = graceEnd.toISOString();
        }

        // Update subscriber record by organization_id
        const updateData: any = {
          organization_id: profile.organization_id,
          email: customer.email,
          user_id: profile.id,
          subscription_tier: tier,
          subscription_end: subscriptionEnd,
          subscription_status: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' : 
                               subscription.status === 'past_due' ? 'past_due' : 
                               subscription.status === 'canceled' ? 'canceled' : 
                               subscription.status === 'expired' ? 'expired' : 'active',
          subscribed: ['active', 'trialing', 'past_due'].includes(subscription.status),
          updated_at: new Date().toISOString(),
        };

        if (gracePeriodEndsAt) {
          updateData.grace_period_ends_at = gracePeriodEndsAt;
        }

        await supabaseClient.from("subscribers").upsert(updateData, { onConflict: 'organization_id' });

        console.log(`[STRIPE-WEBHOOK] Updated subscription for ${customer.email}`, { status: subscription.status, tier });
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

        // Get user_id from profiles table
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .maybeSingle();

        // Update subscription status to reflect trial ending soon
        // This helps the frontend show appropriate messaging
        await supabaseClient.from("subscribers").update({
          user_id: profile?.id || null,
          subscription_status: 'trialing',
          updated_at: new Date().toISOString(),
        }).eq('email', customer.email);

        const trialEndDate = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
        console.log(`[STRIPE-WEBHOOK] Trial ending soon for ${customer.email} - trial ends at ${trialEndDate?.toISOString() || 'unknown'}`);
        
        // Send email notification about trial ending
        try {
          const { Resend } = await import('https://esm.sh/resend@4.0.0');
          const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
          
          await resend.emails.send({
            from: 'Disclosurely <support@disclosurely.com>',
            to: [customer.email],
            subject: 'Your Free Trial is Ending Soon',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                  <h1>Trial Ending Soon</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p>Hello,</p>
                  <p>Your free trial of Disclosurely is ending ${trialEndDate ? `on ${trialEndDate.toLocaleDateString()}` : 'soon'}.</p>
                  <p>To continue using all features, please ensure your payment method is up to date. Your subscription will automatically begin after the trial period ends.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://app.disclosurely.com/dashboard/settings?tab=subscription" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Manage Subscription
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`[STRIPE-WEBHOOK] Trial ending email sent to ${customer.email}`);
        } catch (emailError) {
          console.error('[STRIPE-WEBHOOK] Failed to send trial ending email:', emailError);
        }
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
        
        // Get payment link from invoice
        const paymentLink = invoice.hosted_invoice_url || invoice.invoice_pdf;
        
        // Send email notification with payment link
        try {
          const { Resend } = await import('https://esm.sh/resend@4.0.0');
          const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
          
          await resend.emails.send({
            from: 'Disclosurely <support@disclosurely.com>',
            to: [customer.email],
            subject: 'Payment Action Required',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1>Payment Action Required</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p>Hello,</p>
                  <p>We need additional information to process your payment for your Disclosurely subscription.</p>
                  <p>Please complete the payment to avoid service interruption.</p>
                  ${paymentLink ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${paymentLink}" 
                         style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Complete Payment
                      </a>
                    </div>
                  ` : `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://app.disclosurely.com/dashboard/settings?tab=subscription" 
                         style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Update Payment Method
                      </a>
                    </div>
                  `}
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`[STRIPE-WEBHOOK] Payment action required email sent to ${customer.email}`);
        } catch (emailError) {
          console.error('[STRIPE-WEBHOOK] Failed to send payment action required email:', emailError);
        }
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

