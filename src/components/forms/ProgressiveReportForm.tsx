import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { scanForPrivacyRisks } from '@/utils/privacyDetection';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';
import { SaveDraftButton } from './draft-controls/SaveDraftButton';

// Step components
import Step1Welcome from './progressive-steps/Step1Welcome';
import Step2Title from './progressive-steps/Step2Title';
import Step3Description from './progressive-steps/Step3Description';
import Step4PrivacyCheck from './progressive-steps/Step4PrivacyCheck';
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
  const [privacyRisks, setPrivacyRisks] = useState<any[]>([]);
  const [hasViewedPrivacy, setHasViewedPrivacy] = useState(false);
  // Use default_language from settings, fallback to 'en'
  const [language, setLanguage] = useState<string>(defaultLanguage || 'en');
  const [currentDraftCode, setCurrentDraftCode] = useState(initialDraftCode);

  // Check for privacy risks whenever title/description changes
  useEffect(() => {
    const combinedText = `${formData.title}\n\n${formData.description}`;
    const risks = scanForPrivacyRisks(combinedText);
    setPrivacyRisks(risks);
  }, [formData.title, formData.description]);

  // Determine total steps (privacy check is conditional)
  const showPrivacyStep = privacyRisks.length > 0 && currentStep >= 3 && !hasViewedPrivacy;
  const totalSteps = showPrivacyStep ? 11 : 10;

  // Calculate display step number (accounting for conditional privacy step)
  const getDisplayStepNumber = () => {
    if (currentStep === 0) return 0; // Welcome

    // If we're past the privacy step (currentStep >= 4) and privacy was never shown
    if (currentStep >= 4 && !hasViewedPrivacy && privacyRisks.length === 0) {
      return currentStep - 1; // Subtract 1 because we skipped privacy step
    }

    return currentStep;
  };

  const displayStep = getDisplayStepNumber();

  // Step validation logic
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Welcome
        return true;
      case 1: // Title
        return formData.title.trim().length >= 5;
      case 2: // Description
        return formData.description.trim().length >= 20;
      case 3: // Privacy check (conditional)
        return true; // Always can proceed
      case 4: // Category (adjusted if no privacy step)
        return !!(formData.mainCategory && formData.subCategory);
      case 5: // Urgency
        return formData.priority > 0;
      case 6: // When/Where
        return true; // Optional fields
      case 7: // Evidence
        return true; // Optional
      case 8: // Additional
        return true; // Optional
      case 9: // Review
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
      // Description - check if we need privacy step
      if (validateStep(2)) {
        if (privacyRisks.length > 0 && !hasViewedPrivacy) {
          goToStep(3); // Go to privacy check
        } else {
          goToStep(4); // Skip privacy, go to category
        }
      }
    } else if (currentStep === 3) {
      // Privacy check done
      setHasViewedPrivacy(true);
      goToStep(4); // Go to category
    } else if (currentStep < totalSteps - 1) {
      // All other steps
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && hasViewedPrivacy && privacyRisks.length > 0) {
      // Coming back from category, go to privacy if it was shown
      goToStep(3);
    } else if (currentStep === 4 && !hasViewedPrivacy) {
      // No privacy step was shown, go back to description
      goToStep(2);
    } else if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };


  const handleAutoRedact = (redactedTitle: string, redactedDescription: string) => {
    updateFormData({
      title: redactedTitle,
      description: redactedDescription
    });
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
    // Adjust step numbers if privacy step is shown/hidden
    let adjustedStep = currentStep;

    if (currentStep >= 4 && !hasViewedPrivacy && privacyRisks.length === 0) {
      // No privacy step shown, shift everything down by 1
      adjustedStep = currentStep;
    }

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
          />
        );
      case 2:
        return (
          <Step3Description
            value={formData.description}
            onChange={(description) => updateFormData({ description })}
            isValid={validateStep(2)}
            language={language}
          />
        );
      case 3:
        // Privacy check (only if risks detected)
        if (privacyRisks.length > 0) {
          return (
            <Step4PrivacyCheck
              title={formData.title}
              description={formData.description}
              risks={privacyRisks}
              onAutoRedact={handleAutoRedact}
              language={language}
            />
          );
        }
        // Fallthrough to category if no privacy risks
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
          <Step5Category
            mainCategory={formData.mainCategory}
            subCategory={formData.subCategory}
            customCategory={formData.customCategory}
            onChange={updateFormData}
            isValid={validateStep(currentStep)}
            language={language}
          />
        );
      case 5:
        return (
          <Step6Urgency
            priority={formData.priority}
            onChange={(priority) => updateFormData({ priority })}
            language={language}
          />
        );
      case 6:
        return (
          <Step7WhenWhere
            incidentDate={formData.incidentDate}
            location={formData.location}
            onChange={updateFormData}
            language={language}
          />
        );
      case 7:
        return (
          <Step8Evidence
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            language={language}
          />
        );
      case 8:
        return (
          <Step9Additional
            witnesses={formData.witnesses}
            previousReports={formData.previousReports}
            onChange={updateFormData}
            language={language}
          />
        );
      case 9:
      case 10:
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
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-0" dir={language === 'el' ? 'ltr' : undefined}>
      {/* Progress bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            {currentStep === 0
              ? t.navigation.welcome
              : t.navigation.step
                  .replace('{current}', displayStep.toString())
                  .replace('{total}', '9')}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">{Math.round(progressPercent)}{t.navigation.percent}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step content with animation - Standardized fixed height (except review step) */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          currentStep === 9 || currentStep === 10 
            ? 'min-h-[180px]' // Review step - min height only, allow scroll
            : currentStep === 0
            ? 'min-h-[198px] sm:min-h-[352px]' // Welcome step - min height to accommodate footer
            : 'h-[198px] sm:h-[352px]' // Fixed height: 180px + 10% = 198px mobile, 320px + 10% = 352px desktop
        }`}
        key={currentStep}
      >
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 h-11 sm:h-10 px-3 sm:px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.navigation.back}</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              {organizationId && currentStep > 0 && (
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
                />
              )}
              <Button
                onClick={handleNext}
                disabled={isNextDisabled || isSubmitting}
                style={{ backgroundColor: isNextDisabled ? undefined : brandColor }}
                className="flex items-center gap-2 h-11 sm:h-10 px-4 sm:px-4"
              >
                {t.navigation.continue}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveReportForm;
