import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 语言包直接打包（体积小，避免 http-backend 额外依赖与加载闪烁）
import id from '../public/locales/id.json';
import en from '../public/locales/en.json';
import zh from '../public/locales/zh.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const resources = {
  id: { translation: id },
  en: { translation: en },
  zh: { translation: zh },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // 印尼语为默认（目标市场），中文/英文可选
    fallbackLng: 'id',
    supportedLngs: ['id', 'en', 'zh'],
    defaultNS: 'translation',

    detection: {
      // 优先级：localStorage > 浏览器语言 > HTML lang
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'aceproxy_lang',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React 已自动转义，避免双重转义
    },

    react: {
      useSuspense: false, // 避免 Suspense 边界，配合骨架屏
    },
  });

export default i18n;
