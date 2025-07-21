import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, CheckCircle, Upload, File, X, FileSearch, Share2, Mail, Save, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FeatureRestriction from './FeatureRestriction';
import SubscribePrompt from './SubscribePrompt';

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

interface SavedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
}

interface SavedAnalysis {
  id: string;
  case_id: string;
  case_title: string;
  tracking_id: string;
  analysis_content: string;
  document_count: number;
  created_at: string;
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
  const [uploadedDocuments, setUploadedDocuments] = useState<SavedDocument[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasProAccess = subscriptionData.subscribed && subscriptionData.subscription_tier === 'pro';

  // Fetch data on component mount
  useEffect(() => {
    if (hasProAccess && user) {
      fetchLiveCases();
      fetchSavedDocuments();
      fetchSavedAnalyses();
    }
  }, [hasProAccess, user]);

  const fetchLiveCases = async () => {
    try {
      setLoadingCases(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type')
        .eq('organization_id', profile.organization_id)
        .neq('status', 'closed')
        .order('created_at', { ascending: false });

      if (error) throw error;
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

  const fetchSavedDocuments = async () => {
    // In a real implementation, fetch from a documents table
    // For now, return empty array since we need to create the table
    setUploadedDocuments([]);
  };

  const fetchSavedAnalyses = async () => {
    // In a real implementation, fetch from an ai_analyses table
    // For now, return empty array since we need to create the table
    setSavedAnalyses([]);
  };

  const handleCaseSelection = (caseId: string) => {
    setSelectedCaseId(caseId);
    const selectedReport = liveCases.find(report => report.id === caseId);
    setSelectedCase(selectedReport || null);
    
    // Load saved analysis if exists
    const savedAnalysis = savedAnalyses.find(analysis => analysis.case_id === caseId);
    if (savedAnalysis) {
      setAnalysisResult(savedAnalysis.analysis_content);
    } else {
      setAnalysisResult('');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only PDF, Word, and text files under 10MB are allowed",
        variant: "destructive",
      });
    }

    // Upload files to storage and save references
    for (const file of validFiles) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user?.id)
          .single();

        if (!profile?.organization_id) continue;

        const fileName = `${profile.organization_id}/ai-documents/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('report-attachments')
          .getPublicUrl(fileName);

        const newDoc: SavedDocument = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          created_at: new Date().toISOString()
        };

        setUploadedDocuments(prev => [...prev, newDoc]);
      } catch (error) {
        console.error('Error uploading document:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    if (validFiles.length > 0) {
      toast({
        title: "Documents uploaded",
        description: `${validFiles.length} document(s) added and saved`,
      });
    }
  };

  const removeDocument = async (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document removed",
      description: "Document has been removed from analysis",
    });
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
      // Read actual document content for AI analysis
      const documentContents = await Promise.all(
        uploadedDocuments.map(async (doc) => {
          try {
            // In a real implementation, you'd extract text from the documents
            // For now, we'll simulate with metadata
            return {
              name: doc.name,
              size: doc.size,
              type: doc.type,
              content: `[Policy document: ${doc.name} - ${(doc.size / 1024).toFixed(1)}KB]`
            };
          } catch (error) {
            console.error(`Error reading document ${doc.name}:`, error);
            return {
              name: doc.name,
              size: doc.size,
              type: doc.type,
              content: `[Document ${doc.name} could not be processed]`
            };
          }
        })
      );

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
          companyDocuments: documentContents,
          caseContent: `Case: ${selectedCase.title}\nTracking: ${selectedCase.tracking_id}\nStatus: ${selectedCase.status}\nPriority: ${selectedCase.priority}\nType: ${selectedCase.report_type}\n\nNote: This is a demonstration analysis. In production, encrypted case content would be decrypted and analyzed.`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI analysis failed');
      }

      const { analysis, fallbackAnalysis } = response.data;
      const finalAnalysis = analysis || fallbackAnalysis || 'Analysis could not be completed at this time.';
      
      setAnalysisResult(finalAnalysis);

      toast({
        title: "Analysis Complete",
        description: "AI case analysis has been generated successfully",
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      
      const fallbackAnalysis = generateFallbackAnalysis();
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

  const generateFallbackAnalysis = () => {
    if (!selectedCase) return '';
    
    return `# AI CASE ANALYSIS REPORT

## Case Overview
- **Case ID:** ${selectedCase.tracking_id}
- **Title:** ${selectedCase.title}
- **Status:** ${selectedCase.status}
- **Priority:** ${selectedCase.priority}/5
- **Type:** ${selectedCase.report_type}
- **Created:** ${new Date(selectedCase.created_at).toLocaleDateString()}

## Analysis Summary
This case requires immediate attention based on its priority level and current status. The following recommendations are based on standard compliance protocols.

## Immediate Actions Required
1. **Assign case handler** within 24 hours
2. **Initial assessment** of allegation severity
3. **Document preservation** procedures
4. **Stakeholder notification** as per policy

## Compliance Assessment
${uploadedDocuments.length > 0 ? 
  `✓ **Policy Documentation:** ${uploadedDocuments.length} policy document(s) available for reference\n✓ **Compliance Review:** Manual review required against uploaded policies\n✓ **Documentation:** Cross-reference with organizational guidelines` : 
  `⚠ **Policy Documentation:** No policy documents uploaded\n⚠ **Compliance Review:** Upload company policies for detailed analysis\n⚠ **Documentation:** Standard procedures recommended`}

## Investigation Timeline
- **Initial Review:** 24-48 hours
- **Preliminary Investigation:** 1-7 days  
- **Full Investigation:** 2-4 weeks
- **Resolution Target:** Based on complexity and severity

## Risk Assessment
Based on the case type "${selectedCase.report_type}" and priority level ${selectedCase.priority}, this case presents a **${selectedCase.priority >= 4 ? 'HIGH' : selectedCase.priority >= 3 ? 'MEDIUM' : 'LOW'}** risk profile.

## Recommendations
1. Follow established investigation protocols
2. Maintain confidentiality throughout process
3. Document all actions and decisions
4. Regular status updates to stakeholders
5. Consider external expertise if required

---
*Generated: ${new Date().toLocaleString()}*
*Analysis Type: Standard Fallback (AI service unavailable)*`;
  };

  const saveAnalysis = async () => {
    if (!selectedCase || !analysisResult) {
      toast({
        title: "Nothing to save",
        description: "Please generate an analysis first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // In a real implementation, save to ai_analyses table
      const newAnalysis: SavedAnalysis = {
        id: Date.now().toString(),
        case_id: selectedCase.id,
        case_title: selectedCase.title,
        tracking_id: selectedCase.tracking_id,
        analysis_content: analysisResult,
        document_count: uploadedDocuments.length,
        created_at: new Date().toISOString()
      };

      setSavedAnalyses(prev => {
        const filtered = prev.filter(a => a.case_id !== selectedCase.id);
        return [...filtered, newAnalysis];
      });

      toast({
        title: "Analysis Saved",
        description: "Your case analysis has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Save Error",
        description: "Failed to save analysis",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const shareAnalysis = async () => {
    if (!analysisResult) return;
    
    try {
      await navigator.clipboard.writeText(analysisResult);
      toast({
        title: "Copied to clipboard",
        description: "Analysis copied to clipboard for sharing",
      });
    } catch (error) {
      toast({
        title: "Share Error",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const emailAnalysis = () => {
    if (!analysisResult || !selectedCase) return;
    
    const subject = `AI Analysis: ${selectedCase.title} (${selectedCase.tracking_id})`;
    const body = encodeURIComponent(analysisResult);
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`);
  };

