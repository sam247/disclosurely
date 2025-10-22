
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import BrandedFormLayout from '../BrandedFormLayout';
import SecureSubmissionForm from './SecureSubmissionForm';

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
        console.error('Link not found or error:', linkError);
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
        is_active: linkInfo.is_active
      });

      // Fetch subscription tier for the organization
      await fetchSubscriptionTier(linkInfo.organization_id);

    } catch (error) {
      console.error('Error fetching link data:', error);
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
      // Get organization admins from user_roles table
      const { data: orgAdminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('organization_id', organizationId)
        .eq('role', 'org_admin')
        .eq('is_active', true);

      if (rolesError) {
        console.error('Error fetching org admin roles:', rolesError);
        return null;
      }

      const adminUserIds = (orgAdminRoles || []).map(r => r.user_id);
      
      if (adminUserIds.length === 0) {
        return null;
      }

      const { data: orgAdmins, error: adminsError } = await supabase
        .from('profiles')
        .select('email')
        .in('id', adminUserIds)
        .eq('is_active', true);

      if (adminsError) {
        console.error('Failed to fetch org admins for subscription check:', adminsError);
        return;
      }

      const adminEmails = (orgAdmins || []).map(a => a.email).filter((e): e is string => Boolean(e));

      if (adminEmails.length > 0) {
        const { data: subs, error: subsError } = await supabase
          .from('subscribers')
          .select('email, subscribed, subscription_tier')
          .in('email', adminEmails);

        if (subsError) {
          console.error('Failed to fetch subscribers for org admins:', subsError);
          return;
        }

        const anyActive = subs?.some(s => s.subscribed) ?? false;
        const tierRaw = subs?.find(s => s.subscribed)?.subscription_tier ?? subs?.[0]?.subscription_tier ?? null;
        const normalizedTier = tierRaw === 'starter' ? 'basic' : tierRaw; // normalize historic values

        if (anyActive && normalizedTier) {
          setSubscriptionTier(normalizedTier as 'basic' | 'pro');
        }
      }
    } catch (error) {
      console.error('Error fetching subscription tier:', error);
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
    >
      <SecureSubmissionForm
        linkToken={linkToken!}
        linkData={linkData}
        brandColor={brandColor}
      />
    </BrandedFormLayout>
  );
};

export default SubmissionFormWrapper;
