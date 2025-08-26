
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationData } from '@/contexts/OrganizationContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import BrandedFormLayout from '../BrandedFormLayout';
import SubmissionForm from './SubmissionForm';

interface LinkData {
  id: string;
  name: string;
  description: string;
  usage_count: number;
  usage_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
}

const SubmissionFormWrapper = () => {
  const { linkToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationData, loading: orgLoading, error: orgError, fetchOrganizationByLinkToken } = useOrganizationData();
  
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (linkToken) {
      fetchLinkAndOrganization();
    } else {
      navigate('/404');
    }
  }, [linkToken]);

  const fetchLinkAndOrganization = async () => {
    if (!linkToken) return;

    try {
      // Fetch organization data
      await fetchOrganizationByLinkToken(linkToken);

      // Fetch link data separately (this is public data)
      const response = await fetch(`/api/links/${linkToken}`);
      if (!response.ok) {
        throw new Error('Link not found');
      }
      
      const linkInfo = await response.json();
      setLinkData(linkInfo);
    } catch (error) {
      console.error('Error fetching link data:', error);
      toast({
        title: "Link not found",
        description: "The submission link is invalid or has expired.",
        variant: "destructive",
      });
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission form...</p>
        </div>
      </div>
    );
  }

  if (!linkData || !organizationData || orgError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Not Available</h3>
            <p className="text-gray-600">
              {orgError || 'This submission form is no longer available.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoUrl = organizationData.custom_logo_url || organizationData.logo_url;
  const brandColor = organizationData.brand_color || '#2563eb';

  return (
    <BrandedFormLayout
      title={linkData.name}
      description={linkData.description || 'Submit your report securely and confidentially.'}
      organizationName={organizationData.name}
      logoUrl={logoUrl}
      brandColor={brandColor}
    >
      <SubmissionForm
        linkToken={linkToken!}
        linkData={linkData}
        organizationData={organizationData}
        brandColor={brandColor}
      />
    </BrandedFormLayout>
  );
};

export default SubmissionFormWrapper;
