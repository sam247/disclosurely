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
      console.error('No data returned from edge function');
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: 'No response from server. Please try again.',
      };
    }

    console.log('Edge function response data:', data);
    
    // Ensure the response has the expected structure
    if (data.success && data.draftCode) {
      console.log('Draft code received:', data.draftCode);
      return data;
    } else if (data.error) {
      // Edge function returned an error in the data
      console.error('Edge function error in data:', data.error);
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: data.error || 'Failed to save draft',
      };
    } else {
      console.error('Unexpected response structure:', data);
      return {
        success: false,
        draftCode: '',
        expiresAt: '',
        message: 'Unexpected response from server. Please try again.',
      };
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    
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
    
    console.log('Resuming draft with code:', normalizedDraftCode);
    
    const { data, error } = await supabase.functions.invoke('draft-operations', {
      body: {
        operation: 'resume',
        draftCode: normalizedDraftCode,
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
