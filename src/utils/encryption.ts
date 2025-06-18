
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

// Generate access key for whistleblower
export const generateAccessKey = (trackingId: string, encryptionKey: string): string => {
  return CryptoJS.SHA256(trackingId + encryptionKey).toString().substring(0, 16);
};

// Verify access key
export const verifyAccessKey = (trackingId: string, accessKey: string, encryptionKey: string): boolean => {
  const expectedKey = generateAccessKey(trackingId, encryptionKey);
  return accessKey === expectedKey;
};

// Complete encryption process for reports
export const encryptReport = (reportData: any): { encryptedData: string; keyHash: string; accessKey: string } => {
  const encryptionKey = generateEncryptionKey();
  const encryptedData = encryptData(JSON.stringify(reportData), encryptionKey);
  const keyHash = createKeyHash(encryptionKey);
  
  // For now, we'll use a placeholder tracking ID. In real implementation,
  // this would be generated after the report is created
  const tempTrackingId = 'temp-' + Date.now();
  const accessKey = generateAccessKey(tempTrackingId, encryptionKey);
  
  return { encryptedData, keyHash, accessKey };
};
