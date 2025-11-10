import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
];

interface Step1WelcomeProps {
  onContinue: () => void;
  brandColor: string;
  language: string;
  onLanguageChange: (language: string) => void;
  organizationName?: string;
  availableLanguages?: string[] | null;
}

const Step1Welcome = ({ onContinue, brandColor, language, onLanguageChange, organizationName, availableLanguages }: Step1WelcomeProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  
  // Filter languages based on availableLanguages from settings
  // If availableLanguages is null/undefined, show all languages (backward compatibility)
  const filteredLanguages = availableLanguages && availableLanguages.length > 0
    ? languages.filter(lang => availableLanguages.includes(lang.code))
    : languages;
  
  // Ensure current language is in filtered list, if not, use first available
  const currentLang = filteredLanguages.find(lang => lang.code === language) || filteredLanguages[0];
  
  // If current language is not in available languages, switch to first available
  useEffect(() => {
    if (availableLanguages && availableLanguages.length > 0 && !availableLanguages.includes(language)) {
      onLanguageChange(filteredLanguages[0].code);
    }
  }, [availableLanguages, language, filteredLanguages, onLanguageChange]);

  const welcomeTitle = organizationName 
    ? `${t.welcome.title} To ${organizationName}`
    : t.welcome.title;

  return (
    <div className="text-center space-y-4 sm:space-y-6 py-2">
      {/* Language Selector */}
      <div className="flex justify-end items-center mb-2">
        {/* Language Selector - Responsive, stays on one line */}
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[120px] sm:w-[140px] h-9 sm:h-8 border-gray-300 bg-white hover:bg-gray-50">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Globe className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <SelectValue>
                <span className="text-xs sm:text-sm truncate whitespace-nowrap">{currentLang.flag} {currentLang.name}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[28rem]">
            {filteredLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-2 break-words">
          {welcomeTitle}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4 break-words">
          {t.welcome.subtitle}
        </p>
      </div>

      <div className="pt-4 sm:pt-6 px-4">
        <Button
          size="lg"
          onClick={onContinue}
          style={{ backgroundColor: brandColor }}
          className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-12 sm:h-auto w-full sm:w-auto"
        >
          {t.welcome.beginButton}
        </Button>
      </div>

      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <Button
            variant="link"
            onClick={() => window.location.href = '/status'}
            className="text-xs sm:text-sm text-gray-600 hover:text-primary h-9 sm:h-auto"
          >
            Check Existing Report
          </Button>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Button
            variant="link"
            onClick={() => window.location.href = '/resume-draft'}
            className="text-xs sm:text-sm text-gray-600 hover:text-primary h-9 sm:h-auto"
          >
            Resume a saved draft
          </Button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-4 break-words mt-2 sm:mt-4">
        {t.welcome.footer}
      </p>
    </div>
  );
};

export default Step1Welcome;
