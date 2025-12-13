
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganization } from '@/hooks/useOrganization';
import { FileText, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrivacyPolicyGenerator = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  
  const [policyData, setPolicyData] = useState({
    companyName: organization?.name || '',
    contactEmail: '',
    contactAddress: '',
    dataController: '',
    dataTypes: {
      personalInfo: true,
      reportContent: true,
      communicationData: true,
      technicalData: true,
      usageData: false,
    },
    lawfulBasis: 'legitimate_interest',
    retentionPeriod: '36',
    thirdPartySharing: false,
    thirdPartyDetails: '',
    cookies: true,
    analytics: false,
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  const [generatedPolicy, setGeneratedPolicy] = useState('');

  const generatePolicy = () => {
    const policy = `
# Privacy Policy

**Last updated: ${policyData.lastUpdated}**

## 1. Introduction

${policyData.companyName} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our secure disclosure platform.

## 2. Information We Collect

We may collect and process the following types of personal data:

${policyData.dataTypes.personalInfo ? '- **Personal Information**: Name, email address, contact details\n' : ''}${policyData.dataTypes.reportContent ? '- **Report Content**: Information submitted through our reporting system\n' : ''}${policyData.dataTypes.communicationData ? '- **Communication Data**: Messages and correspondence\n' : ''}${policyData.dataTypes.technicalData ? '- **Technical Data**: IP addresses, browser information, device identifiers\n' : ''}${policyData.dataTypes.usageData ? '- **Usage Data**: How you interact with our platform\n' : ''}

## 3. Legal Basis for Processing

We process your personal data under the following legal basis:
${policyData.lawfulBasis === 'legitimate_interest' ? '- **Legitimate Interest**: To provide our whistleblower reporting services' : ''}
${policyData.lawfulBasis === 'consent' ? '- **Consent**: Where you have given explicit consent' : ''}
${policyData.lawfulBasis === 'contract' ? '- **Contract**: To fulfill our contractual obligations' : ''}
${policyData.lawfulBasis === 'legal_obligation' ? '- **Legal Obligation**: To comply with legal requirements' : ''}

## 4. How We Use Your Information

We use the information we collect to:
- Provide and maintain our reporting platform
- Process and investigate reports
- Communicate with users regarding their reports
- Ensure platform security and prevent fraud
- Comply with legal obligations

## 5. Data Retention

We retain personal data for ${policyData.retentionPeriod} months from the date of collection, or until the purpose for processing is fulfilled, whichever comes first.

## 6. Third Party Sharing

${policyData.thirdPartySharing ? 
`We may share your information with trusted third parties in the following circumstances:
${policyData.thirdPartyDetails}` : 
'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.'}

## 7. Your Rights

Under GDPR, you have the following rights:
- **Right of Access**: Request copies of your personal data
- **Right to Rectification**: Request correction of inaccurate data
- **Right to Erasure**: Request deletion of your personal data
- **Right to Restrict Processing**: Request limitation of processing
- **Right to Data Portability**: Request transfer of your data
- **Right to Object**: Object to processing of your personal data

## 8. Cookies and Tracking

${policyData.cookies ? 
'We use cookies and similar tracking technologies to enhance your experience on our platform. You can manage your cookie preferences through our cookie consent banner.' : 
'We do not use cookies or tracking technologies on our platform.'}

${policyData.analytics ? 
'We use analytics services to understand how our platform is used and to improve our services.' : ''}

## 9. Data Security

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.

## 10. International Transfers

If we transfer your data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place.

## 11. Contact Information

If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:

**Data Controller**: ${policyData.dataController || policyData.companyName}
**Email**: ${policyData.contactEmail}
**Address**: ${policyData.contactAddress}

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
`;

    setGeneratedPolicy(policy);
    toast({
      title: "Policy generated",
      description: "Your privacy policy has been generated successfully.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPolicy);
    toast({
      title: "Copied to clipboard",
      description: "Privacy policy has been copied to your clipboard.",
    });
  };

  const downloadPolicy = () => {
    const blob = new Blob([generatedPolicy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policyData.companyName.replace(/\s+/g, '_')}_Privacy_Policy.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Privacy Policy Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Policy Configuration</CardTitle>
            <CardDescription>
              Configure your organization's privacy policy settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={policyData.companyName}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={policyData.contactEmail}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact-address">Contact Address</Label>
              <Textarea
                id="contact-address"
                value={policyData.contactAddress}
                onChange={(e) => setPolicyData(prev => ({ ...prev, contactAddress: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="data-controller">Data Controller</Label>
              <Input
                id="data-controller"
                value={policyData.dataController}
                onChange={(e) => setPolicyData(prev => ({ ...prev, dataController: e.target.value }))}
                placeholder="Leave blank to use company name"
              />
            </div>

            <div>
              <Label>Data Types Collected</Label>
              <div className="space-y-2 mt-2">
                {Object.entries(policyData.dataTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setPolicyData(prev => ({
                          ...prev,
                          dataTypes: { ...prev.dataTypes, [key]: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="lawful-basis">Lawful Basis for Processing</Label>
              <Select 
                value={policyData.lawfulBasis} 
                onValueChange={(value) => setPolicyData(prev => ({ ...prev, lawfulBasis: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legitimate_interest">Legitimate Interest</SelectItem>
                  <SelectItem value="consent">Consent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="legal_obligation">Legal Obligation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="retention-period">Data Retention Period (months)</Label>
              <Input
                id="retention-period"
                type="number"
                value={policyData.retentionPeriod}
                onChange={(e) => setPolicyData(prev => ({ ...prev, retentionPeriod: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="third-party-sharing"
                checked={policyData.thirdPartySharing}
                onCheckedChange={(checked) => 
                  setPolicyData(prev => ({ ...prev, thirdPartySharing: checked as boolean }))
                }
              />
              <Label htmlFor="third-party-sharing">Share data with third parties</Label>
            </div>

            {policyData.thirdPartySharing && (
              <div>
                <Label htmlFor="third-party-details">Third Party Sharing Details</Label>
                <Textarea
                  id="third-party-details"
                  value={policyData.thirdPartyDetails}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, thirdPartyDetails: e.target.value }))}
                  rows={3}
                />
              </div>
            )}

            <Button onClick={generatePolicy} className="w-full">
              Generate Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Privacy Policy</CardTitle>
            <CardDescription>
              Your customized privacy policy ready for use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedPolicy ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline" onClick={downloadPolicy} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{generatedPolicy}</pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings and click "Generate Privacy Policy" to create your customized policy.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyGenerator;
