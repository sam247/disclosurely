import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { SaveDraftButton } from './draft-controls/SaveDraftButton';

// Step components
import Step1Welcome from './progressive-steps/Step1Welcome';
import Step2Title from './progressive-steps/Step2Title';
import Step3Description from './progressive-steps/Step3Description';
import Step5Category from './progressive-steps/Step5Category';
import Step6Urgency from './progressive-steps/Step6Urgency';
import Step7WhenWhere from './progressive-steps/Step7WhenWhere';
import Step8Evidence from './progressive-steps/Step8Evidence';
import Step9Additional from './progressive-steps/Step9Additional';
import Step10Review from './progressive-steps/Step10Review';

export interface ProgressiveFormData {
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  customCategory: string;
  priority: number;
  incidentDate: string;
  location: string;
  witnesses: string;
  previousReports: boolean;
  additionalNotes: string;
}

interface ProgressiveReportFormProps {
  formData: ProgressiveFormData;
  updateFormData: (updates: Partial<ProgressiveFormData>) => void;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
  onSubmit: (data: ProgressiveFormData) => Promise<void>;
  isSubmitting: boolean;
  brandColor?: string;
  organizationId?: string;
  organizationName?: string;
  draftCode?: string;
  onDraftSaved?: (draftCode: string) => void;
  defaultLanguage?: string;
  availableLanguages?: string[] | null;
}

