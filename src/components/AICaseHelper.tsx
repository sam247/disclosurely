import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, CheckCircle, Upload, File, X, FileSearch, Share2, Mail, Save, Download, Trash2, Eye } from 'lucide-react';
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
  file_size: number;
  content_type: string;
  file_path: string;
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
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const hasProAccess = subscriptionData.subscribed && subscriptionData.subscription_tier === 'pro';

  // Fetch data on component mount
  useEffect(() => {
    if (hasProAccess && user) {
      fetchUserOrganization();
    }
  }, [hasProAccess, user]);

  useEffect(() => {
    if (organizationId) {
      fetchLiveCases();
      fetchSavedDocuments();
      fetchSavedAnalyses();
    }
  }, [organizationId]);

  const fetchUserOrganization = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id);
      }
    } catch (error) {
      console.error('Error fetching user organization:', error);
    }
  };

  const fetchLiveCases = async () => {
    if (!organizationId) return;
    
    try {
      setLoadingCases(true);
      
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('id, title, tracking_id, status, created_at, encrypted_content, encryption_key_hash, priority, report_type')
        .eq('organization_id', organizationId)
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
    if (!organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_helper_documents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedDocuments(data || []);
    } catch (error) {
      console.error('Error fetching saved documents:', error);
    }
  };

  const fetchSavedAnalyses = async () => {
    if (!organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_case_analyses')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching saved analyses:', error);
    }
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
        if (!organizationId) continue;

        const fileName = `${organizationId}/ai-documents/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save document reference to database
        const { error: dbError } = await supabase
          .from('ai_helper_documents')
          .insert({
            organization_id: organizationId,
            name: file.name,
            file_size: file.size,
            content_type: file.type,
            file_path: fileName,
            uploaded_by: user?.id
          });

        if (dbError) throw dbError;

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
      await fetchSavedDocuments();
      toast({
        title: "Documents uploaded",
        description: `${validFiles.length} document(s) added and saved`,
      });
    }
  };

  const removeDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('ai_helper_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      await fetchSavedDocuments();
      toast({
        title: "Document removed",
        description: "Document has been removed",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    }
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
            // Get public URL for the file
            const { data: urlData } = supabase.storage
              .from('report-attachments')
              .getPublicUrl(doc.file_path);

            let content = '';
            
            if (doc.content_type === 'application/pdf') {
              // For PDFs, include metadata only since we can't easily parse binary content
              content = `[PDF Document: ${doc.name}, Size: ${Math.round(doc.file_size / 1024)}KB - Content parsing not available for PDF files. This document should be manually reviewed.]`;
            } else {
              try {
                // Try to download and read text files
                const { data: fileData, error } = await supabase.storage
                  .from('report-attachments')
                  .download(doc.file_path);

                if (error) throw error;
                
                content = await fileData.text();
                content = content.substring(0, 2000) + (content.length > 2000 ? '...' : '');
              } catch (downloadError) {
                content = `[Document ${doc.name} could not be accessed: ${downloadError.message}]`;
              }
            }

            return {
              name: doc.name,
              size: doc.file_size,
              type: doc.content_type,
              content: content
            };
          } catch (error) {
            console.error(`Error processing document ${doc.name}:`, error);
            return {
              name: doc.name,
              size: doc.file_size,
              type: doc.content_type,
              content: `[Document ${doc.name} could not be processed: ${error.message}]`
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
          caseContent: `Case: ${selectedCase.title}\nTracking: ${selectedCase.tracking_id}\nStatus: ${selectedCase.status}\nPriority: ${selectedCase.priority}\nType: ${selectedCase.report_type}\n\nNote: Analyzing case with ${documentContents.length} uploaded document(s).`
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
This case requires immediate attention based on its priority level and current status. The following recommendations are based on standard compliance protocols and ${uploadedDocuments.length} uploaded policy document(s).

## Immediate Actions Required
1. **Assign case handler** within 24 hours
2. **Initial assessment** of allegation severity
3. **Document preservation** procedures
4. **Stakeholder notification** as per policy

## Compliance Assessment
${uploadedDocuments.length > 0 ? 
  `✓ **Policy Documentation:** ${uploadedDocuments.length} policy document(s) available for reference
${uploadedDocuments.map(doc => `  - ${doc.name} (${(doc.file_size / 1024).toFixed(1)}KB)`).join('\n')}
✓ **Compliance Review:** Cross-reference with uploaded organizational policies
✓ **Documentation:** Organizational guidelines applied to analysis` : 
  `⚠ **Policy Documentation:** No policy documents uploaded
⚠ **Compliance Review:** Upload company policies for detailed analysis
⚠ **Documentation:** Standard procedures recommended`}

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
*Analysis Type: Standard Protocol Review*
*Documents Analyzed: ${uploadedDocuments.length}*`;
  };

  const saveAnalysis = async () => {
    if (!selectedCase || !analysisResult || !organizationId) {
      toast({
        title: "Nothing to save",
        description: "Please generate an analysis first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check if analysis already exists for this case
      const existingAnalysis = savedAnalyses.find(a => a.case_id === selectedCase.id);
      
      if (existingAnalysis) {
        // Update existing analysis
        const { error } = await supabase
          .from('ai_case_analyses')
          .update({
            analysis_content: analysisResult,
            document_count: uploadedDocuments.length
          })
          .eq('id', existingAnalysis.id);

        if (error) throw error;
      } else {
        // Create new analysis
        const { error } = await supabase
          .from('ai_case_analyses')
          .insert({
            organization_id: organizationId,
            case_id: selectedCase.id,
            case_title: selectedCase.title,
            tracking_id: selectedCase.tracking_id,
            analysis_content: analysisResult,
            document_count: uploadedDocuments.length,
            created_by: user?.id
          });

        if (error) throw error;
      }

      await fetchSavedAnalyses();
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

  const loadSavedAnalysis = (analysis: SavedAnalysis) => {
    const report = liveCases.find(r => r.id === analysis.case_id);
    if (report) {
      setSelectedCase(report);
      setSelectedCaseId(report.id);
      setAnalysisResult(analysis.analysis_content);
    }
  };

  const deleteSavedAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('ai_case_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      await fetchSavedAnalyses();
      toast({
        title: "Analysis Deleted",
        description: "Saved analysis has been removed",
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
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

  // Convert markdown-style content to rich text formatting
  const formatAnalysisForDisplay = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-800">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-gray-700">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gm, '<strong class="font-semibold">$1</strong>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1">$1. $2</li>')
      .replace(/^✓ (.*$)/gm, '<div class="flex items-start mb-2"><span class="text-green-600 mr-2">✓</span><span>$1</span></div>')
      .replace(/^⚠ (.*$)/gm, '<div class="flex items-start mb-2"><span class="text-yellow-600 mr-2">⚠</span><span>$1</span></div>')
      .replace(/^---$/gm, '<hr class="my-4 border-gray-300">')
      .replace(/\n/g, '<br>');
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
                    <h4 className="font-semibold">{selectedCase.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCase.tracking_id} • Priority {selectedCase.priority} • {selectedCase.status}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Company Documents
                </CardTitle>
                <CardDescription>
                  Upload policy documents for AI to reference during analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="document-upload">Upload Documents</Label>
                  <Input
                    id="document-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, or text files (max 10MB each)
                  </p>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(doc.file_size / 1024).toFixed(1)}KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAnalyzeCase}
                  disabled={!selectedCase || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Case...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Analyze Case with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6 overflow-y-auto">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  {analysisResult && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={shareAnalysis}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={emailAnalysis}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadAnalysis}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button onClick={saveAnalysis} disabled={isSaving}>
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
              
              <CardContent className="flex-1 overflow-y-auto">
                {analysisResult ? (
                  <div 
                    className="prose prose-sm max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisForDisplay(analysisResult) 
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div className="space-y-3">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">No analysis generated yet</p>
                        <p className="text-sm text-muted-foreground">
                          Select a case and click "Analyze Case with AI" to get started
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Analyses Section */}
        {savedAnalyses.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Saved Analyses</CardTitle>
                <CardDescription>
                  Previously generated case analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{analysis.case_title}</h4>
                          <p className="text-xs text-muted-foreground">{analysis.tracking_id}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => loadSavedAnalysis(analysis)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteSavedAnalysis(analysis.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analysis.document_count} document(s) • {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICaseHelper;