
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { encryptReport } from "@/utils/encryption";
import { useNavigate } from "react-router-dom";
import BrandedFormLayout from "./BrandedFormLayout";

const PREDEFINED_CATEGORIES = [
  "Bribery",
  "Fraud", 
  "GDPR",
  "Corruption",
  "Failure to comply with laws and regulation",
  "Endangering the health & safety of individuals",
  "Other (Please Specify)"
];

const SecureReportTool = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<"anonymous" | "confidential">("anonymous");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    customCategory: "",
    content: "",
    incident_date: "",
    location: "",
    people_involved: "",
    evidence_description: "",
    submitter_email: "",
    priority: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category: value,
      customCategory: value === "Other (Please Specify)" ? prev.customCategory : ""
    }));
  };

  const generateTrackingId = () => {
    return 'WB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const getFinalCategory = () => {
    if (formData.category === "Other (Please Specify)" && formData.customCategory.trim()) {
      return formData.customCategory.trim();
    }
    return formData.category;
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

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (formData.category === "Other (Please Specify)" && !formData.customCategory.trim()) {
      toast.error("Please specify the category");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use demo organization for now
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("domain", "demo-corp")
        .single();

      if (!org) {
        toast.error("Organization not found");
        return;
      }

      // Generate a unique tracking ID first
      const trackingId = generateTrackingId();
      const finalCategory = getFinalCategory();

      // Encrypt the report data
      const reportData = {
        title: formData.title,
        content: formData.content,
        category: finalCategory,
        incident_date: formData.incident_date,
        location: formData.location,
        people_involved: formData.people_involved,
        evidence_description: formData.evidence_description,
      };

      const { encryptedData, keyHash } = encryptReport(reportData, trackingId);

      // Submit encrypted report with the generated tracking_id and priority
      const { data: report, error } = await supabase
        .from("reports")
        .insert({
          organization_id: org.id,
          report_type: reportType,
          title: formData.title,
          encrypted_content: encryptedData,
          encryption_key_hash: keyHash,
          tracking_id: trackingId,
          submitted_by_email: reportType === "confidential" ? formData.submitter_email || null : null,
          priority: formData.priority,
          tags: [finalCategory] // Store category as a tag for statistics
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Report created successfully:", report);

      // Navigate to success page with only the tracking ID
      navigate(`/secure/tool/success?trackingId=${encodeURIComponent(trackingId)}`);

    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BrandedFormLayout
      title="Submit Secure Report"
      description="All information will be encrypted and securely transmitted to the organization."
    >
      <div className="space-y-6">
        {/* Security Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">Secure & Anonymous</p>
                <p className="text-green-700">
                  Your report will be encrypted before submission using AES-256 encryption. 
                  No personal information is required for anonymous reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Report Type</Label>
            <RadioGroup
              value={reportType}
              onValueChange={(value: "anonymous" | "confidential") => setReportType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anonymous" id="anonymous" />
                <Label htmlFor="anonymous" className="font-normal text-sm">
                  Anonymous Report (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confidential" id="confidential" />
                <Label htmlFor="confidential" className="font-normal text-sm">
                  Confidential Report (Your email will be stored)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Email for confidential reports */}
          {reportType === "confidential" && (
            <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Category Input */}
          {formData.category === "Other (Please Specify)" && (
            <div className="space-y-2">
              <Label htmlFor="customCategory">Please Specify Category *</Label>
              <Input
                id="customCategory"
                value={formData.customCategory}
                onChange={(e) => handleInputChange("customCategory", e.target.value)}
                placeholder="Enter the specific category"
                required
              />
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority.toString()}
              onValueChange={(value) => handleInputChange("priority", parseInt(value))}
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

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Detailed Description *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Provide detailed information about the incident or concern..."
              rows={4}
              required
            />
          </div>

          {/* Incident Date */}
          <div className="space-y-2">
            <Label htmlFor="incident_date">Incident Date</Label>
            <Input
              id="incident_date"
              type="date"
              value={formData.incident_date}
              onChange={(e) => handleInputChange("incident_date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Where did this occur? (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="people_involved">People Involved</Label>
            <Textarea
              id="people_involved"
              value={formData.people_involved}
              onChange={(e) => handleInputChange("people_involved", e.target.value)}
              placeholder="Names, roles, or descriptions of people involved (optional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence_description">Evidence Description</Label>
            <Textarea
              id="evidence_description"
              value={formData.evidence_description}
              onChange={(e) => handleInputChange("evidence_description", e.target.value)}
              placeholder="Describe any evidence you have (documents, emails, recordings, etc.)"
              rows={2}
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">File upload feature coming soon</p>
            <p className="text-xs text-gray-400">Encrypted file attachments will be supported</p>
          </div>

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

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || !agreedToTerms}
          >
            {isSubmitting ? "Encrypting & Submitting..." : "Submit Secure Report"}
          </Button>
        </form>
      </div>
    </BrandedFormLayout>
  );
};

export default SecureReportTool;
