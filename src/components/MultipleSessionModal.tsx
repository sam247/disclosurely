import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, Smartphone, Monitor, Tablet, LogOut } from 'lucide-react';

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

interface MultipleSessionModalProps {
  open: boolean;
  otherSession: SessionInfo | null;
  onDismiss: () => void;
  onContinueHere: () => void;
  onContinueOtherDevice: () => void;
  onLogoutEverywhere: () => void;
}

const MultipleSessionModal: React.FC<MultipleSessionModalProps> = ({
  open,
  otherSession,
  onDismiss,
  onContinueHere,
  onContinueOtherDevice,
  onLogoutEverywhere,
}) => {
  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatLocation = () => {
    if (!otherSession) return 'Unknown location';
    const parts = [];
    if (otherSession.location_city) parts.push(otherSession.location_city);
    if (otherSession.location_country) parts.push(otherSession.location_country);
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  };

  const formatDevice = () => {
    if (!otherSession) return 'Unknown device';
    if (otherSession.device_name) return otherSession.device_name;
    const parts = [];
    if (otherSession.browser) parts.push(otherSession.browser);
    if (otherSession.os) parts.push(otherSession.os);
    return parts.length > 0 ? parts.join(' ') : 'Unknown device';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-[calc(100vw-3rem)] sm:max-w-[480px] max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Scrollable content area - GUARANTEED to leave space for footer */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <AlertDialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <AlertDialogTitle className="text-sm sm:text-base leading-tight">
                  Multiple Sessions Detected
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs mt-1 sm:mt-1.5">
                  Only one active session is allowed. Choose which device to continue on.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {otherSession && (
            <div className="px-4 sm:px-6 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
              {/* Device Info Card */}
              <div className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-background border flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    {getDeviceIcon(otherSession.device_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm">{formatDevice()}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatLocation()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      Active: {formatTime(otherSession.last_activity_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map showing location */}
              {otherSession.location_lat && otherSession.location_lng && (
                <div className="rounded-lg border overflow-hidden bg-muted/30">
                  <iframe
                    width="100%"
                    height="160"
                    frameBorder="0"
                    style={{ border: 0, display: 'block' }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${otherSession.location_lng - 0.1},${otherSession.location_lat - 0.1},${otherSession.location_lng + 0.1},${otherSession.location_lat + 0.1}&layer=mapnik&marker=${otherSession.location_lat},${otherSession.location_lng}`}
                    title="Session location"
                  />
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-background border-t text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Approximate location</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed footer - ALWAYS visible, never scrolls */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-background/95 space-y-2">
          <Button
            variant="default"
            onClick={onDismiss}
            className="w-full h-9 text-xs sm:text-sm"
          >
            Continue on this device
          </Button>
          <Button
            variant="outline"
            onClick={onContinueOtherDevice}
            className="w-full h-9 text-xs sm:text-sm"
          >
            Continue on other device
          </Button>
          <Button
            variant="ghost"
            onClick={onLogoutEverywhere}
            className="w-full h-9 text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Log out everywhere
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MultipleSessionModal;
