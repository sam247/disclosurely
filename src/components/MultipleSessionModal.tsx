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
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-background p-0">
        <div className="overflow-y-auto flex-1">
          <div className="p-6 pb-4">
            <AlertDialogHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
                <AlertDialogTitle className="text-lg sm:text-xl">Multiple Sessions Detected</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm sm:text-base">
                Only one active session is allowed. Choose which device to continue on.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {otherSession && (
              <div className="space-y-4">
                {/* Device Info Card */}
                <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-background border flex items-center justify-center flex-shrink-0 text-muted-foreground mt-0.5">
                      {getDeviceIcon(otherSession.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">{formatDevice()}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatLocation()}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                        Last active: <span className="font-medium text-foreground">{formatTime(otherSession.last_activity_at)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map showing location */}
                {otherSession.location_lat && otherSession.location_lng && (
                  <div className="rounded-lg border overflow-hidden bg-muted/30">
                    <iframe
                      width="100%"
                      height="200"
                      frameBorder="0"
                      style={{ border: 0 }}
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${otherSession.location_lat},${otherSession.location_lng}&zoom=10`}
                      allowFullScreen
                      loading="lazy"
                      className="w-full"
                    ></iframe>
                    <div className="px-3 py-2 bg-background/95 border-t text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>Approximate location of other session</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed footer with buttons */}
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end p-6 pt-4 border-t bg-background/95 backdrop-blur-sm">
          <Button
            variant="default"
            onClick={onDismiss}
            className="w-full sm:w-auto order-1"
          >
            Continue on this device
          </Button>
          <Button
            variant="outline"
            onClick={onContinueOtherDevice}
            className="w-full sm:w-auto order-2"
          >
            Continue on other device
          </Button>
          <Button
            variant="ghost"
            onClick={onLogoutEverywhere}
            className="w-full sm:w-auto order-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out everywhere
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MultipleSessionModal;
