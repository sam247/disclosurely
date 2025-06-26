
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
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Create hash of the key for verification
export const createKeyHash = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};

// Organization-based encryption for reports
export const encryptReport = (reportData: any, organizationId: string): { encryptedData: string; keyHash: string } => {
  // Use organization ID to generate a consistent key
  const organizationKey = CryptoJS.SHA256(organizationId + process.env.ENCRYPTION_SALT || 'default-salt').toString();
  const encryptedData = encryptData(JSON.stringify(reportData), organizationKey);
  const keyHash = createKeyHash(organizationKey);
  
  return { encryptedData, keyHash };
};

// Decrypt report for authorized dashboard users
export const decryptReport = (encryptedData: string, organizationId: string): any => {
  try {
    const organizationKey = CryptoJS.SHA256(organizationId + process.env.ENCRYPTION_SALT || 'default-salt').toString();
    const decryptedData = decryptData(encryptedData, organizationKey);
    return JSON.parse(decryptedData);
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
