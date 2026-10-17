import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export const supportedLocales = ['en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = 'en';

const getInitialLocale = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const savedLocale = localStorage.getItem('i18nextLng');
      if (
        savedLocale &&
        supportedLocales.includes(savedLocale as SupportedLocale)
      ) {
        return savedLocale;
      }

      const browserLocale = navigator.language.split('-')[0];
      if (supportedLocales.includes(browserLocale as SupportedLocale)) {
        return browserLocale;
      }
    } catch {
      // Fall through to defaultLocale if storage or navigator is unavailable
    }
  }

  return defaultLocale;
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: getInitialLocale(),
  fallbackLng: defaultLocale,
  supportedLngs: supportedLocales,
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  const activeLng = i18n.language || defaultLocale;
  document.documentElement.lang = activeLng;
  document.documentElement.dir = i18n.dir(activeLng);

  i18n.on('languageChanged', (lng: string) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(lng);
  });
}

export default i18n;
