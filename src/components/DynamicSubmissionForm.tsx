
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Search } from 'lucide-react';
import { encryptReport } from '@/utils/encryption';
import BrandedFormLayout from './BrandedFormLayout';
import FileUpload from './FileUpload';
import { uploadReportFile } from '@/utils/fileUpload';
import ReportTypeSelector from './forms/ReportTypeSelector';
import ReportDetailsForm from './forms/ReportDetailsForm';
import ErrorBoundary from './forms/ErrorBoundary';

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
}

const DynamicSubmissionForm = () => {
  const { linkToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    submitter_email: '',
    priority: 3
  });

  useEffect(() => {
    fetchLinkData();
  }, [linkToken]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const fetchLinkData = async () => {
    if (!linkToken) {
      navigate('/404');
      return;
    }

    try {
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
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkInfo) {
        console.error('Link not found or error:', linkError);
        toast({
          title: "Link not found",
          description: "The submission link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      // Validation checks
      if (linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()) {
        toast({
          title: "Link expired",
          description: "This submission link has expired.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      if (linkInfo.usage_limit && linkInfo.usage_count >= linkInfo.usage_limit) {
        toast({
          title: "Usage limit reached",
          description: "This submission link has reached its usage limit.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      setLinkData({
        id: linkInfo.id,
        name: linkInfo.name,
        description: linkInfo.description || '',
        organization_id: linkInfo.organization_id,
        organization_name: linkInfo.organizations.name,
        organization_logo_url: linkInfo.organizations.logo_url,
        organization_custom_logo_url: linkInfo.organizations.custom_logo_url,
        organization_brand_color: linkInfo.organizations.brand_color,
        usage_count: linkInfo.usage_count,
        usage_limit: linkInfo.usage_limit,
        expires_at: linkInfo.expires_at,
        is_active: linkInfo.is_active
      });

    } catch (error) {
      console.error('Error fetching link data:', error);
      toast({
        title: "Error loading form",
        description: "There was a problem loading the submission form.",
        variant: "destructive",
      });
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = () => {
    return linkData?.organization_custom_logo_url || linkData?.organization_logo_url;
  };

  const getBrandColor = () => {
    return linkData?.organization_brand_color || '#2563eb';
  };

  const generateTrackingId = () => {
    return 'WB-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const getFinalCategory = () => {
    if (formData.category === "Other (Please Specify)" && formData.customCategory.trim()) {
      return formData.customCategory.trim();
    }
    return formData.category;
  };

  const validateForm = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.category === "Other (Please Specify)" && !formData.customCategory.trim()) {
      toast({
        title: "Category specification required",
        description: "Please specify the category.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData) return;

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const trackingId = generateTrackingId();
      const finalCategory = getFinalCategory();
      
      const reportContent = {
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        submission_method: 'web_form'
      };

      const { encryptedData, keyHash } = encryptReport(reportContent, linkData.organization_id);

      console.log('=== TARGETED RLS DEBUGGING ===');
      
      // Step 1: Get the exact link data we'll use for insertion
      const { data: linkForInsertion, error: linkError } = await supabase
        .from('organization_links')
        .select('id, organization_id, is_active, expires_at, usage_count, usage_limit')
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkForInsertion) {
        console.error('Cannot get link for insertion:', linkError);
        toast({
          title: "Link verification failed",
          description: "Unable to verify submission link.",
          variant: "destructive",
        });
        return;
      }

      console.log('Link for insertion:', linkForInsertion);

      // Step 2: Test each part of the RLS policy condition manually
      console.log('=== TESTING EACH RLS CONDITION ===');
      
      // Test basic link existence and activity
      const { data: linkExists } = await supabase
        .from('organization_links')
        .select('id, is_active')
        .eq('id', linkForInsertion.id)
        .single();
      console.log('Link exists and active check:', linkExists);

      // Test expiration condition
      const now = new Date().toISOString();
      const expirationTest = !linkForInsertion.expires_at || linkForInsertion.expires_at > now;
      console.log('Expiration test:', {
        expires_at: linkForInsertion.expires_at,
        now: now,
        passes: expirationTest
      });

      // Test usage limit condition  
      const usageTest = !linkForInsertion.usage_limit || linkForInsertion.usage_count < linkForInsertion.usage_limit;
      console.log('Usage limit test:', {
        usage_limit: linkForInsertion.usage_limit,
        usage_count: linkForInsertion.usage_count,
        passes: usageTest
      });

      // Step 3: Test the exact RLS subquery manually
      const { data: rlsSubqueryTest, error: rlsError } = await supabase
        .from('organization_links')
        .select('id')
        .eq('id', linkForInsertion.id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .or(`usage_limit.is.null,usage_count.lt.${linkForInsertion.usage_limit || 999999}`);

      console.log('RLS subquery simulation:', rlsSubqueryTest);
      console.log('RLS subquery error:', rlsError);

      // Step 4: Prepare the exact payload we're trying to insert
      const reportPayload = {
        organization_id: linkForInsertion.organization_id,
        tracking_id: trackingId,
        title: formData.title,
        encrypted_content: encryptedData,
        encryption_key_hash: keyHash,
        report_type: isAnonymous ? 'anonymous' as const : 'confidential' as const,
        submitted_by_email: isAnonymous ? null : formData.submitter_email || null,
        submitted_via_link_id: linkForInsertion.id,
        status: 'new' as const,
        priority: formData.priority,
        tags: [finalCategory]
      };

      console.log('=== INSERTION ATTEMPT ===');
      console.log('Final payload:', reportPayload);
      console.log('submitted_via_link_id is NOT NULL:', reportPayload.submitted_via_link_id !== null);
      
      // Step 5: Attempt the insertion
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert(reportPayload)
        .select();

      if (reportError) {
        console.error('=== INSERTION FAILED ===');
        console.error('Error code:', reportError.code);
        console.error('Error message:', reportError.message);
        console.error('Error details:', reportError.details);
        console.error('Error hint:', reportError.hint);
        
        // If RLS is the issue, let's try to understand why
        if (reportError.code === '42501') {
          console.error('RLS POLICY VIOLATION - The policy check failed');
          console.error('This means the EXISTS clause in Allow_anonymous_link_submissions returned false');
          console.error('Even though our manual tests passed, the policy subquery failed');
          
          // Try a direct policy test
          const { data: directPolicyTest } = await supabase
            .from('organization_links')  
            .select('id')
            .eq('id', linkForInsertion.id)
            .eq('is_active', true);
            
          console.log('Direct policy test (just id and is_active):', directPolicyTest);
        }
        
        toast({
          title: "Submission failed",
          description: `RLS Policy Error: ${reportError.message}. Check console for detailed analysis.`,
          variant: "destructive",
        });
        return;
      }

      console.log('SUCCESS! Report created:', reportData);
      const report = reportData?.[0];

      // Upload attached files if any
      if (attachedFiles.length > 0 && report) {
        const uploadPromises = attachedFiles.map(file => 
          uploadReportFile(file, trackingId, report.id)
        );

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(result => !result.success);

        if (failedUploads.length > 0) {
          toast({
            title: "Report submitted",
            description: `Report submitted successfully, but ${failedUploads.length} file(s) failed to upload.`,
            variant: "destructive",
          });
        }
      }

      // Navigate to success page
      navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);

    } catch (error: any) {
      console.error('=== SUBMISSION CATCH BLOCK ===');
      console.error('Caught error:', error);
      
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission form...</p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Not Available</h3>
            <p className="text-gray-600">This submission form is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoUrl = getLogoUrl();
  const brandColor = getBrandColor();

  return (
    <ErrorBoundary>
      <BrandedFormLayout
        title={linkData.name}
        description={linkData.description || 'Submit your report securely and confidentially.'}
        organizationName={linkData.organization_name}
        logoUrl={logoUrl}
        brandColor={brandColor}
      >
        <div className="space-y-6">
          {/* Check Status Button */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Search className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Already submitted a report?</p>
                    <p className="text-blue-800">
                      Check the status of your existing report using your tracking ID.
                    </p>
                  </div>
                </div>
                <Link to={`/secure/tool/submit/${linkToken}/status`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ReportTypeSelector
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
              submitterEmail={formData.submitter_email}
              setSubmitterEmail={(email) => updateFormData({ submitter_email: email })}
            />

            <ReportDetailsForm
              formData={formData}
              updateFormData={updateFormData}
            />

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Supporting Evidence</Label>
              <FileUpload
                onFilesChange={setAttachedFiles}
                maxFiles={5}
                maxSize={10}
                disabled={submitting}
              />
            </div>

            {/* Security Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Your Privacy is Protected</p>
                    <p className="text-blue-800">
                      All information is encrypted and stored securely. {isAnonymous ? 'This anonymous report cannot be traced back to you.' : 'Your identity will be kept confidential.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </div>
      </BrandedFormLayout>
    </ErrorBoundary>
  );
};

export default DynamicSubmissionForm;
