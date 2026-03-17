'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ReviewItem = {
  id: string;
  rating: number;
  food_rating: number | null;
  service_rating: number | null;
  comment: string | null;
  liked_item_names: string[];
  created_at: string;
};

type ReviewsData = {
  total: number;
  avgRating: number;
  avgFoodRating: number;
  avgServiceRating: number;
  distribution: Record<number, number>;
  topLikedItems: { name: string; count: number }[];
  recentReviews: ReviewItem[];
};

type Props = {
  restaurantId: string;
  locale: string;
};

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ScoreRing({ score, label, sub }: { score: number; label: string; sub?: string }) {
  const pct = (score / 5) * 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 72 72" className="-rotate-90 h-20 w-20">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke="url(#scoreGrad)" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900 leading-none">{score.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-right text-xs font-medium text-gray-500">{star}</span>
      <svg viewBox="0 0 12 12" className="h-3 w-3 flex-shrink-0 text-amber-400" fill="currentColor">
        <path d="M6 0l1.5 4H12L8.5 6.5 10 11 6 8.5 2 11l1.5-4.5L0 4h4.5z" />
      </svg>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-gray-400">{pct}%</span>
    </div>
  );
}

function ratingColor(r: number) {
  if (r >= 4) return 'text-emerald-600 bg-emerald-50';
  if (r >= 3) return 'text-amber-600 bg-amber-50';
  return 'text-red-500 bg-red-50';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function ReviewsDashboardContent({ restaurantId, locale }: Props) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/${restaurantId}/reviews`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-lg bg-gray-200" />
          <div className="h-40 rounded-2xl bg-white" />
          <div className="h-60 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { total, avgRating, avgFoodRating, avgServiceRating, distribution, topLikedItems, recentReviews } = data;

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard/${restaurantId}`}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            대시보드
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">리뷰 분석</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 p-6">

        {/* 총 리뷰 없을 때 */}
        {total === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold text-gray-700">아직 리뷰가 없어요</p>
            <p className="mt-1 text-sm text-gray-400">손님이 식사 후 평가를 남기면 여기에 표시됩니다.</p>
          </div>
        )}

        {total > 0 && (
          <>
            {/* 종합 점수 카드 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* 종합 */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">종합 평점</p>
                  <div className="text-6xl font-black text-gray-900 leading-none">{avgRating.toFixed(1)}</div>
                  <StarRow value={avgRating} />
                  <p className="text-sm text-gray-400">리뷰 {total.toLocaleString()}건</p>
                </div>

                {/* 구분선 */}
                <div className="hidden sm:block w-px self-stretch bg-gray-100" />
                <div className="block sm:hidden h-px w-full bg-gray-100" />

                {/* 세부 점수 */}
                <div className="flex flex-1 justify-around gap-6 w-full">
                  <ScoreRing score={avgFoodRating} label="음식 맛" sub="Food" />
                  <ScoreRing score={avgServiceRating} label="서비스" sub="Service" />
                </div>
              </div>
            </div>

            {/* 분포 + 인기 메뉴 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* 평점 분포 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="mb-4 text-sm font-semibold text-gray-700">평점 분포</h2>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar key={star} star={star} count={distribution[star] ?? 0} total={total} />
                  ))}
                </div>
              </div>

              {/* 인기 메뉴 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <h2 className="mb-4 text-sm font-semibold text-gray-700">손님이 좋아한 메뉴 TOP 5</h2>
                {topLikedItems.length === 0 ? (
                  <p className="text-sm text-gray-400">좋아요 데이터가 없습니다.</p>
                ) : (
                  <ol className="space-y-3">
                    {topLikedItems.map((item, i) => (
                      <li key={item.name} className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0
                              ? 'bg-amber-400 text-white'
                              : i === 1
                              ? 'bg-gray-300 text-white'
                              : i === 2
                              ? 'bg-orange-300 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.count}회</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* 최근 리뷰 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">
                최근 리뷰
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                  최근 {recentReviews.length}건
                </span>
              </h2>
              <ul className="space-y-3">
                {recentReviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 종합 별점 뱃지 */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${ratingColor(review.rating)}`}
                        >
                          ★ {review.rating}.0
                        </span>
                        {/* 음식/서비스 */}
                        {review.food_rating != null && (
                          <span className="text-xs text-gray-400">
                            음식 <span className="font-medium text-gray-600">{review.food_rating}★</span>
                          </span>
                        )}
                        {review.service_rating != null && (
                          <span className="text-xs text-gray-400">
                            서비스 <span className="font-medium text-gray-600">{review.service_rating}★</span>
                          </span>
                        )}
                      </div>
                      <time className="flex-shrink-0 text-xs text-gray-400">{formatDate(review.created_at)}</time>
                    </div>

                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    )}

                    {review.liked_item_names.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {review.liked_item_names.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 border border-orange-100"
                          >
                            👍 {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
