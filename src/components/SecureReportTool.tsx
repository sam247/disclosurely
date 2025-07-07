
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BrandedFormLayout from '@/components/BrandedFormLayout';
import DynamicSubmissionForm from '@/components/DynamicSubmissionForm';

const SecureReportTool = () => {
  const { linkToken } = useParams();
  const { toast } = useToast();
  const [linkData, setLinkData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (linkToken) {
      fetchLinkAndOrganizationData();
    }
  }, [linkToken]);

  const fetchLinkAndOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Fetch link data
      const { data: link, error: linkError } = await supabase
        .from('organization_links')
        .select('*, organizations(*)')
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError) {
        console.error('Link fetch error:', linkError);
        setError('Invalid or inactive submission link');
        return;
      }

      if (!link) {
        setError('Submission link not found');
        return;
      }

      // Check if link has expired
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        setError('This submission link has expired');
        return;
      }

      // Check usage limit
      if (link.usage_limit && link.usage_count >= link.usage_limit) {
        setError('This submission link has reached its usage limit');
        return;
      }

      setLinkData(link);
      setOrganizationData(link.organizations);
    } catch (error) {
      console.error('Error fetching link data:', error);
      setError('Failed to load submission form');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BrandedFormLayout
        title="Loading..."
        description="Please wait while we load the submission form"
        organizationName="Loading"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading submission form...</p>
        </div>
      </BrandedFormLayout>
    );
  }

  if (error) {
    return (
      <BrandedFormLayout
        title="Error"
        description="There was a problem loading the submission form"
        organizationName="Error"
      >
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Form</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </BrandedFormLayout>
    );
  }

  return (
    <BrandedFormLayout
      title="Submit Report Securely"
      description="Your submission will be encrypted and handled confidentially"
      organizationName={organizationData?.name}
      logoUrl={organizationData?.logo_url}
      brandColor={organizationData?.brand_color}
    >
      <DynamicSubmissionForm 
        linkToken={linkToken!}
        organizationId={linkData?.organization_id}
        linkData={linkData}
      />
    </BrandedFormLayout>
  );
};

export default SecureReportTool;
