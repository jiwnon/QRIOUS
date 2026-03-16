import { isNativeApp } from './index';

const SESSION_KEY = 'platemate_session';

/**
 * 세션 정보를 네이티브 스토리지에 저장 (앱 재시작해도 유지)
 */
export async function saveSessionToStorage(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  if (!isNativeApp()) return;

  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.set({
    key: SESSION_KEY,
    value: JSON.stringify({ accessToken, refreshToken }),
  });
}

/**
 * 저장된 세션으로 Supabase 자동 로그인
 * 앱 초기 진입 시 호출
 */
export async function restoreSessionFromStorage(): Promise<boolean> {
  if (!isNativeApp()) return false;

  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: SESSION_KEY });
    if (!value) return false;

    const { accessToken, refreshToken } = JSON.parse(value);
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) {
      // 토큰 만료 시 삭제
      await clearStoredSession();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function clearStoredSession(): Promise<void> {
  if (!isNativeApp()) return;
  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.remove({ key: SESSION_KEY });
}
