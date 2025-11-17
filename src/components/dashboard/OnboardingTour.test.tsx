import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingTour } from './OnboardingTour';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTranslation } from 'react-i18next';

// Mock dependencies
vi.mock('@/hooks/useUserRoles');
vi.mock('react-i18next');
vi.mock('react-joyride', () => ({
  default: ({ steps, run, callback }: any) => {
    if (!run) return null;
    return (
      <div data-testid="joyride-mock">
        <div data-testid="step-count">{steps.length}</div>
        <button onClick={() => callback({ status: 'finished', action: 'close', index: 0 })}>
          Finish
        </button>
        <button onClick={() => callback({ status: 'skipped', action: 'skip', index: 0 })}>
          Skip
        </button>
        <button onClick={() => callback({ action: 'next', index: 0, status: 'running' })}>
          Next
        </button>
        <button onClick={() => callback({ action: 'prev', index: 1, status: 'running' })}>
          Previous
        </button>
      </div>
    );
  },
  STATUS: {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
  },
}));

describe('OnboardingTour', () => {
  const mockOnFinish = vi.fn();
  const mockOnSkip = vi.fn();
  const mockT = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
  });

  it('should not render when run is false', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    const { container } = render(
      <OnboardingTour run={false} onFinish={mockOnFinish} onSkip={mockOnSkip} />
    );

    expect(container.querySelector('[data-testid="joyride-mock"]')).not.toBeInTheDocument();
  });

  it('should render when run is true', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    expect(screen.getByTestId('joyride-mock')).toBeInTheDocument();
  });

  it('should have 6 steps for non-admin users', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    // Non-admin steps: welcome, dashboard-home, secure-link, checklist, language-selector, complete
    expect(screen.getByTestId('step-count')).toHaveTextContent('6');
  });

  it('should have 11 steps for admin users', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: true,
      isOrgOwner: true,
      isTeamMember: false,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    // Admin steps: welcome, dashboard-home, secure-link, ai-helper, analytics, workflows, team, settings, checklist, language-selector, complete
    expect(screen.getByTestId('step-count')).toHaveTextContent('11');
  });

  it('should call onFinish when tour is finished', async () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    const finishButton = screen.getByText('Finish');
    finishButton.click();

    expect(mockOnFinish).toHaveBeenCalledTimes(1);
    expect(mockOnSkip).not.toHaveBeenCalled();
  });

  it('should call onSkip when tour is skipped', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    const skipButton = screen.getByText('Skip');
    skipButton.click();

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
    expect(mockOnFinish).not.toHaveBeenCalled();
  });

  it('should use translated strings', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: true,
      isOrgOwner: true,
      isTeamMember: false,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    // Check that translation function was called for tour steps
    expect(mockT).toHaveBeenCalledWith('tour.welcome');
    expect(mockT).toHaveBeenCalledWith('tour.dashboardHome');
    expect(mockT).toHaveBeenCalledWith('tour.complete');
    expect(mockT).toHaveBeenCalledWith('tour.back');
    expect(mockT).toHaveBeenCalledWith('tour.next');
    expect(mockT).toHaveBeenCalledWith('tour.skip');
  });

  it('should call translation for admin-only steps when user is admin', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: true,
      isOrgOwner: true,
      isTeamMember: false,
      loading: false,
    });

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    expect(mockT).toHaveBeenCalledWith('tour.aiHelper');
    expect(mockT).toHaveBeenCalledWith('tour.analytics');
    expect(mockT).toHaveBeenCalledWith('tour.workflows');
    expect(mockT).toHaveBeenCalledWith('tour.team');
    expect(mockT).toHaveBeenCalledWith('tour.settings');
  });

  it('should not call translation for admin-only steps when user is not admin', () => {
    vi.mocked(useUserRoles).mockReturnValue({
      isOrgAdmin: false,
      isOrgOwner: false,
      isTeamMember: true,
      loading: false,
    });

    mockT.mockClear();

    render(<OnboardingTour run={true} onFinish={mockOnFinish} onSkip={mockOnSkip} />);

    expect(mockT).not.toHaveBeenCalledWith('tour.aiHelper');
    expect(mockT).not.toHaveBeenCalledWith('tour.analytics');
    expect(mockT).not.toHaveBeenCalledWith('tour.workflows');
    expect(mockT).not.toHaveBeenCalledWith('tour.team');
    expect(mockT).not.toHaveBeenCalledWith('tour.settings');
  });
});
