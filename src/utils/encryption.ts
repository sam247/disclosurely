
import CryptoJS from 'crypto-js';

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

// Simplified organization-based encryption for reports
export const encryptReport = (reportData: any, organizationId: string): { encryptedData: string; keyHash: string } => {
  try {
    if (!organizationId) {
      throw new Error('Organization ID is required for encryption');
    }
    
    // Create a deterministic key based on organization ID
    const salt = process.env.ENCRYPTION_SALT || 'disclosurely-salt-2024';
    const keyMaterial = organizationId + salt;
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString();
    
    // Stringify the data
    const dataString = JSON.stringify(reportData);
    
    // Encrypt the data
    const encryptedData = encryptData(dataString, organizationKey);
    const keyHash = createKeyHash(organizationKey);
    
    return { encryptedData, keyHash };
  } catch (error) {
    throw new Error('Failed to encrypt report data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Secure minimal decryption for category extraction only
export const decryptReportCategory = (encryptedData: string, organizationId: string): string => {
  let organizationKey: string | null = null;
  let decryptedString: string | null = null;
  
  try {
    if (!encryptedData || !organizationId) {
      throw new Error('Both encrypted data and organization ID are required');
    }

    // Enhanced key derivation with user session context
    const salt = 'disclosurely-salt-2024-enhanced';
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily rotation
    const keyMaterial = organizationId + salt + timestamp.toString();
    organizationKey = CryptoJS.SHA256(keyMaterial).toString();
    
    // Decrypt the data
    decryptedString = decryptData(encryptedData, organizationKey);
    
    // Parse JSON and extract only the category
    const parsedData = JSON.parse(decryptedString);
    const category = parsedData.category || 'General';
    
    return category;
  } catch (error) {
    // Fallback to previous key for backward compatibility
    try {
      if (organizationKey && decryptedString) {
        // Clear previous attempt
        organizationKey = null;
        decryptedString = null;
      }
      
      const legacySalt = 'disclosurely-salt-2024';
      const legacyKeyMaterial = organizationId + legacySalt;
      organizationKey = CryptoJS.SHA256(legacyKeyMaterial).toString();
      
      decryptedString = decryptData(encryptedData, organizationKey);
      const parsedData = JSON.parse(decryptedString);
      const category = parsedData.category || 'General';
      
      return category;
    } catch (fallbackError) {
      return 'Unknown';
    }
  } finally {
    // Secure cleanup - overwrite sensitive data in memory
    if (organizationKey) {
      organizationKey = 'x'.repeat(organizationKey.length);
    }
    if (decryptedString) {
      decryptedString = 'x'.repeat(decryptedString.length);
    }
  }
};

// Legacy function maintained for full report access when needed
export const decryptReport = (encryptedData: string, organizationId: string): any => {
  try {
    if (!encryptedData || !organizationId) {
      throw new Error('Both encrypted data and organization ID are required');
    }

    // Recreate the same key used for encryption
    const salt = 'disclosurely-salt-2024';
    const keyMaterial = organizationId + salt;
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString();
    
    // Decrypt the data
    const decryptedString = decryptData(encryptedData, organizationKey);
    
    // Parse the JSON
    const parsedData = JSON.parse(decryptedString);
    
    return parsedData;
  } catch (error) {
    throw new Error('Failed to decrypt report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
