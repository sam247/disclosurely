import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string) => void;
  onShowOriginal: () => void;
  isTranslated: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const TranslateButton = ({ 
  text, 
  onTranslated, 
  onShowOriginal, 
  isTranslated,
  size = 'sm',
  variant = 'outline'
}: TranslateButtonProps) => {
  const { toast } = useToast();
  const { i18n, t } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (isTranslated) {
      onShowOriginal();
      return;
    }

    setIsTranslating(true);
    try {
      const targetLanguage = getLanguageName(i18n.language);
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { 
          text,
          targetLanguage
        }
      });

      if (error) throw error;

      if (data?.translatedText) {
        onTranslated(data.translatedText);
        toast({
          title: t('translate'),
          description: `Translated to ${targetLanguage}`,
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : 'Failed to translate text',
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'pl': 'Polish',
      'zh': 'Mandarin Chinese',
      'hi': 'Hindi',
      'ar': 'Modern Standard Arabic',
      'bn': 'Bengali',
      'ko': 'Korean',
      'ja': 'Japanese',
      'ur': 'Urdu'
    };
    return languages[code] || 'English';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTranslate}
      loading={isTranslating}
      loadingText={t('translating')}
      disabled={isTranslating}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {isTranslated ? t('showOriginal') : t('translate')}
    </Button>
  );
};

export default TranslateButton;
