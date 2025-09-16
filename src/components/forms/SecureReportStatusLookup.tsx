
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from '../BrandedFormLayout';
import { useSecureForm } from '@/hooks/useSecureForm';
import { validateTrackingId } from '@/utils/inputValidation';

const SecureReportStatusLookup = () => {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();
  const { linkToken } = useParams();
  const { toast } = useToast();
  const { organizationData, fetchOrganizationByTrackingId, fetchOrganizationByLinkToken } = useOrganizationData();
  const { isSubmitting, secureSubmit } = useSecureForm();

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
    console.log('Checking report status for tracking ID:', data.trackingId);

    // Use secure RPC to validate existence and get branding without exposing report data
    const { data: orgRows, error: orgError } = await supabase.rpc(
      'get_organization_by_tracking_id',
      { p_tracking_id: data.trackingId }
    );

    if (orgError) {
      console.error('RPC error during status lookup:', orgError);
      throw new Error('Unable to check status right now. Please try again.');
    }

    if (!orgRows || orgRows.length === 0) {
      console.error('Report not found via RPC');
      throw new Error('Report not found. Please check your tracking ID and try again.');
    }

    const org = orgRows[0];

    // Pre-fetch organization data to avoid flash
    fetchOrganizationByTrackingId(data.trackingId);

    // Navigate to messaging with minimal org branding in state
    navigate(`/secure/tool/messaging/${data.trackingId}`, {
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

  // Default branding if no organization data is available
  const logoUrl = organizationData?.custom_logo_url || organizationData?.logo_url;
  const brandColor = organizationData?.brand_color || '#2563eb';
  const organizationName = organizationData?.name || 'Organization';

  return (
    <BrandedFormLayout
      title="Check Report Status"
      description="Enter your tracking ID to view your report status and communicate securely."
      organizationName={organizationName}
      logoUrl={logoUrl}
      brandColor={brandColor}
    >
      <div className="space-y-6">
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
