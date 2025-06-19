
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Upload, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { encryptData } from '@/utils/encryption';

interface OrganizationData {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  brand_color: string | null;
  logo_url: string | null;
}

interface LinkData {
  id: string;
  name: string;
  description: string;
  department: string;
  location: string;
  custom_fields: any[];
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
}

const DynamicSubmissionForm = () => {
  const { orgDomain, linkToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitter_name: '',
    submitter_email: '',
    contact_preference: 'none',
    incident_date: '',
    location: '',
    witnesses: '',
    evidence_description: '',
    follow_up_password: ''
  });

  useEffect(() => {
    fetchLinkData();
  }, [orgDomain, linkToken]);

  const fetchLinkData = async () => {
    if (!orgDomain || !linkToken) {
      navigate('/404');
      return;
    }

    try {
      // First, get organization by domain
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('domain', orgDomain)
        .eq('is_active', true)
        .single();

      if (orgError || !orgData) {
        toast({
          title: "Organization not found",
          description: "The organization link is invalid or inactive.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      setOrganization(orgData);

      // Then get the link data
      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select('*')
        .eq('link_token', linkToken)
        .eq('organization_id', orgData.id)
        .eq('is_active', true)
        .single();

      if (linkError || !linkInfo) {
        toast({
          title: "Link not found",
          description: "The submission link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/404');
        return;
      }

      // Check if link has expired
      if (linkInfo.expires_at && new Date(linkInfo.expires_at) < new Date()) {
        toast({
          title: "Link expired",
          description: "This submission link has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
      if (linkInfo.usage_limit && linkInfo.usage_count >= linkInfo.usage_limit) {
        toast({
          title: "Usage limit reached",
          description: "This submission link has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      setLinkData(linkInfo);

      // Track page view
      await supabase.from('link_analytics').insert({
        link_id: linkInfo.id,
        event_type: 'view',
        metadata: { user_agent: navigator.userAgent }
      });

    } catch (error) {
      console.error('Error fetching link data:', error);
      toast({
        title: "Error loading form",
        description: "There was a problem loading the submission form.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingId = () => {
    return 'WB-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !linkData) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonymous && !formData.follow_up_password.trim()) {
      toast({
        title: "Password required",
        description: "Please set a password for follow-up access.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const trackingId = generateTrackingId();
      const reportData = {
        title: formData.title,
        description: formData.description,
        submitter_name: isAnonymous ? null : formData.submitter_name,
        submitter_email: isAnonymous ? null : formData.submitter_email,
        contact_preference: formData.contact_preference,
        incident_date: formData.incident_date || null,
        location: formData.location || linkData.location,
        witnesses: formData.witnesses,
        evidence_description: formData.evidence_description,
        department: linkData.department,
        submission_method: 'web_form',
        link_info: {
          link_id: linkData.id,
          link_name: linkData.name,
          org_domain: orgDomain
        }
      };

      // Encrypt the report content
      const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
      const encryptedContent = await encryptData(JSON.stringify(reportData), encryptionKey);
      const keyHash = await crypto.subtle.digest('SHA-256', encryptionKey);

      // Insert the report
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          organization_id: organization.id,
          tracking_id: trackingId,
          title: formData.title,
          encrypted_content: encryptedContent,
          encryption_key_hash: Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
          report_type: isAnonymous ? 'anonymous' : 'confidential',
          submitted_by_email: isAnonymous ? null : formData.submitter_email,
          submitted_via_link_id: linkData.id,
          status: 'new',
          priority: 3
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Update link usage count
      await supabase
        .from('organization_links')
        .update({ usage_count: linkData.usage_count + 1 })
        .eq('id', linkData.id);

      // Track submission
      await supabase.from('link_analytics').insert({
        link_id: linkData.id,
        event_type: 'submit',
        metadata: { 
          tracking_id: trackingId,
          report_type: isAnonymous ? 'anonymous' : 'confidential'
        }
      });

      // Navigate to success page with tracking ID
      navigate('/secure/tool/success', { 
        state: { 
          trackingId,
          isAnonymous,
          hasPassword: !isAnonymous && formData.follow_up_password.trim() !== ''
        }
      });

    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your report. Please try again.",
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

  if (!organization || !linkData) {
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

  const brandColor = organization.brand_color || '#2563eb';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with organization branding */}
      <header className="bg-white shadow" style={{ borderTopColor: brandColor, borderTopWidth: '4px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            {organization.logo_url ? (
              <img 
                src={organization.logo_url} 
                alt={organization.name}
                className="h-10 w-auto mr-4"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: brandColor }}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-sm text-gray-600">Secure Report Submission</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: brandColor }} />
                {linkData.name}
              </CardTitle>
              <CardDescription>
                {linkData.description || 'Submit your report securely and confidentially.'}
                {linkData.department && <span className="block mt-1 text-sm">Department: {linkData.department}</span>}
                {linkData.location && <span className="block text-sm">Location: {linkData.location}</span>}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Type</CardTitle>
              <CardDescription>Choose how you'd like to submit this report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="flex items-center gap-2">
                  {isAnonymous ? 'Anonymous Submission' : 'Confidential Submission'}
                  <span className="text-sm text-gray-500">
                    ({isAnonymous ? 'No personal information required' : 'Provide contact details for follow-up'})
                  </span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information (if not anonymous) */}
          {!isAnonymous && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>This information will be kept confidential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submitter_name">Full Name</Label>
                    <Input
                      id="submitter_name"
                      value={formData.submitter_name}
                      onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="submitter_email">Email Address</Label>
                    <Input
                      id="submitter_email"
                      type="email"
                      value={formData.submitter_email}
                      onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="follow_up_password">Follow-up Password *</Label>
                  <div className="relative">
                    <Input
                      id="follow_up_password"
                      type={showPassword ? "text" : "password"}
                      required={!isAnonymous}
                      value={formData.follow_up_password}
                      onChange={(e) => setFormData({ ...formData, follow_up_password: e.target.value })}
                      placeholder="Create a secure password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this password to check your report status and communicate securely
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
              <CardDescription>Provide information about the incident or concern</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide a detailed description of what happened..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incident_date">Incident Date</Label>
                  <Input
                    id="incident_date"
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={linkData.location || "Where did this occur?"}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="witnesses">Witnesses (if any)</Label>
                <Input
                  id="witnesses"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Names of any witnesses"
                />
              </div>

              <div>
                <Label htmlFor="evidence_description">Evidence Description</Label>
                <Textarea
                  id="evidence_description"
                  value={formData.evidence_description}
                  onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                  placeholder="Describe any evidence you have (documents, photos, etc.)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
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
          <div className="flex justify-end space-x-3">
            <Button 
              type="submit" 
              disabled={submitting}
              className="px-8"
              style={{ backgroundColor: brandColor }}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DynamicSubmissionForm;
