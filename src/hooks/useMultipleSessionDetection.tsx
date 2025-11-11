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
  const sessionIdRef = useRef<string | null>(null);

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

  // Track session on login
  const trackSession = useCallback(async () => {
    if (!user || !session || hasTrackedSession) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    // Prevent duplicate tracking
    if (sessionIdRef.current === sessionId) return;
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

  // Track session on mount if user is logged in (only once)
  useEffect(() => {
    if (user && session && !hasTrackedSession) {
      trackSession();
    }
  }, [user, session, trackSession, hasTrackedSession]);

  const handleDismiss = useCallback(() => {
    setShowModal(false);
    setOtherSession(null);
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

