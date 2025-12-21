import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import { saveDraft, updateDraft } from '@/services/draftService';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import { SaveDraftModal } from './SaveDraftModal';
import { useToast } from '@/hooks/use-toast';
import { log, LogContext } from '@/utils/logger';

interface SaveDraftButtonProps {
  formData: ProgressiveFormData;
  currentStep: number;
  language: string;
  organizationId: string;
  existingDraftCode?: string;
  onDraftSaved: (draftCode: string) => void;
  brandColor?: string;
}

export const SaveDraftButton = ({
  formData,
  currentStep,
  language,
  organizationId,
  existingDraftCode,
  onDraftSaved,
  brandColor = '#2563eb',
}: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedDraftCode, setSavedDraftCode] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const request = {
        formData,
        currentStep,
        language,
        organizationId,
      };

      const response = existingDraftCode
        ? await updateDraft(existingDraftCode, request)
        : await saveDraft(request);

      

      setIsSaving(false);

      if (response.success && response.draftCode) {
        
        setSavedDraftCode(response.draftCode);
        setShowModal(true);
        onDraftSaved(response.draftCode);
      } else {
        log.error(LogContext.SUBMISSION, 'Draft save failed', new Error(response.message || 'Unknown error'), { organizationId, currentStep });
        toast({
          title: "Failed to save draft",
          description: response.message || "An error occurred while saving your draft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsSaving(false);
      log.error(LogContext.SUBMISSION, 'Error saving draft', error instanceof Error ? error : new Error(String(error)), { organizationId, currentStep });
      toast({
        title: "Failed to save draft",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleSave}
        loading={isSaving}
        loadingText="Saving..."
        className="gap-2 h-11 sm:h-10 px-3 sm:px-4 w-full sm:w-auto"
      >
        {existingDraftCode ? (
          <>
            <Check className="w-4 h-4" />
            Update Draft
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Draft
          </>
        )}
      </Button>

      {showModal && (
        <SaveDraftModal
          draftCode={savedDraftCode}
          onClose={() => setShowModal(false)}
          brandColor={brandColor}
        />
      )}
    </>
  );
};
