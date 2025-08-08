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
      console.log('🔥🔥🔥 ULTIMATE DEBUGGING SESSION START 🔥🔥🔥');
      console.log('Timestamp:', new Date().toISOString());
      
      // 1. CAPTURE INITIAL STATE
      console.log('=== 1. INITIAL STATE CAPTURE ===');
      const initialSession = await supabase.auth.getSession();
      console.log('Initial session exists:', !!initialSession.data.session);
      console.log('Initial user email:', initialSession.data.session?.user?.email);
      console.log('Initial access token exists:', !!initialSession.data.session?.access_token);
      console.log('Initial session object keys:', initialSession.data.session ? Object.keys(initialSession.data.session) : 'null');
      
      // 2. TEST RLS POLICY CONDITIONS
      console.log('=== 2. RLS POLICY CONDITIONS TEST ===');
      const testPayload = {
        submitted_via_link_id: linkData.id,
        report_type: 'anonymous' as const,
        submitted_by_email: null
      };
      console.log('Test payload for RLS conditions:');
      console.log('  submitted_via_link_id IS NOT NULL:', testPayload.submitted_via_link_id !== null);
      console.log('  report_type = anonymous:', testPayload.report_type === 'anonymous');
      console.log('  submitted_by_email IS NULL:', testPayload.submitted_by_email === null);
      console.log('  Link ID value:', testPayload.submitted_via_link_id);
      console.log('  Link ID type:', typeof testPayload.submitted_via_link_id);
      
      // 3. VERIFY LINK EXISTS AND IS VALID
      console.log('=== 3. LINK VERIFICATION ===');
      const linkVerification = await supabase
        .from('organization_links')
        .select('id, is_active, organization_id, usage_limit, usage_count, expires_at')
        .eq('id', linkData.id)
        .single();
      
      console.log('Link verification result:', linkVerification);
      if (linkVerification.error) {
        console.error('Link verification failed:', linkVerification.error);
      } else {
        console.log('Link is valid and active:', linkVerification.data?.is_active);
        console.log('Link organization_id:', linkVerification.data?.organization_id);
      }
      
      // 4. CHECK CURRENT USER CONTEXT
      console.log('=== 4. USER CONTEXT CHECK ===');
      const currentUser = await supabase.auth.getUser();
      console.log('Current user result:', currentUser);
      console.log('User exists:', !!currentUser.data.user);
      console.log('User email:', currentUser.data.user?.email);
      
      // 5. FORCE SIGNOUT TO ENSURE ANONYMOUS CONTEXT
      console.log('=== 5. FORCING SIGNOUT FOR ANONYMOUS CONTEXT ===');
      if (initialSession.data.session) {
        console.log('Session detected, signing out...');
        const signOutResult = await supabase.auth.signOut();
        console.log('Signout result:', signOutResult);
        
        // Wait for signout to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 6. VERIFY NO SESSION EXISTS MULTIPLE TIMES
      console.log('=== 6. SESSION VERIFICATION (MULTIPLE CHECKS) ===');
      for (let i = 0; i < 5; i++) {
        const sessionCheck = await supabase.auth.getSession();
        console.log(`Session check ${i + 1}:`, {
          exists: !!sessionCheck.data.session,
          user: sessionCheck.data.session?.user?.email,
          accessToken: !!sessionCheck.data.session?.access_token
        });
        
        if (sessionCheck.data.session) {
          console.error(`CRITICAL: Session still exists on check ${i + 1}`);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // 7. CHECK SUPABASE CLIENT INTERNAL STATE
      console.log('=== 7. SUPABASE CLIENT INTERNAL STATE ===');
      console.log('Supabase client auth instance:', supabase.auth);
      console.log('Client ready:', !!supabase.auth);
      
      // 8. PREPARE SUBMISSION DATA
      console.log('=== 8. SUBMISSION DATA PREPARATION ===');
      const trackingId = generateTrackingId();
      const finalCategory = getFinalCategory();
      
      const reportContent = {
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        submission_method: 'web_form'
      };

      console.log('Report content to encrypt:', reportContent);
      
      const { encryptedData, keyHash } = encryptReport(reportContent, linkData.organization_id);
      console.log('Encryption completed successfully');
      console.log('Encrypted data length:', encryptedData.length);
      console.log('Key hash preview:', keyHash.substring(0, 16) + '...');

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

      console.log('=== 9. FINAL PAYLOAD VALIDATION ===');
      console.log('Complete payload:', JSON.stringify(reportPayload, null, 2));
      
      // Validate each RLS condition one more time
      console.log('RLS Condition 1 - submitted_via_link_id IS NOT NULL:');
      console.log('  Value:', reportPayload.submitted_via_link_id);
      console.log('  Is not null:', reportPayload.submitted_via_link_id !== null);
      console.log('  Type:', typeof reportPayload.submitted_via_link_id);
      
      console.log('RLS Condition 2 - report_type = anonymous:');
      console.log('  Value:', reportPayload.report_type);
      console.log('  Equals anonymous:', reportPayload.report_type === 'anonymous');
      console.log('  Type:', typeof reportPayload.report_type);
      
      console.log('RLS Condition 3 - submitted_by_email IS NULL:');
      console.log('  Value:', reportPayload.submitted_by_email);
      console.log('  Is null:', reportPayload.submitted_by_email === null);
      console.log('  Type:', typeof reportPayload.submitted_by_email);
      
      // 10. PERFORM A TEST QUERY FIRST
      console.log('=== 10. PRE-SUBMISSION TEST QUERY ===');
      try {
        const testQuery = await supabase
          .from('reports')
          .select('id')
          .limit(1);
        
        console.log('Test query result:', testQuery);
        console.log('Test query error:', testQuery.error);
        
        if (testQuery.error) {
          console.error('Pre-submission test query failed:', testQuery.error);
        }
      } catch (testError) {
        console.error('Test query exception:', testError);
      }
      
      // 11. CHECK ALL RLS POLICIES ON REPORTS TABLE
      console.log('=== 11. CHECKING ALL RLS POLICIES ===');
      try {
        const rlsCheck = await supabase
          .rpc('validate_organization_link', { link_id: linkData.id });
        
        console.log('RLS validation function result:', rlsCheck);
      } catch (rlsError) {
        console.log('RLS validation function not available or failed:', rlsError);
      }
      
      // 12. FINAL AUTH STATE BEFORE SUBMISSION
      console.log('=== 12. FINAL AUTH STATE BEFORE SUBMISSION ===');
      const finalAuthCheck = await supabase.auth.getSession();
      console.log('Final auth check:', {
        hasSession: !!finalAuthCheck.data.session,
        userEmail: finalAuthCheck.data.session?.user?.email,
        hasAccessToken: !!finalAuthCheck.data.session?.access_token
      });
      
      // 13. LOG THE EXACT REQUEST CONFIGURATION
      console.log('=== 13. REQUEST CONFIGURATION ANALYSIS ===');
      console.log('Supabase URL:', supabase.supabaseUrl);
      console.log('Supabase Key (first 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
      
      // 14. ATTEMPT THE SUBMISSION
      console.log('=== 14. EXECUTING SUBMISSION ===');
      console.log('About to call supabase.from(reports).insert()');
      console.log('Exact payload being sent:', reportPayload);
      
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert(reportPayload)
        .select();

      // 15. DETAILED ERROR ANALYSIS
      if (reportError) {
        console.error('=== 15. SUBMISSION FAILED - DETAILED ERROR ANALYSIS ===');
        console.error('Error object:', reportError);
        console.error('Error code:', reportError.code);
        console.error('Error message:', reportError.message);
        console.error('Error details:', reportError.details);
        console.error('Error hint:', reportError.hint);
        
        // Check auth state at time of error
        const errorAuthState = await supabase.auth.getSession();
        console.error('Auth state when error occurred:', {
          hasSession: !!errorAuthState.data.session,
          userEmail: errorAuthState.data.session?.user?.email,
          hasAccessToken: !!errorAuthState.data.session?.access_token
        });
        
        // Check if it's specifically an RLS error
        if (reportError.code === '42501' || reportError.message.includes('row-level security')) {
          console.error('🚨 CONFIRMED RLS POLICY VIOLATION');
          console.error('This means the RLS policy is not allowing the insert');
          console.error('Policy conditions that should be met:');
          console.error('1. submitted_via_link_id IS NOT NULL:', reportPayload.submitted_via_link_id !== null);
          console.error('2. report_type = anonymous:', reportPayload.report_type === 'anonymous');
          console.error('3. submitted_by_email IS NULL:', reportPayload.submitted_by_email === null);
          
          // Try to understand what's happening
          console.error('Possible issues:');
          console.error('- RLS policy syntax error');
          console.error('- Database trigger interfering');
          console.error('- Type mismatch in policy conditions');
          console.error('- Hidden authentication context');
        }
        
        throw new Error(`Submission failed: ${reportError.message}`);
      }

      console.log('=== 16. SUBMISSION SUCCESS ===');
      console.log('Report created successfully:', reportData?.[0]?.id);
      console.log('Full response data:', reportData);

      const report = reportData?.[0];

      // Handle file uploads if any
      if (attachedFiles.length > 0 && report) {
        console.log('=== 17. FILE UPLOAD PROCESS ===');
        const uploadPromises = attachedFiles.map(file => 
          uploadReportFile(file, trackingId, report.id)
        );

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(result => !result.success);

        if (failedUploads.length > 0) {
          console.warn('Some file uploads failed:', failedUploads);
          toast({
            title: "Report submitted",
            description: `Report submitted successfully, but ${failedUploads.length} file(s) failed to upload.`,
            variant: "destructive",
          });
        }
      }

      // Navigate to success page
      console.log('=== 18. NAVIGATION TO SUCCESS ===');
      navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);

    } catch (error: any) {
      console.error('=== 🚨 SUBMISSION EXCEPTION 🚨 ===');
      console.error('Exception type:', typeof error);
      console.error('Exception instanceof Error:', error instanceof Error);
      console.error('Exception message:', error?.message);
      console.error('Exception stack:', error?.stack);
      console.error('Full exception object:', error);
      
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      console.log('🔥🔥🔥 ULTIMATE DEBUGGING SESSION END 🔥🔥🔥');
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
