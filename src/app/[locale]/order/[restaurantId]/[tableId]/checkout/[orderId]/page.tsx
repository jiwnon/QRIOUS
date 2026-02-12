import { getTossClientKey } from '@/lib/payments/toss';
import { CheckoutContent } from '@/components/customer/CheckoutContent';

type Props = {
  params: Promise<{ locale: string; restaurantId: string; tableId: string; orderId: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale, restaurantId, tableId, orderId } = await params;
  const tossClientKey = getTossClientKey();
  return (
    <CheckoutContent
      locale={locale}
      restaurantId={restaurantId}
      tableId={tableId}
      orderId={orderId}
      tossClientKey={tossClientKey}
    />
  );
}
