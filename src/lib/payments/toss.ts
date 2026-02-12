/**
 * 토스페이먼츠 연동 (한국 결제)
 * 결제 요청: 클라이언트 SDK, 결제 승인: API Route
 */
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

export function getTossClientKey() {
  return TOSS_CLIENT_KEY ?? '';
}

export function getTossSecretKey() {
  return TOSS_SECRET_KEY ?? '';
}

export type TossConfirmBody = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

/** 서버에서 토스 결제 승인 요청 */
export async function confirmTossPayment(body: TossConfirmBody): Promise<{ success: boolean; error?: string }> {
  const secret = getTossSecretKey();
  if (!secret) {
    return { success: false, error: 'TOSS_SECRET_KEY not configured' };
  }

  const res = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(secret + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: (err as { message?: string }).message ?? res.statusText };
  }
  return { success: true };
}
