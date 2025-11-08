import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import { saveDraft, updateDraft } from '@/services/draftService';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import { SaveDraftModal } from './SaveDraftModal';

interface SaveDraftButtonProps {
  formData: ProgressiveFormData;
  currentStep: number;
  language: string;
  organizationId: string;
  existingDraftCode?: string;
  onDraftSaved: (draftCode: string) => void;
}

export const SaveDraftButton = ({
  formData,
  currentStep,
  language,
  organizationId,
  existingDraftCode,
  onDraftSaved,
}: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedDraftCode, setSavedDraftCode] = useState('');

  const handleSave = async () => {
    setIsSaving(true);

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

    if (response.success) {
      setSavedDraftCode(response.draftCode);
      setShowModal(true);
      onDraftSaved(response.draftCode);
    } else {
      alert('Failed to save draft: ' + response.message);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <>
            <div className="animate-spin">⏳</div>
            Saving...
          </>
        ) : existingDraftCode ? (
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
        />
      )}
    </>
  );
};
