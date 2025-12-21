
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { useCustomDomain } from '@/hooks/useCustomDomain';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from '../BrandedFormLayout';
import { useSecureForm } from '@/hooks/useSecureForm';
import { validateTrackingId } from '@/utils/inputValidation';
import { log, LogContext } from '@/utils/logger';

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

const SecureReportStatusLookup = () => {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();
  const { linkToken } = useParams();
  const { toast } = useToast();
  const { organizationData, fetchOrganizationByTrackingId, fetchOrganizationByLinkToken } = useOrganizationData();
  const { isSubmitting, secureSubmit } = useSecureForm();
  const { customDomain, organizationId, isCustomDomain, loading: domainLoading } = useCustomDomain();
  const [domainBranding, setDomainBranding] = useState<OrganizationBranding | null>(null);
  const [loadingBranding, setLoadingBranding] = useState(true);

  // Fetch organization branding from custom domain (like main form does)
  useEffect(() => {
    if (!domainLoading && isCustomDomain && organizationId) {
      fetchOrganizationBrandingFromDomain();
    } else if (!domainLoading) {
      setLoadingBranding(false);
    }
  }, [domainLoading, isCustomDomain, organizationId]);

  // Also fetch from linkToken if available
  useEffect(() => {
    if (linkToken) {
      // Pre-fetch organization data to avoid branding flash
      fetchOrganizationByLinkToken(linkToken);
    }
  }, [linkToken, fetchOrganizationByLinkToken]);

  // Also pre-fetch when component mounts to avoid flash
  useEffect(() => {
    if (linkToken && !organizationData) {
      fetchOrganizationByLinkToken(linkToken);
    }
  }, []);

  const fetchOrganizationBrandingFromDomain = async () => {
    if (!organizationId) {
      setLoadingBranding(false);
      return;
    }

    try {
      

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
        log.error(LogContext.FRONTEND, 'Organization link error in SecureReportStatusLookup', linkError instanceof Error ? linkError : new Error(String(linkError)));
        setLoadingBranding(false);
        return;
      }

      if (!linkInfo) {
        
        setLoadingBranding(false);
        return;
      }

      

      setDomainBranding({
        name: linkInfo.organizations.name,
        logo_url: linkInfo.organizations.logo_url,
        custom_logo_url: linkInfo.organizations.custom_logo_url,
        brand_color: linkInfo.organizations.brand_color
      });
    } catch (error) {
      log.error(LogContext.FRONTEND, 'Error fetching organization branding from domain', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingBranding(false);
    }
  };

  const validateInput = (data: { trackingId: string }) => {
    if (!validateTrackingId(data.trackingId)) {
      toast({
        title: "Invalid tracking ID",
        description: "Please enter a valid tracking ID (DIS-XXXXXXXX).",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const lookupReport = async (data: { trackingId: string }) => {
    

    // Use secure RPC to validate existence and get branding without exposing report data
    const { data: orgRows, error: orgError } = await supabase.rpc(
      'get_organization_by_tracking_id',
      { p_tracking_id: data.trackingId }
    );

    if (orgError) {
      log.error(LogContext.DATABASE, 'RPC error during status lookup', orgError instanceof Error ? orgError : new Error(String(orgError)), { trackingId });
      throw new Error('Unable to check status right now. Please try again.');
    }

    if (!orgRows || orgRows.length === 0) {
      log.warn(LogContext.FRONTEND, 'Report not found via RPC', { trackingId });
      throw new Error('Report not found. Please check your tracking ID and try again.');
    }

    const org = orgRows[0];

    // Pre-fetch organization data to avoid flash
    fetchOrganizationByTrackingId(data.trackingId);

    // Navigate to messaging with minimal org branding in state
    navigate(`/status/${data.trackingId}`, {
      state: {
        trackingId: data.trackingId,
        organizationData: org,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    secureSubmit(lookupReport, { trackingId: trackingId.replace(/\s+/g, '').trim() }, validateInput);
  };

  // Show loading if we're fetching branding from domain or linkToken
  if (loadingBranding || (linkToken && !organizationData)) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  // Priority: domainBranding > organizationData (from linkToken) > defaults
  // This ensures custom domain branding takes precedence
  const branding = domainBranding || organizationData;
  const logoUrl = branding?.custom_logo_url || branding?.logo_url || undefined;
  const brandColor = branding?.brand_color || '#2563eb';
  const organizationName = branding?.name || 'Organization';

  return (
    <BrandedFormLayout
      title="Check Report Status"
      description="Enter your tracking ID to view your report status and communicate securely."
      organizationName={organizationName}
      logoUrl={logoUrl}
      brandColor={brandColor}
      linkToken={linkToken}
    >
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
          <h1 className="text-2xl font-bold text-foreground">Check Report Status</h1>
          <p className="text-sm text-muted-foreground">
            Enter your tracking ID to view your report status and communicate securely
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input
                  id="trackingId"
                  type="text"
                  placeholder="DIS-XXXXXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="font-mono"
                  maxLength={12}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Use the tracking ID provided when you submitted your report
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
                style={{ backgroundColor: brandColor }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Need Help?</p>
                <p className="text-blue-800">
                  If you can't find your tracking ID, check the confirmation email or contact support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BrandedFormLayout>
  );
};

export default SecureReportStatusLookup;
