import { Button } from '@/components/ui/button';
import { Shield, Lock, Clock, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Step1WelcomeProps {
  onContinue: () => void;
  brandColor: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'ru', name: 'Русский' },
];

const Step1Welcome = ({ onContinue, brandColor }: Step1WelcomeProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <div className="text-center space-y-5 py-4">
      {/* Language Selector */}
      <div className="flex justify-end">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-sm">
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <div
          className="p-4 rounded-full"
          style={{ backgroundColor: `${brandColor}15` }}
        >
          <Shield className="w-12 h-12" style={{ color: brandColor }} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Submit a Confidential Report
        </h1>
        <p className="text-base text-gray-600 max-w-md mx-auto">
          Your identity is protected. Takes approximately 5 minutes.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
        <div className="flex flex-col items-center text-center space-y-2 p-3">
          <div className="p-2 rounded-lg bg-green-50">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900">100% Anonymous</h3>
          <p className="text-xs text-gray-600">
            Your identity remains completely confidential
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-2 p-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900">Secure & Encrypted</h3>
          <p className="text-xs text-gray-600">
            All data encrypted with enterprise-grade protection
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-2 p-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900">~5 Minutes</h3>
          <p className="text-xs text-gray-600">
            Quick process with step-by-step guidance
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="lg"
          onClick={onContinue}
          style={{ backgroundColor: brandColor }}
          className="px-8 py-5 text-base"
        >
          Let's Begin →
        </Button>
      </div>

      <p className="text-xs text-gray-500 max-w-md mx-auto">
        By continuing, you agree that the information you provide will be reviewed by authorized personnel.
      </p>
    </div>
  );
};

export default Step1Welcome;
