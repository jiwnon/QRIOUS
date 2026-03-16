// Capacitor 플러그인은 네이티브 앱 환경에서만 임포트
// 브라우저에서는 모두 no-op으로 처리

export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
};

export const getPlatform = (): 'android' | 'ios' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const platform = cap?.getPlatform?.();
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  return 'web';
};
