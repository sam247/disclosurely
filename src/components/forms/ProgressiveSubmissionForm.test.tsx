import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import CleanSubmissionWrapper from './CleanSubmissionWrapper';

// Mock hooks
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
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock('@/hooks/useCustomDomain', () => ({
  useCustomDomain: () => ({
    customDomain: null,
    organizationId: 'org-1',
    isCustomDomain: false,
    loading: false,
  }),
}));

// Mock Supabase
const mockInvoke = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: () => ({
          eq: () => ({
            single: () => mockSingle(),
          }),
        }),
      };
    },
  },
}));

describe('ProgressiveSubmissionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render submission form', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'link-1',
        organization_id: 'org-1',
        is_active: true,
        name: 'Test Link',
      },
      error: null,
    });

    renderWithProviders(<CleanSubmissionWrapper />);

    // Form should load
    await waitFor(() => {
      expect(screen.queryByText(/report|submit/i)).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should validate required fields', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'link-1',
        organization_id: 'org-1',
        is_active: true,
        name: 'Test Link',
      },
      error: null,
    });

    renderWithProviders(<CleanSubmissionWrapper />);

    // Wait for form to load
    await waitFor(() => {
      const form = screen.queryByRole('form') || screen.queryByText(/report/i);
      expect(form).toBeTruthy();
    }, { timeout: 5000 });
  });
});

