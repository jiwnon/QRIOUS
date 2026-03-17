import { ReviewsDashboardContent } from '@/components/dashboard/ReviewsDashboardContent';
import { assertCanAccessRestaurant } from '@/lib/auth/server';

type Props = {
  params: Promise<{ locale: string; restaurantId: string }>;
};

export default async function ReviewsPage({ params }: Props) {
  const { locale, restaurantId } = await params;
  await assertCanAccessRestaurant(restaurantId, locale);
  return <ReviewsDashboardContent restaurantId={restaurantId} locale={locale} />;
}
