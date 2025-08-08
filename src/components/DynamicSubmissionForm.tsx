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
      console.log('=== ANONYMOUS SUBMISSION ATTEMPT ===');
      
      // Get the current auth headers before any changes
      const initialHeaders = await supabase.auth.getSession();
      console.log('=== INITIAL AUTH STATE ===');
      console.log('Initial session:', initialHeaders.data.session?.user?.email || 'none');
      console.log('Initial access_token exists:', !!initialHeaders.data.session?.access_token);
      
      // Store current session to potentially restore later (but we won't in anonymous case)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Force sign out and wait for it to complete
      if (currentSession) {
        console.log('=== SIGNING OUT FOR ANONYMOUS SUBMISSION ===');
        await supabase.auth.signOut();
        
        // Wait longer for the signout to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verify auth state multiple times to be absolutely sure
      for (let i = 0; i < 3; i++) {
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        console.log(`=== AUTH CHECK ${i + 1} ===`);
        console.log('Session exists:', !!checkSession);
        console.log('User:', checkSession?.user?.email || 'none');
        console.log('Access token exists:', !!checkSession?.access_token);
        
        if (checkSession) {
          console.error('CRITICAL: Session still exists after signout attempt');
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          console.log('SUCCESS: No session detected');
          break;
        }
      }

      // Final check - get the exact headers that will be sent
      const finalAuthState = await supabase.auth.getSession();
      console.log('=== FINAL AUTH STATE BEFORE REQUEST ===');
      console.log('Final session:', finalAuthState.data.session);
      console.log('Will send Authorization header:', !!finalAuthState.data.session?.access_token);

      const trackingId = generateTrackingId();
      const finalCategory = getFinalCategory();
      
      const reportContent = {
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        submission_method: 'web_form'
      };

      console.log('=== REPORT DATA ===');
      console.log('Tracking ID:', trackingId);
      console.log('Link ID:', linkData.id);
      console.log('Organization ID:', linkData.organization_id);
      console.log('Report type: anonymous');
      console.log('Submitted by email: null');

      const { encryptedData, keyHash } = encryptReport(reportContent, linkData.organization_id);

      const reportPayload = {
        organization_id: linkData.organization_id,
        tracking_id: trackingId,
        title: formData.title,
        encrypted_content: encryptedData,
        encryption_key_hash: keyHash,
        report_type: 'anonymous' as const,
        submitted_by_email: null,
        submitted_via_link_id: linkData.id,
        status: 'new' as const,
        priority: formData.priority,
        tags: [finalCategory]
      };

      console.log('=== PAYLOAD VALIDATION ===');
      console.log('submitted_via_link_id is not null:', reportPayload.submitted_via_link_id !== null);
      console.log('report_type is anonymous:', reportPayload.report_type === 'anonymous');
      console.log('submitted_by_email is null:', reportPayload.submitted_by_email === null);
      console.log('Full payload:', reportPayload);

      // Check the current RLS policy manually
      console.log('=== RLS POLICY CHECK ===');
      console.log('Policy should allow if:');
      console.log('1. submitted_via_link_id IS NOT NULL:', reportPayload.submitted_via_link_id !== null);
      console.log('2. report_type = anonymous:', reportPayload.report_type === 'anonymous'); 
      console.log('3. submitted_by_email IS NULL:', reportPayload.submitted_by_email === null);

      // Make the submission
      console.log('=== EXECUTING ANONYMOUS INSERT ===');
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert(reportPayload)
        .select();

      if (reportError) {
        console.error('=== SUBMISSION FAILED ===');
        console.error('Error code:', reportError.code);
        console.error('Error message:', reportError.message);
        console.error('Error details:', reportError.details);
        console.error('Error hint:', reportError.hint);
        
        // Let's also check what the current auth state is when the error occurs
        const errorAuthState = await supabase.auth.getSession();
        console.error('Auth state when error occurred:', {
          hasSession: !!errorAuthState.data.session,
          userEmail: errorAuthState.data.session?.user?.email,
          hasAccessToken: !!errorAuthState.data.session?.access_token
        });
        
        throw new Error(`Submission failed: ${reportError.message}`);
      }

      console.log('=== SUBMISSION SUCCESS ===');
      console.log('Report created:', reportData?.[0]?.id);

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
      console.error('=== SUBMISSION EXCEPTION ===');
      console.error('Exception:', error);
      
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
