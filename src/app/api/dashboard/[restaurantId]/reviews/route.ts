import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    const [{ data: reviews }, { data: menuItems }] = await Promise.all([
      supabase
        .from('private_reviews')
        .select('id, rating, food_rating, service_rating, comment, liked_items, created_at')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false }),
      supabase
        .from('menu_items')
        .select('id, name')
        .eq('restaurant_id', restaurantId),
    ]);

    const menuMap = new Map((menuItems ?? []).map((m) => [m.id, m.name]));
    const total = reviews?.length ?? 0;

    const avgRating = total
      ? Math.round((reviews!.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;
    const avgFoodRating = total
      ? Math.round((reviews!.reduce((s, r) => s + (r.food_rating ?? 0), 0) / total) * 10) / 10
      : 0;
    const avgServiceRating = total
      ? Math.round((reviews!.reduce((s, r) => s + (r.service_rating ?? 0), 0) / total) * 10) / 10
      : 0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews?.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    });

    const likedCount = new Map<string, number>();
    reviews?.forEach((r) => {
      (r.liked_items ?? []).forEach((id: string) => {
        likedCount.set(id, (likedCount.get(id) ?? 0) + 1);
      });
    });
    const topLikedItems = Array.from(likedCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ name: menuMap.get(id) ?? '삭제된 메뉴', count }));

    const recentReviews = (reviews ?? []).slice(0, 30).map((r) => ({
      id: r.id,
      rating: r.rating,
      food_rating: r.food_rating,
      service_rating: r.service_rating,
      comment: r.comment,
      liked_item_names: (r.liked_items ?? [])
        .map((id: string) => menuMap.get(id))
        .filter(Boolean) as string[],
      created_at: r.created_at,
    }));

    return NextResponse.json({
      total,
      avgRating,
      avgFoodRating,
      avgServiceRating,
      distribution,
      topLikedItems,
      recentReviews,
    });
  } catch (err) {
    console.error('[reviews GET]', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
