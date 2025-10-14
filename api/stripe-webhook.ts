import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

function centsToDecimal(cents?: number | null) {
  return cents ? Math.round(cents) / 100 : 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Build a GA4 'purchase' from relevant Stripe events
  let purchase:
    | {
        transaction_id: string;
        value: number;
        currency: string;
        items: Array<{ item_id: string; item_name?: string; quantity?: number }>;
      }
    | null = null;

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === 'paid') {
        const plan = (s.metadata?.plan || 'subscription').toLowerCase(); // set when you create the checkout session
        purchase = {
          transaction_id: s.id, // or s.payment_intent as string
          value: centsToDecimal(s.amount_total),
          currency: (s.currency || 'gbp').toUpperCase(),
          items: [{ item_id: plan, item_name: plan, quantity: 1 }],
        };
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const inv = event.data.object as Stripe.Invoice;
      const line = inv.lines?.data?.[0];
      const nickname =
        line?.plan?.nickname || line?.price?.nickname || inv.metadata?.plan || 'subscription';
      purchase = {
        transaction_id: inv.id,
        value: centsToDecimal(inv.amount_paid),
        currency: (inv.currency || 'gbp').toUpperCase(),
        items: [{ item_id: nickname.toLowerCase(), item_name: nickname, quantity: 1 }],
      };
      break;
    }
    default:
      // ignore others
  }

  if (purchase) {
    try {
      const endpoint =
        process.env.GA4_ENDPOINT ||
        'https://server-side-tagging-nsepetvtjq-uc.a.run.app/mp/collect';

      // GA4 requires client_id OR user_id. A random client_id is fine for server events.
      const clientId = `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;

      await fetch(
        `${endpoint}?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            non_personalized_ads: true,
            events: [
              {
                name: 'purchase',
                params: {
                  transaction_id: purchase.transaction_id,
                  value: purchase.value,
                  currency: purchase.currency,
                  items: purchase.items,
                  affiliation: 'stripe',
                },
              },
            ],
          }),
        }
      );
    } catch (e) {
      console.error('Failed sending to sGTM / GA4 MP:', e);
      // Still return 200 so Stripe doesn't retry forever if your sGTM blips.
    }
  }

  return res.status(200).json({ received: true });
}
