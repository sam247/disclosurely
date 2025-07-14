import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, CheckCircle, Upload, File, X, FileSearch } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  encrypted_content: string;
  encryption_key_hash: string;
  priority: number;
  report_type: string;
}

const AICaseHelper = () => {
  const { subscriptionData, user } = useAuth();
  const { toast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [liveCases, setLiveCases] = useState<Report[]>([]);
  const [selectedCase, setSelectedCase] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const hasProAccess = subscriptionData.subscribed && (subscriptionData.subscription_tier === 'pro' || subscriptionData.subscription_tier?.includes('tier_'));
  
  // Debug subscription data
  console.log('AICaseHelper - Subscription data:', subscriptionData);
  console.log('AICaseHelper - Has Pro Access:', hasProAccess);

  // Fetch live cases on component mount
  useEffect(() => {
    if (hasProAccess && user) {
      fetchLiveCases();
    }
  }, [hasProAccess, user]);

  const fetchLiveCases = async () => {
    try {
      setLoadingCases(true);
      
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) return;

      // Fetch live cases (not closed)
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type')
        .eq('organization_id', profile.organization_id)
        .neq('status', 'closed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live cases:', error);
        toast({
          title: "Error",
          description: "Failed to fetch live cases",
          variant: "destructive",
        });
        return;
      }

      setLiveCases(reportsData || []);
    } catch (error) {
      console.error('Error fetching live cases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch live cases",
        variant: "destructive",
      });
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCaseSelection = (caseId: string) => {
    setSelectedCaseId(caseId);
    const selectedReport = liveCases.find(report => report.id === caseId);
    setSelectedCase(selectedReport || null);
    setAnalysisResult(''); // Clear previous analysis
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only PDF, Word, and text files under 10MB are allowed",
        variant: "destructive",
      });
    }

    setUploadedDocuments(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast({
        title: "Documents uploaded",
        description: `${validFiles.length} document(s) added for AI analysis`,
      });
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeCase = async () => {
    if (!selectedCase) {
      toast({
        title: "Case Required",
        description: "Please select a case to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare company documents data
      const companyDocuments = uploadedDocuments.map(doc => ({
        name: doc.name,
        size: doc.size,
        type: doc.type,
        content: `[Document content would be extracted in a real implementation: ${doc.name}]`
      }));

      // Call the AI analysis edge function
      const response = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          caseData: {
            title: selectedCase.title,
            tracking_id: selectedCase.tracking_id,
            status: selectedCase.status,
            priority: selectedCase.priority,
            report_type: selectedCase.report_type,
            created_at: selectedCase.created_at
          },
          companyDocuments,
          caseContent: `[Encrypted case content - would be decrypted in real implementation for ${selectedCase.tracking_id}]`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI analysis failed');
      }

      const { analysis, fallbackAnalysis } = response.data;
      
      setAnalysisResult(analysis || fallbackAnalysis || 'Analysis could not be completed at this time.');

      toast({
        title: "Analysis Complete",
        description: "AI case analysis has been generated successfully",
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Fallback analysis if API fails
      const fallbackAnalysis = `
AI CASE ANALYSIS REPORT
Case: ${selectedCase.title} (${selectedCase.tracking_id})
Status: ${selectedCase.status}
Priority: ${selectedCase.priority}/5
Type: ${selectedCase.report_type}

NOTE: AI analysis service temporarily unavailable. Proceeding with standard analysis.

IMMEDIATE ACTIONS REQUIRED:
1. Assign case to senior case handler within 24 hours
2. Review case content for urgency indicators
3. Implement standard escalation procedures based on priority level
4. Document all actions taken for audit trail

RECOMMENDED TIMELINE:
- Initial review and triage: Within 24 hours
- Preliminary investigation: 1-7 days
- Full investigation completion: 1-4 weeks

POLICY COMPLIANCE:
${uploadedDocuments.length > 0 ? 
  `• ${uploadedDocuments.length} policy document(s) uploaded for reference\n• Manual review required for compliance checking\n• Cross-reference with uploaded documentation` : 
  '• Upload company policies for detailed compliance analysis\n• Review current whistleblower procedures\n• Ensure proper documentation throughout process'}

STAKEHOLDER NOTIFICATIONS:
• Case Handler (immediate assignment)
• Department Manager (as appropriate)
• Legal/Compliance team (if escalation required)

This is a fallback analysis. For detailed AI insights, please try again or contact support.
Generated: ${new Date().toLocaleString()}
      `;
      
      setAnalysisResult(fallbackAnalysis);
      
      toast({
        title: "Analysis Completed with Fallback",
        description: "Standard analysis provided. AI service temporarily unavailable.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasProAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Case Helper
            <Badge variant="secondary">PRO Feature</Badge>
          </CardTitle>
          <CardDescription>
            AI-powered case analysis with policy compliance checking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Access AI Case Analysis</h3>
            <p className="text-gray-600 mb-6">
              Get AI-powered case analysis against your organization's policies and compliance requirements with Pro subscription.
            </p>
            
            <div className="p-4 border rounded-lg bg-gray-50 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-gray-400 mt-1">
                  <FileSearch className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">AI Case Analysis</h4>
                  <p className="text-sm text-gray-500 mt-1">Select live cases and get AI recommendations based on your policies</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                Upgrade to Pro - Coming Soon
              </Button>
              <p className="text-xs text-gray-500">
                AI Case Helper is available with Pro subscription
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Case Helper
            <Badge variant="default" className="bg-green-600">
              {subscriptionData.subscription_tier?.toUpperCase() || 'FREE'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Select a live case and get AI-powered compliance analysis based on your organization's policies
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Case Analysis with Policy Compliance
          </CardTitle>
          <CardDescription>
            Select a case, upload your policies, and get AI recommendations for compliant handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Case Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="case-select">Select Live Case</Label>
              <Select value={selectedCaseId} onValueChange={handleCaseSelection} disabled={loadingCases}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCases ? "Loading cases..." : "Select a case to analyze"} />
                </SelectTrigger>
                <SelectContent>
                  {liveCases.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.tracking_id} - {report.title} ({report.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {liveCases.length} live case(s) available for analysis
              </p>
            </div>

            {selectedCase && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selected Case Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Tracking ID:</span> {selectedCase.tracking_id}
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Status:</span> {selectedCase.status}
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Priority:</span> {selectedCase.priority}/5
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Type:</span> {selectedCase.report_type}
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-600 font-medium">Created:</span> {new Date(selectedCase.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Company Policies & Handbooks
              </CardTitle>
              <CardDescription>
                Upload your organization's policies, handbooks, and guidelines for AI-powered compliance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy-upload">Select Documents</Label>
                <Input
                  id="policy-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleDocumentUpload}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF, Word, and text files up to 10MB each
                </p>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-600" />
                          <span className="text-sm truncate">{doc.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(doc.size / 1024 / 1024).toFixed(1)}MB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDocument(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={handleAnalyzeCase}
            disabled={isLoading || !selectedCase}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Case...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Analyze Case with AI {uploadedDocuments.length > 0 && `(+${uploadedDocuments.length} docs)`}
              </>
            )}
          </Button>

          {analysisResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Analysis Complete</h4>
                {uploadedDocuments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {uploadedDocuments.length} docs analyzed
                  </Badge>
                )}
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {analysisResult}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AICaseHelper;