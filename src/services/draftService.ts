import { supabase } from '@/integrations/supabase/client';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import {
  SaveDraftRequest,
  SaveDraftResponse,
  ResumeDraftRequest,
  ResumeDraftResponse,
} from '@/types/drafts';

/**
 * SECURE DRAFT SERVICE
 *
 * All draft operations now go through edge functions with:
 * ✅ Rate limiting (10 operations per 5 minutes)
 * ✅ Server-side draft_code verification
 * ✅ Audit logging
 * ✅ AES-256-GCM encryption
 */

export async function saveDraft(request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'save',
        organizationId: request.organizationId,
        formData: request.formData,
        fileMetadata: request.fileMetadata || [],
        currentStep: request.currentStep,
        language: request.language,
      }
    });

    if (error) {
      console.error('Error saving draft:', error);
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: error.message || 'Failed to save draft',
      };
    }

    return data;
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      success: false,
      draftCode: '',
      expiresAt: '',
      message: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}

export async function resumeDraft(request: ResumeDraftRequest): Promise<ResumeDraftResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'resume',
        draftCode: request.draftCode,
      }
    });

    if (error) {
      console.error('Error resuming draft:', error);
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        expiresAt: '',
        message: error.message || 'Failed to resume draft',
      };
    }

    return data;
  } catch (error) {
    console.error('Error resuming draft:', error);
    return {
      success: false,
      formData: {} as ProgressiveFormData,
      currentStep: 0,
      language: 'en',
      expiresAt: '',
      message: error instanceof Error ? error.message : 'Failed to resume draft',
    };
  }
}

export async function updateDraft(draftCode: string, request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'update',
        draftCode: draftCode,
        formData: request.formData,
        fileMetadata: request.fileMetadata || [],
        currentStep: request.currentStep,
        language: request.language,
      }
    });

    if (error) {
      console.error('Error updating draft:', error);
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: error.message || 'Failed to update draft',
      };
    }

    return data;
  } catch (error) {
    console.error('Error updating draft:', error);
    return {
      success: false,
      draftCode: '',
      expiresAt: '',
      message: error instanceof Error ? error.message : 'Failed to update draft',
    };
  }
}

export async function deleteDraft(draftCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'delete',
        draftCode: draftCode,
      }
    });

    if (error) {
      console.error('Error deleting draft:', error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
}