const ProgressiveReportForm = ({
  formData,
  updateFormData,
  attachedFiles,
  setAttachedFiles,
  onSubmit,
  isSubmitting,
  brandColor = '#6366f1',
  organizationId,
  organizationName,
  draftCode: initialDraftCode,
  onDraftSaved,
  defaultLanguage,
  availableLanguages
}: ProgressiveReportFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  // Use default_language from settings, fallback to 'en'
  const [language, setLanguage] = useState<string>(defaultLanguage || 'en');
  const [currentDraftCode, setCurrentDraftCode] = useState(initialDraftCode);

  // Total steps (Step 3 privacy check removed - inline redaction now available in each step)
  const totalSteps = 9; // Welcome(0), Title(1), Description(2), Category(3), Urgency(4), When/Where(5), Evidence(6), Additional(7), Review(8)

  // Step validation logic
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Welcome
        return true;
      case 1: // Title
        return formData.title.trim().length >= 5;
      case 2: // Description
        return formData.description.trim().length >= 20;
      case 3: // Category
        return !!(formData.mainCategory && formData.subCategory);
      case 4: // Urgency
        return formData.priority > 0;
      case 5: // When/Where
        return true; // Optional fields
      case 6: // Evidence
        return true; // Optional
      case 7: // Additional
        return true; // Optional
      case 8: // Review
        return true;
      default:
        return false;
    }
  }, [formData]);

  const goToStep = (step: number) => {
    if (step > currentStep) {
      setDirection('forward');
    } else {
      setDirection('backward');
    }
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Welcome to Title
      goToStep(1);
    } else if (currentStep === 1) {
      // Title to Description
      if (validateStep(1)) {
        goToStep(2);
      }
    } else if (currentStep === 2) {
      // Description to Category
      if (validateStep(2)) {
        goToStep(3); // Go to category
      }
    } else if (currentStep < totalSteps - 1) {
      // All other steps
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };



  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  // Load draft on mount if draftCode provided
  useEffect(() => {
    if (initialDraftCode) {
      // Draft loading is handled by parent component
      setCurrentDraftCode(initialDraftCode);
    }
  }, [initialDraftCode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        // Don't trigger on textareas or when button is focused
        if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'BUTTON') {
          e.preventDefault();
          if (currentStep < totalSteps - 1 && validateStep(currentStep)) {
            handleNext();
          }
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (currentStep > 0) {
          handleBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, isSubmitting, validateStep]);

  // Calculate progress percentage
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Determine which step component to render
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Welcome
            onContinue={handleNext}
            brandColor={brandColor}
            language={language}
            onLanguageChange={setLanguage}
            organizationName={organizationName}
            availableLanguages={availableLanguages}
          />
        );
      case 1:
        return (
          <Step2Title
            value={formData.title}
            onChange={(title) => updateFormData({ title })}
            isValid={validateStep(1)}
            language={language}
            organizationId={organizationId}
          />
        );
      case 2:
        return (
          <Step3Description
            value={formData.description}
            onChange={(description) => updateFormData({ description })}
            isValid={validateStep(2)}
            language={language}
            organizationId={organizationId}
          />
        );
      case 3:
        return (
          <Step5Category
            mainCategory={formData.mainCategory}
            subCategory={formData.subCategory}
            customCategory={formData.customCategory}
            onChange={updateFormData}
            isValid={validateStep(currentStep)}
            language={language}
          />
        );
      case 4:
        return (
          <Step6Urgency
            priority={formData.priority}
            onChange={(priority) => updateFormData({ priority })}
            language={language}
          />
        );
      case 5:
        return (
          <Step7WhenWhere
            incidentDate={formData.incidentDate}
            location={formData.location}
            onChange={updateFormData}
            language={language}
            organizationId={organizationId}
          />
        );
      case 6:
        return (
          <Step8Evidence
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            language={language}
          />
        );
      case 7:
        return (
          <Step9Additional
            witnesses={formData.witnesses}
            previousReports={formData.previousReports}
            onChange={updateFormData}
            language={language}
            organizationId={organizationId}
          />
        );
      case 8:
      case 9:
        return (
          <Step10Review
            formData={formData}
            attachedFiles={attachedFiles}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  // Don't show navigation on welcome or review steps
  const showNavigation = currentStep > 0 && currentStep < totalSteps - 1;
  const isNextDisabled = !validateStep(currentStep);

  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-0 flex flex-col" dir={language === 'el' ? 'ltr' : undefined}>
      {/* Progress bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            {currentStep === 0
              ? t.navigation.welcome
              : t.navigation.step
                  .replace('{current}', (currentStep + 1).toString())
                  .replace('{total}', totalSteps.toString())}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">{Math.round(progressPercent)}{t.navigation.percent}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step content with animation - Fully responsive, no fixed heights */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          currentStep === 9 || currentStep === 8
            ? 'min-h-[180px]' // Review step - min height only, allow scroll
            : currentStep === 0
            ? 'min-h-[198px] sm:min-h-[352px]' // Welcome step - min height to accommodate footer
            : 'min-h-[198px]' // All other steps - fully responsive, no fixed height
        }`}
        key={currentStep}
      >
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
          {/* Mobile: Stack buttons vertically */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2">
            {/* Mobile: Save Draft on top, then Back/Continue */}
            {organizationId && currentStep > 0 && (
              <div className="sm:hidden w-full">
                <SaveDraftButton
                  formData={formData}
                  currentStep={currentStep}
                  language={language}
                  organizationId={organizationId}
                  existingDraftCode={currentDraftCode}
                  onDraftSaved={(code) => {
                    setCurrentDraftCode(code);
                    onDraftSaved?.(code);
                  }}
                  brandColor={brandColor}
                />
              </div>
            )}
            
            {/* Back and Continue buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 h-11 sm:h-10 px-3 sm:px-4 flex-1 sm:flex-initial"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.navigation.back}</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={isNextDisabled || isSubmitting}
                style={{ backgroundColor: isNextDisabled ? undefined : brandColor }}
                className="flex items-center gap-2 h-11 sm:h-10 px-4 sm:px-4 flex-1 sm:flex-initial"
              >
                {t.navigation.continue}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Desktop: Save Draft on the right */}
            {organizationId && currentStep > 0 && (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <SaveDraftButton
                  formData={formData}
                  currentStep={currentStep}
                  language={language}
                  organizationId={organizationId}
                  existingDraftCode={currentDraftCode}
                  onDraftSaved={(code) => {
                    setCurrentDraftCode(code);
                    onDraftSaved?.(code);
                  }}
                  brandColor={brandColor}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveReportForm;
