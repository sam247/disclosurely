import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { usePIIDetector } from '@/hooks/usePIIDetector';
import { PIIWarningBox } from '@/components/forms/PIIWarningBox';

interface Step2TitleProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  language: string;
  organizationId?: string;
}

const Step2Title = ({ value, onChange, isValid, language, organizationId }: Step2TitleProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time PII detection
  const { hasPII, detections, isDetecting, hasError } = usePIIDetector(value, {
    debounce: 500,
    organizationId,
    confidenceThreshold: 0.4,
  });

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-4 py-2 flex flex-col">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              {t.step1.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {t.step1.subtitle}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="title" className="text-sm sm:text-base">
              {t.step1.label}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">{t.step1.tooltipTitle}</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>{t.step1.tooltipExample1}</li>
                  <li>{t.step1.tooltipExample2}</li>
                  <li>{t.step1.tooltipExample3}</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            ref={inputRef}
            id="title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.step1.placeholder}
            className={`text-base sm:text-lg min-h-[52px] sm:min-h-[56px] ${
              hasPII ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            maxLength={200}
            autoComplete="off"
          />
          
          {/* PII detection feedback */}
          {value.length > 10 && (
            <div className="space-y-2">
              <PIIWarningBox detections={detections} isDetecting={isDetecting} />
              {!isDetecting && !hasPII && !hasError && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  ✅ No personal information detected
                </div>
              )}
              {!isDetecting && hasError && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  ⚠️ Unable to check for personal information. Please review your content carefully.
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs sm:text-sm gap-2 mt-2">
            <div className="text-gray-500 min-w-0 flex-1">
              {!isValid && value.length > 0 && value.length < 5 && (
                <span className="text-amber-600">{t.step1.minChars}</span>
              )}
              {isValid && (
                <span className="text-green-600">{t.step1.looksGood}</span>
              )}
            </div>
            <span className="text-gray-400 flex-shrink-0">{value.length}{t.step1.charCount}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Step2Title;
