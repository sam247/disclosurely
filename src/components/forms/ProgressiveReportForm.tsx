import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { scanForPrivacyRisks } from '@/utils/privacyDetection';
import { progressiveFormTranslations } from '@/i18n/progressiveFormTranslations';

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
}

const ProgressiveReportForm = ({
  formData,
  updateFormData,
  attachedFiles,
  setAttachedFiles,
  onSubmit,
  isSubmitting,
  brandColor = '#6366f1'
}: ProgressiveReportFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [privacyRisks, setPrivacyRisks] = useState<any[]>([]);
  const [hasViewedPrivacy, setHasViewedPrivacy] = useState(false);
  const [language, setLanguage] = useState<string>('en');

  // Check for privacy risks whenever title/description changes
  useEffect(() => {
    const combinedText = `${formData.title}\n\n${formData.description}`;
    const risks = scanForPrivacyRisks(combinedText);
    setPrivacyRisks(risks);
  }, [formData.title, formData.description]);

  // Determine total steps (privacy check is conditional)
  const showPrivacyStep = privacyRisks.length > 0 && currentStep >= 3 && !hasViewedPrivacy;
  const totalSteps = showPrivacyStep ? 11 : 10;

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

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
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
            additionalNotes={formData.additionalNotes}
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
  const showSkip = [6, 7, 8].includes(currentStep); // When/Where, Evidence, Additional
  const isNextDisabled = !validateStep(currentStep);

  const t = progressiveFormTranslations[language as keyof typeof progressiveFormTranslations] || progressiveFormTranslations.en;

  return (
    <div className="w-full max-w-2xl mx-auto" dir={language === 'el' ? 'ltr' : undefined}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            {currentStep === 0
              ? t.navigation.welcome
              : t.navigation.step
                  .replace('{current}', currentStep.toString())
                  .replace('{total}', (totalSteps - 1).toString())}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progressPercent)}{t.navigation.percent}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step content with animation */}
      <div
        className="min-h-[400px] transition-all duration-300 ease-in-out"
        key={currentStep}
      >
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.navigation.back}
          </Button>

          <div className="flex items-center gap-3">
            {showSkip && (
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                {t.navigation.skip}
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isNextDisabled || isSubmitting}
              style={{ backgroundColor: isNextDisabled ? undefined : brandColor }}
              className="flex items-center gap-2"
            >
              {t.navigation.continue}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveReportForm;
