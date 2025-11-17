import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCustomDomains } from './useCustomDomains';

// Mock Supabase client
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'test-token' },
  }),
}));

describe('useCustomDomains', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchDomains', () => {
    it('should fetch domains successfully', async () => {
      const mockDomains = [
        {
          id: 'domain-1',
          domain_name: 'report.company.com',
          verification_status: 'verified',
          created_at: '2024-01-01',
        },
        {
          id: 'domain-2',
          domain_name: 'whistleblow.company.com',
          verification_status: 'pending',
          created_at: '2024-01-02',
        },
      ];

      mockInvoke.mockResolvedValueOnce({
        data: { domains: mockDomains },
        error: null,
      });

      const { result } = renderHook(() => useCustomDomains());

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.domains).toEqual(mockDomains);
      expect(result.current.error).toBeNull();
      expect(mockInvoke).toHaveBeenCalledWith('custom-domains', {
        body: { action: 'list' },
      });
    });

    it('should handle fetch errors gracefully', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch domains' },
      });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch domains');
      expect(result.current.domains).toEqual([]);
    });
  });

  describe('addDomain', () => {
    it('should add domain successfully and return DNS instructions', async () => {
      const mockDNSInstructions = {
        type: 'CNAME',
        name: 'report.company.com',
        value: 'cname.disclosurely.com',
        ttl: 3600,
      };

      const mockNewDomain = {
        id: 'new-domain',
        domain_name: 'report.company.com',
        verification_status: 'pending',
        created_at: '2024-01-03',
      };

      // Mock initial fetchDomains on hook mount
      mockInvoke.mockResolvedValueOnce({
        data: { domains: [] },
        error: null,
      });

      // Mock add domain response
      mockInvoke.mockResolvedValueOnce({
        data: {
          domain: mockNewDomain,
          dns_instructions: mockDNSInstructions,
        },
        error: null,
      });

      // Mock refresh domains response after add
      mockInvoke.mockResolvedValueOnce({
        data: { domains: [mockNewDomain] },
        error: null,
      });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let addResult;
      await act(async () => {
        addResult = await result.current.addDomain('report.company.com');
      });

      expect(addResult).toEqual({
        domain: mockNewDomain,
        dns_instructions: mockDNSInstructions,
      });

      // After refresh, domains should be updated
      expect(result.current.domains).toHaveLength(1);

      expect(mockInvoke).toHaveBeenCalledWith('custom-domains', {
        body: {
          action: 'add',
          domain_name: 'report.company.com',
        },
      });
    });

    it('should handle add domain errors', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          data: { domains: [] },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Domain already exists' },
        });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addDomain('existing.com');
        })
      ).rejects.toThrow();
    });
  });

  describe('verifyDomain', () => {
    it('should verify domain successfully', async () => {
      const mockVerifiedDomain = {
        id: 'domain-1',
        domain_name: 'report.company.com',
        verification_status: 'verified',
      };

      mockInvoke
        .mockResolvedValueOnce({
          data: { domains: [] },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            verified: true,
            message: 'Domain verified successfully',
            domain: mockVerifiedDomain,
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { domains: [mockVerifiedDomain] },
          error: null,
        });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyDomain('domain-1');
      });

      expect(verifyResult).toEqual({
        verified: true,
        message: 'Domain verified successfully',
        domain: mockVerifiedDomain,
      });

      expect(mockInvoke).toHaveBeenCalledWith('custom-domains', {
        body: {
          action: 'verify',
          domainId: 'domain-1',
        },
      });
    });

    it('should handle verification failure', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          data: { domains: [] },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            verified: false,
            message: 'DNS records not found',
          },
          error: null,
        });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyDomain('domain-1');
      });

      expect(verifyResult.verified).toBe(false);
      expect(verifyResult.message).toBe('DNS records not found');
    });
  });

  describe('deleteDomain', () => {
    it('should delete domain successfully', async () => {
      const initialDomains = [
        { id: 'domain-1', domain_name: 'test1.com' },
        { id: 'domain-2', domain_name: 'test2.com' },
      ];

      mockInvoke
        .mockResolvedValueOnce({
          data: { domains: initialDomains },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { domains: [initialDomains[1]] },
          error: null,
        });

      const { result } = renderHook(() => useCustomDomains());

      await waitFor(() => {
        expect(result.current.domains).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteDomain('domain-1');
      });

      await waitFor(() => {
        expect(result.current.domains).toHaveLength(1);
      });

      expect(mockInvoke).toHaveBeenCalledWith('custom-domains', {
        body: {
          action: 'delete',
          domainId: 'domain-1',
        },
      });
    });
  });

  // DNS propagation tests removed - checkPropagation function not yet implemented
  // TODO: Implement checkPropagation feature post-launch if needed
});
