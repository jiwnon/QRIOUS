'use client';

import { useEffect } from 'react';
import { isNativeApp } from '@/lib/capacitor';
import { restoreSessionFromStorage } from '@/lib/capacitor/auto-login';
import { initPushNotifications } from '@/lib/capacitor/push-notifications';
import { createClient } from '@/lib/supabase/client';

/**
 * 네이티브 앱 환경 초기화
 * - 자동 로그인 (저장된 세션 복구)
 * - 푸시 알림 등록
 * _app/[locale]/layout.tsx 에 추가
 */
export default function CapacitorProvider() {
  useEffect(() => {
    if (!isNativeApp()) return;

    async function init() {
      // 1. 저장된 세션으로 자동 로그인 시도
      await restoreSessionFromStorage();

      // 2. 현재 로그인된 유저 확인
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 3. 푸시 알림 초기화
      await initPushNotifications(user.id);

      // 4. 이후 로그인/로그아웃 이벤트 감지 → 세션 저장/삭제
      supabase.auth.onAuthStateChange(async (event, session) => {
        const { saveSessionToStorage, clearStoredSession } = await import('@/lib/capacitor/auto-login');
        const { removePushToken } = await import('@/lib/capacitor/push-notifications');

        if (event === 'SIGNED_IN' && session) {
          await saveSessionToStorage(session.access_token, session.refresh_token);
          await initPushNotifications(session.user.id);
        }

        if (event === 'SIGNED_OUT') {
          if (user) await removePushToken(user.id);
          await clearStoredSession();
        }
      });
    }

    init();
  }, []);

  return null;
}
