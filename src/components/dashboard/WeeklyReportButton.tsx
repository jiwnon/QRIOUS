'use client';

import { useState } from 'react';
import { WeeklyReportModal } from './WeeklyReportModal';

type Props = {
  restaurantId: string;
};

export function WeeklyReportButton({ restaurantId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-primary-500 bg-white px-4 py-2 text-sm font-medium text-primary-600 transition hover:bg-primary-50"
      >
        주간 리포트 보기
      </button>
      {open && (
        <WeeklyReportModal
          restaurantId={restaurantId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
