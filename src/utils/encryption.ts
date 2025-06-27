
import CryptoJS from 'crypto-js';

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

// Encrypt data with AES-256
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Decrypt data with AES-256
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Decryption failed - empty result');
    }
    
    return decryptedString;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Create hash of the key for verification
export const createKeyHash = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};

// Organization-based encryption for reports
export const encryptReport = (reportData: any, organizationId: string): { encryptedData: string; keyHash: string } => {
  try {
    // Use organization ID to generate a consistent key
    const organizationKey = CryptoJS.SHA256(organizationId + (process.env.ENCRYPTION_SALT || 'default-salt')).toString();
    const dataString = JSON.stringify(reportData);
    const encryptedData = encryptData(dataString, organizationKey);
    const keyHash = createKeyHash(organizationKey);
    
    return { encryptedData, keyHash };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

// Decrypt report for authorized dashboard users
export const decryptReport = (encryptedData: string, organizationId: string): any => {
  try {
    if (!encryptedData || !organizationId) {
      console.error('Missing required parameters for decryption');
      return null;
    }

    const organizationKey = CryptoJS.SHA256(organizationId + (process.env.ENCRYPTION_SALT || 'default-salt')).toString();
    const decryptedData = decryptData(encryptedData, organizationKey);
    
    try {
      return JSON.parse(decryptedData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { content: decryptedData }; // Return as simple content if JSON parsing fails
    }
  } catch (error) {
    console.error('Failed to decrypt report:', error);
    return null;
  }
};

// Message encryption functions
export const encryptMessage = async (message: string, key?: string): Promise<{ encryptedData: string; keyHash: string }> => {
  const messageKey = key || generateEncryptionKey();
  const encryptedData = encryptData(message, messageKey);
  const keyHash = createKeyHash(messageKey);
  
  return { encryptedData, keyHash };
};

// Decrypt message
export const decryptMessage = async (encryptedData: string, key: string): Promise<string> => {
  try {
    return decryptData(encryptedData, key);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    return '[Unable to decrypt message]';
  }
};
