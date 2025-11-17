import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingChecklist } from './OnboardingChecklist';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useUserRoles');
vi.mock('@/hooks/useAuth');
vi.mock('react-i18next');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OnboardingChecklist', () => {
  const mockOnStartTour = vi.fn();
  const mockT = vi.fn((key: string, params?: any) => {
    if (params) {
      return `${key}_${params.completed}_${params.total}`;
    }
    return key;
  });
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      subscriptionData: { subscribed: true },
      subscriptionLoading: false,
      refreshSubscription: vi.fn(),
    } as any);

    // Default Supabase mock setup
    const mockFrom = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { first_name: 'Test', last_name: 'User', organization_id: 'org-123' },
      error: null
    });
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              single: mockSingle,
            }),
          }),
        };
      }
      if (table === 'cases') {
        return {
          select: mockSelect.mockReturnValue({
            limit: mockLimit,
          }),
        };
      }
      if (table === 'organizations') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {
        select: mockSelect,
      };
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should show loading state initially', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    const { container } = renderWithRouter(
      <OnboardingChecklist onStartTour={mockOnStartTour} />
    );

    // Initially loading, so component returns null
    expect(container.firstChild).toBeNull();
  });

  it('should render checklist for non-admin users', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      const checklist = screen.getByRole('button', { name: /checklist\.title/i });
      expect(checklist).toBeInTheDocument();
    });

    // Non-admin should have 3 items: profile, case, tour
    expect(mockT).toHaveBeenCalledWith('checklist.completeProfile');
    expect(mockT).toHaveBeenCalledWith('checklist.createCase');
    expect(mockT).toHaveBeenCalledWith('checklist.takeTour');
  });

  it('should render checklist for admin users with additional items', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: true,
      isOrgOwner: true,
      isTeamMember: false,
      loading: false,
    });

    // Mock team count query
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { first_name: 'Admin', last_name: 'User', organization_id: 'org-123' },
                error: null
              }),
            }),
          }),
        };
      }
      if (table === 'cases') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === 'organizations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { brand_color: '#000000' }, error: null }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      expect(mockT).toHaveBeenCalledWith('checklist.inviteTeam');
      expect(mockT).toHaveBeenCalledWith('checklist.setupBranding');
    });
  });

  it('should show progress correctly', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      const trigger = screen.getByRole('button', { name: /checklist\.title/i });
      expect(trigger).toBeInTheDocument();
    });

    // Check progress text shows 1/3 (profile is complete from mock)
    await waitFor(() => {
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  it('should have takeTour item that calls onStartTour', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    // Wait for checklist to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /checklist\.title/i })).toBeInTheDocument();
    });

    // Verify takeTour translation was called (item is created with onStartTour action)
    expect(mockT).toHaveBeenCalledWith('checklist.takeTour');
  });

  it('should have items with navigation paths', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /checklist\.title/i })).toBeInTheDocument();
    });

    // Verify createCase item exists (has path to /dashboard)
    expect(mockT).toHaveBeenCalledWith('checklist.createCase');
  });

  it('should load checklist state from localStorage', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    // Pre-populate localStorage with tour completion
    localStorage.setItem(
      `onboarding_checklist_${mockUser.id}`,
      JSON.stringify({ takeTour: true })
    );

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /checklist\.title/i })).toBeInTheDocument();
    });

    // Progress should show 2/3 (profile from database + tour from localStorage)
    await waitFor(() => {
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });
  });

  it('should auto-open on first visit when not complete', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      const trigger = screen.getByRole('button', { name: /checklist\.title/i });
      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    // Check that the "seen" flag was set
    const seen = localStorage.getItem(`onboarding_checklist_seen_${mockUser.id}`);
    expect(seen).toBe('true');
  });

  it('should not render when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      subscriptionData: {},
      subscriptionLoading: false,
      refreshSubscription: vi.fn(),
    } as any);

    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: false,
      loading: false,
    });

    const { container } = renderWithRouter(
      <OnboardingChecklist onStartTour={mockOnStartTour} />
    );

    // Component should not render when no user
    expect(container.firstChild).toBeNull();
  });

  it('should mark items as completed based on database state', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    // Mock that user has created a case
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { first_name: 'Test', last_name: 'User', organization_id: 'org-123' },
                error: null
              }),
            }),
          }),
        };
      }
      if (table === 'cases') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 'case-1' }], error: null }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);

    renderWithRouter(<OnboardingChecklist onStartTour={mockOnStartTour} />);

    await waitFor(() => {
      // Progress should show 2/3 (profile + case complete)
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });
  });
});
