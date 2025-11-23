import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { usePIIDetector } from '@/hooks/usePIIDetector';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Step3DescriptionProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  language: string;
  organizationId?: string;
}

const Step3Description = ({ value, onChange, isValid, language, organizationId }: Step3DescriptionProps) => {
  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real-time PII detection
  const { hasPII, detections, isDetecting } = usePIIDetector(value, {
    debounce: 500,
    organizationId,
    confidenceThreshold: 0.4, // Strict for anonymous reports
  });

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Simulate AI analysis indicator when user has typed enough
  useEffect(() => {
    if (value.length > 50) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <TooltipProvider>
      <div className="space-y-4 py-2 flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {t.step2.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.step2.subtitle}
          </p>
        </div>
      </div>

        <div className="space-y-2 flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2">
            <Label htmlFor="description" className="text-base">
              {t.step2.label}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">{t.step2.tooltipTitle}</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li><strong>What</strong> {t.step2.tooltipWhat}</li>
                  <li><strong>When</strong> {t.step2.tooltipWhen}</li>
                  <li><strong>Who</strong> {t.step2.tooltipWho}</li>
                  <li><strong>Where</strong> {t.step2.tooltipWhere}</li>
                  <li><strong>Impact</strong> {t.step2.tooltipImpact}</li>
                </ul>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="h-4 w-4 text-purple-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-2">{t.step2.aiPrivacyTitle}</p>
                <p className="text-sm mb-2">{t.step2.aiPrivacyDesc}</p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>{t.step2.aiPrivacy1}</li>
                  <li>{t.step2.aiPrivacy2}</li>
                  <li>{t.step2.aiPrivacy3}</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            ref={textareaRef}
            id="description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.step2.placeholder}
            className={`min-h-[120px] sm:min-h-[180px] flex-1 text-base resize-none ${
              hasPII ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            maxLength={5000}
          />
          
          {/* Real-time PII detection feedback */}
          {value.length > 50 && (
            <div className="space-y-2">
              {isDetecting && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Checking for personal information...
                </div>
              )}
              
              {!isDetecting && hasPII && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>⚠️ Personal Information Detected</strong>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {detections.slice(0, 5).map((detection, i) => (
                        <li key={i}>
                          {detection.type.replace('_', ' ')}: Remove this to maintain anonymity
                        </li>
                      ))}
                      {detections.length > 5 && (
                        <li className="text-xs">...and {detections.length - 5} more</li>
                      )}
                    </ul>
                    <p className="mt-2 text-xs">
                      Tip: Use general terms instead of specific names, emails, or phone numbers.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              {!isDetecting && !hasPII && value.length > 50 && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  ✅ No personal information detected
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm mt-2 flex-shrink-0">
            <div className="text-gray-500">
              {!isValid && value.length > 0 && value.length < 20 && (
                <span className="text-amber-600">{t.step2.minChars}</span>
              )}
              {isValid && !isAnalyzing && !hasPII && (
                <span className="text-green-600">{t.step2.goodDetail}</span>
              )}
              {isAnalyzing && (
                <span className="text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  {t.step2.analyzing}
                </span>
              )}
            </div>
            <span className="text-gray-400">{value.length}{t.step2.charCount}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Step3Description;
