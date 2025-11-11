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
  const idleCountdownIntervalRef = useRef<NodeJS.Timeout>();
  const absoluteCountdownIntervalRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const absoluteWarningShownRef = useRef(false);
  
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showAbsoluteWarning, setShowAbsoluteWarning] = useState(false);
  const [idleTimeRemaining, setIdleTimeRemaining] = useState(0);
  const [absoluteTimeRemaining, setAbsoluteTimeRemaining] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Clear all timers and intervals
  const clearAllTimers = useCallback(() => {
    try {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = undefined;
      }
      if (absoluteTimerRef.current) {
        clearTimeout(absoluteTimerRef.current);
        absoluteTimerRef.current = undefined;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = undefined;
      }
      if (idleCountdownIntervalRef.current) {
        clearInterval(idleCountdownIntervalRef.current);
        idleCountdownIntervalRef.current = undefined;
      }
      if (absoluteCountdownIntervalRef.current) {
        clearInterval(absoluteCountdownIntervalRef.current);
        absoluteCountdownIntervalRef.current = undefined;
      }
    } catch (error) {
      console.error('Error clearing timers:', error);
    }
  }, []);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    if (!user || !session) {
      return;
    }
    
    // Do not reset timers while a warning modal is visible
    if (showIdleWarning || showAbsoluteWarning) {
      return;
    }

    try {
      // Update last activity time
      lastActivityRef.current = Date.now();
      
      // Clear existing timers
      clearAllTimers();

      // Reset warning states
      setShowIdleWarning(false);
      setIdleTimeRemaining(0);
      warningShownRef.current = false;

      // Set new idle timer
      idleTimerRef.current = setTimeout(() => {
        setIdleTimeRemaining(60);
        setShowIdleWarning(true);
      }, IDLE_TIMEOUT);
      
      
    } catch (error) {
      console.error('Error resetting idle timer:', error);
    }
  }, [user, session, showIdleWarning, showAbsoluteWarning, clearAllTimers]);

  // Show warning before absolute timeout
  const showAbsoluteTimeoutWarning = useCallback(() => {
    if (absoluteWarningShownRef.current) return;
    
    try {
      absoluteWarningShownRef.current = true;
      setAbsoluteTimeRemaining(5 * 60); // 5 minutes in seconds
      setShowAbsoluteWarning(true);
      
    } catch (error) {
      console.error('Error showing absolute timeout warning:', error);
    }
  }, []);

  // Handle extend session
  const handleExtendSession = useCallback(() => {
    try {
      // Close modals first
      setShowIdleWarning(false);
      setShowAbsoluteWarning(false);
      setIdleTimeRemaining(0);
      setAbsoluteTimeRemaining(0);
      warningShownRef.current = false;
      absoluteWarningShownRef.current = false;

      // Clear all timers
      clearAllTimers();

      // Update last activity time
      lastActivityRef.current = Date.now();

      // Start fresh idle timer
      idleTimerRef.current = setTimeout(() => {
        setIdleTimeRemaining(60);
        setShowIdleWarning(true);
      }, IDLE_TIMEOUT);
      
      toast({
        title: "Session Extended",
        description: "Your session has been extended.",
      });
      
      
    } catch (error) {
      console.error('Error extending session:', error);
    }
  }, [toast, clearAllTimers]);

  // Handle sign out from warning
  const handleSignOutFromWarning = useCallback(() => {
    try {
      setShowIdleWarning(false);
      setShowAbsoluteWarning(false);
      clearAllTimers();
      signOut();
      
    } catch (error) {
      console.error('Error signing out from warning:', error);
    }
  }, [signOut, clearAllTimers]);

  // Set up absolute timeout
  const setupAbsoluteTimeout = useCallback(() => {
    if (!user || !session) return;

    try {
      // Clear existing absolute timer
      if (absoluteTimerRef.current) {
        clearTimeout(absoluteTimerRef.current);
      }

      // Reset session start time
      sessionStartRef.current = Date.now();
      absoluteWarningShownRef.current = false;

      // Show warning 5 minutes before absolute timeout
      const warningTime = ABSOLUTE_TIMEOUT - (5 * 60 * 1000);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(showAbsoluteTimeoutWarning, warningTime);

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
      
      
    } catch (error) {
      console.error('Error setting up absolute timeout:', error);
    }
  }, [user, session, signOut, toast, showAbsoluteTimeoutWarning, showAbsoluteWarning]);

  // Countdown effect for warnings (continues counting even when tab is hidden for regulatory compliance)
  useEffect(() => {
    // Clear any existing intervals first
    if (idleCountdownIntervalRef.current) {
      clearInterval(idleCountdownIntervalRef.current);
      idleCountdownIntervalRef.current = undefined;
    }
    if (absoluteCountdownIntervalRef.current) {
      clearInterval(absoluteCountdownIntervalRef.current);
      absoluteCountdownIntervalRef.current = undefined;
    }
    
    if (showIdleWarning && idleTimeRemaining > 0) {
      idleCountdownIntervalRef.current = setInterval(() => {
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
      absoluteCountdownIntervalRef.current = setInterval(() => {
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
      if (idleCountdownIntervalRef.current) {
        clearInterval(idleCountdownIntervalRef.current);
        idleCountdownIntervalRef.current = undefined;
      }
      if (absoluteCountdownIntervalRef.current) {
        clearInterval(absoluteCountdownIntervalRef.current);
        absoluteCountdownIntervalRef.current = undefined;
      }
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
      clearAllTimers();
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
      clearAllTimers();
    };
  }, [user, session, resetIdleTimer, setupAbsoluteTimeout, clearAllTimers]);

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
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, IDLE_TIMEOUT - elapsed);
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