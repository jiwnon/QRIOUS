import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.platemate.app',
  appName: 'Platemate',
  webDir: 'out',
  server: {
    // 개발/배포 모두 라이브 URL 사용 (OpenNext/Cloudflare Workers SSR 유지)
    url: 'https://platem8.xyz',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#fef7ee',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ec751c',
    },
  },
  android: {
    backgroundColor: '#fef7ee',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
