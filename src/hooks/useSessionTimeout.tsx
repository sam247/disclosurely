import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

const IDLE_TIMEOUT = 7 * 60 * 1000; // 7 minutes
const ABSOLUTE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

export const useSessionTimeout = () => {
  const { user, session, signOut } = useAuth();
  const { toast } = useToast();
  
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const absoluteTimerRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    if (!user || !session) return;

    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity.",
        variant: "destructive",
      });
      signOut();
    }, IDLE_TIMEOUT);
  }, [user, session, signOut, toast]);

  // Show warning before absolute timeout
  const showAbsoluteTimeoutWarning = useCallback(() => {
    if (warningShownRef.current) return;
    
    warningShownRef.current = true;
    toast({
      title: "Session Ending Soon",
      description: "Your session will expire in 5 minutes due to maximum session time. Please save your work.",
      variant: "destructive",
    });
  }, [toast]);

  // Set up absolute timeout
  const setupAbsoluteTimeout = useCallback(() => {
    if (!user || !session) return;

    // Clear existing absolute timer
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
    }

    // Reset session start time
    sessionStartRef.current = Date.now();
    warningShownRef.current = false;

    // Show warning 5 minutes before absolute timeout
    const warningTime = ABSOLUTE_TIMEOUT - (5 * 60 * 1000);
    setTimeout(showAbsoluteTimeoutWarning, warningTime);

    // Set absolute timeout
    absoluteTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "Your session has reached the maximum allowed time and has been terminated.",
        variant: "destructive",
      });
      signOut();
    }, ABSOLUTE_TIMEOUT);
  }, [user, session, signOut, toast, showAbsoluteTimeoutWarning]);

  // Set up activity listeners
  useEffect(() => {
    if (!user || !session) {
      // Clear timers when user is logged out
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      return;
    }

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Set up timers when user logs in
    setupAbsoluteTimeout();
    resetIdleTimer();

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    };
  }, [user, session, resetIdleTimer, setupAbsoluteTimeout]);

  // Return session time information
  return {
    getIdleTimeRemaining: () => {
      if (!user) return 0;
      return IDLE_TIMEOUT;
    },
    getAbsoluteTimeRemaining: () => {
      if (!user) return 0;
      const elapsed = Date.now() - sessionStartRef.current;
      return Math.max(0, ABSOLUTE_TIMEOUT - elapsed);
    }
  };
};