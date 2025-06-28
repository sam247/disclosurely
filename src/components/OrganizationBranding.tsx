
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Palette, Upload, Crown } from 'lucide-react';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
}

const OrganizationBranding = () => {
  const { organization, refetch } = useOrganization();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    if (organization) {
      setLogoUrl(organization.custom_logo_url || '');
    }
  }, [organization]);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ custom_logo_url: logoUrl || null })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Branding updated",
        description: "Your organization branding has been saved successfully.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating branding",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isTier2 = subscriptionData.subscribed && subscriptionData.subscription_tier === 'tier2';

  if (checkingSubscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Organization Branding
        </CardTitle>
        <CardDescription>
          Customize how your organization appears on submission pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isTier2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">Premium Feature</span>
            </div>
            <p className="text-sm text-amber-700">
              Custom logo branding is available for Tier 2 subscribers. 
              Upgrade your subscription to customize your submission pages with your organization's logo.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://your-domain.com/logo.png"
              disabled={!isTier2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a direct URL to your logo image (PNG, JPG, or SVG recommended)
            </p>
          </div>

          {logoUrl && (
            <div>
              <Label>Preview</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                <img
                  src={logoUrl}
                  alt="Organization Logo"
                  className="h-12 max-w-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={loading || !isTier2}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Branding Settings'}
          </Button>
        </div>

        {!isTier2 && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Without custom branding, your submission pages will display your organization name:
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {organization?.name?.charAt(0) || 'O'}
                </span>
              </div>
              <span className="font-medium text-gray-900">{organization?.name}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrganizationBranding;
