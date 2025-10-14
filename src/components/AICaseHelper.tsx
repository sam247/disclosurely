
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, Upload, File, Trash2, FileText } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitizer';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

interface LiveCase {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  created_at: string;
  priority: number;
}

interface CompanyDocument {
  id: string;
  name: string;
  file_path: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

interface AICaseHelperProps {
  reportId?: string;
  reportContent?: string;
}

interface SavedAnalysis {
  id: string;
  case_title: string;
  tracking_id: string;
  analysis_content: string;
  created_at: string;
}

const AICaseHelper: React.FC<AICaseHelperProps> = ({ reportId, reportContent }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [liveCases, setLiveCases] = useState<LiveCase[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (reportId) {
      setSelectedCaseId(reportId);
    }
    loadLiveCases();
    loadDocuments();
  }, [reportId]);

  const loadLiveCases = async () => {
    if (!user) return;
    
    setIsLoadingCases(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, tracking_id, title, status, created_at, priority')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLiveCases(data || []);
    } catch (error) {
      console.error('Error loading live cases:', error);
      toast({
        title: "Error",
        description: "Failed to load live cases.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCases(false);
    }
  };

  const loadDocuments = async () => {
    if (!user) return;
    
    setIsLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('ai_helper_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('ai-helper-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Insert metadata into database
        const { error: dbError } = await supabase
          .from('ai_helper_documents')
          .insert({
            name: file.name,
            file_path: fileName,
            content_type: file.type,
            file_size: file.size,
            uploaded_by: user.id,
            organization_id: organization?.id || ''
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: `${files.length} document(s) uploaded successfully.`
      });

      loadDocuments();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const deleteDocument = async (doc: CompanyDocument) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ai-helper-docs')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('ai_helper_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully."
      });

      loadDocuments();
      setSelectedDocs(prev => prev.filter(id => id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const analyzeCase = async (prompt?: string) => {
    if (!selectedCaseId) {
      toast({
        title: "No Case Selected",
        description: "Please select a case to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    try {
      // Get selected case data
      setAnalysisProgress(20);
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', selectedCaseId)
        .single();

      if (caseError) throw caseError;
      setAnalysisProgress(30);

      // Decrypt the report content for AI analysis
      let decryptedContent = reportContent || '[Case content not available]';
      if (caseData.encrypted_content && caseData.organization_id) {
        try {
          // Import decrypt function dynamically
          const { decryptReport } = await import('@/utils/encryption');
          const decrypted = decryptReport(caseData.encrypted_content, caseData.organization_id);
          decryptedContent = `
Case Details:
- Category: ${decrypted.category || 'Not specified'}
- Description: ${decrypted.description || 'Not provided'}
- Location: ${decrypted.location || 'Not specified'}
- Date of Incident: ${decrypted.dateOfIncident || 'Not specified'}
- Witnesses: ${decrypted.witnesses || 'None mentioned'}
- Evidence: ${decrypted.evidence || 'No evidence provided'}
- Additional Details: ${decrypted.additionalDetails || 'None provided'}
          `.trim();
        } catch (decryptError) {
          console.error('Error decrypting case content:', decryptError);
          decryptedContent = '[Case content is encrypted and could not be decrypted for analysis]';
        }
      }

      // Process selected documents
      setAnalysisProgress(50);
      const companyDocuments = [];
      for (const docId of selectedDocs) {
        const doc = documents.find(d => d.id === docId);
        if (doc && doc.content_type === 'application/pdf') {
          try {
            const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-pdf-text', {
              body: { filePath: doc.file_path }
            });

            if (extractError) throw extractError;

            companyDocuments.push({
              name: doc.name,
              content: extractData.textContent || `[PDF Document: ${doc.name}]`
            });
          } catch (error) {
            console.error(`Error extracting text from ${doc.name}:`, error);
            companyDocuments.push({
              name: doc.name,
              content: `[PDF Document: ${doc.name} - Text extraction failed]`
            });
          }
        } else if (doc) {
          companyDocuments.push({
            name: doc.name,
            content: `[Document: ${doc.name} - ${doc.content_type}]`
          });
        }
      }
      setAnalysisProgress(70);

      // Invoke AI analysis with decrypted content
      setAnalysisProgress(80);
      const { data, error } = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          caseData: {
            title: caseData.title,
            status: caseData.status,
            created_at: caseData.created_at,
            priority: caseData.priority,
            tracking_id: caseData.tracking_id,
            report_type: caseData.report_type
          },
          caseContent: decryptedContent,
          companyDocuments,
          customPrompt: prompt
        }
      });

      if (error) throw error;

      setAnalysisProgress(100);
      setAnalysis(data.analysis);
      
      // Store current analysis data for saving
      setCurrentAnalysisData({
        caseData,
        customPrompt: prompt,
        companyDocuments,
        analysis: data.analysis
      });

      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for this case."
      });
    } catch (error) {
      console.error('Error analyzing case:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive"
      });
      setAnalysisProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomAnalysis = () => {
    if (customPrompt.trim()) {
      analyzeCase(customPrompt);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const saveAnalysis = async () => {
    if (!currentAnalysisData || !organization?.id) {
      toast({
        title: "Cannot Save",
        description: "No analysis available to save.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_case_analyses')
        .insert({
          case_id: selectedCaseId,
          organization_id: organization.id,
          case_title: currentAnalysisData.caseData.title,
          tracking_id: currentAnalysisData.caseData.tracking_id,
          analysis_content: currentAnalysisData.analysis,
          document_count: currentAnalysisData.companyDocuments?.length || 0,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI analysis has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Case Analysis
          </div>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="text-muted-foreground">AI Credits:</span>
            <span className="font-mono text-lg">∞</span>
          </div>
        </CardTitle>
        <CardDescription>
          Select a live case and upload company documents for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Live Case</label>
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId} disabled={isLoadingCases}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingCases ? "Loading cases..." : "Choose a live case"} />
            </SelectTrigger>
            <SelectContent>
              {liveCases.map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{case_.tracking_id}</span>
                    <span className="text-sm text-muted-foreground ml-2">{case_.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Company Documents</label>
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button size="sm" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Document List */}
          {isLoadingDocs ? (
            <div className="text-sm text-muted-foreground">Loading documents...</div>
          ) : documents.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleDocSelection(doc.id)}
                    />
                    <div className="flex items-center space-x-2">
                      {doc.content_type === 'application/pdf' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <File className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDocument(doc)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              No documents uploaded yet. Upload PDFs, Word documents, or text files to include in analysis.
            </div>
          )}
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analysis Progress</span>
              <span className="font-medium">{analysisProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Analysis Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => analyzeCase()}
              disabled={isAnalyzing || !selectedCaseId}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Case'
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Ask a specific question about this case..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleCustomAnalysis}
              disabled={isAnalyzing || !customPrompt.trim() || !selectedCaseId}
              variant="outline"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Custom Analysis'
              )}
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">AI Analysis Results:</h4>
              <Button
                onClick={saveAnalysis}
                disabled={isSaving}
                size="sm"
                variant="outline"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Analysis'
                )}
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtml(formatMarkdownToHtml(analysis))
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICaseHelper;
