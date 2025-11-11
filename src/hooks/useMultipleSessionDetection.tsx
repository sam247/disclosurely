import { useState, useEffect, useCallback } from 'react';
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

  // Track session on login
  const trackSession = useCallback(async () => {
    if (!user || !session) return;

    try {
      const response = await supabase.functions.invoke('track-session', {
        body: {
          action: 'create',
          sessionId: session.access_token, // Using access token as session identifier
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
    } catch (error) {
      console.error('Error tracking session:', error);
      // Don't block login if session tracking fails
    }
  }, [user, session]);

  // Update session activity periodically
  useEffect(() => {
    if (!user || !session) return;

    const updateActivity = async () => {
      try {
        const sessionId = `${user.id}_${session.access_token.substring(0, 20)}`;
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
  }, [user, session]);

  // Track session on mount if user is logged in
  useEffect(() => {
    if (user && session && !showModal) {
      trackSession();
    }
  }, [user, session, trackSession, showModal]);

  const handleDismiss = useCallback(() => {
    setShowModal(false);
    setOtherSession(null);
  }, []);

  const handleContinueHere = useCallback(async () => {
    if (!user || !session || isProcessing) return;

    setIsProcessing(true);
    try {
      const sessionId = `${user.id}_${session.access_token.substring(0, 20)}`;
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
  }, [user, session, isProcessing]);

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

