import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';

const IDLE_TIMEOUT = 7 * 60 * 1000; // 7 minutes
const ABSOLUTE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout

export const useSessionTimeout = () => {
  const { user, session, signOut } = useAuth();
  const { toast } = useToast();
  
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const absoluteTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const absoluteWarningShownRef = useRef(false);
  
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showAbsoluteWarning, setShowAbsoluteWarning] = useState(false);
  const [idleTimeRemaining, setIdleTimeRemaining] = useState(0);
  const [absoluteTimeRemaining, setAbsoluteTimeRemaining] = useState(0);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    if (!user || !session) return;

    // Clear existing timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Reset warning states
    setShowIdleWarning(false);
    warningShownRef.current = false;

    // Show warning before idle timeout
    warningTimerRef.current = setTimeout(() => {
      if (warningShownRef.current) return;
      warningShownRef.current = true;
      setIdleTimeRemaining(WARNING_TIME / 1000);
      setShowIdleWarning(true);
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set idle timeout
    idleTimerRef.current = setTimeout(() => {
      if (!showIdleWarning) {
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity.",
          variant: "destructive",
        });
        signOut();
      }
    }, IDLE_TIMEOUT);
  }, [user, session, signOut, toast, showIdleWarning]);

  // Show warning before absolute timeout
  const showAbsoluteTimeoutWarning = useCallback(() => {
    if (absoluteWarningShownRef.current) return;
    
    absoluteWarningShownRef.current = true;
    setAbsoluteTimeRemaining(5 * 60); // 5 minutes in seconds
    setShowAbsoluteWarning(true);
  }, []);

  // Handle extend session
  const handleExtendSession = useCallback(() => {
    setShowIdleWarning(false);
    setShowAbsoluteWarning(false);
    warningShownRef.current = false;
    absoluteWarningShownRef.current = false;
    
    // Trigger user activity to reset timers
    document.dispatchEvent(new Event('mousedown'));
    
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    });
  }, [toast]);

  // Handle sign out from warning
  const handleSignOutFromWarning = useCallback(() => {
    setShowIdleWarning(false);
    setShowAbsoluteWarning(false);
    signOut();
  }, [signOut]);

  // Set up absolute timeout
  const setupAbsoluteTimeout = useCallback(() => {
    if (!user || !session) return;

    // Clear existing absolute timer
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
    }

    // Reset session start time
    sessionStartRef.current = Date.now();
    absoluteWarningShownRef.current = false;

    // Show warning 5 minutes before absolute timeout
    const warningTime = ABSOLUTE_TIMEOUT - (5 * 60 * 1000);
    setTimeout(showAbsoluteTimeoutWarning, warningTime);

    // Set absolute timeout
    absoluteTimerRef.current = setTimeout(() => {
      if (!showAbsoluteWarning) {
        toast({
          title: "Session Expired",
          description: "Your session has reached the maximum allowed time and has been terminated.",
          variant: "destructive",
        });
        signOut();
      }
    }, ABSOLUTE_TIMEOUT);
  }, [user, session, signOut, toast, showAbsoluteTimeoutWarning, showAbsoluteWarning]);

  // Countdown effect for warnings
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showIdleWarning && idleTimeRemaining > 0) {
      interval = setInterval(() => {
        setIdleTimeRemaining(prev => {
          if (prev <= 1) {
            setShowIdleWarning(false);
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    if (showAbsoluteWarning && absoluteTimeRemaining > 0) {
      interval = setInterval(() => {
        setAbsoluteTimeRemaining(prev => {
          if (prev <= 1) {
            setShowAbsoluteWarning(false);
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showIdleWarning, showAbsoluteWarning, idleTimeRemaining, absoluteTimeRemaining, signOut]);

  // Set up activity listeners
  useEffect(() => {
    if (!user || !session) {
      // Clear timers when user is logged out
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      setShowIdleWarning(false);
      setShowAbsoluteWarning(false);
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
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [user, session, resetIdleTimer, setupAbsoluteTimeout]);

  // Return session time information and warning components
  return {
    getIdleTimeRemaining: () => {
      if (!user) return 0;
      return IDLE_TIMEOUT;
    },
    getAbsoluteTimeRemaining: () => {
      if (!user) return 0;
      const elapsed = Date.now() - sessionStartRef.current;
      return Math.max(0, ABSOLUTE_TIMEOUT - elapsed);
    },
    // Warning components
    IdleWarningComponent: () => (
      <SessionTimeoutWarning
        open={showIdleWarning}
        timeRemaining={idleTimeRemaining}
        onExtendSession={handleExtendSession}
        onSignOut={handleSignOutFromWarning}
      />
    ),
    AbsoluteWarningComponent: () => (
      <SessionTimeoutWarning
        open={showAbsoluteWarning}
        timeRemaining={absoluteTimeRemaining}
        onExtendSession={handleExtendSession}
        onSignOut={handleSignOutFromWarning}
      />
    )
  };
};