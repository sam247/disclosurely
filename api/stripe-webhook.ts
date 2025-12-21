// api/stripe-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Utility: read raw body for Stripe validation
async function buffer(readable: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Missing STRIPE_WEBHOOK_SECRET
    return res.status(500).send('Server misconfigured');
  }

  let event: Stripe.Event;
  const buf = await buffer(req);
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: unknown) {
    // Stripe signature verification failed
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // We care about successful purchases:
    // - checkout.session.completed (first-time subscription)
    // - invoice.payment_succeeded (renewals)
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'invoice.payment_succeeded'
    ) {
      // For both event types, `event.data.object` will be different:
      // - checkout.session.completed -> Stripe.Checkout.Session
      // - invoice.payment_succeeded -> Stripe.Invoice
      // We normalize to get value, currency, email, transaction_id, rdt_cid.
      let currency: string | undefined;
      let value: number | undefined;
      let email: string | undefined;
      let transactionId: string | undefined;
      let rdtCid: string | null = null;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        currency = session.currency ?? undefined;
        // amount_total is in cents (or the smallest currency unit)
        value = session.amount_total ? session.amount_total / 100 : undefined;
        email = session.customer_details?.email ?? undefined;
        transactionId = session.id;
        rdtCid = (session.metadata?.rdt_cid as string) || null;
      } else {
        const invoice = event.data.object as Stripe.Invoice;
        currency = invoice.currency ?? undefined;
        value = invoice.amount_paid ? invoice.amount_paid / 100 : undefined;
        // Fetch customer to get email if not present
        if (invoice.customer_email) {
          email = invoice.customer_email;
        } else if (invoice.customer) {
          const customer =
            typeof invoice.customer === 'string'
              ? await stripe.customers.retrieve(invoice.customer)
              : invoice.customer;
          if (!('deleted' in customer)) {
            email = customer.email ?? undefined;
          }
        }
        transactionId = invoice.id;

        // Try to pull rdt_cid from the originating checkout session on first invoice
        // (Some setups carry this on subscription or invoice metadata)
        rdtCid =
          ((invoice.metadata && (invoice.metadata['rdt_cid'] as string)) ||
            null);
      }

      // Server-side tracking has been removed
      // Transaction data is available in the variables above if needed for other purposes
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // Webhook handler error
    return res.status(500).send('Webhook handler error');
  }
}
