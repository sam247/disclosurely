
import CryptoJS from 'crypto-js';

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

// Encrypt data with AES-256
export const encryptData = (data: string, key: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data with AES-256
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption returned empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Create hash of the key for verification
export const createKeyHash = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};

// Organization-based encryption for reports
export const encryptReport = (reportData: any, organizationId: string): { encryptedData: string; keyHash: string } => {
  try {
    console.log('Encrypting report for organization:', organizationId);
    
    // Use organization ID to generate a consistent key with salt
    const salt = process.env.ENCRYPTION_SALT || 'default-salt-key-2024';
    const organizationKey = CryptoJS.SHA256(organizationId + salt).toString();
    
    console.log('Generated encryption key hash:', organizationKey.substring(0, 8) + '...');
    
    const dataString = JSON.stringify(reportData);
    console.log('Data to encrypt length:', dataString.length);
    
    const encryptedData = encryptData(dataString, organizationKey);
    const keyHash = createKeyHash(organizationKey);
    
    console.log('Encryption successful, encrypted data length:', encryptedData.length);
    
    return { encryptedData, keyHash };
  } catch (error) {
    console.error('Report encryption failed:', error);
    throw new Error('Failed to encrypt report data');
  }
};

// Decrypt report for authorized dashboard users
export const decryptReport = (encryptedData: string, organizationId: string): any => {
  try {
    console.log('Attempting to decrypt report for organization:', organizationId);
    
    if (!encryptedData || !organizationId) {
      console.error('Missing required parameters for decryption');
      throw new Error('Missing encrypted data or organization ID');
    }

    // Use the same salt as encryption
    const salt = process.env.ENCRYPTION_SALT || 'default-salt-key-2024';
    const organizationKey = CryptoJS.SHA256(organizationId + salt).toString();
    
    console.log('Generated decryption key hash:', organizationKey.substring(0, 8) + '...');
    console.log('Encrypted data length:', encryptedData.length);
    console.log('Encrypted data preview:', encryptedData.substring(0, 50) + '...');
    
    // Validate encrypted data format
    if (!encryptedData.includes('=') && !encryptedData.includes('+') && !encryptedData.includes('/')) {
      console.error('Invalid encrypted data format - not base64');
      throw new Error('Invalid encrypted data format');
    }
    
    const decryptedData = decryptData(encryptedData, organizationKey);
    console.log('Decrypted data length:', decryptedData.length);
    
    if (!decryptedData) {
      console.error('Decryption returned empty result');
      throw new Error('Decryption returned empty result');
    }

    // Validate JSON format
    let parsedData;
    try {
      parsedData = JSON.parse(decryptedData);
    } catch (parseError) {
      console.error('Failed to parse decrypted JSON:', parseError);
      console.error('Decrypted content (first 200 chars):', decryptedData.substring(0, 200));
      throw new Error('Invalid JSON format in decrypted data');
    }
    
    console.log('Successfully parsed decrypted data:', Object.keys(parsedData));
    return parsedData;
  } catch (error) {
    console.error('Failed to decrypt report:', error);
    
    // More specific error messages
    if (error.message.includes('Malformed')) {
      throw new Error('Data corruption detected - unable to decrypt report content');
    } else if (error.message.includes('Invalid')) {
      throw new Error('Invalid data format - report may be corrupted');
    } else {
      throw new Error('Decryption failed - please contact support if this persists');
    }
  }
};
