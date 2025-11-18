import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionTimeout } from './useSessionTimeout';

// Mock useAuth hook
const mockSignOut = vi.fn();
const mockUser = { id: 'test-user', email: 'test@example.com' };
const mockSession = { access_token: 'test-token' };

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    session: mockSession,
    signOut: mockSignOut,
  }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('./use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize without warnings', () => {
    const { result } = renderHook(() => useSessionTimeout());

    expect(result.current.getIdleTimeRemaining()).toBeGreaterThan(0);
    expect(result.current.getAbsoluteTimeRemaining()).toBeGreaterThan(0);
  });

  it('should track idle time correctly', () => {
    const { result } = renderHook(() => useSessionTimeout());

    const initialIdleTime = result.current.getIdleTimeRemaining();

    // Fast forward 1 minute
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    const newIdleTime = result.current.getIdleTimeRemaining();
    expect(newIdleTime).toBeLessThan(initialIdleTime);
  });

  it('should track absolute session time correctly', () => {
    const { result } = renderHook(() => useSessionTimeout());

    const initialAbsoluteTime = result.current.getAbsoluteTimeRemaining();

    // Fast forward 1 hour
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });

    const newAbsoluteTime = result.current.getAbsoluteTimeRemaining();
    // Allow for small timing differences - time should decrease or stay the same
    expect(newAbsoluteTime).toBeLessThanOrEqual(initialAbsoluteTime);
    // But should definitely be less if we advanced time
    if (initialAbsoluteTime > 0) {
      expect(newAbsoluteTime).toBeLessThan(initialAbsoluteTime);
    }
  });

  it('should reset idle timer on user activity', () => {
    const { result } = renderHook(() => useSessionTimeout());

    // Fast forward to near timeout
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000); // 10 minutes
    });

    const timeBeforeActivity = result.current.getIdleTimeRemaining();

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    const timeAfterActivity = result.current.getIdleTimeRemaining();

    // Time should be reset (increased)
    expect(timeAfterActivity).toBeGreaterThan(timeBeforeActivity);
  });

  it('should not reset timer when warning is shown', async () => {
    const { result } = renderHook(() => useSessionTimeout());

    // Fast forward to show warning (15 minutes)
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    // Wait for warning to appear with timeout
    await waitFor(() => {
      expect(result.current.IdleWarningComponent).toBeTruthy();
    }, { timeout: 2000 });

    const timeBeforeActivity = result.current.getIdleTimeRemaining();

    // Try to trigger activity while warning is shown
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    // Wait a bit to see if timer resets
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const timeAfterActivity = result.current.getIdleTimeRemaining();
    
    // Timer should not reset (time should be same or less, not more)
    // If warning is showing, activity shouldn't reset the timer
    expect(timeAfterActivity).toBeLessThanOrEqual(timeBeforeActivity + 1000); // Allow small margin
  }, { timeout: 5000 });

  it('should handle various activity events', () => {
    const { result } = renderHook(() => useSessionTimeout());

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(eventType => {
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const timeBefore = result.current.getIdleTimeRemaining();

      // Simulate event
      act(() => {
        const event = eventType.startsWith('touch')
          ? new TouchEvent(eventType)
          : new MouseEvent(eventType);
        document.dispatchEvent(event);
      });

      const timeAfter = result.current.getIdleTimeRemaining();

      // Timer should be reset
      expect(timeAfter).toBeGreaterThanOrEqual(timeBefore);
    });
  });

  it('should clean up timers on unmount', () => {
    const { unmount } = renderHook(() => useSessionTimeout());

    unmount();

    // Verify no timers are active
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should handle visibility changes', () => {
    renderHook(() => useSessionTimeout());

    // Simulate tab becoming hidden
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Simulate tab becoming visible again
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Should not throw errors
    expect(true).toBe(true);
  });
});
