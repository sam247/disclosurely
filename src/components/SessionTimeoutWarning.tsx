import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  open: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onSignOut: () => void;
}

const SessionTimeoutWarning = React.memo(({ 
  open, 
  timeRemaining, 
  onExtendSession, 
  onSignOut 
}: SessionTimeoutWarningProps) => {
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 60) return `${Math.max(0, seconds)} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-4 sm:mx-0">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-base sm:text-lg">
                Session Expiring Soon
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left mt-3 sm:mt-4 text-sm">
            Your session will expire in <strong className="text-foreground">{formatTimeRemaining(timeRemaining)}</strong> due to inactivity.
            Would you like to extend your session or sign out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel
            onClick={onSignOut}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Sign Out
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onExtendSession}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 order-1 sm:order-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

SessionTimeoutWarning.displayName = 'SessionTimeoutWarning';

export default SessionTimeoutWarning;