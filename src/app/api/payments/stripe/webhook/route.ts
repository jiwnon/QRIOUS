import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getStripeSecretKey, getStripeWebhookSecret } from '@/lib/payments/stripe';

export async function POST(request: Request) {
  const secret = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  try {
    const body = await request.text();
    const stripe = new Stripe(secret);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[payments/stripe/webhook] signature', msg);
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error('[payments/stripe/webhook] missing metadata.orderId');
    return NextResponse.json({ error: 'Missing orderId in session' }, { status: 400 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_provider: 'stripe',
      payment_key: typeof session.payment_intent === 'object' && session.payment_intent?.id
        ? session.payment_intent.id
        : (session.payment_intent as string | null) ?? session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('[payments/stripe/webhook] update order', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
