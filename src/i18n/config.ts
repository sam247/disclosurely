import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pl from './locales/pl.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import ur from './locales/ur.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      pl: { translation: pl },
      zh: { translation: zh },
      hi: { translation: hi },
      ar: { translation: ar },
      bn: { translation: bn },
      ko: { translation: ko },
      ja: { translation: ja },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
