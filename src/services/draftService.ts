import { supabase } from '@/integrations/supabase/client';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import {
  SaveDraftRequest,
  SaveDraftResponse,
  ResumeDraftRequest,
  ResumeDraftResponse,
} from '@/types/drafts';

// ============================================
// PRODUCTION-READY ENCRYPTION USING WEB CRYPTO API
// ============================================

/**
 * Derives a cryptographic key from the draft code using PBKDF2
 * This ensures the draft code itself acts as the password
 */
async function deriveKey(draftCode: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // Import the draft code as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(draftCode),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive a strong encryption key using PBKDF2
  // Using a fixed salt is acceptable here since each draft has a unique code
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('disclosurely-draft-salt-v1'), // Fixed salt for drafts
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, // AES-256-GCM encryption
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM
 * Returns encrypted data, IV, and hash for verification
 */
async function encryptData(
  data: string,
  draftCode: string
): Promise<{ encrypted: string; hash: string; iv: string }> {
  const encoder = new TextEncoder();
  const key = await deriveKey(draftCode);

  // Generate a random initialization vector (IV)
  // IV must be unique for each encryption operation
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  // Convert to base64 for storage
  const encrypted = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(iv);

  // Create a simple hash for verification (not for security, just integrity check)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(draftCode));
  const hash = arrayBufferToBase64(hashBuffer.slice(0, 16)); // First 16 bytes

  return { encrypted, hash, iv: ivBase64 };
}

/**
 * Decrypts data using AES-256-GCM
 */
async function decryptData(
  encrypted: string,
  iv: string,
  draftCode: string
): Promise<string> {
  const key = await deriveKey(draftCode);

  // Convert from base64
  const encryptedBuffer = base64ToArrayBuffer(encrypted);
  const ivBuffer = base64ToArrayBuffer(iv);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Helper function to convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function saveDraft(request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    // Generate draft code FIRST (needed for encryption)
    const { data: draftCode, error: codeError } = await supabase.rpc('generate_draft_code');

    if (codeError) throw codeError;
    if (!draftCode) throw new Error('Failed to generate draft code');

    // Prepare draft data
    const draftData = {
      formData: request.formData,
      fileMetadata: request.fileMetadata || [],
    };

    // Encrypt content using the draft code as the encryption key
    const { encrypted, hash, iv } = await encryptData(
      JSON.stringify(draftData),
      draftCode as string
    );

    // Calculate expiration (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Insert draft with encrypted content and IV
    const { error: insertError } = await supabase
      .from('report_drafts')
      .insert({
        organization_id: request.organizationId,
        draft_code: draftCode as string,
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        iv: iv, // Store the initialization vector
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

    // Check if IV exists (for backwards compatibility with old drafts)
    if (!data.iv) {
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        expiresAt: '',
        message: 'Draft was created with an older version and cannot be decrypted. Please create a new draft.',
      };
    }

    // Decrypt content using the draft code and stored IV
    const decryptedContent = await decryptData(
      data.encrypted_content,
      data.iv,
      request.draftCode
    );
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
      message: error instanceof Error ? error.message : 'Failed to resume draft. The code may be incorrect.',
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

    // Encrypt content using the draft code (generates new IV each time)
    const { encrypted, hash, iv } = await encryptData(
      JSON.stringify(draftData),
      draftCode
    );

    // First get current save count
    const { data: currentDraft } = await supabase
      .from('report_drafts')
      .select('save_count')
      .eq('draft_code', draftCode)
      .single();

    const newSaveCount = (currentDraft?.save_count || 0) + 1;

    // Update existing draft with new encrypted content and IV
    const { error } = await supabase
      .from('report_drafts')
      .update({
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        iv: iv, // Update IV with new value
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
