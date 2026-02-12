import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getStripeSecretKey } from '@/lib/payments/stripe';

/** 결제 성공 페이지에서 session_id로 주문 상태 동기화 (webhook 지연 대비) */
export async function POST(request: Request) {
  try {
    const secret = getStripeSecretKey();
    if (!secret) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { session_id?: string };
    const sessionId = body.session_id;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id required' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Session not paid' },
        { status: 400 }
      );
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: 'No orderId in session' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single();

    if (order?.payment_status === 'paid') {
      return NextResponse.json({ ok: true, message: 'Already paid' });
    }

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_provider: 'stripe',
        payment_key: typeof session.payment_intent === 'object' && session.payment_intent?.id
          ? session.payment_intent.id
          : session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('[payments/stripe/verify-session]', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payments/stripe/verify-session]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
