import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  open: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onSignOut: () => void;
}

const SessionTimeoutWarning = ({ 
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
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left mt-4">
            Your session will expire in <strong>{formatTimeRemaining(timeRemaining)}</strong> due to inactivity.
            Would you like to extend your session or sign out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onSignOut} className="w-full sm:w-auto">
            Sign Out
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onExtendSession}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutWarning;