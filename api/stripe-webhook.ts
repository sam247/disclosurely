// pages/api/stripe-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false, // Stripe needs the raw body to verify signatures
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// ---- GA4 / sGTM MP config ----
// We send Measurement Protocol events to the *server container* endpoint.
// Example provided by you:
const GA4_MP_ENDPOINT =
  process.env.GA4_MP_ENDPOINT ||
  'https://server-side-tagging-nsepetvtjq-uc.a.run.app/mp/collect';
const GA4_MEASUREMENT_ID =
  process.env.GA4_MEASUREMENT_ID || 'G-8QLEGKTKCW';
const GA4_API_SECRET = process.env.GA4_API_SECRET;

// Utility: read raw body for Stripe validation
async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).send('Server misconfigured');
  }

  let event: Stripe.Event;
  const buf = await buffer(req);
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('❌ Stripe signature verification failed:', err.message);
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

      // Build GA4 MP payload for sGTM
      // We send email & rdt_cid as custom params; your Reddit CAPI tag maps them.
      const mpPayload = {
        client_id: '555.1', // static client_id for server events; replace if you generate one
        events: [
          {
            name: 'purchase',
            params: {
              currency,
              value,
              transaction_id: transactionId,
              email,     // <-- used by sGTM Reddit tag
              rdt_cid: rdtCid // <-- used by sGTM Reddit tag
            },
          },
        ],
      };

      // Only send GA4 event if API secret is configured
      if (GA4_API_SECRET) {
        const url = `${GA4_MP_ENDPOINT}?measurement_id=${encodeURIComponent(
          GA4_MEASUREMENT_ID
        )}&api_secret=${encodeURIComponent(GA4_API_SECRET)}`;

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mpPayload),
        });

        if (!resp.ok) {
          const t = await resp.text().catch(() => '');
          console.error('❌ GA4 MP (via sGTM) failed:', resp.status, t);
        } else {
          console.log('✅ GA4 MP (via sGTM) purchase sent.');
        }
      } else {
        console.warn('⚠️ GA4_API_SECRET environment variable is missing. GA4 tracking will be disabled.');
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler error');
  }
}
