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
      // Provide more specific error messages
      let errorMessage = 'Failed to save draft';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'FunctionInvocationError') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
      
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: errorMessage,
      };
    }

    if (!data) {
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: 'No response from server. Please try again.',
      };
    }

    
    
    // Ensure the response has the expected structure
    if (data.success && data.draftCode) {
      
      return data;
    } else if (data.error) {
      // Edge function returned an error in the data
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: data.error || 'Failed to save draft',
      };
    } else {
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: 'Unexpected response from server. Please try again.',
      };
    }
  } catch (error) {
    let errorMessage = 'Failed to save draft';
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      draftCode: '',
      expiresAt: '',
      message: errorMessage,
    };
  }
}

export async function resumeDraft(request: ResumeDraftRequest): Promise<ResumeDraftResponse> {
  try {
    // Normalize draft code: trim whitespace and convert to uppercase
    const normalizedDraftCode = request.draftCode.trim().toUpperCase().replace(/\s+/g, '');
    
    
    
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'resume',
        draftCode: normalizedDraftCode,
      }
    });

    if (error) {
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
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: error.message || 'Failed to update draft',
      };
    }

    return data;
  } catch (error) {
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
      // Error deleting draft
      return false;
    }

    return data?.success || false;
  } catch (error) {
    return false;
  }
}
