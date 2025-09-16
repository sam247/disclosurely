import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes - more reasonable for users
const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours - full work day
const WARNING_TIME = 60 * 1000; // Show warning 60 seconds before timeout

export const useSessionTimeout = () => {
  const { user, session, signOut } = useAuth();
  const { toast } = useToast();
  
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const absoluteTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const absoluteWarningShownRef = useRef(false);
  const pendingIdleWarningRef = useRef(false);
  
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showAbsoluteWarning, setShowAbsoluteWarning] = useState(false);
  const [idleTimeRemaining, setIdleTimeRemaining] = useState(0);
  const [absoluteTimeRemaining, setAbsoluteTimeRemaining] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    if (!user || !session) return;
    // Do not reset timers while a warning modal is visible
    if (showIdleWarning || showAbsoluteWarning) return;

    // Clear existing timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Reset warning states and countdown
    setShowIdleWarning(false);
    setIdleTimeRemaining(0);
    warningShownRef.current = false;
    pendingIdleWarningRef.current = false;

    // After 60 seconds of inactivity, show a 60s countdown popup
    idleTimerRef.current = setTimeout(() => {
      console.log('Idle timeout reached, showing warning modal');
      setIdleTimeRemaining(60);
      setShowIdleWarning(true);
    }, IDLE_TIMEOUT);
  }, [user, session, showIdleWarning, showAbsoluteWarning]);

  // Show warning before absolute timeout
  const showAbsoluteTimeoutWarning = useCallback(() => {
    if (absoluteWarningShownRef.current) return;
    
    absoluteWarningShownRef.current = true;
    setAbsoluteTimeRemaining(5 * 60); // 5 minutes in seconds
    setShowAbsoluteWarning(true);
  }, []);

  // Handle extend session
  const handleExtendSession = useCallback(() => {
    // Close modals first
    setShowIdleWarning(false);
    setShowAbsoluteWarning(false);
    setIdleTimeRemaining(0);
    warningShownRef.current = false;
    absoluteWarningShownRef.current = false;
    pendingIdleWarningRef.current = false;

    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Start fresh idle timer
    idleTimerRef.current = setTimeout(() => {
      console.log('Idle timeout reached after extension, showing warning modal');
      setIdleTimeRemaining(60);
      setShowIdleWarning(true);
    }, IDLE_TIMEOUT);
    
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

  // Countdown effect for warnings (pause when tab is hidden)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const isVisible = () => typeof document !== 'undefined' && document.visibilityState === 'visible';
    
    if (showIdleWarning && idleTimeRemaining > 0) {
      interval = setInterval(() => {
        setIdleTimeRemaining(prev => {
          if (!isVisible()) return prev; // pause countdown while hidden
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
          if (!isVisible()) return prev; // pause countdown while hidden
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

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      
      // Simple logic: when tab becomes visible, just continue with any existing modal
      // No complex deferred logic that might cause issues
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

    // Activity events to monitor (enhanced for mobile)
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'touchmove',
      'touchend',
      'click',
      'focus',
      'blur'
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

  // Memoized warning components to prevent unnecessary re-renders
  const IdleWarningComponent = useMemo(() => (
    <SessionTimeoutWarning
      open={showIdleWarning}
      timeRemaining={idleTimeRemaining}
      onExtendSession={handleExtendSession}
      onSignOut={handleSignOutFromWarning}
    />
  ), [showIdleWarning, idleTimeRemaining, handleExtendSession, handleSignOutFromWarning]);

  const AbsoluteWarningComponent = useMemo(() => (
    <SessionTimeoutWarning
      open={showAbsoluteWarning}
      timeRemaining={absoluteTimeRemaining}
      onExtendSession={handleExtendSession}
      onSignOut={handleSignOutFromWarning}
    />
  ), [showAbsoluteWarning, absoluteTimeRemaining, handleExtendSession, handleSignOutFromWarning]);

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
    // Memoized warning components
    IdleWarningComponent,
    AbsoluteWarningComponent
  };
};