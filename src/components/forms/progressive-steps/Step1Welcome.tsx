import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Search, FileText } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  const navigate = useNavigate();
  
  // If current language is not in available languages, switch to first available
  useEffect(() => {
    if (availableLanguages && availableLanguages.length > 0 && !availableLanguages.includes(language)) {
      onLanguageChange(filteredLanguages[0].code);
    }
  }, [availableLanguages, language, filteredLanguages, onLanguageChange]);
  const { toast } = useToast();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const welcomeTitle = organizationName 
    ? `${t.welcome.title} To ${organizationName}`
    : t.welcome.title;

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast({
        title: "Tracking ID required",
        description: "Please enter your tracking ID to check the status.",
        variant: "destructive",
      });
      return;
    }

    // Validate tracking ID format (DIS-XXXXXXXX)
    const trackingIdPattern = /^DIS-[A-Z0-9]{8}$/i;
    const cleanTrackingId = trackingId.trim().toUpperCase().replace(/\s+/g, '');
    
    if (!trackingIdPattern.test(cleanTrackingId)) {
      toast({
        title: "Invalid tracking ID",
        description: "Please enter a valid tracking ID in the format DIS-XXXXXXXX.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingStatus(true);

    try {
      // Use secure RPC to validate existence and get organization info
      const { data: orgRows, error: orgError } = await supabase.rpc(
        'get_organization_by_tracking_id',
        { p_tracking_id: cleanTrackingId }
      );

      if (orgError) {
        console.error('RPC error during status lookup:', orgError);
        throw new Error('Unable to check status right now. Please try again.');
      }

      if (!orgRows || orgRows.length === 0) {
        throw new Error('Report not found. Please check your tracking ID and try again.');
      }

      // Navigate to messaging page with tracking ID
      setIsStatusDialogOpen(false);
      setTrackingId(''); // Reset tracking ID
      navigate(`/secure/tool/messaging/${cleanTrackingId}`, {
        state: {
          trackingId: cleanTrackingId,
          organizationData: orgRows[0],
        },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check report status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="text-center space-y-3 sm:space-y-4 py-2">
      {/* Language Selector and Check Status Button */}
      <div className="flex justify-between items-center mb-2">
        {/* Check Existing Report Button */}
        <Dialog 
          open={isStatusDialogOpen} 
          onOpenChange={(open) => {
            setIsStatusDialogOpen(open);
            if (!open) {
              setTrackingId(''); // Reset tracking ID when dialog closes
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 sm:h-8 border-gray-300 bg-white hover:bg-gray-50 gap-2"
            >
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-xs sm:text-sm">Check Existing Report</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[800px] sm:w-full">
            <DialogHeader>
              <DialogTitle>Check Report Status</DialogTitle>
              <DialogDescription>
                Enter your tracking ID to view your report status and communicate securely.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input
                  id="trackingId"
                  type="text"
                  placeholder="DIS-XXXXXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="font-mono"
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  Use the tracking ID provided when you submitted your report
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isCheckingStatus}
                style={{ backgroundColor: brandColor }}
              >
                {isCheckingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Language Selector */}
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[120px] sm:w-[140px] h-9 sm:h-8 border-gray-300 bg-white hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-600" />
              <SelectValue>
                <span className="text-xs sm:text-sm">{currentLang.flag} {currentLang.name}</span>
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

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-2">
          {welcomeTitle}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
          {t.welcome.subtitle}
        </p>
      </div>


      <div className="pt-2 sm:pt-1 px-4">
        <Button
          size="lg"
          onClick={onContinue}
          style={{ backgroundColor: brandColor }}
          className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-12 sm:h-auto w-full sm:w-auto"
        >
          {t.welcome.beginButton}
        </Button>
      </div>

      <div className="text-center space-y-2">
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

      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-4">
        {t.welcome.footer}
      </p>
    </div>
  );
};

export default Step1Welcome;
