import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const PublicLanguageSelector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Update URL to include language code
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // Remove existing language code if present
    const languageCodes = languages.map(lang => lang.code);
    if (languageCodes.includes(pathSegments[0])) {
      pathSegments.shift();
    }
    
    // Add new language code (except for English which is default)
    const newPath = languageCode === 'en' 
      ? `/${pathSegments.join('/')}`
      : `/${languageCode}/${pathSegments.join('/')}`;
    
    navigate(newPath);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] h-9 border-gray-300 bg-white hover:bg-gray-50">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">{currentLanguage.flag}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200 z-[100]">
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
  );
};

export default PublicLanguageSelector;
