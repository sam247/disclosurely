
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search } from 'lucide-react';
import { encryptReport } from '@/utils/encryption';
import FileUpload from '../FileUpload';
import { uploadReportFile } from '@/utils/fileUpload';
import ReportTypeSelector from './ReportTypeSelector';
import ReportDetailsForm from './ReportDetailsForm';
import ErrorBoundary from './ErrorBoundary';
import { useSecureForm } from '@/hooks/useSecureForm';
import { validateReportTitle, validateReportDescription } from '@/utils/inputValidation';

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

interface SecureSubmissionFormProps {
  linkToken: string;
  linkData: LinkData;
  brandColor: string;
}

const SecureSubmissionForm = ({ linkToken, linkData, brandColor }: SecureSubmissionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainCategory: '',
    subCategory: '',
    customCategory: '',
    submitter_email: '',
    priority: 3
  });

  const { isSubmitting, secureSubmit } = useSecureForm({
    rateLimitKey: `submission_${linkToken}`,
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000 // 10 minutes
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const generateTrackingId = () => {
    return 'DIS-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const getFinalCategory = () => {
    if (formData.subCategory === "Other (Please Specify)" && formData.customCategory.trim()) {
      return `${formData.mainCategory} - ${formData.customCategory.trim()}`;
    }
    if (formData.mainCategory && formData.subCategory) {
      return `${formData.mainCategory} - ${formData.subCategory}`;
    }
    return formData.mainCategory;
  };

  const validateForm = (data: any) => {
    console.log('🔵 Starting form validation...');
    console.log('🔵 Validation data:', data);
    
    if (!validateReportTitle(data.title)) {
      console.log('❌ Title validation failed:', data.title);
      toast({
        title: "Invalid title",
        description: "Title must be between 3 and 200 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateReportDescription(data.description)) {
      console.log('❌ Description validation failed:', data.description);
      toast({
        title: "Invalid description",
        description: "Description must be between 10 and 5000 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (!data.mainCategory) {
      console.log('❌ Main category validation failed:', data.mainCategory);
      toast({
        title: "Main category required",
        description: "Please select a main category.",
        variant: "destructive",
      });
      return false;
    }

    if (!data.subCategory) {
      console.log('❌ Sub category validation failed:', data.subCategory);
      toast({
        title: "Sub category required",
        description: "Please select a sub category.",
        variant: "destructive",
      });
      return false;
    }

    if (data.subCategory === "Other (Please Specify)" && !data.customCategory.trim()) {
      console.log('❌ Custom category validation failed:', data.customCategory);
      toast({
        title: "Category specification required",
        description: "Please specify the category.",
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ Form validation passed!');
    return true;
  };

  const submitReport = async (sanitizedData: any) => {
    console.log('Starting secure anonymous report submission...');
    
    const trackingId = generateTrackingId();
    const finalCategory = getFinalCategory();
    
    const reportContent = {
      title: sanitizedData.title,
      description: sanitizedData.description,
      category: finalCategory,
      submission_method: 'web_form'
    };

    console.log('Encrypting report content...');
    const { encryptedData, keyHash } = encryptReport(reportContent, linkData.organization_id);

    const reportPayload = {
      tracking_id: trackingId,
      title: sanitizedData.title,
      encrypted_content: encryptedData,
      encryption_key_hash: keyHash,
      report_type: 'anonymous' as const,
      submitted_by_email: null,
      status: 'new' as const,
      priority: sanitizedData.priority,
      tags: [finalCategory]
    };

    console.log('Submitting via edge function...');
    
    const { data, error } = await supabase.functions.invoke('submit-anonymous-report', {
      body: {
        reportData: reportPayload,
        linkToken: linkToken
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Submission failed: ${error.message}`);
    }

    if (!data.success) {
      console.error('Submission error:', data);
      throw new Error(data.error || 'Submission failed');
    }

    console.log('Report submitted successfully!', data.report);
    const report = data.report;

    // Handle file uploads if any
    if (attachedFiles.length > 0 && report) {
      console.log('Processing file uploads...');
      const uploadPromises = attachedFiles.map(file => uploadReportFile(file, trackingId, report.id));
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

    console.log('Success! Navigating to success page...');
    navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Submit button clicked!');
    console.log('🔵 Form data:', formData);
    console.log('🔵 Link data exists:', !!linkData);
    console.log('🔵 Link token exists:', !!linkToken);
    
    if (!linkData || !linkToken) {
      console.log('❌ Missing linkData or linkToken, stopping submission');
      return;
    }

    console.log('🔵 Calling secureSubmit...');
    secureSubmit(submitReport, formData, validateForm);
  };

  return (
    <ErrorBoundary>
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full hover:opacity-90"
            style={{ backgroundColor: brandColor }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default SecureSubmissionForm;
