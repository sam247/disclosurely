import AICaseHelper from '@/components/AICaseHelper';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const AIHelperView = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('aiCaseHelperTitle')}</h1>
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
      <AICaseHelper />
    </div>
  );
};

export default AIHelperView;
