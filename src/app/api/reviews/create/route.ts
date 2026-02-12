import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Body = {
  orderId: string;
  foodRating: number;
  serviceRating: number;
  comment?: string;
  likedItems?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { orderId, foodRating, serviceRating, comment, likedItems } = body;

    if (!orderId || typeof foodRating !== 'number' || typeof serviceRating !== 'number') {
      return NextResponse.json(
        { error: 'orderId, foodRating, serviceRating required' },
        { status: 400 }
      );
    }
    if (foodRating < 1 || foodRating > 5 || serviceRating < 1 || serviceRating > 5) {
      return NextResponse.json(
        { error: 'foodRating and serviceRating must be 1-5' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, restaurant_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('private_reviews')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Review already submitted for this order' }, { status: 400 });
    }

    const rating = Math.round((foodRating + serviceRating) / 2);
    const { error: insertError } = await supabase.from('private_reviews').insert({
      order_id: orderId,
      restaurant_id: order.restaurant_id,
      rating,
      food_rating: foodRating,
      service_rating: serviceRating,
      comment: comment ?? null,
      liked_items: Array.isArray(likedItems) ? likedItems : [],
    });

    if (insertError) {
      console.error('[reviews/create]', insertError);
      return NextResponse.json(
        { error: 'Failed to save review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reviews/create]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
