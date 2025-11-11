import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import MultipleSessionModal from '@/components/MultipleSessionModal';

interface SessionInfo {
  id: string;
  device_type: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  location_city: string | null;
  location_country: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  last_activity_at: string;
}

export const useMultipleSessionDetection = () => {
  const { user, session, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [otherSession, setOtherSession] = useState<SessionInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTrackedSession, setHasTrackedSession] = useState(false);
  const [hasCheckedOnMount, setHasCheckedOnMount] = useState(false);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a stable session ID (based on user ID and timestamp of first login)
  const getSessionId = useCallback(() => {
    if (!user || !session) return null;
    
    // Use a combination that's stable for this login session
    // Store in sessionStorage to persist across page refreshes
    const storageKey = `session_id_${user.id}`;
    let storedSessionId = sessionStorage.getItem(storageKey);
    
    if (!storedSessionId) {
      // Create new session ID on first login
      storedSessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem(storageKey, storedSessionId);
    }
    
    return storedSessionId;
  }, [user, session]);

  // Check for other sessions
  const checkForOtherSessions = useCallback(async () => {
    if (!user || !session) return;

    // Don't check if modal was recently dismissed (cooldown period: 1 hour)
    if (dismissedAt && (Date.now() - dismissedAt) < 60 * 60 * 1000) {
      return false;
    }

    // Don't check if modal is already showing
    if (showModal) return false;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      const response = await supabase.functions.invoke('track-session', {
        body: {
          action: 'check_other_sessions',
          sessionId: sessionId,
          userId: user.id,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data?.hasOtherSessions && data.otherSessions) {
        setOtherSession(data.otherSessions);
        setShowModal(true);
        return true; // Other sessions found
      }
      
      return false; // No other sessions
    } catch (error) {
      console.error('Error checking for other sessions:', error);
      return false;
    }
  }, [user, session, getSessionId, dismissedAt, showModal]);

  // Track session on login
  const trackSession = useCallback(async () => {
    if (!user || !session) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    // Prevent duplicate tracking
    if (sessionIdRef.current === sessionId && hasTrackedSession) return;
    sessionIdRef.current = sessionId;

    try {
      const response = await supabase.functions.invoke('track-session', {
        body: {
          action: 'create',
          sessionId: sessionId,
          userId: user.id,
          userAgent: navigator.userAgent,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data?.hasOtherSessions && data.otherSessions) {
        setOtherSession(data.otherSessions);
        setShowModal(true);
      }
      
      setHasTrackedSession(true);
    } catch (error) {
      console.error('Error tracking session:', error);
      // Don't block login if session tracking fails
    }
  }, [user, session, hasTrackedSession, getSessionId]);

  // Update session activity periodically
  useEffect(() => {
    if (!user || !session) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    const updateActivity = async () => {
      try {
        await supabase.functions.invoke('track-session', {
          body: {
            action: 'update_activity',
            sessionId: sessionId,
            userId: user.id,
          },
        });
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    };

    // Update activity every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session, getSessionId]);

  // Track session on mount if user is logged in (only once per session)
  useEffect(() => {
    if (user && session && !hasTrackedSession) {
      // Delay to ensure session is fully established
      const timeoutId = setTimeout(() => {
        trackSession();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [user, session, trackSession, hasTrackedSession]);

  // Check for other sessions ONLY after session tracking is complete
  useEffect(() => {
    if (!user || !session) {
      // Clean up intervals when user logs out
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      setShowModal(false);
      setOtherSession(null);
      setHasCheckedOnMount(false);
      setDismissedAt(null);
      return;
    }

    // Only check for other sessions AFTER we've tracked the current session
    // This prevents false positives on page refresh
    if (!hasCheckedOnMount && hasTrackedSession) {
      // Delay check to ensure session is fully updated in database
      const timeoutId = setTimeout(() => {
        checkForOtherSessions();
        setHasCheckedOnMount(true);
      }, 2000); // Wait 2 seconds after session is tracked

      return () => clearTimeout(timeoutId);
    }

    // Check periodically (every 5 minutes) to catch new sessions - only if session is tracked
    if (hasTrackedSession && hasCheckedOnMount) {
      checkIntervalRef.current = setInterval(() => {
        checkForOtherSessions();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    }
  }, [user, session, checkForOtherSessions, hasCheckedOnMount, hasTrackedSession]);

  const handleDismiss = useCallback(() => {
    setShowModal(false);
    setOtherSession(null);
    setDismissedAt(Date.now()); // Record dismissal time for cooldown
  }, []);

  const handleContinueHere = useCallback(async () => {
    if (!user || !session || isProcessing) return;

    setIsProcessing(true);
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;
      
      // Deactivate other sessions
      await supabase.functions.invoke('track-session', {
        body: {
          action: 'deactivate_other',
          sessionId: sessionId,
          userId: user.id,
        },
      });

      setShowModal(false);
      setOtherSession(null);
    } catch (error) {
      console.error('Error deactivating other sessions:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user, session, isProcessing, getSessionId]);

  const handleContinueOtherDevice = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Log out current device
    await signOut();
  }, [signOut, isProcessing]);

  const handleLogoutEverywhere = useCallback(async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      // Deactivate all sessions
      await supabase.functions.invoke('track-session', {
        body: {
          action: 'deactivate_all',
          userId: user.id,
        },
      });

      // Then sign out
      await signOut();
    } catch (error) {
      console.error('Error logging out everywhere:', error);
      // Still sign out even if API call fails
      await signOut();
    } finally {
      setIsProcessing(false);
    }
  }, [user, signOut, isProcessing]);

  const ModalComponent = (
    <MultipleSessionModal
      open={showModal}
      otherSession={otherSession}
      onDismiss={handleDismiss}
      onContinueHere={handleContinueHere}
      onContinueOtherDevice={handleContinueOtherDevice}
      onLogoutEverywhere={handleLogoutEverywhere}
    />
  );

  return { ModalComponent };
};

