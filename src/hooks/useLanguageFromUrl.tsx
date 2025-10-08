import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const supportedLanguages = ['en', 'es', 'fr', 'de', 'pl'];

export const useLanguageFromUrl = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && supportedLanguages.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    } else if (!lang && i18n.language !== 'en') {
      // Default to English if no language in URL
      i18n.changeLanguage('en');
    }
  }, [lang, i18n]);

  return { currentLanguage: lang || 'en' };
};
