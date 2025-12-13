import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
  createKeyHash,
  encryptReport,
  decryptReport,
} from './encryption';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('Encryption Utilities', () => {
  describe('generateEncryptionKey', () => {
    it('should generate a random encryption key', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).toBeTruthy();
      expect(key2).toBeTruthy();
      expect(key1).not.toBe(key2); // Should be random
      expect(typeof key1).toBe('string');
    });

    it('should generate keys of consistent length', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1.length).toBe(key2.length);
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data successfully', () => {
      const originalData = 'This is sensitive whistleblower information';
      const key = generateEncryptionKey();

      const encrypted = encryptData(originalData, key);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(originalData);

      const decrypted = decryptData(encrypted, key);
      expect(decrypted).toBe(originalData);
    });

    it('should encrypt the same data differently each time (due to IV)', () => {
      const data = 'Test data';
      const key = generateEncryptionKey();

      const encrypted1 = encryptData(data, key);
      const encrypted2 = encryptData(data, key);

      // Different encrypted values due to different IVs
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decryptData(encrypted1, key)).toBe(data);
      expect(decryptData(encrypted2, key)).toBe(data);
    });

    it('should handle Unicode characters correctly', () => {
      const unicodeData = '测试数据 🔒 Ñoño Ångström';
      const key = generateEncryptionKey();

      const encrypted = encryptData(unicodeData, key);
      const decrypted = decryptData(encrypted, key);

      expect(decrypted).toBe(unicodeData);
    });

    it('should handle JSON data', () => {
      const jsonData = JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        report: 'Confidential information',
      });
      const key = generateEncryptionKey();

      const encrypted = encryptData(jsonData, key);
      const decrypted = decryptData(encrypted, key);
      const parsed = JSON.parse(decrypted);

      expect(parsed.name).toBe('John Doe');
      expect(parsed.email).toBe('john@example.com');
    });

    it('should throw error when encrypting with empty data', () => {
      const key = generateEncryptionKey();

      expect(() => encryptData('', key)).toThrow('Data and key are required');
    });

    it('should throw error when encrypting with empty key', () => {
      expect(() => encryptData('data', '')).toThrow('Data and key are required');
    });

    it('should throw error when decrypting with wrong key', () => {
      const data = 'Secret data';
      const correctKey = generateEncryptionKey();
      const wrongKey = generateEncryptionKey();

      const encrypted = encryptData(data, correctKey);

      expect(() => decryptData(encrypted, wrongKey)).toThrow('Failed to decrypt data');
    });

    it('should throw error when decrypting with empty key', () => {
      const data = 'Secret data';
      const key = generateEncryptionKey();
      const encrypted = encryptData(data, key);

      expect(() => decryptData(encrypted, '')).toThrow('Encrypted data and key are required');
    });

    it('should throw error when decrypting invalid ciphertext', () => {
      const key = generateEncryptionKey();

      expect(() => decryptData('invalid-ciphertext', key)).toThrow('Failed to decrypt data');
    });
  });

  describe('createKeyHash', () => {
    it('should create a consistent hash for the same key', () => {
      const key = 'test-key-123';
      const hash1 = createKeyHash(key);
      const hash2 = createKeyHash(key);

      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different keys', () => {
      const key1 = 'test-key-1';
      const key2 = 'test-key-2';

      const hash1 = createKeyHash(key1);
      const hash2 = createKeyHash(key2);

      expect(hash1).not.toBe(hash2);
    });

    it('should create a SHA-256 hash (64 characters)', () => {
      const key = 'test-key';
      const hash = createKeyHash(key);

      expect(hash.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });
  });

  describe('encryptReport (server-side)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call edge function for server-side encryption', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockInvoke = supabase.functions.invoke as any;

      mockInvoke.mockResolvedValueOnce({
        data: {
          encryptedData: 'encrypted-report-data',
          keyHash: 'key-hash-value',
        },
        error: null,
      });

      const reportData = {
        description: 'Test report',
        category: 'fraud',
      };

      const result = await encryptReport(reportData, 'org-123');

      expect(mockInvoke).toHaveBeenCalledWith('encrypt-report-data', {
        body: { reportData, organizationId: 'org-123' },
      });

      expect(result).toEqual({
        encryptedData: 'encrypted-report-data',
        keyHash: 'key-hash-value',
      });
    });

    it('should throw error when organization ID is missing', async () => {
      await expect(encryptReport({ data: 'test' }, '')).rejects.toThrow(
        'Organization ID is required for encryption'
      );
    });

    it('should handle edge function errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockInvoke = supabase.functions.invoke as any;

      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Encryption failed' },
      });

      await expect(
        encryptReport({ data: 'test' }, 'org-123')
      ).rejects.toThrow('Server-side encryption failed');
    });
  });

  describe('decryptReport (server-side)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call edge function for server-side decryption', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockInvoke = supabase.functions.invoke as any;
      const mockGetSession = supabase.auth.getSession as any;

      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-token',
          },
        },
      });

      mockInvoke.mockResolvedValueOnce({
        data: {
          decryptedData: { description: 'Test report', category: 'fraud' },
        },
        error: null,
      });

      const result = await decryptReport('encrypted-data', 'org-123');

      expect(mockGetSession).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalledWith('decrypt-report-data', {
        body: { encryptedData: 'encrypted-data', organizationId: 'org-123' },
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(result).toEqual({
        description: 'Test report',
        category: 'fraud',
      });
    });

    it('should throw error when not authenticated', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockGetSession = supabase.auth.getSession as any;

      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await expect(decryptReport('encrypted-data', 'org-123')).rejects.toThrow(
        'Authentication required for decryption'
      );
    });

    it('should throw error when encrypted data is missing', async () => {
      await expect(decryptReport('', 'org-123')).rejects.toThrow(
        'Both encrypted data and organization ID are required'
      );
    });

    it('should throw error when organization ID is missing', async () => {
      await expect(decryptReport('encrypted-data', '')).rejects.toThrow(
        'Both encrypted data and organization ID are required'
      );
    });

    it('should handle edge function errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockInvoke = supabase.functions.invoke as any;
      const mockGetSession = supabase.auth.getSession as any;

      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-token',
          },
        },
      });

      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Decryption failed' },
      });

      await expect(
        decryptReport('encrypted-data', 'org-123')
      ).rejects.toThrow('Server-side decryption failed');
    });
  });
});
