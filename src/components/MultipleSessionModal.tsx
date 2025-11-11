import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, Smartphone, Monitor, Tablet, LogOut, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    if (otherSession?.location_lat && otherSession?.location_lng) {
      // Use OpenStreetMap static map image (more reliable than iframe)
      const lat = otherSession.location_lat;
      const lng = otherSession.location_lng;
      // Static map image from OpenStreetMap
      const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=12#map=12/${lat}/${lng}`;
      setMapUrl(mapUrl);
    } else {
      setMapUrl('');
    }
  }, [otherSession]);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      case 'desktop':
      default:
        return <Monitor className="h-5 w-5" />;
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
    // device_name already contains the formatted device info from the edge function
    if (otherSession.device_name) return otherSession.device_name;
    // Fallback to browser and OS if device_name is not available
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
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <AlertDialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-base sm:text-lg font-semibold">Multiple Login Session Detected</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <AlertDialogDescription className="text-left space-y-4">
            <p className="text-sm text-muted-foreground">
              We detected a login from another device. For security, only one active session is allowed at a time.
            </p>

            {otherSession && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4 border">
                {/* Device Info */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 text-muted-foreground">
                    {getDeviceIcon(otherSession.device_type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-medium text-sm">{formatDevice()}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{formatLocation()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last active: {formatTime(otherSession.last_activity_at)}
                    </p>
                  </div>
                </div>

                {/* Map display if location data available */}
                {otherSession.location_lat && otherSession.location_lng && (
                  <div className="mt-4 border rounded-lg overflow-hidden bg-background">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full bg-muted"
                      style={{ paddingBottom: '56.25%' }}
                    >
                      <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${otherSession.location_lat},${otherSession.location_lng}&zoom=12&size=600x400&markers=${otherSession.location_lat},${otherSession.location_lng},red-pushpin`}
                        alt="Login location"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if static map fails - show placeholder
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Map unavailable</div>';
                          }
                        }}
                      />
                    </a>
                    <div className="p-2 bg-muted/30 text-xs text-center text-muted-foreground border-t">
                      Approximate location • <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">View on map</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm font-medium pt-2">What would you like to do?</p>
          </AlertDialogDescription>
        </div>
        
        {/* Fixed footer */}
        <AlertDialogFooter className="flex-col gap-2 p-4 sm:p-6 pt-4 border-t flex-shrink-0 bg-muted/30">
          <Button
            variant="destructive"
            onClick={onLogoutEverywhere}
            className="w-full sm:w-auto text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out everywhere
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onContinueOtherDevice}
              className="w-full sm:w-auto text-sm"
            >
              Continue on another device
            </Button>
            <Button
              variant="outline"
              onClick={onDismiss}
              className="w-full sm:w-auto text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Continue on this device
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MultipleSessionModal;

