'use client';

import { useTranslations } from 'next-intl';

type Props = {
  itemCount: number;
  totalPrice: number;
  restaurantId: string;
  tableId: string;
  onClick: () => void;
};

export function CartBar({ itemCount, totalPrice, restaurantId, tableId, onClick }: Props) {
  const t = useTranslations('Order');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="relative shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600" aria-hidden>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{t('cart')}</p>
            <p className="font-semibold text-gray-900">
              ₩{totalPrice.toLocaleString()}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onClick}
          disabled={itemCount === 0}
          data-restaurant-id={restaurantId}
          data-table-id={tableId}
          className="shrink-0 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-900"
        >
          {t('placeOrder')}
        </button>
      </div>
    </div>
  );
}
