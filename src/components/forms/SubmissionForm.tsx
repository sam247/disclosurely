
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search } from 'lucide-react';
import FileUpload from '../FileUpload';
import { uploadReportFile } from '@/utils/fileUpload';
import ReportTypeSelector from './ReportTypeSelector';
import ReportDetailsForm from './ReportDetailsForm';
import ErrorBoundary from './ErrorBoundary';

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

interface SubmissionFormProps {
  linkToken: string;
  linkData: LinkData;
  brandColor: string;
}

const SubmissionForm = ({ linkToken, linkData, brandColor }: SubmissionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
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

  const validateForm = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.mainCategory) {
      toast({
        title: "Main category required",
        description: "Please select a main category.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.subCategory) {
      toast({
        title: "Sub category required",
        description: "Please select a sub category.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.subCategory === "Other (Please Specify)" && !formData.customCategory.trim()) {
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
    if (!linkData || !linkToken) return;

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      console.log('Starting anonymous report submission...');
      
      const trackingId = generateTrackingId();
      const finalCategory = getFinalCategory();

      // Server will encrypt the data - send unencrypted
      const reportPayload = {
        tracking_id: trackingId,
        title: formData.title,
        description: formData.description,
        category: finalCategory,
        submission_method: 'web_form',
        report_type: 'anonymous' as const,
        submitted_by_email: null,
        status: 'new' as const,
        priority: formData.priority,
        tags: [finalCategory]
      };

      console.log('Submitting via edge function...');
      
      // Use the edge function instead of direct database access
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

    } catch (error: any) {
      console.error('Submission error:', error);
      
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
    </ErrorBoundary>
  );
};

export default SubmissionForm;
