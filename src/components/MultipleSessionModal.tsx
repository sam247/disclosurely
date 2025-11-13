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
import { Shield, MapPin, Smartphone, Monitor, Tablet, LogOut } from 'lucide-react';
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
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md p-0 gap-0 overflow-hidden">
        {/* Header - Cleaner design */}
        <AlertDialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">Multiple Sessions Detected</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Only one active session is allowed. Choose which device to continue on.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Content - Simplified */}
        <div className="px-6 pb-6">
          {otherSession && (
            <div className="bg-muted/50 rounded-lg p-4 border space-y-3">
              {/* Device Info - Cleaner layout */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0 text-muted-foreground">
                  {getDeviceIcon(otherSession.device_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{formatDevice()}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatLocation()}</span>
                  </div>
                </div>
              </div>
              
              {/* Last active time */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Last active: <span className="font-medium text-foreground">{formatTime(otherSession.last_activity_at)}</span>
              </div>

              {/* Map - Only show if location data exists */}
              {otherSession.location_lat && otherSession.location_lng && (
                <div className="mt-3 border rounded-md overflow-hidden bg-background">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full bg-muted aspect-video"
                  >
                    <img
                      src={`https://staticmap.openstreetmap.de/staticmap.php?center=${otherSession.location_lat},${otherSession.location_lng}&zoom=12&size=400x300&markers=${otherSession.location_lat},${otherSession.location_lng},red-pushpin`}
                      alt="Login location"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Map unavailable</div>';
                        }
                      }}
                    />
                  </a>
                  <div className="px-3 py-2 bg-muted/50 text-xs text-center text-muted-foreground border-t">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                      View on map
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer - Cleaner button layout */}
        <AlertDialogFooter className="px-6 pb-6 pt-0 gap-3 flex-col sm:flex-row">
          <Button
            variant="default"
            onClick={onDismiss}
            className="w-full sm:flex-1 order-2 sm:order-1"
          >
            Continue on this device
          </Button>
          <Button
            variant="outline"
            onClick={onContinueOtherDevice}
            className="w-full sm:flex-1 order-3 sm:order-2"
          >
            Continue on other device
          </Button>
          <Button
            variant="ghost"
            onClick={onLogoutEverywhere}
            className="w-full sm:w-auto order-1 sm:order-3 text-destructive hover:text-destructive hover:bg-destructive/10"
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

