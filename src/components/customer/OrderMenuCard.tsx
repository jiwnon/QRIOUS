'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Locale } from '@/types';
import type { MenuItem } from '@/types';
import { getLocalizedName } from '@/lib/utils/menu';

type Props = {
  item: MenuItem;
  locale: Locale;
  /** 뱃지 라벨 (예: "인기 1위", "사장님 추천") — 여러 개 가능 */
  badgeLabels?: string[];
  onAdd: () => void;
  onOpenDetail?: () => void;
};

export function OrderMenuCard({ item, locale, badgeLabels, onAdd, onOpenDetail }: Props) {
  const name = getLocalizedName(item, locale);
  const description = item.description_i18n?.[locale] ?? item.description ?? '';
  const spicyLevel = item.spicy_level ?? 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role={onOpenDetail ? 'button' : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onClick={onOpenDetail}
      onKeyDown={onOpenDetail ? (e) => e.key === 'Enter' && onOpenDetail() : undefined}
      className={`flex items-stretch gap-3 rounded-none border-b border-gray-100 bg-white py-4 transition active:bg-gray-50 ${onOpenDetail ? 'cursor-pointer' : ''}`}
    >
      {/* 왼쪽: 텍스트 + 뱃지 */}
      <div className="min-w-0 flex-1 py-0.5">
        {badgeLabels && badgeLabels.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {badgeLabels.map((label) => (
              <span
                key={label}
                className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 line-clamp-2">{name}</h3>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-gray-900">
            ₩{item.price.toLocaleString()}
          </span>
          {spicyLevel > 0 && (
            <span className="text-xs text-amber-600">🌶️ × {spicyLevel}</span>
          )}
        </div>
      </div>

      {/* 오른쪽: 이미지 80x80 + 원형 + 버튼 */}
      <div className="relative flex shrink-0 items-center">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={item.image_url.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-gray-300">
              🍽️
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onAdd();
          }}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-lg font-bold text-white shadow-md transition hover:bg-primary-600 active:scale-95"
          aria-label="Add to cart"
        >
          +
        </button>
      </div>
    </motion.article>
  );
}
