'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReviewModal, type OrderItemForReview } from './ReviewModal';
import type { Locale } from '@/types';

const REVIEW_REQUEST_AFTER_MS = 30 * 60 * 1000; // 30분

type Props = {
  locale: string;
  restaurantId: string;
  tableId: string;
  orderId: string;
};

export function CheckoutComplete({ locale, restaurantId, tableId, orderId }: Props) {
  const t = useTranslations('checkout');
  const pathPrefix = locale === 'ko' ? '' : `/${locale}`;
  const backUrl = `${pathPrefix}/order/${restaurantId}/${tableId}`;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItemForReview[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then((data: { items?: OrderItemForReview[] }) => {
        if (!cancelled && Array.isArray(data.items)) setOrderItems(data.items);
      })
      .catch(() => {});

    timerRef.current = setTimeout(() => {
      if (!cancelled) setShowReviewModal(true);
    }, REVIEW_REQUEST_AFTER_MS);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary-600">{t('complete')}</p>
          <p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p>
          <p className="mt-4 text-sm text-gray-600">
            결제가 완료되었습니다. 주문이 접수되었습니다.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            약 30분 후 식사 만족도 평가를 요청드릴 수 있습니다.
          </p>
          <Link
            href={backUrl}
            className="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition hover:bg-primary-600"
          >
            메뉴로 돌아가기
          </Link>
        </div>
      </main>
      {showReviewModal && (
        <ReviewModal
          orderId={orderId}
          locale={locale as Locale}
          items={orderItems}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
