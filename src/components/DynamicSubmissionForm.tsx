
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { encryptReport } from '@/utils/encryption';

const DynamicSubmissionForm = () => {
  const { linkToken } = useParams();
  const navigate = useNavigate();
  
  const [linkData, setLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<"anonymous" | "confidential">("anonymous");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    incident_date: "",
    location: "",
    people_involved: "",
    evidence_description: "",
    submitter_email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchLinkData();
  }, [linkToken]);

  const fetchLinkData = async () => {
    if (!linkToken) {
      toast.error("Invalid submission link");
      return;
    }

    try {
      // Fetch link data without authentication since this is a public form
      const { data: linkInfo, error } = await supabase
        .from('organization_links')
        .select(`
          *,
          organizations (
            id,
            name,
            brand_color,
            logo_url
          )
        `)
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching link data:', error);
        toast.error("Invalid or expired submission link");
        return;
      }

      if (!linkInfo) {
        toast.error("Submission link not found");
        return;
      }

      // Check if link has expired
      if (linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()) {
        toast.error("This submission link has expired");
        return;
      }

      // Check usage limit
      if (linkInfo.usage_limit && linkInfo.usage_count >= linkInfo.usage_limit) {
        toast.error("This submission link has reached its usage limit");
        return;
      }

      setLinkData(linkInfo);
    } catch (error) {
      console.error('Error fetching link data:', error);
      toast.error("Failed to load submission form");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTrackingId = () => {
    return 'WB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!linkData) {
      toast.error("Invalid submission link");
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingId = generateTrackingId();

      // Encrypt the report data
      const reportData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        incident_date: formData.incident_date,
        location: formData.location,
        people_involved: formData.people_involved,
        evidence_description: formData.evidence_description,
      };

      const { encryptedData, keyHash } = encryptReport(reportData, trackingId);

      // Submit encrypted report
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          organization_id: linkData.organization_id,
          report_type: reportType,
          title: formData.title,
          encrypted_content: encryptedData,
          encryption_key_hash: keyHash,
          tracking_id: trackingId,
          submitted_by_email: reportType === "confidential" ? formData.submitter_email || null : null,
          submitted_via_link_id: linkData.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Update link usage count
      await supabase
        .from('organization_links')
        .update({ usage_count: linkData.usage_count + 1 })
        .eq('id', linkData.id);

      console.log("Report created successfully:", report);
      navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);

    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Link Not Found</h3>
            <p className="text-gray-600">
              This submission link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const organization = linkData.organizations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{organization?.name || 'SecureReport'}</span>
            <span className="text-sm text-gray-500 ml-4">Secure Submission Portal</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Security Notice */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Secure & Anonymous</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                Your report will be encrypted before submission using AES-256 encryption. 
                No personal information is required for anonymous reports, and all data is protected with enterprise-grade security.
              </p>
            </CardContent>
          </Card>

          {/* Report Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>{linkData.name}</span>
              </CardTitle>
              <CardDescription>
                {linkData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div>
                  <Label className="text-base font-medium">Report Type</Label>
                  <RadioGroup
                    value={reportType}
                    onValueChange={(value: "anonymous" | "confidential") => setReportType(value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anonymous" id="anonymous" />
                      <Label htmlFor="anonymous" className="font-normal">
                        Anonymous Report (Recommended)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="confidential" id="confidential" />
                      <Label htmlFor="confidential" className="font-normal">
                        Confidential Report (Your email will be stored)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Email for confidential reports */}
                {reportType === "confidential" && (
                  <div>
                    <Label htmlFor="submitter_email">Your Email Address</Label>
                    <Input
                      id="submitter_email"
                      type="email"
                      value={formData.submitter_email}
                      onChange={(e) => handleInputChange("submitter_email", e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Brief title describing the issue"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Financial misconduct, Safety violation, Harassment"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Detailed Description *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Provide detailed information about the incident or concern..."
                    rows={6}
                    required
                  />
                </div>

                {/* Incident Date */}
                <div>
                  <Label htmlFor="incident_date">Incident Date</Label>
                  <Input
                    id="incident_date"
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => handleInputChange("incident_date", e.target.value)}
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Where did this occur? (optional)"
                  />
                </div>

                {/* People Involved */}
                <div>
                  <Label htmlFor="people_involved">People Involved</Label>
                  <Textarea
                    id="people_involved"
                    value={formData.people_involved}
                    onChange={(e) => handleInputChange("people_involved", e.target.value)}
                    placeholder="Names, roles, or descriptions of people involved (optional)"
                    rows={3}
                  />
                </div>

                {/* Evidence */}
                <div>
                  <Label htmlFor="evidence_description">Evidence Description</Label>
                  <Textarea
                    id="evidence_description"
                    value={formData.evidence_description}
                    onChange={(e) => handleInputChange("evidence_description", e.target.value)}
                    placeholder="Describe any evidence you have (documents, emails, recordings, etc.)"
                    rows={3}
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I understand that this report will be encrypted and submitted securely. 
                    I agree to the terms of service and privacy policy. I confirm that the information provided is accurate to the best of my knowledge.
                  </Label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting || !agreedToTerms}
                >
                  {isSubmitting ? "Encrypting & Submitting..." : "Submit Secure Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DynamicSubmissionForm;
