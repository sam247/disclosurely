
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import BrandedFormLayout from '../BrandedFormLayout';
import ProgressiveSubmissionForm from './ProgressiveSubmissionForm';

interface LinkData {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  organization_name: string;
  organization_logo_url?: string;
  organization_custom_logo_url?: string;
  organization_brand_color?: string;
  usage_count: number;
  usage_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  default_language?: string;
  available_languages?: string[] | null;
}

const SubmissionFormWrapper = () => {
  const { linkToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'pro' | null>(null);

  useEffect(() => {
    if (linkToken) {
      fetchLinkData();
    } else {
      navigate('/404');
    }
  }, [linkToken]);

  const fetchLinkData = async () => {
    if (!linkToken) {
      navigate('/404');
      return;
    }

    try {
      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select(`
          id,
          name,
          description,
          organization_id,
          is_active,
          expires_at,
          usage_limit,
          usage_count,
          default_language,
          available_languages,
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkInfo) {
        toast({
          title: "Link not found",
          description: "The submission link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      // Validation checks
      if (linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()) {
        toast({
          title: "Link expired",
          description: "This submission link has expired.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      if (linkInfo.usage_limit && linkInfo.usage_count >= linkInfo.usage_limit) {
        toast({
          title: "Usage limit reached",
          description: "This submission link has reached its usage limit.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      // Parse available_languages if it's a string (JSONB)
      let availableLanguages = linkInfo.available_languages;
      if (availableLanguages && typeof availableLanguages === 'string') {
        try {
          availableLanguages = JSON.parse(availableLanguages);
        } catch (e) {
          availableLanguages = null;
        }
      }

      setLinkData({
        id: linkInfo.id,
        name: linkInfo.name,
        description: linkInfo.description || '',
        organization_id: linkInfo.organization_id,
        organization_name: linkInfo.organizations.name,
        organization_logo_url: linkInfo.organizations.logo_url,
        organization_custom_logo_url: linkInfo.organizations.custom_logo_url,
        organization_brand_color: linkInfo.organizations.brand_color,
        usage_count: linkInfo.usage_count,
        usage_limit: linkInfo.usage_limit,
        expires_at: linkInfo.expires_at,
        is_active: linkInfo.is_active,
        default_language: linkInfo.default_language,
        available_languages: availableLanguages as string[] | null
      });

      // Fetch subscription tier for the organization
      await fetchSubscriptionTier(linkInfo.organization_id);
      
      // Check subscription status and block if expired
      await checkSubscriptionStatus(linkInfo.organization_id);

    } catch (error) {
      toast({
        title: "Error loading form",
        description: "There was a problem loading the submission form.",
        variant: "destructive",
      });
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionTier = async (organizationId: string) => {
    try {
      // Query subscription directly by organization_id
      const { data: subscription, error: subsError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (subsError || !subscription) {
        return;
      }

      if (subscription.subscribed) {
        const normalizedTier = subscription.subscription_tier === 'starter' ? 'basic' : subscription.subscription_tier;
        if (normalizedTier) {
          setSubscriptionTier(normalizedTier as 'basic' | 'pro');
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const checkSubscriptionStatus = async (organizationId: string) => {
    try {
      // Query subscription directly by organization_id
      const { data: subscription, error: subsError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, subscription_status, grace_period_ends_at')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (subsError || !subscription) {
        // No subscription found - allow submission (might be free tier or new org)
        return;
      }

      // Check if subscription is active
      if (!subscription.subscribed) {
        toast({
          title: "Subscription Expired",
          description: "This organization's subscription has expired. Report submissions are currently unavailable.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      // Check subscription_end and grace period
      const now = new Date();
      if (subscription.subscription_end) {
        const subscriptionEnd = new Date(subscription.subscription_end);
        if (subscriptionEnd < now) {
          // Check grace period
          if (subscription.grace_period_ends_at) {
            const gracePeriodEnds = new Date(subscription.grace_period_ends_at);
            if (gracePeriodEnds <= now) {
              toast({
                title: "Subscription Expired",
                description: "This organization's subscription has expired. Report submissions are currently unavailable.",
                variant: "destructive",
              });
              navigate('/404');
              return;
            }
          } else {
            toast({
              title: "Subscription Expired",
              description: "This organization's subscription has expired. Report submissions are currently unavailable.",
              variant: "destructive",
            });
            navigate('/404');
            return;
          }
        }
      }

      // Check subscription_status
      if (subscription.subscription_status === 'expired' || subscription.subscription_status === 'canceled') {
        // Check if in grace period
        if (subscription.grace_period_ends_at) {
          const gracePeriodEnds = new Date(subscription.grace_period_ends_at);
          if (gracePeriodEnds <= now) {
            toast({
              title: "Subscription Expired",
              description: "This organization's subscription has expired. Report submissions are currently unavailable.",
              variant: "destructive",
            });
            navigate('/404');
            return;
          }
        } else {
          toast({
            title: "Subscription Expired",
            description: "This organization's subscription has expired. Report submissions are currently unavailable.",
            variant: "destructive",
          });
          navigate('/404');
          return;
        }
      }
    } catch (error) {
      // Silent error handling - don't block form if check fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission form...</p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Not Available</h3>
            <p className="text-gray-600">This submission form is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoUrl = linkData.organization_custom_logo_url || linkData.organization_logo_url;
  const brandColor = linkData.organization_brand_color || '#2563eb';

  return (
    <BrandedFormLayout
      title={linkData.name}
      description={linkData.description || 'Submit your report securely and confidentially.'}
      organizationName={linkData.organization_name}
      logoUrl={logoUrl}
      brandColor={brandColor}
      subscriptionTier={subscriptionTier}
      linkToken={linkToken}
    >
      <ProgressiveSubmissionForm
        linkToken={linkToken!}
        linkData={linkData}
        brandColor={brandColor}
        defaultLanguage={linkData.default_language}
        availableLanguages={linkData.available_languages}
      />
    </BrandedFormLayout>
  );
};

export default SubmissionFormWrapper;
