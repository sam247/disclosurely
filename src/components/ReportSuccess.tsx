
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from './BrandedFormLayout';

const ReportSuccess = () => {
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('trackingId');
  const { toast } = useToast();
  const { organizationData, loading, error, fetchOrganizationByTrackingId } = useOrganizationData();

  useEffect(() => {
    if (trackingId) {
      fetchOrganizationByTrackingId(trackingId);
    }
  }, [trackingId]);

  const copyTrackingId = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      toast({
        title: "Copied!",
        description: "Tracking ID copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Default branding if organization data fails to load
  const logoUrl = organizationData?.custom_logo_url || organizationData?.logo_url;
  const brandColor = organizationData?.brand_color || '#2563eb';
  const organizationName = organizationData?.name || 'Organization';

  return (
    <BrandedFormLayout
      title="Report Submitted Successfully"
      description="Your report has been received and will be reviewed by our team."
      organizationName={organizationName}
      logoUrl={logoUrl}
      brandColor={brandColor}
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
          </CardContent>
        </Card>
      </div>
    </BrandedFormLayout>
  );
};

export default ReportSuccess;
