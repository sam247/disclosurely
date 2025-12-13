
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from './BrandedFormLayout';
import { supabase } from '@/integrations/supabase/client';

const ReportSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get trackingId from location state (preferred) or URL params (fallback)
  const trackingId = (location.state as any)?.trackingId || searchParams.get('trackingId');
  const linkTokenFromUrl = searchParams.get('linkToken');
  const { toast } = useToast();
  const { organizationData, loading, error, fetchOrganizationByTrackingId } = useOrganizationData();
  const { customDomain, organizationId, isCustomDomain, loading: domainLoading } = useCustomDomain();
  const [linkToken, setLinkToken] = useState<string | null>(linkTokenFromUrl);
  const [domainBranding, setDomainBranding] = useState<any>(null);

  // Fetch organization branding from custom domain (like main form does)
  useEffect(() => {
    if (!domainLoading && isCustomDomain && organizationId) {
      fetchOrganizationBrandingFromDomain();
    }
  }, [domainLoading, isCustomDomain, organizationId]);

  const fetchOrganizationBrandingFromDomain = async () => {
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, logo_url, custom_logo_url, brand_color')
        .eq('id', organizationId)
        .single();

      if (!orgError && org) {
        setDomainBranding(org);
      }
    } catch (error) {
      console.error('Error fetching organization branding from domain:', error);
    }
  };

  useEffect(() => {
    if (trackingId) {
      fetchOrganizationByTrackingId(trackingId).catch((err) => {
        console.error('Error fetching organization:', err);
        // Don't throw - let the component render with error state
      });
      // Only fetch linkToken from the report if not provided in URL
      if (!linkTokenFromUrl) {
        fetchLinkTokenFromReport(trackingId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId, linkTokenFromUrl]);

  const fetchLinkTokenFromReport = async (trackingId: string) => {
    try {
      // First, get the report to find the organization_id
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('organization_id, submitted_via_link_id')
        .eq('tracking_id', trackingId)
        .maybeSingle();

      if (reportError || !report) {
        
        return;
      }

      // If the report has a submitted_via_link_id, get the link_token from that
      if (report.submitted_via_link_id) {
        const { data: link, error: linkError } = await supabase
          .from('organization_links')
          .select('link_token')
          .eq('id', report.submitted_via_link_id)
          .eq('is_active', true)
          .maybeSingle();

        if (!linkError && link) {
          setLinkToken(link.link_token);
          return;
        }
      }

      // Otherwise, get the first active link for this organization
      if (report.organization_id) {
        const { data: link, error: linkError } = await supabase
          .from('organization_links')
          .select('link_token')
          .eq('organization_id', report.organization_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!linkError && link) {
          setLinkToken(link.link_token);
        }
      }
    } catch (error) {
      console.error('Error fetching link token:', error);
    }
  };

  const copyTrackingId = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      toast({
        title: "Copied!",
        description: "Tracking ID copied to clipboard",
      });
    }
  };

  // Priority: domainBranding > organizationData (from tracking ID) > defaults
  // This ensures custom domain branding takes precedence
  // IMPORTANT: All hooks must be called before any conditional returns
  const finalBranding = useMemo(() => domainBranding || organizationData, [domainBranding, organizationData]);
  const logoUrl = finalBranding?.custom_logo_url || finalBranding?.logo_url;
  const brandColor = finalBranding?.brand_color || '#2563eb';
  const organizationName = finalBranding?.name || 'Organization';

  // Don't block rendering if we don't have a trackingId - show success message anyway
  if (!trackingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">No tracking ID provided</p>
        </div>
      </div>
    );
  }

  // Show loading only if we're actively fetching and don't have any data yet
  if ((loading || domainLoading) && !finalBranding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrandedFormLayout
      title="Report Submitted Successfully"
      description="Your report has been received and will be reviewed by our team."
      organizationName={organizationName}
      logoUrl={logoUrl}
      brandColor={brandColor}
      linkToken={linkToken || undefined}
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">Note</p>
                  <p className="text-yellow-800">
                    Your report was submitted successfully, but we couldn't load the organization branding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Report Submitted</h2>
            <p className="text-green-800 mb-6">
              Thank you for your submission. Your report has been securely received and assigned a tracking ID.
            </p>
            
            {trackingId && (
              <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Tracking ID:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                    {trackingId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTrackingId}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Save your tracking ID</strong> - you'll need it to check your report status.</p>
              <p>You will be contacted if additional information is needed.</p>
              <p>All communications will be handled securely and confidentially.</p>
            </div>

            <div className="mt-6 pt-6 border-t border-green-200">
              <Button
                variant="outline"
                onClick={() => navigate('/report')}
                className="flex items-center gap-2"
                style={{ borderColor: brandColor, color: brandColor }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BrandedFormLayout>
  );
};

export default ReportSuccess;
