import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { resumeDraft } from '@/services/draftService';
import BrandedFormLayout from '@/components/BrandedFormLayout';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

export const ResumeDraft = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draftCode, setDraftCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { customDomain, organizationId, isCustomDomain, loading: domainLoading } = useCustomDomain();
  const [domainBranding, setDomainBranding] = useState<OrganizationBranding | null>(null);
  const [draftBranding, setDraftBranding] = useState<OrganizationBranding | null>(null);
  const [loadingBranding, setLoadingBranding] = useState(true);

  // Fetch organization branding from custom domain (like main form does)
  useEffect(() => {
    if (!domainLoading && isCustomDomain && organizationId) {
      fetchOrganizationBrandingFromDomain();
    } else if (!domainLoading) {
      setLoadingBranding(false);
    }
  }, [domainLoading, isCustomDomain, organizationId]);

  // Also fetch organization branding when draft code is entered
  useEffect(() => {
    if (draftCode && draftCode.length >= 12) {
      fetchOrganizationBrandingFromDraft();
    }
  }, [draftCode]);

  const fetchOrganizationBrandingFromDomain = async () => {
    if (!organizationId) {
      setLoadingBranding(false);
      return;
    }

    try {
      console.log('Fetching organization branding for custom domain:', customDomain);

      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select(`
          organization_id,
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
        .maybeSingle();

      if (linkError) {
        console.error('Organization link error:', linkError);
        setLoadingBranding(false);
        return;
      }

      if (!linkInfo) {
        console.log('No organization link found for custom domain');
        setLoadingBranding(false);
        return;
      }

      console.log('Organization branding found for custom domain:', linkInfo);

      setDomainBranding({
        name: linkInfo.organizations.name,
        logo_url: linkInfo.organizations.logo_url,
        custom_logo_url: linkInfo.organizations.custom_logo_url,
        brand_color: linkInfo.organizations.brand_color
      });
    } catch (error) {
      console.error('Error fetching organization branding from domain:', error);
    } finally {
      setLoadingBranding(false);
    }
  };

  const fetchOrganizationBrandingFromDraft = async () => {
    if (!draftCode) return;
    
    setLoadingBranding(true);
    try {
      // Fetch draft to get organization_id
      const { data: draftData, error: draftError } = await supabase
        .from('report_drafts')
        .select('organization_id')
        .eq('draft_code', draftCode.toUpperCase())
        .maybeSingle();

      if (draftError || !draftData) {
        setLoadingBranding(false);
        return;
      }

      // Fetch organization branding
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, logo_url, custom_logo_url, brand_color')
        .eq('id', draftData.organization_id)
        .maybeSingle();

      if (orgError || !orgData) {
        setLoadingBranding(false);
        return;
      }

      setDraftBranding({
        name: orgData.name,
        logo_url: orgData.logo_url,
        custom_logo_url: orgData.custom_logo_url,
        brand_color: orgData.brand_color
      });
    } catch (error) {
      console.error('Error fetching organization branding from draft:', error);
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleResume = async () => {
    setError('');
    setIsLoading(true);

    // Normalize draft code: trim, uppercase, remove spaces
    const normalizedCode = draftCode.trim().toUpperCase().replace(/\s+/g, '');
    
    console.log('Resuming draft with normalized code:', normalizedCode);

    const response = await resumeDraft({ draftCode: normalizedCode });
    setIsLoading(false);

    if (response.success) {
      // Navigate to form with draft data using normalized code
      navigate(`/report?draft=${normalizedCode}`);
    } else {
      console.error('Failed to resume draft:', response);
      setError(response.message || 'Failed to load draft');
    }
  };

  // Priority: domainBranding > draftBranding > defaults
  // This ensures custom domain branding takes precedence
  const branding = domainBranding || draftBranding;
  const brandColor = branding?.brand_color || '#2563eb';
  const logoUrl = branding?.custom_logo_url || branding?.logo_url;

  const content = (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/report')}
          className="gap-2 h-11 sm:h-10 px-3 sm:px-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Resume Draft</h1>
        <p className="text-sm text-muted-foreground">
          Enter your draft code to continue your report
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="draft-code">Draft Code</Label>
              <Input
                id="draft-code"
                placeholder="DR-A7K9-M3P2-X8Q5"
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              onClick={handleResume}
              disabled={!draftCode || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: brandColor }}
            >
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  Resume Draft
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/report')}
                className="text-sm"
              >
                Start a new report instead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Need Help?</p>
              <p className="text-blue-800">
                If you can't find your draft code, check your email or contact support. Drafts expire after 48 hours for security reasons.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Show loading if we're fetching branding from domain
  if (loadingBranding) {
    return (
      <BrandedFormLayout
        title="Loading..."
        organizationName="Loading"
        brandColor="#2563eb"
        description="Loading..."
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </BrandedFormLayout>
    );
  }

  // Always use BrandedFormLayout for consistent header
  return (
    <BrandedFormLayout
      title="Resume Draft"
      organizationName={branding?.name || 'Disclosurely'}
      logoUrl={logoUrl}
      brandColor={brandColor}
      description="Enter your draft code to continue your report"
    >
      {content}
    </BrandedFormLayout>
  );
};

export default ResumeDraft;
