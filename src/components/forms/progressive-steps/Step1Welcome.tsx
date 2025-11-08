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
}

const Step1Welcome = ({ onContinue, brandColor, language, onLanguageChange, organizationName }: Step1WelcomeProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const welcomeTitle = organizationName 
    ? `${t.welcome.title} To ${organizationName}`
    : t.welcome.title;

  return (
    <div className="text-center space-y-3 py-2">
      {/* Language Selector */}
      <div className="flex justify-end mb-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] h-8 border-gray-300 bg-white hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-600" />
              <SelectValue>
                <span className="text-sm">{currentLang.flag} {currentLang.name}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[28rem]">
            {languages.map((lang) => (
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

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {welcomeTitle}
        </h1>
        <p className="text-base text-gray-600 max-w-md mx-auto">
          {t.welcome.subtitle}
        </p>
      </div>


      <div className="pt-1">
        <Button
          size="lg"
          onClick={onContinue}
          style={{ backgroundColor: brandColor }}
          className="px-8 py-4 text-base"
        >
          {t.welcome.beginButton}
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => window.location.href = '/resume-draft'}
          className="text-sm text-gray-600 hover:text-primary"
        >
          Resume a saved draft
        </Button>
      </div>

      <p className="text-xs text-gray-500 max-w-md mx-auto">
        {t.welcome.footer}
      </p>
    </div>
  );
};

export default Step1Welcome;
