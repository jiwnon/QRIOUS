import { isNativeApp } from './index';

/**
 * 푸시 알림 권한 요청 + FCM 토큰 획득
 * 토큰은 Supabase profiles 테이블에 저장
 */
export async function initPushNotifications(userId: string): Promise<void> {
  if (!isNativeApp()) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  // 권한 확인
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') {
    console.warn('[Push] 알림 권한 거부됨');
    return;
  }

  // FCM 등록
  await PushNotifications.register();

  // 토큰 수신 → Supabase 저장
  await PushNotifications.addListener('registration', async (token) => {
    console.log('[Push] FCM 토큰:', token.value);
    await savePushToken(userId, token.value);
  });

  // 등록 실패
  await PushNotifications.addListener('registrationError', (err) => {
    console.error('[Push] 등록 실패:', err.error);
  });

  // 앱 포그라운드에서 알림 수신
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[Push] 수신:', notification);
  });

  // 알림 탭해서 앱 열기
  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[Push] 액션:', action);
    // 특정 주문 페이지로 이동 등 처리 가능
    const data = action.notification.data;
    if (data?.orderId) {
      window.location.href = `/dashboard`;
    }
  });
}

async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { getPlatform } = await import('./index');

    await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token,
        platform: getPlatform(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    );
  } catch (err) {
    console.error('[Push] 토큰 저장 실패:', err);
  }
}

export async function removePushToken(userId: string): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { getPlatform } = await import('./index');

    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', getPlatform());
  } catch (err) {
    console.error('[Push] 토큰 삭제 실패:', err);
  }
}
