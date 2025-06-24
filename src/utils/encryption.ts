
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

// Complete encryption process for reports - now only returns tracking ID
export const encryptReport = (reportData: any, trackingId: string): { encryptedData: string; keyHash: string } => {
  const encryptionKey = generateEncryptionKey();
  const encryptedData = encryptData(JSON.stringify(reportData), encryptionKey);
  const keyHash = createKeyHash(encryptionKey);
  
  return { encryptedData, keyHash };
};
