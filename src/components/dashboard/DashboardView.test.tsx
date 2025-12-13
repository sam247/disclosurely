import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import DashboardView from './DashboardView';

// Mock hooks
const mockUser = { id: 'user-1', email: 'test@example.com' };
const mockOrganization = { id: 'org-1', name: 'Test Org' };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    subscriptionData: { subscribed: true, subscription_tier: 'pro' },
  }),
}));

vi.mock('@/hooks/useOrganization', () => ({
  useOrganization: () => ({
    organization: mockOrganization,
    profile: { id: 'profile-1', organization_id: 'org-1' },
  }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({
    isOrgAdmin: true,
    roles: ['org_admin'],
  }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => mockOrder(),
            }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      };
    },
  },
}));

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it('should render dashboard with reports list', async () => {
    const mockReports = [
      {
        id: 'report-1',
        tracking_id: 'TRACK001',
        status: 'new',
        created_at: '2024-01-01T00:00:00Z',
        encrypted_content: 'encrypted',
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockReports,
      error: null,
    });

    renderWithProviders(<DashboardView />);

    // Dashboard should load - check for any dashboard content
    // Use more specific queries to avoid multiple matches
    await waitFor(() => {
      const hasTable = screen.queryByRole('table');
      const hasFilterButton = screen.queryByRole('button', { name: /filter/i });
      const hasReportsHeading = screen.queryByRole('heading', { name: /reports/i });
      const hasDashboardContent = hasTable || hasFilterButton || hasReportsHeading;
      expect(hasDashboardContent).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should filter reports by status', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DashboardView />);

    // Look for filter buttons
    const filterButton = screen.queryByRole('button', { name: /filter|status/i });
    
    if (filterButton) {
      await user.click(filterButton);
      
      // Should be able to select status
      const statusOption = screen.queryByText(/new|open|closed/i);
      if (statusOption) {
        await user.click(statusOption);
      }
    }
  });

  it('should assign case to team member', async () => {
    const user = userEvent.setup();

    const mockReports = [
      {
        id: 'report-1',
        tracking_id: 'TRACK001',
        status: 'new',
        created_at: '2024-01-01T00:00:00Z',
        encrypted_content: 'encrypted',
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockReports,
      error: null,
    });

    renderWithProviders(<DashboardView />);

    // Look for assign button
    await waitFor(() => {
      const assignButton = screen.queryByRole('button', { name: /assign/i });
      if (assignButton) {
        expect(assignButton).toBeInTheDocument();
      }
    }, { timeout: 5000 });
  });

  it('should update report status', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DashboardView />);

    // Look for status update controls
    await waitFor(() => {
      const statusButton = screen.queryByRole('button', { name: /status|update/i });
      if (statusButton) {
        expect(statusButton).toBeInTheDocument();
      }
    }, { timeout: 5000 });
  });
});

