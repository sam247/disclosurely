import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const countryToLanguageMap: Record<string, string> = {
  ES: 'es', // Spain
  MX: 'es', // Mexico
  AR: 'es', // Argentina
  CO: 'es', // Colombia
  CL: 'es', // Chile
  PE: 'es', // Peru
  VE: 'es', // Venezuela
  FR: 'fr', // France
  BE: 'fr', // Belgium (also Dutch, but defaulting to French)
  CH: 'fr', // Switzerland (also German/Italian)
  CA: 'fr', // Canada (also English)
  DE: 'de', // Germany
  AT: 'de', // Austria
  LU: 'de', // Luxembourg (also French)
  PL: 'pl', // Poland
  SE: 'sv', // Sweden
  NO: 'no', // Norway
  PT: 'pt', // Portugal
  BR: 'pt', // Brazil
  IT: 'it', // Italy
  NL: 'nl', // Netherlands
  DK: 'da', // Denmark
  GR: 'el', // Greece
  CY: 'el', // Cyprus
};

export const useGeographicalLanguage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run on first load and if not already on a language-specific path
    const hasLanguageInPath = /^\/(es|fr|de|pl|sv|no|pt|it|nl|da|el)(\/|$)/.test(location.pathname);
    
    if (hasLanguageInPath || sessionStorage.getItem('language-detected')) {
      return;
    }

    const detectAndRedirect = async () => {
      try {
        // Use a geolocation API to detect user's country
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Geolocation failed');
        
        const data = await response.json();
        const userCountry = data.country_code;
        const suggestedLang = countryToLanguageMap[userCountry];

        if (suggestedLang && suggestedLang !== 'en') {
          // Mark that we've detected language
          sessionStorage.setItem('language-detected', 'true');
          
          // Change i18n language
          i18n.changeLanguage(suggestedLang);
          
          // Redirect to language-specific path
          const currentPath = location.pathname === '/' ? '' : location.pathname;
          navigate(`/${suggestedLang}${currentPath}`, { replace: true });
        } else {
          sessionStorage.setItem('language-detected', 'true');
        }
      } catch (error) {
        // Silently fail - just use default English
        sessionStorage.setItem('language-detected', 'true');
        console.log('Geographical language detection unavailable');
      }
    };

    detectAndRedirect();
  }, [location.pathname, navigate, i18n]);
};
