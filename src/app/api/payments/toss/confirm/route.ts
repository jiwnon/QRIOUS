import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmTossPayment, type TossConfirmBody } from '@/lib/payments/toss';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TossConfirmBody;
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'paymentKey, orderId, amount required' },
        { status: 400 }
      );
    }

    const result = await confirmTossPayment({ paymentKey, orderId, amount });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Payment confirm failed' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_status === 'paid') {
      return NextResponse.json({ ok: true, message: 'Already paid' });
    }
    if (Number(order.total_amount) !== amount) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_provider: 'toss',
        payment_key: paymentKey,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[payments/toss/confirm] update', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payments/toss/confirm]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
