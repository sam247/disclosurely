
import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

// SECURITY NOTE: Client-side encryption functions are deprecated
// Use server-side encryption edge functions instead
// This file is kept for backward compatibility only

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

// Improved encryption with better error handling
export const encryptData = (data: string, key: string): string => {
  try {
    if (!data || !key) {
      throw new Error('Data and key are required for encryption');
    }
    
    // Use AES encryption with explicit configuration
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.toString();
  } catch (error) {
    throw new Error('Failed to encrypt data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Improved decryption with better error handling
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    if (!encryptedData || !key) {
      throw new Error('Encrypted data and key are required for decryption');
    }
    
    // Attempt decryption with explicit configuration
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Convert to UTF8 string
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString || decryptedString.length === 0) {
      throw new Error('Decryption resulted in empty string - please verify the encryption key');
    }
    
    return decryptedString;
  } catch (error) {
    throw new Error('Failed to decrypt data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Create hash of the key for verification
export const createKeyHash = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};

// Server-side encryption for reports (calls edge function)
export const encryptReport = async (reportData: any, organizationId: string): Promise<{ encryptedData: string; keyHash: string }> => {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required for encryption');
    }
    
    // Call server-side encryption edge function
    const { data, error } = await supabase.functions.invoke('encrypt-report-data', {
      body: { reportData, organizationId }
    });

    if (error) {
      throw new Error('Server-side encryption failed: ' + error.message);
    }

    return { encryptedData: data.encryptedData, keyHash: data.keyHash };
  } catch (error) {
    throw new Error('Failed to encrypt report data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// DEPRECATED: This function uses hardcoded salts and is insecure
// Use server-side decryption edge functions instead
export const decryptReportCategory = (encryptedData: string, organizationId: string): string => {
  
  
  // Return a safe fallback instead of attempting decryption
  return 'General';
};

// Server-side decryption for full report access (calls edge function)
export const decryptReport = async (encryptedData: string, organizationId: string): Promise<any> => {
  try {
    if (!encryptedData || !organizationId) {
      throw new Error('Both encrypted data and organization ID are required');
    }

    // Call server-side decryption edge function with authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for decryption');
    }

    const { data, error } = await supabase.functions.invoke('decrypt-report-data', {
      body: { encryptedData, organizationId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      throw new Error('Server-side decryption failed: ' + error.message);
    }

    return data.decryptedData;
  } catch (error) {
    throw new Error('Failed to decrypt report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
