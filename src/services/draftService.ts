import { supabase } from '@/integrations/supabase/client';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import {
  SaveDraftRequest,
  SaveDraftResponse,
  ResumeDraftRequest,
  ResumeDraftResponse,
} from '@/types/drafts';

// Simple client-side encryption (basic obfuscation)
// For production, this uses base64 encoding
function encryptData(data: string): { encrypted: string; hash: string } {
  const encrypted = btoa(encodeURIComponent(data));
  const hash = btoa(encrypted.substring(0, 32));
  return { encrypted, hash };
}

function decryptData(encrypted: string): string {
  return decodeURIComponent(atob(encrypted));
}

export async function saveDraft(request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    // Prepare draft data
    const draftData = {
      formData: request.formData,
      fileMetadata: request.fileMetadata || [],
    };

    // Encrypt content
    const { encrypted, hash } = encryptData(JSON.stringify(draftData));

    // Calculate expiration (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Generate draft code
    const { data: draftCode, error: codeError } = await supabase.rpc('generate_draft_code');

    if (codeError) throw codeError;
    if (!draftCode) throw new Error('Failed to generate draft code');

    // Insert draft
    const { error: insertError } = await supabase
      .from('report_drafts')
      .insert({
        organization_id: request.organizationId,
        draft_code: draftCode as string,
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        current_step: request.currentStep,
        language: request.language,
        file_metadata: request.fileMetadata || [],
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) throw insertError;

    return {
      success: true,
      draftCode: draftCode as string,
      expiresAt: expiresAt.toISOString(),
      message: 'Draft saved successfully',
    };
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
    // Fetch draft by code
    const { data, error } = await supabase
      .from('report_drafts')
      .select('*')
      .eq('draft_code', request.draftCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        expiresAt: '',
        message: 'Draft not found or expired',
      };
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        expiresAt: '',
        message: 'Draft has expired',
      };
    }

    // Decrypt content
    const decryptedContent = decryptData(data.encrypted_content);
    const draftData = JSON.parse(decryptedContent);

    return {
      success: true,
      formData: draftData.formData,
      currentStep: data.current_step,
      language: data.language,
      fileMetadata: draftData.fileMetadata,
      expiresAt: data.expires_at,
    };
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
    // Prepare draft data
    const draftData = {
      formData: request.formData,
      fileMetadata: request.fileMetadata || [],
    };

    // Encrypt content
    const { encrypted, hash } = encryptData(JSON.stringify(draftData));

    // First get current save count
    const { data: currentDraft } = await supabase
      .from('report_drafts')
      .select('save_count')
      .eq('draft_code', draftCode)
      .single();

    const newSaveCount = (currentDraft?.save_count || 0) + 1;

    // Update existing draft
    const { error } = await supabase
      .from('report_drafts')
      .update({
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        current_step: request.currentStep,
        language: request.language,
        file_metadata: request.fileMetadata || [],
        updated_at: new Date().toISOString(),
        save_count: newSaveCount,
      })
      .eq('draft_code', draftCode);

    if (error) throw error;

    // Get updated expires_at
    const { data } = await supabase
      .from('report_drafts')
      .select('expires_at')
      .eq('draft_code', draftCode)
      .single();

    return {
      success: true,
      draftCode,
      expiresAt: data?.expires_at || '',
      message: 'Draft updated successfully',
    };
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
    const { error } = await supabase
      .from('report_drafts')
      .delete()
      .eq('draft_code', draftCode);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
}
