'use client';

import { useEffect, useState } from 'react';
import type { WeeklyReportContent } from '@/types';

type Props = {
  restaurantId: string;
  onClose: () => void;
};

export function WeeklyReportModal({ restaurantId, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<WeeklyReportContent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/dashboard/${restaurantId}/weekly-report`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(b));
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json as WeeklyReportContent);
          setStatus('success');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg((err as { error?: string }).error ?? '리포트를 불러올 수 없습니다.');
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">주간 AI 리포트</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          {status === 'loading' && (
            <p className="py-12 text-center text-gray-500">AI가 분석 중...</p>
          )}
          {status === 'error' && (
            <p className="py-8 text-center text-red-600">{errorMsg}</p>
          )}
          {status === 'success' && data && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-500">매출 요약</p>
                <p className="mt-1 text-gray-900">{data.sales_summary}</p>
              </div>
              {data.top_insights.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-medium uppercase text-blue-700">인사이트</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-800">
                    {data.top_insights.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.recommendations.length > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="text-xs font-medium uppercase text-emerald-700">개선 제안</p>
                  <ul className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-800">
                    {data.recommendations.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-xs font-medium uppercase text-amber-700">주의 사항</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-800">
                    {data.warnings.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
