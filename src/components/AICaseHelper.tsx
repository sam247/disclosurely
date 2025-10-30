
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, Upload, File, Trash2, FileText, GripVertical } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitizer';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { auditLogger } from '@/utils/auditLogger';

interface NewCase {
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
  const [selectedCaseData, setSelectedCaseData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [newCases, setNewCases] = useState<NewCase[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // Default 30% width
  const [isResizing, setIsResizing] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (reportId) {
      setSelectedCaseId(reportId);
    }
    loadNewCases();
    loadDocuments();
    loadSavedAnalyses();
  }, [reportId]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAnalyzing]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 50%
      if (newWidth >= 20 && newWidth <= 50) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const loadNewCases = async () => {
    if (!user) return;
    
    setIsLoadingCases(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, tracking_id, title, status, created_at, priority')
        .eq('status', 'new')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewCases(data || []);
    } catch (error) {
      console.error('Error loading new cases:', error);
      toast({
        title: "Error",
        description: "Failed to load new cases.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCases(false);
    }
  };

  const loadSavedAnalyses = async () => {
    if (!organization?.id) return;
    
    setIsLoadingSaved(true);
    try {
      const { data, error } = await supabase
        .from('ai_case_analyses')
        .select('id, case_title, tracking_id, analysis_content, created_at')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedAnalyses(data || []);
    } catch (error) {
      console.error('Error loading saved analyses:', error);
    } finally {
      setIsLoadingSaved(false);
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

  const analyzeCase = async () => {
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

    // Add user message to chat if there's a custom prompt
    const userMessage = customPrompt.trim();
    if (userMessage) {
      setChatMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }]);
      setCustomPrompt(''); // Clear the input
    }

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
          const decrypted = await decryptReport(caseData.encrypted_content, caseData.organization_id);
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
      setAnalysisProgress(60);
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
              content: extractData.text || `[PDF Document: ${doc.name}]`
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

      // Prepare chat context for follow-up questions
      const chatContext = chatMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const isFollowUp = chatMessages.length > 0 || userMessage;

      // Invoke AI analysis with decrypted content
      setAnalysisProgress(80);
      const { data, error } = await supabase.functions.invoke('analyze-case-with-ai', {
        body: {
          caseData: {
            id: caseData.id, // CRITICAL: needed for AI Gateway org lookup
            title: caseData.title,
            status: caseData.status,
            created_at: caseData.created_at,
            priority: caseData.priority,
            tracking_id: caseData.tracking_id,
            report_type: caseData.report_type
          },
          caseContent: decryptedContent,
          companyDocuments,
          customPrompt: isFollowUp ? 
            `This is ${userMessage ? 'a new question' : 'a follow-up'} about the case. Previous conversation:\n${chatContext}\n\n${userMessage ? `User's question: ${userMessage}` : 'Please provide additional analysis or clarification.'}\n\nPlease provide a helpful response, keeping the same conversational tone.` :
            undefined
        }
      });

      if (error) throw error;

      setAnalysisProgress(100);
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.analysis,
        timestamp: new Date()
      }]);

      // Store current analysis data for saving
      setCurrentAnalysisData({
        caseData,
        customPrompt: userMessage,
        companyDocuments,
        analysis: data.analysis
      });

      // Set the main analysis for the first time
      if (!analysis) {
        setAnalysis(data.analysis);
      }

      // Log AI analysis event
      if (user && organization?.id) {
        await auditLogger.log({
          eventType: 'case.ai_analysis',
          category: 'case_management',
          action: 'analyze',
          severity: 'low',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: organization.id,
          targetType: 'case',
          targetId: selectedCaseId,
          targetName: caseData.title,
          summary: `AI analysis performed on case: ${caseData.title}`,
          metadata: {
            has_custom_prompt: !!userMessage,
            documents_analyzed: companyDocuments.length,
            is_follow_up: isFollowUp
          }
        });
      }

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
        title: "✅ Analysis Saved",
        description: "You can view it in the 'Saved Analyses' dropdown."
      });
      
      // Reload saved analyses
      loadSavedAnalyses();
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

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedCaseId) {
      toast({
        title: "Cannot Send Message",
        description: "Please select a case first.",
        variant: "destructive",
      });
      return;
    }

    // Set the custom prompt and trigger analysis
    setCustomPrompt(chatInput.trim());
    setChatInput('');
    
    // Trigger the analyzeCase function which will handle the chat
    await analyzeCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Compliance Consultant</h1>
            <p className="text-xs text-muted-foreground">Expert guidance for case analysis and compliance decisions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">AI Credits:</span>
          <span className="font-mono">∞</span>
        </div>
      </div>

      {/* Resizable Panel Layout */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden bg-gray-50" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
        {/* Left Panel - Controls */}
        <div 
          className="bg-white border-r overflow-y-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="p-4 space-y-4">
            {/* Saved Analyses */}
            {savedAnalyses.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-700">📁 Saved Analyses</label>
                <Select onValueChange={(value) => {
                  const saved = savedAnalyses.find(s => s.id === value);
                  if (saved) {
                    setChatMessages([{
                      role: 'assistant',
                      content: saved.analysis_content,
                      timestamp: new Date(saved.created_at)
                    }]);
                    toast({
                      title: "Loaded Saved Analysis",
                      description: `${saved.tracking_id} - ${saved.case_title}`
                    });
                  }
                }}>
                  <SelectTrigger className="border-green-200 bg-green-50">
                    <SelectValue placeholder="Load a previous analysis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAnalyses.map((saved) => (
                      <SelectItem key={saved.id} value={saved.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{saved.tracking_id}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(saved.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Case Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Case</label>
              <Select value={selectedCaseId} onValueChange={(value) => {
                setSelectedCaseId(value);
                const selectedCase = newCases.find(c => c.id === value);
                setSelectedCaseData(selectedCase || null);
                // Clear previous analysis and chat when switching cases
                setAnalysis('');
                setChatMessages([]);
              }} disabled={isLoadingCases}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCases ? "Loading cases..." : "Choose a new case"} />
                </SelectTrigger>
                <SelectContent>
                  {newCases.map((case_) => (
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Company Documents</label>
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
                <div className="text-xs text-muted-foreground">Loading documents...</div>
              ) : documents.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          onCheckedChange={() => toggleDocSelection(doc.id)}
                        />
                        {doc.content_type === 'application/pdf' ? (
                          <FileText className="h-3 w-3 text-red-500 flex-shrink-0" />
                        ) : (
                          <File className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDocument(doc)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4 bg-gray-50 rounded border border-dashed">
                  Upload policy documents to provide context
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-green-600 mt-0.5">🔒</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-900 mb-1">Privacy Protected</p>
                  <p className="text-xs text-green-700">
                    PII automatically redacted • Zero data retention • Encrypted processing
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <Button
                onClick={() => analyzeCase()}
                disabled={isAnalyzing || !selectedCaseId}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
              {isAnalyzing && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{analysisProgress}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-200 hover:bg-primary cursor-col-resize flex items-center justify-center group relative"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute inset-y-0 -inset-x-2" /> {/* Larger hit area */}
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-primary absolute" />
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Messages - Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground max-w-md">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Brain className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Compliance Consultant Ready</h3>
                  <p className="text-sm mb-4">Select a case and click "Start Analysis" to begin. I'll provide expert guidance on compliance, risk assessment, and next steps.</p>
                  <div className="text-xs text-left bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-blue-900">I can help with:</p>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>GDPR & data privacy compliance</li>
                      <li>Risk assessment & mitigation</li>
                      <li>Investigation procedures</li>
                      <li>Regulatory guidance</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white border'
                    }`}>
                      <div className="p-4">
                        <div 
                          className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}
                          dangerouslySetInnerHTML={{ 
                            __html: sanitizeHtml(formatMarkdownToHtml(message.content))
                          }}
                        />
                      </div>
                      <div className={`px-4 pb-2 text-xs ${
                        message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      }`}>
                        {message.role === 'assistant' && '🤖 AI Consultant • '}
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-xl shadow-sm p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analyzing case and preparing guidance...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask a follow-up question or request specific guidance..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isAnalyzing || !selectedCaseId}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-white"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <Button
                onClick={sendChatMessage}
                disabled={isAnalyzing || !chatInput.trim() || !selectedCaseId}
                size="lg"
                className="self-end"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
            {chatMessages.length > 0 && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={saveAnalysis}
                  disabled={isSaving}
                  size="sm"
                  variant="outline"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Analysis'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICaseHelper;