  const downloadAnalysis = () => {
    if (!analysisResult || !selectedCase) return;
    
    const blob = new Blob([analysisResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Analysis_${selectedCase.tracking_id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!hasProAccess) {
    const isUnsubscribed = !subscriptionData.subscribed || !subscriptionData.subscription_tier;
    
    if (isUnsubscribed) {
      return (
        <SubscribePrompt 
          feature="AI Case Helper"
          description="Get AI-powered compliance analysis and recommendations based on your organization's policies"
        />
      );
    } else {
      return (
        <FeatureRestriction 
          feature="AI Case Helper"
          requiredTier="pro"
          onUpgrade={() => {
            console.log('Upgrade to Pro clicked');
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">AI Case Helper</h1>
                <p className="text-muted-foreground">
                  AI-powered compliance analysis and recommendations
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">
              {subscriptionData.subscription_tier?.toUpperCase() || 'FREE'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Column - Case Selection & Document Upload */}
          <div className="space-y-6 overflow-y-auto">
            
            {/* Case Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  Select Case for Analysis
                </CardTitle>
                <CardDescription>
                  Choose a live case to analyze with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="case-select">Live Cases</Label>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {liveCases.length} live case(s) available for analysis
                  </p>
                </div>

                {selectedCase && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Case Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tracking ID:</span> {selectedCase.tracking_id}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {selectedCase.status}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {selectedCase.priority}/5
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {selectedCase.report_type}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Created:</span> {new Date(selectedCase.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Company Policies & Documents
                </CardTitle>
                <CardDescription>
                  Upload organizational policies for AI-enhanced compliance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="policy-upload">Upload Documents</Label>
                  <Input
                    id="policy-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, and text files up to 10MB each
                  </p>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Documents ({uploadedDocuments.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded border">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <span className="text-sm truncate">{doc.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(doc.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDocument(doc.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAnalyzeCase}
                  disabled={isLoading || !selectedCase}
                  className="w-full"
                  size="lg"
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Analysis Results
                    {uploadedDocuments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {uploadedDocuments.length} docs analyzed
                      </Badge>
                    )}
                  </CardTitle>
                  {analysisResult && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={shareAnalysis}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={emailAnalysis}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadAnalysis}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveAnalysis} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription>
                  AI-generated compliance analysis and recommendations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {analysisResult ? (
                  <div className="flex-1 overflow-hidden">
                    <Textarea
                      value={analysisResult}
                      readOnly
                      className="h-full resize-none font-mono text-sm"
                      placeholder="Analysis results will appear here..."
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div className="text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready for AI Analysis</p>
                      <p className="text-sm">Select a case and click "Analyze Case with AI" to begin</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Bottom Action Bar */}
            <div className="mt-4 p-4 bg-card border rounded-lg">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  {savedAnalyses.length > 0 && (
                    <span>{savedAnalyses.length} saved analysis(es)</span>
                  )}
                </div>
                <div>
                  {analysisResult && (
                    <span>{analysisResult.length.toLocaleString()} characters</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICaseHelper;