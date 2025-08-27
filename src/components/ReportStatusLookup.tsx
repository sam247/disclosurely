
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from './BrandedFormLayout';

const ReportStatusLookup = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationData, fetchOrganizationByTrackingId } = useOrganizationData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter your tracking ID to check report status.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Checking report status for tracking ID:', trackingId);
      
      // First, verify the report exists and get basic info
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('id, tracking_id, status, created_at, organization_id')
        .eq('tracking_id', trackingId.trim())
        .single();

      if (reportError || !reportData) {
        console.error('Report not found:', reportError);
        toast({
          title: "Report not found",
          description: "Please check your tracking ID and try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Report found:', reportData);
      
      // Fetch organization data for branding
      await fetchOrganizationByTrackingId(trackingId.trim());
      
      // Navigate to report status page with the tracking ID
      navigate(`/report/status/${trackingId.trim()}`);
      
    } catch (error) {
      console.error('Error checking report status:', error);
      toast({
        title: "Error",
        description: "There was a problem checking your report status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                  placeholder="WB-XXXXXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Use the tracking ID provided when you submitted your report
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !trackingId.trim()}
                style={{ backgroundColor: brandColor }}
              >
                {loading ? (
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

export default ReportStatusLookup;
