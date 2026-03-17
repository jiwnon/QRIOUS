'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (params: Record<string, unknown>) => void;
      };
    };
  }
}

type Props = {
  couponCode: string;
  onClose: () => void;
};

function downloadCouponImage(code: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#fff7ed';
  ctx.fillRect(0, 0, 480, 260);
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(12, 12, 456, 236);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(12, 12, 456, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('10% DISCOUNT COUPON', 240, 57);
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 42px "Courier New"';
  ctx.fillText(code, 240, 145);
  ctx.fillStyle = '#6b7280';
  ctx.font = '15px Arial';
  ctx.fillText('Next visit: Enter this code at checkout', 240, 185);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px Arial';
  ctx.fillText('Valid for 1 year  |  platem8.xyz', 240, 220);

  const link = document.createElement('a');
  link.download = `coupon-${code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function CouponModal({ couponCode, onClose }: Props) {
  const kakaoReady = useRef(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key) return;

    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
      kakaoReady.current = true;
    };

    if (window.Kakao) {
      initKakao();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakaojs/2.7.4/kakao.min.js';
    script.async = true;
    script.onload = initKakao;
    document.head.appendChild(script);
  }, []);

  const shareText = `재방문 10% 할인 쿠폰 받았어요!\n쿠폰 코드: ${couponCode}\nPlatem8(platem8.xyz) 결제 시 입력하세요 🎟`;

  const handleKakaoShare = () => {
    if (!window.Kakao?.isInitialized()) {
      // SDK 미로드 시 클립보드 폴백
      navigator.clipboard.writeText(shareText).catch(() => {});
      alert('카카오 공유를 불러오는 중입니다. 쿠폰 정보가 복사되었습니다!');
      return;
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '재방문 10% 할인 쿠폰 🎟',
        description: `쿠폰 코드: ${couponCode}\nPlatem8 결제 화면에서 입력하세요`,
        imageUrl: 'https://platem8.xyz/icons/icon-512x512.png',
        link: {
          mobileWebUrl: 'https://platem8.xyz',
          webUrl: 'https://platem8.xyz',
        },
      },
      buttons: [
        {
          title: 'Platemate에서 주문하기',
          link: {
            mobileWebUrl: 'https://platem8.xyz',
            webUrl: 'https://platem8.xyz',
          },
        },
      ],
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '10% 할인 쿠폰', text: shareText });
        return;
      } catch {
        // 취소 시 무시
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      alert('쿠폰 정보가 클립보드에 복사되었습니다!');
    } catch {
      alert(`쿠폰 코드: ${couponCode}`);
    }
  };

  const emailBody = encodeURIComponent(
    `재방문 10% 할인 쿠폰\n쿠폰 코드: ${couponCode}\n\nPlatem8(platem8.xyz) 결제 화면에서 코드를 입력하세요.`
  );
  const emailUrl = `mailto:?subject=${encodeURIComponent('재방문 10% 할인 쿠폰')}&body=${emailBody}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://platem8.xyz')}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="bg-orange-500 px-6 py-5 text-center">
          <p className="text-4xl">🎟</p>
          <p className="mt-1 text-xl font-bold text-white">할인 쿠폰이 발급되었습니다!</p>
          <p className="mt-1 text-sm text-orange-100">리뷰를 남겨주셔서 감사합니다 🙏</p>
        </div>

        {/* 쿠폰 본문 */}
        <div className="border-b-2 border-dashed border-orange-200 bg-orange-50 px-6 py-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-orange-400">쿠폰 번호</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-gray-900">
            {couponCode}
          </p>
          <div className="mt-3 inline-block rounded-full bg-orange-100 px-4 py-1">
            <p className="text-sm font-semibold text-orange-700">10% 할인 · 유효기간 1년</p>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            다음 방문 시 결제 화면에서 이 번호를 입력하세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => downloadCouponImage(couponCode)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-700"
          >
            📥 이미지로 저장
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-medium text-white transition hover:bg-green-600"
          >
            📤 공유하기
          </button>
          <div className="flex gap-2">
            {/* 카카오톡 */}
            <button
              type="button"
              onClick={handleKakaoShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-gray-800 transition hover:brightness-95"
              style={{ backgroundColor: '#FEE500' }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.857c0 2.754 1.653 5.182 4.162 6.68-.183.683-.663 2.474-.76 2.858-.12.476.174.471.367.342.15-.1 2.39-1.624 3.358-2.28.61.086 1.233.13 1.873.13 5.523 0 10-3.477 10-7.73C22 6.477 17.523 3 12 3z" />
              </svg>
              카카오톡
            </button>
            {/* LINE */}
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#06C755">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE
            </a>
            {/* 이메일 */}
            <a
              href={emailUrl}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ✉️ 이메일
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm text-gray-400 transition hover:text-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
