import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle } from 'lucide-react';
import { encryptReport } from '@/utils/encryption';
import BrandedFormLayout from './BrandedFormLayout';

interface LinkData {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  organization_name: string;
  organization_logo_url?: string;
  organization_custom_logo_url?: string;
  organization_brand_color?: string;
}

const DynamicSubmissionForm = () => {
  const { linkToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitter_email: '',
    priority: 3
  });

  useEffect(() => {
    fetchLinkData();
  }, [linkToken]);

  const fetchLinkData = async () => {
    if (!linkToken) {
      navigate('/404');
      return;
    }

    try {
      console.log('Fetching link data for token:', linkToken);

      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select(`
          id,
          name,
          description,
          organization_id,
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

      console.log('Link found:', linkInfo);

      setLinkData({
        id: linkInfo.id,
        name: linkInfo.name,
        description: linkInfo.description || '',
        organization_id: linkInfo.organization_id,
        organization_name: linkInfo.organizations.name,
        organization_logo_url: linkInfo.organizations.logo_url,
        organization_custom_logo_url: linkInfo.organizations.custom_logo_url,
        organization_brand_color: linkInfo.organizations.brand_color
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const trackingId = generateTrackingId();
      
      console.log('Submitting report:', {
        title: formData.title,
        organizationId: linkData.organization_id,
        isAnonymous,
        priority: formData.priority
      });

      // Encrypt the report data using organization-based encryption
      const reportData = {
        title: formData.title,
        description: formData.description,
        submission_method: 'web_form'
      };

      const { encryptedData, keyHash } = encryptReport(reportData, linkData.organization_id);

      // Create the report
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          organization_id: linkData.organization_id,
          tracking_id: trackingId,
          title: formData.title,
          encrypted_content: encryptedData,
          encryption_key_hash: keyHash,
          report_type: isAnonymous ? 'anonymous' : 'confidential',
          submitted_by_email: isAnonymous ? null : formData.submitter_email,
          submitted_via_link_id: linkData.id,
          status: 'new',
          priority: formData.priority
        })
        .select()
        .single();

      if (reportError) {
        console.error('Report submission error:', reportError);
        throw reportError;
      }

      console.log('Report created successfully:', report);

      // Update link usage count
      const { data: currentLink } = await supabase
        .from('organization_links')
        .select('usage_count')
        .eq('id', linkData.id)
        .single();

      if (currentLink) {
        await supabase
          .from('organization_links')
          .update({ 
            usage_count: (currentLink.usage_count || 0) + 1
          })
          .eq('id', linkData.id);
      }

      // Navigate to success page with tracking ID
      navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);

    } catch (error: any) {
      console.error('Error submitting report:', error);
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
    <BrandedFormLayout
      title={linkData.name}
      description={linkData.description || 'Submit your report securely and confidentially.'}
      organizationName={linkData.organization_name}
      logoUrl={logoUrl}
      brandColor={brandColor}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Report Type</Label>
          <div className="flex items-center space-x-3">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm">
              {isAnonymous ? 'Anonymous Submission' : 'Confidential Submission'}
              <span className="text-xs text-gray-500">
                ({isAnonymous ? 'No personal information required' : 'Provide email for follow-up'})
              </span>
            </Label>
          </div>
        </div>

        {/* Contact Information (if not anonymous) */}
        {!isAnonymous && (
          <div className="space-y-2">
            <Label htmlFor="submitter_email">Email Address</Label>
            <Input
              id="submitter_email"
              type="email"
              value={formData.submitter_email}
              onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
              placeholder="your@email.com"
              required={!isAnonymous}
            />
          </div>
        )}

        {/* Report Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide a detailed description of what happened..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority.toString()}
              onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Critical (Immediate danger/serious violation)</SelectItem>
                <SelectItem value="2">2 - High (Significant impact)</SelectItem>
                <SelectItem value="3">3 - Medium (Standard concern)</SelectItem>
                <SelectItem value="4">4 - Low (Minor issue)</SelectItem>
                <SelectItem value="5">5 - Informational (General feedback)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
    </BrandedFormLayout>
  );
};

export default DynamicSubmissionForm;
