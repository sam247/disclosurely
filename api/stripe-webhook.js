import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  // Update user subscription status in your database
  // This would typically involve updating a subscribers table
  // with the subscription details from the session metadata
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Create or update subscription record in your database
  // Extract customer email and subscription details
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Update subscription status in your database
  // Handle status changes like active, past_due, canceled, etc.
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Mark subscription as canceled in your database
  // Update user access permissions
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  // Update subscription status to active
  // Send confirmation email if needed
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Update subscription status to past_due
  // Send payment failure notification
}
