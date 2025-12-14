import AICaseHelper from '@/components/AICaseHelper';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOrganization } from '@/hooks/useOrganization';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const AIHelperView = () => {
  const { t } = useTranslation();
  const { organization } = useOrganization();
  const { data: aiCaseHelperEnabled, isLoading: aiCaseHelperLoading } = useFeatureFlag('ai_case_helper', organization?.id);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (aiCaseHelperLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (aiCaseHelperEnabled === false) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            AI Case Helper feature is currently disabled. Please contact support if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className={isMobile ? 'h-full flex flex-col min-h-0' : 'space-y-6'}>
      <div className={isMobile ? 'flex-shrink-0 mb-4' : ''}>
        <h1 className="text-xl sm:text-2xl font-bold">{t('aiCaseHelperTitle')}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <p className="text-muted-foreground text-sm sm:text-base">{t('aiCaseHelperDescription')}</p>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full hover:bg-muted active:bg-muted transition-colors p-1.5 touch-manipulation"
                  aria-label="Quick start guide"
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                align="start"
                sideOffset={8}
                className="max-w-[280px] sm:max-w-xs p-4 bg-blue-50 border-blue-200 text-sm"
              >
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Quick Start Guide</p>
                  <ol className="text-xs sm:text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                    <li>Select a case from the dropdown below</li>
                    <li>Click <strong>"Preview"</strong> to see what PII will be redacted</li>
                    <li>Click <strong>"Analyze"</strong> to get AI compliance guidance</li>
                    <li>Use the chat to ask follow-up questions</li>
                  </ol>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={isMobile ? 'flex-1 min-h-0 overflow-hidden' : ''}>
        <AICaseHelper />
      </div>
    </div>
  );
};

export default AIHelperView;
