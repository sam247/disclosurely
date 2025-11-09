import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import BrandedFormLayout from '../BrandedFormLayout';
import ProgressiveSubmissionForm from './ProgressiveSubmissionForm';
import { resumeDraft } from '@/services/draftService';

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
  link_token: string;
  default_language?: string;
  available_languages?: string[] | null;
}

const CleanSubmissionWrapper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customDomain, organizationId, isCustomDomain, loading: domainLoading } = useCustomDomain();
  const [searchParams] = useSearchParams();
  const draftCode = searchParams.get('draft');

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftData, setDraftData] = useState<any>(null);

  useEffect(() => {
    console.log('CleanSubmissionWrapper: Domain detection:', {
      domainLoading,
      isCustomDomain,
      organizationId,
      customDomain,
      currentHost: window.location.hostname
    });

    if (!domainLoading) {
      if (isCustomDomain && organizationId) {
        console.log('✅ Custom domain detected, fetching link data...');
        fetchOrgLinkData();
      } else {
        // Not on a custom domain
        console.log('❌ Custom domain NOT detected:', { isCustomDomain, organizationId });
        setLoading(false);
        toast({
          title: "Access via custom domain",
          description: "This reporting portal can only be accessed via your organization's custom domain.",
          variant: "destructive",
        });
      }
    }
  }, [domainLoading, isCustomDomain, organizationId]);

  const fetchOrgLinkData = async () => {
    if (!organizationId) {
      navigate('/404');
      return;
    }

    try {
      // Fetch the primary (first/default) link for this organization
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
          link_token,
          default_language,
          available_languages,
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (linkError || !linkInfo) {
        console.error('Link not found or error:', linkError);
        toast({
          title: "Reporting portal not configured",
          description: "This organization hasn't set up their reporting portal yet.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validation checks
      if (linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()) {
        toast({
          title: "Portal unavailable",
          description: "This reporting portal has expired.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (linkInfo.usage_limit && linkInfo.usage_count >= linkInfo.usage_limit) {
        toast({
          title: "Portal unavailable",
          description: "This reporting portal has reached its usage limit.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Parse available_languages if it's a string (JSONB)
      let availableLanguages = linkInfo.available_languages;
      if (availableLanguages && typeof availableLanguages === 'string') {
        try {
          availableLanguages = JSON.parse(availableLanguages);
        } catch (e) {
          console.error('Error parsing available_languages:', e);
          availableLanguages = null;
        }
      }

      // Transform to expected format
      const formattedLinkData: LinkData = {
        id: linkInfo.id,
        name: linkInfo.name,
        description: linkInfo.description,
        organization_id: linkInfo.organization_id,
        organization_name: linkInfo.organizations.name,
        organization_logo_url: linkInfo.organizations.logo_url,
        organization_custom_logo_url: linkInfo.organizations.custom_logo_url,
        organization_brand_color: linkInfo.organizations.brand_color,
        usage_count: linkInfo.usage_count,
        usage_limit: linkInfo.usage_limit,
        expires_at: linkInfo.expires_at,
        is_active: linkInfo.is_active,
        link_token: linkInfo.link_token,
        default_language: linkInfo.default_language,
        available_languages: availableLanguages as string[] | null
      };

      setLinkData(formattedLinkData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching organization link data:', error);
      toast({
        title: "Error",
        description: "Failed to load the reporting portal. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Load draft if draft code is provided
  useEffect(() => {
    if (draftCode && linkData) {
      loadDraft();
    }
  }, [draftCode, linkData]);

  const loadDraft = async () => {
    if (!draftCode) return;

    // Normalize draft code: trim, uppercase, remove spaces
    const normalizedCode = draftCode.trim().toUpperCase().replace(/\s+/g, '');
    console.log('Loading draft with normalized code:', normalizedCode);

    const response = await resumeDraft({ draftCode: normalizedCode });
    if (response.success) {
      setDraftData(response);
    } else {
      console.error('Failed to load draft:', response);
      toast({
        title: "Draft not found",
        description: response.message || "Unable to load draft. It may have expired.",
        variant: "destructive",
      });
    }
  };

  if (domainLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading reporting portal...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCustomDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Access via Custom Domain</h3>
                <p className="text-sm text-muted-foreground">
                  This reporting portal can only be accessed through your organization's custom domain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Portal Not Available</h3>
                <p className="text-sm text-muted-foreground">
                  This reporting portal is not configured or is currently unavailable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandColor = linkData.organization_brand_color || '#6366f1';

  return (
    <BrandedFormLayout
      title="Submit a Report"
      organizationName={linkData.organization_name}
      logoUrl={linkData.organization_custom_logo_url || linkData.organization_logo_url}
      brandColor={brandColor}
      description={linkData.description}
      linkToken={linkData.link_token}
    >
      <ProgressiveSubmissionForm
        linkToken={linkData.link_token}
        linkData={linkData}
        brandColor={brandColor}
        draftCode={draftCode || undefined}
        draftData={draftData}
        defaultLanguage={linkData.default_language}
        availableLanguages={linkData.available_languages}
      />
    </BrandedFormLayout>
  );
};

export default CleanSubmissionWrapper;
