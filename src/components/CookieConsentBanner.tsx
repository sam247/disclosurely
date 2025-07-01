
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkConsentStatus();
  }, [user]);

  const checkConsentStatus = async () => {
    // Check localStorage first for immediate response
    const localConsent = localStorage.getItem('cookie-consent');
    if (localConsent) {
      try {
        const consent = JSON.parse(localConsent);
        if (consent.timestamp && Date.now() - consent.timestamp < 365 * 24 * 60 * 60 * 1000) {
          setPreferences(consent.preferences);
          return;
        }
      } catch (error) {
        console.error('Error parsing local consent:', error);
      }
    }

    // Show banner if no valid consent found
    setShowBanner(true);
  };

  const savePreferences = async (newPreferences: CookiePreferences) => {
    setLoading(true);
    try {
      // Always save to localStorage for immediate use
      localStorage.setItem('cookie-consent', JSON.stringify({
        preferences: newPreferences,
        timestamp: Date.now()
      }));

      setPreferences(newPreferences);
      setShowBanner(false);
      setShowSettings(false);

      toast({
        title: "Cookie preferences saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save cookie preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50 max-w-sm">
        <Card className="shadow-lg border-2">
          <CardContent className="p-4">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-start space-x-3 mb-4">
              <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Cookie Preferences</h3>
                <p className="text-xs text-gray-600 mt-1">
                  We use cookies to enhance your experience and analyze usage. Choose your preferences below.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Customize
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={acceptNecessary}
                  disabled={loading}
                  className="flex-1 text-xs"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  disabled={loading}
                  className="flex-1 text-xs"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Cookie Preferences</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Choose which cookies you'd like to accept. These preferences are stored without using tracking cookies.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label className="text-sm sm:text-base font-medium">Essential Cookies</Label>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label className="text-sm sm:text-base font-medium">Analytics Cookies</Label>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Help us understand how visitors use our website anonymously.
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label className="text-sm sm:text-base font-medium">Marketing Cookies</Label>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Used to show you relevant content and advertisements.
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={() => savePreferences(preferences)}
                disabled={loading}
                className="text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;
