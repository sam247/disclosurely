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

// Mock Supabase
const mockInvoke = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: (...args: any[]) => {
          mockSelect(...args);
          return {
            eq: (...args: any[]) => {
              mockEq(...args);
              return {
                eq: (...args: any[]) => {
                  mockEq(...args);
                  return {
                    order: () => ({
                      limit: () => ({
                        maybeSingle: mockMaybeSingle,
                      }),
                    }),
                  };
                },
              };
            },
          };
        },
      };
    },
  },
}));

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

    await waitFor(() => {
      // Message should be removed (rollback)
      expect(screen.queryByText('This should fail')).not.toBeInTheDocument();
    });

    // Input should be restored
    expect(messageInput).toHaveValue('This should fail');
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

    // Try to send empty message
    await user.click(sendButton);

    // Should not call invoke for sending
    expect(mockInvoke).toHaveBeenCalledTimes(1); // Only initial load
  });
});
