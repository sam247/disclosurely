import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureForm } from '@/hooks/useSecureForm';
import { validateReportTitle, validateReportDescription } from '@/utils/inputValidation';
import { uploadReportFile } from '@/utils/fileUpload';
import ProgressiveReportForm, { ProgressiveFormData } from './ProgressiveReportForm';

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
  link_token: string;
}

interface ProgressiveSubmissionFormProps {
  linkToken: string;
  linkData: LinkData;
  brandColor: string;
}

const ProgressiveSubmissionForm = ({ linkToken, linkData, brandColor }: ProgressiveSubmissionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<ProgressiveFormData>({
    title: '',
    description: '',
    mainCategory: '',
    subCategory: '',
    customCategory: '',
    priority: 3,
    incidentDate: '',
    location: '',
    witnesses: '',
    previousReports: false,
    additionalNotes: ''
  });

  const { isSubmitting, secureSubmit } = useSecureForm({
    rateLimitKey: `submission_${linkToken}`,
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000
  });

  const updateFormData = (updates: Partial<ProgressiveFormData>) => {
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

  const validateForm = (): boolean => {
    if (!validateReportTitle(formData.title)) {
      toast({
        title: "Invalid Title",
        description: "Title must be between 3 and 200 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateReportDescription(formData.description)) {
      toast({
        title: "Invalid Description",
        description: "Description must be between 10 and 5000 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.mainCategory || !formData.subCategory) {
      toast({
        title: "Category Required",
        description: "Please select both main and sub category.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.subCategory === "Other (Please Specify)" && !formData.customCategory.trim()) {
      toast({
        title: "Category Required",
        description: "Please specify the custom category.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const trackingId = generateTrackingId();
    const finalCategory = getFinalCategory();

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
      tags: [finalCategory],
      incident_date: formData.incidentDate || null,
      location: formData.location || null,
      witnesses: formData.witnesses || null,
      previous_reports: formData.previousReports,
      additional_notes: formData.additionalNotes || null
    };

    await secureSubmit(async () => {
      try {
        // Submit via edge function
        const { data, error } = await supabase.functions.invoke('submit-anonymous-report', {
          body: {
            ...reportPayload,
            linkToken,
            organizationId: linkData.organization_id
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to submit report');
        }

        if (!data?.success || !data?.reportId) {
          throw new Error('Invalid response from server');
        }

        const reportId = data.reportId;

        // Upload files if any
        if (attachedFiles.length > 0) {
          for (const file of attachedFiles) {
            try {
              await uploadReportFile(file, reportId, linkData.organization_id);
            } catch (fileError) {
              console.error('File upload error:', fileError);
              // Don't fail the whole submission if file upload fails
            }
          }
        }

        // Navigate to success page
        navigate('/success', {
          state: {
            trackingId,
            organizationName: linkData.organization_name,
            filesUploaded: attachedFiles.length
          }
        });

      } catch (error: any) {
        console.error('Submission error:', error);
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit report. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  return (
    <ProgressiveReportForm
      formData={formData}
      updateFormData={updateFormData}
      attachedFiles={attachedFiles}
      setAttachedFiles={setAttachedFiles}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      brandColor={brandColor}
    />
  );
};

export default ProgressiveSubmissionForm;
