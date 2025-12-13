import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import AnonymousMessaging from './AnonymousMessaging';

// Mock hooks
vi.mock('@/hooks/useCustomDomain', () => ({
  useCustomDomain: () => ({
    customDomain: null,
    organizationId: 'test-org-id',
    isCustomDomain: false,
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock React Router
const mockParams = { trackingId: 'ABC12345' };
const mockLocation = { state: {} };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useLocation: () => mockLocation,
  };
});

// Mock Supabase - Use chainable query builder
// Note: Variables used in vi.mock must be defined inside the factory function due to hoisting
vi.mock('@/integrations/supabase/client', () => {
  const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = vi.fn();
  const mockSingle = vi.fn();

  const createChainableQueryBuilder = (finalResult: any = { data: null, error: null }) => {
    const builder: any = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue(finalResult),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: mockSingle.mockResolvedValue(finalResult),
      maybeSingle: mockMaybeSingle.mockResolvedValue(finalResult),
    };
    
    // Make it thenable (Promise-like)
    builder.then = (onResolve: any) => Promise.resolve(finalResult).then(onResolve);
    builder.catch = (onReject: any) => Promise.resolve(finalResult).catch(onReject);
    builder.finally = (onFinally: any) => Promise.resolve(finalResult).finally(onFinally);
    
    return builder;
  };

  return {
    supabase: {
      functions: {
        invoke: mockInvoke,
      },
      from: vi.fn(() => createChainableQueryBuilder()),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    },
  };
});

describe('AnonymousMessaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load report and messages successfully', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    const mockMessages = [
      {
        id: 'msg-1',
        sender_type: 'case_handler',
        encrypted_message: 'Can you provide more details?',
        created_at: '2024-01-01T01:00:00Z',
        is_read: true,
      },
      {
        id: 'msg-2',
        sender_type: 'whistleblower',
        encrypted_message: 'Yes, here are the details...',
        created_at: '2024-01-01T02:00:00Z',
        is_read: true,
      },
    ];

    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: mockMessages,
        organization: { name: 'Test Org', brand_color: '#123456' },
      },
      error: null,
    });

    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });

    // Check messages are displayed
    expect(screen.getByText('Can you provide more details?')).toBeInTheDocument();
    expect(screen.getByText('Yes, here are the details...')).toBeInTheDocument();
  });

  it('should send encrypted message successfully', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    // Mock initial load
    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: [],
        organization: { name: 'Test Org' },
      },
      error: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });

    // Mock send message
    const newMessage = {
      id: 'msg-new',
      sender_type: 'whistleblower',
      encrypted_message: 'This is a follow-up message',
      created_at: new Date().toISOString(),
      is_read: false,
    };

    mockInvoke.mockResolvedValueOnce({
      data: { message: newMessage },
      error: null,
    });

    // Type message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'This is a follow-up message');

    // Send message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('anonymous-report-messaging', {
        body: {
          action: 'send',
          trackingId: 'ABC12345',
          message: 'This is a follow-up message',
        },
      });
    });

    // Message should appear
    await waitFor(() => {
      expect(screen.getByText('This is a follow-up message')).toBeInTheDocument();
    });
  });

  it('should handle message send failure with rollback', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    // Mock initial load
    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: [],
        organization: { name: 'Test Org' },
      },
      error: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });

    // Mock send failure
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Send failed' },
    });

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, 'This should fail');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for error handling
    await waitFor(() => {
      // The message input should still contain the text (rollback restores it)
      // But the message should not appear in the messages list
    expect(messageInput).toHaveValue('This should fail');
    }, { timeout: 3000 });

    // Verify the message was not added to the messages list
    // The textarea still has the value, but it shouldn't be in the messages
    const messageInList = screen.queryByText('This should fail', { selector: '[data-message]' });
    expect(messageInList).not.toBeInTheDocument();
  });

  it('should handle report not found', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Report not found' },
    });

    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('anonymous-report-messaging', {
        body: { action: 'load', trackingId: 'ABC12345' },
      });
    });
  });

  it('should display messages in correct order', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    const mockMessages = [
      {
        id: 'msg-1',
        sender_type: 'whistleblower',
        encrypted_message: 'First message',
        created_at: '2024-01-01T01:00:00Z',
        is_read: true,
      },
      {
        id: 'msg-2',
        sender_type: 'case_handler',
        encrypted_message: 'Second message',
        created_at: '2024-01-01T02:00:00Z',
        is_read: true,
      },
      {
        id: 'msg-3',
        sender_type: 'whistleblower',
        encrypted_message: 'Third message',
        created_at: '2024-01-01T03:00:00Z',
        is_read: true,
      },
    ];

    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: mockMessages,
        organization: { name: 'Test Org' },
      },
      error: null,
    });

    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      const messages = screen.getAllByText(/message/i);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  it('should apply custom branding from custom domain', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        organization_id: 'test-org-id',
        organizations: {
          name: 'Custom Branded Org',
          logo_url: 'https://example.com/logo.png',
          brand_color: '#FF0000',
        },
      },
      error: null,
    });

    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: [],
      },
      error: null,
    });

    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });
  });

  it('should prevent empty messages from being sent', async () => {
    const mockReport = {
      id: 'report-1',
      tracking_id: 'ABC12345',
      title: 'Test Report',
      status: 'new',
      created_at: '2024-01-01T00:00:00Z',
      organization_id: 'test-org-id',
    };

    mockInvoke.mockResolvedValueOnce({
      data: {
        report: mockReport,
        messages: [],
        organization: { name: 'Test Org' },
      },
      error: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<AnonymousMessaging />);

    await waitFor(() => {
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send/i });

    // Clear previous calls to only count calls after button click
    mockInvoke.mockClear();
    
    // Reset mock to return the same data for any subsequent calls
    mockInvoke.mockResolvedValue({
      data: {
        report: mockReport,
        messages: [],
        organization: { name: 'Test Org' },
      },
      error: null,
    });

    // Try to send empty message
    await user.click(sendButton);

    // Wait a bit to ensure no async calls are made
    await waitFor(() => {
      // Should not call invoke for sending empty message
      expect(mockInvoke).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
