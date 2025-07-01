
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Cookie, Settings } from 'lucide-react';

interface CookieConsentProps {
  organizationId: string;
}

const CookieConsent = ({ organizationId }: CookieConsentProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingConsent();
  }, [organizationId]);

  const checkExistingConsent = async () => {
    try {
      const { data, error } = await supabase
        .from('cookie_consents')
        .select('*')
        .eq('organization_id', organizationId)
        .gt('expires_at', new Date().toISOString())
        .order('consent_timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const existingConsent = data[0];
        setConsent({
          necessary: existingConsent.necessary_cookies,
          analytics: existingConsent.analytics_cookies,
          marketing: existingConsent.marketing_cookies,
        });
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error checking existing consent:', error);
      setShowBanner(true);
    }
  };

  const saveConsent = async (consentData: typeof consent) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cookie_consents')
        .insert({
          organization_id: organizationId,
          ip_address: null, // In a real app, you'd get this from the server
          user_agent: navigator.userAgent,
          consent_given: true,
          necessary_cookies: consentData.necessary,
          analytics_cookies: consentData.analytics,
          marketing_cookies: consentData.marketing,
        });

      if (error) throw error;

      setConsent(consentData);
      setShowBanner(false);
      setShowSettings(false);

      toast({
        title: "Preferences saved",
        description: "Your cookie preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message || "Failed to save cookie preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Cookie Preferences</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  You can customize your preferences or accept all cookies.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
                disabled={loading}
              >
                Necessary Only
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                disabled={loading}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you'd like to accept. You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Necessary Cookies</Label>
                  <p className="text-sm text-gray-500">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Analytics Cookies</Label>
                  <p className="text-sm text-gray-500">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Marketing Cookies</Label>
                  <p className="text-sm text-gray-500">
                    Used to track visitors and display relevant ads.
                  </p>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveConsent(consent)}
                disabled={loading}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
