import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import CaseInsightsView from './CaseInsightsView';

// Mock hooks
const mockUser = { id: 'user-1', email: 'test@example.com' };
const mockOrganization = { id: 'org-1', name: 'Test Org' };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('@/hooks/useOrganization', () => ({
  useOrganization: () => ({
    organization: mockOrganization,
  }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

describe('CaseInsightsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state correctly', async () => {
    renderWithProviders(<CaseInsightsView />);

    await waitFor(() => {
      expect(screen.getByText('Case Insights')).toBeInTheDocument();
    });

    expect(screen.getByText(/Ask questions about your cases and get instant insights/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question about your cases/i)).toBeInTheDocument();
    
    // Check for suggested queries
    expect(screen.getByText('Show me fraud cases from Q4')).toBeInTheDocument();
    expect(screen.getByText("What's my average resolution time?")).toBeInTheDocument();
  });

  it('should transition to chat interface after first query', async () => {
    const mockResponse = {
      response: 'I found 2 fraud cases from Q4.',
      cases: [
        {
          id: 'case-1',
          tracking_id: 'DIS-001',
          title: 'Fraud Case 1',
          status: 'investigating',
          priority: 2,
          created_at: '2024-10-01T00:00:00Z'
        }
      ]
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await userEvent.type(input, 'Show me fraud cases');
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Clear Chat')).toBeInTheDocument();
    });

    // Should show chat interface
    expect(screen.getByText('Show me fraud cases')).toBeInTheDocument();
    expect(screen.getByText('I found 2 fraud cases from Q4.')).toBeInTheDocument();
  });

  it('should handle suggested query clicks', async () => {
    const mockResponse = {
      response: 'Here are your cases.',
      cases: []
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    const suggestionButton = screen.getByText('Show me fraud cases from Q4');
    await userEvent.click(suggestionButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('rag-case-query', {
        body: {
          query: 'Show me fraud cases from Q4',
          organizationId: 'org-1'
        }
      });
    });
  });

  it('should display case cards in AI responses', async () => {
    const mockResponse = {
      response: 'I found these cases:',
      cases: [
        {
          id: 'case-1',
          tracking_id: 'DIS-001',
          title: 'Fraud Case 1',
          status: 'investigating',
          priority: 2,
          created_at: '2024-10-01T00:00:00Z'
        },
        {
          id: 'case-2',
          tracking_id: 'DIS-002',
          title: 'Fraud Case 2',
          status: 'new',
          priority: 1,
          created_at: '2024-10-15T00:00:00Z'
        }
      ]
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'Show fraud cases');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('DIS-001')).toBeInTheDocument();
      expect(screen.getByText('DIS-002')).toBeInTheDocument();
    });

    expect(screen.getByText('Fraud Case 1')).toBeInTheDocument();
    expect(screen.getByText('Fraud Case 2')).toBeInTheDocument();
  });

  it('should navigate to case details when View Details is clicked', async () => {
    const mockResponse = {
      response: 'Found case:',
      cases: [
        {
          id: 'case-1',
          tracking_id: 'DIS-001',
          title: 'Test Case',
          status: 'new',
          priority: 3,
          created_at: '2024-10-01T00:00:00Z'
        }
      ]
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'test query');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    const viewDetailsButton = screen.getAllByText('View Details')[0];
    await userEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ai-helper?caseId=case-1');
  });

  it('should clear chat and return to empty state', async () => {
    const mockResponse = {
      response: 'Test response',
      cases: []
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    // Send a query first
    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'test query');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Clear Chat')).toBeInTheDocument();
    });

    // Clear chat
    const clearButton = screen.getByText('Clear Chat');
    await userEvent.click(clearButton);

    // Should return to empty state
    await waitFor(() => {
      expect(screen.getByText(/Ask questions about your cases and get instant insights/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while querying', async () => {
    // Delay the response to test loading state
    mockInvoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: { response: 'Done', cases: [] },
        error: null
      }), 100))
    );

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'test query');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Searching your cases/i)).toBeInTheDocument();
    });
  });

  it('should handle query errors gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Query failed' }
    });

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'test query');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Query Failed',
          variant: 'destructive'
        })
      );
    });
  });

  it('should handle Enter key to submit query', async () => {
    const mockResponse = {
      response: 'Response',
      cases: []
    };

    mockInvoke.mockResolvedValue({
      data: mockResponse,
      error: null
    });

    renderWithProviders(<CaseInsightsView />);

    const input = screen.getByPlaceholderText(/Ask a question about your cases/i);
    await userEvent.type(input, 'test query{Enter}');

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    });
  });
});

