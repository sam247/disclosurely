
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, Upload, File, Trash2, FileText, GripVertical, Eye } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitizer';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { auditLogger } from '@/utils/auditLogger';
import { PIIPreviewModal } from '@/components/PIIPreviewModal';

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
  const [hasRunInitialAnalysis, setHasRunInitialAnalysis] = useState(false); // Track if initial analysis is done
  const [currentSavedAnalysisId, setCurrentSavedAnalysisId] = useState<string | null>(null); // Track current saved analysis
  const [showPIIPreview, setShowPIIPreview] = useState(false); // PII preview modal
  const [previewContent, setPreviewContent] = useState<string>(''); // Content for PII preview
  const [isLoadingPreview, setIsLoadingPreview] = useState(false); // Loading state for preview
  const [hasViewedPreview, setHasViewedPreview] = useState(false); // Track if user has previewed current case
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
  }, [reportId]);

  // Load saved analyses when organization is available
  useEffect(() => {
    if (organization?.id) {
      loadSavedAnalyses();
    }
  }, [organization?.id]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
        .neq('status', 'archived') // Load all cases except archived
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
      toast({
        title: "Error",
        description: "Failed to load cases.",
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

  const deleteSavedAnalysis = async (analysisId: string, trackingId: string) => {
    try {
      const { error } = await supabase
        .from('ai_case_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      // Clear current selection if deleting the current one
      if (currentSavedAnalysisId === analysisId) {
        setCurrentSavedAnalysisId(null);
      }

      toast({
        title: "✅ Analysis Deleted",
        description: `Deleted analysis for ${trackingId}`
      });

      // Reload the list
      loadSavedAnalyses();
    } catch (error) {
      console.error('Error deleting saved analysis:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete analysis. Please try again.",
        variant: "destructive"
      });
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
            console.log(`[PDF Extract] Starting extraction for: ${doc.name}`);
            const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-pdf-text', {
              body: { filePath: doc.file_path }
            });

            if (extractError) {
              console.error(`[PDF Extract] Error for ${doc.name}:`, extractError);
              throw extractError;
            }

            const extractedText = extractData.text || '';
            console.log(`[PDF Extract] SUCCESS! Extracted ${extractedText.length} chars from ${doc.name}`);
            console.log(`[PDF Extract] Preview: ${extractedText.substring(0, 200)}...`);

            companyDocuments.push({
              name: doc.name,
              content: extractedText || `[PDF Document: ${doc.name}]`
            });

            // Show toast to user
            toast({
              title: `📄 ${doc.name}`,
              description: `Extracted ${extractedText.length.toLocaleString()} characters`
            });
          } catch (error) {
            console.error(`[PDF Extract] Failed for ${doc.name}:`, error);
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

      // Invoke AI analysis with decrypted content (FULL analysis, no follow-up context)
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
          customPrompt: undefined // No custom prompt for initial analysis
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

      // Mark that initial analysis is complete
      setHasRunInitialAnalysis(true);

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
            is_follow_up: false // Initial analysis, not a follow-up
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

      // Reload saved analyses first
      await loadSavedAnalyses();
      
      toast({
        title: "✅ Analysis Saved",
        description: "You can view it in the 'Saved Analyses' dropdown."
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

  const loadPreviewContent = async () => {
    if (!selectedCaseId) return;

    setIsLoadingPreview(true);
    try {
      // Fetch case data
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', selectedCaseId)
        .single();

      if (caseError) throw caseError;

      // Decrypt the report content
      let decryptedContent = '';
      if (caseData.encrypted_content && caseData.organization_id) {
        try {
          const { decryptReport } = await import('@/utils/encryption');
          const decrypted = await decryptReport(caseData.encrypted_content, caseData.organization_id);
          decryptedContent = `Category: ${decrypted.category || 'Not specified'}

Description: ${decrypted.description || 'Not provided'}

Location: ${decrypted.location || 'Not specified'}

Date of Incident: ${decrypted.dateOfIncident || 'Not specified'}

Witnesses: ${decrypted.witnesses || 'None mentioned'}

Evidence: ${decrypted.evidence || 'No evidence provided'}

Additional Details: ${decrypted.additionalDetails || 'None provided'}`;
        } catch (decryptError) {
          console.error('Error decrypting case content:', decryptError);
          decryptedContent = '[Case content is encrypted and could not be decrypted]';
        }
      } else {
        decryptedContent = '[No case content available]';
      }

      // Build preview content
      let fullContent = `Case: ${caseData.title}\n\n${decryptedContent}`;
      
      // Add document info
      if (selectedDocs.length > 0) {
        const docNames = selectedDocs.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return doc ? doc.name : 'Unknown';
        }).join(', ');
        fullContent += `\n\nDocuments to be analyzed: ${docNames}`;
      }

      setPreviewContent(fullContent);
      setShowPIIPreview(true);
      setHasViewedPreview(true); // Mark preview as viewed for this case
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: "Preview Failed",
        description: "Failed to load case content for preview.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
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

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message to chat
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsChatting(true); // Use different state for chat vs analysis
    
    console.log('[Chat] Sending follow-up message:', userMessage);

    try {
      // Build chat context (last 4 messages for brevity)
      const recentMessages = chatMessages.slice(-4).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      recentMessages.push({
        role: 'user',
        content: userMessage
      });

      // Call AI Gateway directly for conversational follow-up
      const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are a compliance consultant having a conversational chat with a case handler. 

Context: You previously analyzed a case titled "${selectedCaseData?.title || 'a compliance case'}". The user is now asking follow-up questions.

Guidelines:
- Provide SHORT, conversational responses (2-3 paragraphs max)
- NO headings, NO bullet points, NO structured analysis - just natural conversation
- Be direct and helpful, like chatting with a colleague
- Only structure information if the user explicitly asks you to list or format something
- Reference the case context when relevant`
            },
            ...recentMessages
          ],
          temperature: 0.7,
          max_tokens: 500, // Shorter for chat
          context: {
            purpose: 'chat_follow_up',
            report_id: selectedCaseId
          }
        },
        headers: {
          'X-Organization-Id': organization?.id || ''
        }
      });

      if (error) {
        console.error('[Chat] Edge Function error:', error);
        throw error;
      }

      // Parse AI Gateway response
      if (!data || !data.choices || !data.choices[0]?.message?.content) {
        console.error('[Chat] Invalid response format:', data);
        throw new Error('No response from AI');
      }

      const aiResponse = data.choices[0].message.content;
      console.log('[Chat] AI response received:', aiResponse.substring(0, 100) + '...');
      
      // Log PII redaction if any
      if (data.metadata?.pii_redacted) {
        console.log('[Chat] PII redacted in chat:', data.metadata.pii_stats);
      }

      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('[Chat] Error sending chat message:', error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChatting(false);
    }
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
          className="bg-white border-r flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Start Guide */}
            {!hasRunInitialAnalysis && chatMessages.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Quick Start Guide</p>
                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Select a case from the dropdown below</li>
                      <li>Click <strong>"Preview"</strong> to see what PII will be redacted</li>
                      <li>Click <strong>"Analyze"</strong> to get AI compliance guidance</li>
                      <li>Use the chat to ask follow-up questions</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Analyses - Always visible */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-green-700">📁 Saved Analyses {savedAnalyses.length > 0 && `(${savedAnalyses.length})`}</label>
              <Select value={currentSavedAnalysisId || ""} onValueChange={(value) => {
                  const saved = savedAnalyses.find(s => s.id === value);
                  if (saved) {
                    // Load the saved analysis into chat
                    setChatMessages([{
                      role: 'assistant',
                      content: saved.analysis_content,
                      timestamp: new Date(saved.created_at)
                    }]);
                    
                    // Find and select the case it was for
                    const relatedCase = newCases.find(c => c.tracking_id === saved.tracking_id);
                    if (relatedCase) {
                      setSelectedCaseId(relatedCase.id);
                      setSelectedCaseData(relatedCase);
                    }
                    
                    // Mark as having run initial analysis and track the saved ID
                    setHasRunInitialAnalysis(true);
                    setCurrentSavedAnalysisId(value);
                    
                    toast({
                      title: "✅ Loaded Saved Analysis",
                      description: `${saved.tracking_id} - ${saved.case_title}`
                    });
                  }
                }} disabled={savedAnalyses.length === 0}>
                  <SelectTrigger className="border-green-200 bg-green-50">
                    <SelectValue placeholder={savedAnalyses.length === 0 ? "No saved analyses yet" : "Load a previous analysis..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAnalyses.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        No saved analyses yet. Complete an analysis and click "Save Analysis" to save it.
                      </div>
                    ) : (
                      savedAnalyses.map((saved) => (
                      <SelectItem key={saved.id} value={saved.id}>
                        <div className="flex items-center justify-between w-full group">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{saved.tracking_id}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(saved.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSavedAnalysis(saved.id, saved.tracking_id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))
                    )}
                  </SelectContent>
                </Select>
            </div>

            {/* Case Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Case</label>
              <Select value={selectedCaseId} onValueChange={(value) => {
                setSelectedCaseId(value);
                const selectedCase = newCases.find(c => c.id === value);
                setSelectedCaseData(selectedCase || null);
                // Only clear if switching to a different case
                if (value !== selectedCaseId) {
                  setAnalysis('');
                  setChatMessages([]);
                  setHasRunInitialAnalysis(false);
                  setCurrentSavedAnalysisId(null);
                  setHasViewedPreview(false); // Reset preview flag when switching cases
                }
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

          </div> {/* End scrollable area */}

          {/* Sticky Bottom Section - Security Notice + Buttons */}
          <div className="p-4 border-t bg-white space-y-3 flex-shrink-0">
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

          {/* Preview + Analyze Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={loadPreviewContent}
              disabled={!selectedCaseId || isLoadingPreview}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isLoadingPreview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={() => analyzeCase()}
              disabled={isAnalyzing || !selectedCaseId || !hasViewedPreview}
              className="flex-1"
              size="lg"
              title={!hasViewedPreview ? "Please preview the case first" : ""}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {hasRunInitialAnalysis ? 'Re-Analyze' : 'Analyze'}
                </>
              )}
            </Button>
          </div>
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
                disabled={isChatting || isAnalyzing || !selectedCaseId}
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
                disabled={isChatting || isAnalyzing || !chatInput.trim() || !selectedCaseId}
                size="lg"
                className="self-end"
              >
                {isChatting ? (
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

      {/* PII Preview Modal */}
      {showPIIPreview && selectedCaseData && (
        <PIIPreviewModal
          originalText={previewContent}
          caseTitle={selectedCaseData.title}
          onConfirm={() => {
            setShowPIIPreview(false);
            analyzeCase(); // Proceed with actual analysis
          }}
          onCancel={() => setShowPIIPreview(false)}
        />
      )}
    </div>
  );
};

export default AICaseHelper;
