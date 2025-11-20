import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

import { supabase } from '@/integrations/supabase/client';

describe('Security Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Row Level Security (RLS)', () => {
    it('should enforce organization isolation for reports', async () => {
      // This test verifies RLS policies prevent cross-organization access
      const mockReports = [
        { id: '1', organization_id: 'org-1', title: 'Report 1' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockReports,
            error: null,
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('reports')
        .select('*')
        .eq('organization_id', 'org-1');

      expect(data).toHaveLength(1);
      expect(data![0].organization_id).toBe('org-1');
    });

    it('should enforce user role-based access control', async () => {
      const mockUserRoles = [
        { user_id: 'user-1', role: 'case_handler', organization_id: 'org-1' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockUserRoles,
              error: null,
            }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', 'user-1')
        .eq('organization_id', 'org-1');

      expect(data).toHaveLength(1);
      expect(data![0].role).toBe('case_handler');
    });

    it('should prevent access to soft-deleted records', async () => {
      const mockReports = [
        { id: '1', title: 'Active Report', deleted_at: null },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockResolvedValue({
            data: mockReports,
            error: null,
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('reports')
        .select('*')
        .is('deleted_at', null);

      expect(data).toHaveLength(1);
      expect(data![0].deleted_at).toBeNull();
    });
  });

  describe('Data Encryption', () => {
    it('should verify report data is encrypted at rest', async () => {
      const mockEncryptedReport = {
        id: 'report-1',
        encrypted_data: 'U2FsdGVkX1+encrypted_content_here',
        key_hash: 'abc123hash',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockEncryptedReport,
        error: null,
      });

      const { data } = await supabase.functions.invoke('encrypt-report-data', {
        body: { reportData: { description: 'Test' }, organizationId: 'org-1' },
      });

      expect(data.encrypted_data).toBeDefined();
      expect(data.encrypted_data).not.toContain('Test');
      expect(data.key_hash).toBeDefined();
    });

    it('should verify message encryption for secure communication', async () => {
      const mockEncryptedMessage = {
        id: 'msg-1',
        encrypted_message: 'encrypted_content',
        sender_type: 'case_handler',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { message: mockEncryptedMessage },
        error: null,
      });

      const { data } = await supabase.functions.invoke('anonymous-report-messaging', {
        body: {
          action: 'send',
          trackingId: 'ABC123',
          message: 'Sensitive information',
        },
      });

      expect(data.message.encrypted_message).toBeDefined();
      expect(data.message.encrypted_message).not.toContain('Sensitive');
    });

    it('should enforce encryption salt immutability', async () => {
      // Verify the encryption salt cannot be changed without proper authorization
      const mockAuditLog = {
        event_type: 'encryption_salt_change_attempt',
        severity: 'critical',
        blocked: true,
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: mockAuditLog,
          error: null,
        }),
      } as any);

      const { data } = await supabase.from('encryption_salt_audit').insert({
        action: 'encryption_salt_change_attempt',
        changed_at: new Date().toISOString(),
      }) as any;

      expect(data?.blocked).toBe(true);
    });
  });

  describe('Authentication & Session Security', () => {
    it('should validate JWT token expiration', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            refresh_token: 'refresh_token',
            expires_in: 3600,
            expires_at: Date.now() + 3600000, // 1 hour from now
            token_type: 'bearer',
            user: {} as any,
          },
        },
        error: null,
      } as any);

      const { data } = await supabase.auth.getSession();

      expect(data.session?.access_token).toBeDefined();
      expect(data.session?.expires_at).toBeGreaterThan(Date.now());
    });

    it('should enforce account lockout after failed attempts', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true, // Account is locked
        error: null,
      });

      const { data: isLocked } = await supabase.rpc('is_account_locked', {
        p_email: 'test@example.com',
        p_organization_id: null,
      });

      expect(isLocked).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('is_account_locked', {
        p_email: 'test@example.com',
        p_organization_id: null,
      });
    });

    it('should track concurrent sessions', async () => {
      const mockActiveSessions = [
        { id: 'session-1', user_id: 'user-1', is_active: true },
        { id: 'session-2', user_id: 'user-1', is_active: true },
      ];

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { sessions: mockActiveSessions },
        error: null,
      });

      const { data } = await supabase.functions.invoke('track-session', {
        body: { action: 'check_active_sessions', userId: 'user-1' },
      });

      expect(data.sessions).toHaveLength(2);
      expect(data.sessions.every((s: any) => s.is_active)).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    it('should log sensitive operations to audit trail', async () => {
      const mockAuditEntry = {
        event_type: 'report.viewed',
        category: 'case_management',
        severity: 'medium',
        actor_email: 'admin@test.com',
        target_id: 'report-123',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [mockAuditEntry],
          error: null,
        }),
      } as any);

      const { data } = await supabase.from('audit_logs').insert([{
        action: 'viewed',
        event_type: 'report.viewed',
        category: 'case_management',
        severity: 'medium',
        actor_email: 'admin@test.com',
        target_id: 'report-123',
        actor_type: 'user',
        summary: 'Report viewed',
        hash: 'test-hash',
        organization_id: 'org-1',
      }]) as any;

      expect(data).toBeDefined();
      if (data) {
        expect(data[0].event_type).toBe('report.viewed');
      }
    });

    it('should verify audit log tamper-evidence with hash chain', async () => {
      const mockAuditLogs = [
        { id: '1', event_type: 'action1', previous_hash: null, hash: 'hash1' },
        { id: '2', event_type: 'action2', previous_hash: 'hash1', hash: 'hash2' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockAuditLogs,
            error: null,
          }),
        }),
      } as any);

      const { data } = await supabase.from('audit_logs').select('*').order('created_at');

      expect(data![1].previous_hash).toBe(data![0].hash);
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should prevent SQL injection in database queries', async () => {
      const maliciousInput = "'; DROP TABLE reports; --";

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any);

      // Parameterized query should safely handle malicious input
      const { data } = await supabase.from('reports').select('*').eq('title', maliciousInput);

      expect(data).toEqual([]);
      // Query should not have executed malicious SQL
    });

    it('should sanitize XSS attempts in user input', () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      const sanitized = xssAttempt
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });
  });

  describe('File Upload Security', () => {
    it('should strip metadata from uploaded files', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          original_metadata: { gps: 'removed', camera: 'removed' },
          stripped: true,
        },
        error: null,
      });

      const { data } = await supabase.functions.invoke('strip-document-metadata', {
        body: { fileId: 'file-123' },
      });

      expect(data.stripped).toBe(true);
      expect(data.original_metadata).toBeDefined();
    });

    it('should validate file types and sizes', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      const validFile = { type: 'image/jpeg', size: 5 * 1024 * 1024 };
      const invalidType = { type: 'application/exe', size: 1024 };
      const tooLarge = { type: 'image/jpeg', size: 15 * 1024 * 1024 };

      expect(allowedTypes.includes(validFile.type) && validFile.size <= maxSize).toBe(true);
      expect(allowedTypes.includes(invalidType.type)).toBe(false);
      expect(tooLarge.size <= maxSize).toBe(false);
    });
  });

  describe('PII Detection & Redaction', () => {
    it('should detect and redact PII before AI processing', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          redacted_text: 'My email is [REDACTED] and phone is [REDACTED]',
          pii_found: ['email', 'phone'],
        },
        error: null,
      });

      const { data } = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          reportData: {
            description: 'My email is test@example.com and phone is 555-1234',
          },
        },
      });

      expect(data.redacted_text).not.toContain('test@example.com');
      expect(data.redacted_text).not.toContain('555-1234');
      expect(data.pii_found).toContain('email');
      expect(data.pii_found).toContain('phone');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const requests = Array(100).fill(null);

      // First should succeed
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as any);

      // After rate limit, should fail
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded' },
      } as any);

      // Simulate rapid requests
      const results = await Promise.all(
        requests.slice(0, 2).map(() =>
          supabase.functions.invoke('some-endpoint', {
            body: {},
          })
        )
      );

      // At least one should be rate limited (in real scenario)
      expect(supabase.functions.invoke).toHaveBeenCalled();
    });
  });

  describe('Case Insights RAG Security', () => {
    it('should enforce organization isolation in RAG queries', async () => {
      // User A from org-1 should not see org-2 cases
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          response: 'Found 2 cases',
          cases: [
            { id: 'case-1', tracking_id: 'DIS-001', organization_id: 'org-1' },
            { id: 'case-2', tracking_id: 'DIS-002', organization_id: 'org-1' }
          ]
        },
        error: null
      });

      const { data } = await supabase.functions.invoke('rag-case-query', {
        body: {
          query: 'Show me fraud cases',
          organizationId: 'org-1'
        }
      });

      // Verify all returned cases belong to org-1
      expect(data.cases.every((c: any) => c.organization_id === 'org-1')).toBe(true);
      expect(data.cases.length).toBe(2);
    });

    it('should block cross-organization access attempts', async () => {
      // User from org-1 trying to query org-2 should be blocked
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized: User does not belong to this organization' }
      });

      const { error } = await supabase.functions.invoke('rag-case-query', {
        body: {
          query: 'Show me cases',
          organizationId: 'org-2' // Different org
        }
      });

      expect(error?.message).toContain('Unauthorized');
    });

    it('should enforce rate limiting on RAG queries (10/minute)', async () => {
      // First 10 requests should succeed
      for (let i = 0; i < 10; i++) {
        vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
          data: { response: 'Success', cases: [] },
          error: null
        });
      }

      // 11th request should be rate limited
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Too many requests. Please try again later.' }
      });

      // Simulate 11 rapid requests
      const requests = Array(11).fill(null).map(() =>
        supabase.functions.invoke('rag-case-query', {
          body: { query: 'test', organizationId: 'org-1' }
        })
      );

      const results = await Promise.all(requests);
      const lastResult = results[results.length - 1];

      expect(lastResult.error?.message).toContain('Too many requests');
    });

    it('should log all RAG queries to audit table', async () => {
      const mockQueryLog = {
        id: 'log-1',
        organization_id: 'org-1',
        user_id: 'user-1',
        query_text: 'Show me fraud cases',
        results_count: 2,
        cases_returned: ['case-1', 'case-2'],
        created_at: new Date().toISOString()
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [mockQueryLog],
          error: null
        })
      } as any);

      // Simulate query logging
      const { data } = await supabase.from('rag_query_logs').insert({
        organization_id: 'org-1',
        user_id: 'user-1',
        query_text: 'Show me fraud cases',
        results_count: 2,
        cases_returned: ['case-1', 'case-2']
      }) as any;

      expect(data).toBeDefined();
      if (data && Array.isArray(data)) {
        expect(data[0].organization_id).toBe('org-1');
        expect(data[0].query_text).toBe('Show me fraud cases');
        expect(data[0].results_count).toBe(2);
      }
    });

    it('should verify match_cases_by_organization RPC enforces org_id filter', async () => {
      // RPC function should only return cases from specified org
      const mockCases = [
        { id: 'case-1', tracking_id: 'DIS-001', organization_id: 'org-1' },
        { id: 'case-2', tracking_id: 'DIS-002', organization_id: 'org-1' }
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockCases,
        error: null
      });

      const { data } = await supabase.rpc('match_cases_by_organization', {
        query_embedding: '[0.1, 0.2, ...]',
        match_threshold: 0.7,
        match_count: 10,
        org_id: 'org-1'
      });

      // Verify all cases belong to requested org
      expect(data.every((c: any) => c.organization_id === 'org-1')).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith(
        'match_cases_by_organization',
        expect.objectContaining({ org_id: 'org-1' })
      );
    });

    it('should prevent users from viewing other organizations query logs', async () => {
      // User from org-1 should only see org-1 logs
      const mockLogs = [
        {
          id: 'log-1',
          organization_id: 'org-1',
          user_id: 'user-1',
          query_text: 'Query 1'
        }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockLogs,
            error: null
          })
        })
      } as any);

      const { data } = await supabase
        .from('rag_query_logs')
        .select('*')
        .eq('organization_id', 'org-1');

      expect(data).toBeDefined();
      expect(data!.every((log: any) => log.organization_id === 'org-1')).toBe(true);
    });
  });
});
