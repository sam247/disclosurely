
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Shield, Clock, MessageSquare, Home } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
  domain?: string;
}

const ReportSuccess = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState<string>('');
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(null);
  const [organizationLinkToken, setOrganizationLinkToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('trackingId');
    if (id) {
      setTrackingId(id);
      fetchOrganizationBranding(id);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrganizationBranding = async (trackingId: string) => {
    try {
      // Find the report by tracking ID to get the organization
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select(`
          organization_id,
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color,
            domain
          )
        `)
        .eq('tracking_id', trackingId)
        .single();

      if (reportError || !report) {
        console.error('Report not found:', reportError);
        setLoading(false);
        return;
      }

      // Get the organization's link token for status checking
      const { data: linkData, error: linkError } = await supabase
        .from('organization_links')
        .select('link_token')
        .eq('organization_id', report.organization_id)
        .eq('is_active', true)
        .single();

      if (linkError) {
        console.error('Organization link not found:', linkError);
      }

      setOrganizationBranding({
        name: report.organizations.name,
        logo_url: report.organizations.logo_url,
        custom_logo_url: report.organizations.custom_logo_url,
        brand_color: report.organizations.brand_color,
        domain: report.organizations.domain
      });

      if (linkData?.link_token) {
        setOrganizationLinkToken(linkData.link_token);
      }
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success('Tracking ID copied to clipboard!');
  };

  const getLogoUrl = () => {
    return organizationBranding?.custom_logo_url || organizationBranding?.logo_url;
  };

  const getBrandColor = () => {
    return organizationBranding?.brand_color || '#2563eb';
  };

  const getOrganizationName = () => {
    return organizationBranding?.name || 'Disclosurely';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!trackingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No tracking information found.</p>
            <Link to="/">
              <Button className="mt-4">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoUrl = getLogoUrl();
  const brandColor = getBrandColor();
  const organizationName = getOrganizationName();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Organization Branding */}
      <header className="bg-white shadow-sm border-t-4 w-full" style={{ borderTopColor: brandColor }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center justify-center mr-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={`${organizationName} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}
                  style={{ backgroundColor: brandColor }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organizationName}</h1>
                <p className="text-sm text-gray-600">Secure Report Submission</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Report Submitted Successfully</CardTitle>
              <CardDescription className="text-green-700">
                Your report has been securely encrypted and submitted. Thank you for your courage in speaking up.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Security Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" style={{ color: brandColor }} />
                <span>Your Information is Protected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Your report is completely anonymous and cannot be traced back to you.
              </p>

              {/* Tracking ID */}
              <div className="p-4 rounded-lg border" style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}40` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: brandColor }}>Your Tracking ID</p>
                    <p className="text-2xl font-mono font-bold" style={{ color: brandColor }}>{trackingId}</p>
                    <p className="text-sm mt-1" style={{ color: `${brandColor}CC` }}>Save this ID to check your report status</p>
                  </div>
                  <Button onClick={copyTrackingId} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                  <span className="text-sm font-bold" style={{ color: brandColor }}>1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Your report will be reviewed</h4>
                  <p className="text-sm text-gray-600">The appropriate team will review your report within 2-3 business days.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                  <span className="text-sm font-bold" style={{ color: brandColor }}>2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">You can check status anytime</h4>
                  <p className="text-sm text-gray-600">Use your tracking ID to check the status of your report.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                  <span className="text-sm font-bold" style={{ color: brandColor }}>3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Secure communication</h4>
                  <p className="text-sm text-gray-600">The organization may reach out with questions through secure messaging.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {organizationLinkToken ? (
              <Link to={`/secure/tool/submit/${organizationLinkToken}/status`} className="flex-1">
                <Button 
                  className="w-full hover:opacity-90" 
                  size="lg"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Check Messages & Status
                </Button>
              </Link>
            ) : (
              <Link to="/secure/tool/status" className="flex-1">
                <Button 
                  className="w-full hover:opacity-90" 
                  size="lg"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Check Messages & Status
                </Button>
              </Link>
            )}
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="h-5 w-5 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccess;
