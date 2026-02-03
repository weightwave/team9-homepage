import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'zh-Hant', 'es', 'pt', 'fr', 'de', 'ja', 'ko', 'ru', 'it', 'nl'],
  defaultLocale: 'en'
});
