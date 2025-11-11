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
      // Generate static map URL (using OpenStreetMap or similar)
      const lat = otherSession.location_lat;
      const lng = otherSession.location_lng;
      // Using OpenStreetMap static map (free alternative)
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
      setMapUrl(mapUrl);
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
    const parts = [];
    if (otherSession.device_name) parts.push(otherSession.device_name);
    if (otherSession.browser) parts.push(otherSession.browser);
    if (otherSession.os) parts.push(`(${otherSession.os})`);
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
      <AlertDialogContent className="sm:max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle>Multiple Login Session Detected</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left mt-4 space-y-4">
            <p>
              We detected a new login from another device. For security, only one active session is allowed at a time.
            </p>

            {otherSession && (
              <div className="bg-muted rounded-lg p-4 space-y-3 border">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getDeviceIcon(otherSession.device_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{formatDevice()}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{formatLocation()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {formatTime(otherSession.last_activity_at)}
                    </p>
                  </div>
                </div>

                {/* Map display if location data available */}
                {otherSession.location_lat && otherSession.location_lng && (
                  <div className="mt-3 border rounded-lg overflow-hidden">
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Login location map"
                      className="w-full"
                    />
                    <div className="p-2 bg-muted/50 text-xs text-center text-muted-foreground">
                      Approximate location of the other login
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm font-medium mt-4">What would you like to do?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <X className="h-4 w-4 mr-2" />
            This wasn't me. Continue on this device
          </Button>
          <Button
            variant="outline"
            onClick={onContinueOtherDevice}
            className="w-full sm:w-auto order-2"
          >
            Continue on another device
          </Button>
          <Button
            variant="destructive"
            onClick={onLogoutEverywhere}
            className="w-full sm:w-auto order-1 sm:order-3"
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

