
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
    
    console.log('Encrypting data length:', data.length, 'with key length:', key.length);
    
    // Use AES encryption with explicit configuration
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = encrypted.toString();
    console.log('Encryption successful, result length:', result.length);
    
    return result;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Improved decryption with better error handling
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    if (!encryptedData || !key) {
      throw new Error('Encrypted data and key are required for decryption');
    }
    
    console.log('Attempting decryption...');
    console.log('Encrypted data length:', encryptedData.length);
    console.log('Key length:', key.length);
    console.log('Encrypted data sample:', encryptedData.substring(0, 100));
    
    // Attempt decryption with explicit configuration
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    console.log('Decryption object created:', !!decrypted);
    
    // Convert to UTF8 string
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted string length:', decryptedString.length);
    
    if (!decryptedString || decryptedString.length === 0) {
      console.error('Decryption resulted in empty string - likely wrong key or corrupted data');
      throw new Error('Decryption resulted in empty string - please verify the encryption key');
    }
    
    console.log('Decryption successful');
    return decryptedString;
  } catch (error) {
    console.error('Decryption failed with error:', error);
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
    console.log('=== ENCRYPTING REPORT ===');
    console.log('Organization ID:', organizationId);
    
    if (!organizationId) {
      throw new Error('Organization ID is required for encryption');
    }
    
    // Create a deterministic key based on organization ID
    const salt = process.env.ENCRYPTION_SALT || 'disclosurely-salt-2024';
    const keyMaterial = organizationId + salt;
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString();
    
    console.log('Generated key hash:', organizationKey.substring(0, 8) + '...');
    
    // Stringify the data
    const dataString = JSON.stringify(reportData);
    console.log('Data to encrypt (length):', dataString.length);
    console.log('Data sample:', dataString.substring(0, 100));
    
    // Encrypt the data
    const encryptedData = encryptData(dataString, organizationKey);
    const keyHash = createKeyHash(organizationKey);
    
    console.log('Encryption completed successfully');
    console.log('Encrypted data length:', encryptedData.length);
    console.log('Key hash:', keyHash.substring(0, 16) + '...');
    
    return { encryptedData, keyHash };
  } catch (error) {
    console.error('Report encryption failed:', error);
    throw new Error('Failed to encrypt report data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Improved decrypt report for authorized dashboard users
export const decryptReport = (encryptedData: string, organizationId: string): any => {
  try {
    console.log('=== DECRYPTING REPORT ===');
    console.log('Organization ID:', organizationId);
    console.log('Encrypted data length:', encryptedData.length);
    
    if (!encryptedData || !organizationId) {
      throw new Error('Both encrypted data and organization ID are required');
    }

    // Recreate the same key used for encryption
    const salt = process.env.ENCRYPTION_SALT || 'disclosurely-salt-2024';
    const keyMaterial = organizationId + salt;
    const organizationKey = CryptoJS.SHA256(keyMaterial).toString();
    
    console.log('Recreated key hash:', organizationKey.substring(0, 8) + '...');
    
    // Decrypt the data
    const decryptedString = decryptData(encryptedData, organizationKey);
    
    // Parse the JSON
    let parsedData;
    try {
      parsedData = JSON.parse(decryptedString);
    } catch (parseError) {
      console.error('Failed to parse decrypted JSON:', parseError);
      console.error('Decrypted string (first 200 chars):', decryptedString.substring(0, 200));
      throw new Error('Decrypted data is not valid JSON');
    }
    
    console.log('Report decryption successful');
    console.log('Parsed data keys:', Object.keys(parsedData));
    
    return parsedData;
  } catch (error) {
    console.error('Report decryption failed:', error);
    throw new Error('Failed to decrypt report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
