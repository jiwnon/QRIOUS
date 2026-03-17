import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en', 'zh', 'ja', 'ru'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
  localeDetection: false,
});
