import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Loader2, 
  X, 
  Send, 
  Search, 
  Brain, 
  Upload, 
  FileText,
  Eye,
  Save,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/utils';
import { detectIntent, extractCaseId, getSuggestedQueries, QueryIntent } from '@/utils/intentDetection';
import { PIIPreviewModal } from '@/components/PIIPreviewModal';
import { decryptReport } from '@/utils/encryption';
import { auditLogger } from '@/utils/auditLogger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { sanitizeHtml } from '@/utils/sanitizer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cases?: Array<{
    id: string;
    tracking_id: string;
    title: string;
    status: string;
    priority: number;
    created_at: string;
    similarity?: number;
  }>;
  mode?: 'rag' | 'deep-dive';
  timestamp: Date;
}

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

const AIAssistantView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(true);
  const [currentMode, setCurrentMode] = useState<'rag' | 'deep-dive' | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedCaseData, setSelectedCaseData] = useState<any>(null);
  const [cases, setCases] = useState<NewCase[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [showPIIPreview, setShowPIIPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for caseId in URL params (from case card clicks)
  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (caseId) {
      setSelectedCaseId(caseId);
      setCurrentMode('deep-dive');
      loadCaseData(caseId);
    }
  }, [searchParams]);

  // Load cases and documents on mount
  useEffect(() => {
    if (user) {
      loadCases();
      loadDocuments();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update empty state
  useEffect(() => {
    setIsEmptyState(messages.length === 0 && !selectedCaseId);
  }, [messages, selectedCaseId]);

  const loadCases = async () => {
    if (!user) return;
    
    setIsLoadingCases(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, tracking_id, title, status, created_at, priority')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setIsLoadingCases(false);
    }
  };

  const loadCaseData = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      setSelectedCaseData(data);
    } catch (error) {
      console.error('Error loading case data:', error);
      toast({
        title: "Error",
        description: "Failed to load case data.",
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
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleQuery = async (query: string) => {
    if (!query.trim() || isLoading || !organization?.id) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Detect intent
      const intent = detectIntent(query, { selectedCaseId });
      const caseIdFromQuery = extractCaseId(query);
      
      // If case ID found in query, switch to deep-dive mode
      if (caseIdFromQuery) {
        const matchingCase = cases.find(c => 
          c.tracking_id.toLowerCase() === caseIdFromQuery.toLowerCase() ||
          c.id === caseIdFromQuery
        );
        if (matchingCase) {
          setSelectedCaseId(matchingCase.id);
          setCurrentMode('deep-dive');
          await loadCaseData(matchingCase.id);
        }
      }

      // Determine mode
      let mode: 'rag' | 'deep-dive' = currentMode || (intent === 'deep-dive' ? 'deep-dive' : 'rag');
      
      // If we have a selected case and intent is ambiguous, default to deep-dive
      if (intent === 'ambiguous' && selectedCaseId) {
        mode = 'deep-dive';
      } else if (intent === 'deep-dive' || caseIdFromQuery) {
        mode = 'deep-dive';
      } else {
        mode = 'rag';
      }

      setCurrentMode(mode);

      if (mode === 'rag') {
        // RAG search mode
        const { data, error } = await supabase.functions.invoke('rag-case-query', {
          body: {
            query: query.trim(),
            organizationId: organization.id
          }
        });

        if (error) throw error;

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response || 'No response generated',
          cases: data.cases || [],
          mode: 'rag',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Deep-dive analysis mode
        if (!selectedCaseId) {
          toast({
            title: "No Case Selected",
            description: "Please select a case or mention a case ID in your query.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Get case data if not already loaded
        if (!selectedCaseData) {
          await loadCaseData(selectedCaseId);
        }

        // Decrypt case content
        let decryptedContent = '';
        if (selectedCaseData?.encrypted_content && selectedCaseData?.organization_id) {
          try {
            const decrypted = await decryptReport(selectedCaseData.encrypted_content, selectedCaseData.organization_id);
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
            decryptedContent = '[Case content is encrypted and could not be decrypted]';
          }
        }

        // Process selected documents
        const companyDocuments = [];
        for (const docId of selectedDocs) {
          const doc = documents.find(d => d.id === docId);
          if (doc && doc.content_type === 'application/pdf') {
            try {
              const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-pdf-text', {
                body: { filePath: doc.file_path }
              });

              if (!extractError && extractData?.text) {
                companyDocuments.push({
                  name: doc.name,
                  content: extractData.text
                });
              }
            } catch (error) {
              console.error(`Error extracting PDF ${doc.name}:`, error);
            }
          }
        }

        // Check if this is a follow-up question or initial analysis
        const isFollowUp = messages.length > 0 && currentMode === 'deep-dive';
        
        let analysisResponse;
        if (isFollowUp) {
          // Follow-up chat message
          const recentMessages = messages.slice(-4).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          recentMessages.push({ role: 'user', content: query.trim() });

          const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
            body: {
              messages: [
                {
                  role: 'system',
                  content: `You are a compliance consultant having a conversational chat about case "${selectedCaseData?.title || 'a compliance case'}". Provide SHORT, conversational responses (2-3 paragraphs max). NO headings, NO bullet points - just natural conversation.`
                },
                ...recentMessages
              ],
              temperature: 0.7,
              max_tokens: 500,
              context: {
                purpose: 'chat_follow_up',
                report_id: selectedCaseId
              }
            },
            headers: {
              'X-Organization-Id': organization.id
            }
          });

          if (error) throw error;
          analysisResponse = data.response || data.content || 'No response generated';
        } else {
          // Initial analysis
          const { data, error } = await supabase.functions.invoke('analyze-case-with-ai', {
            body: {
              caseData: {
                id: selectedCaseData.id,
                title: selectedCaseData.title,
                status: selectedCaseData.status,
                created_at: selectedCaseData.created_at,
                priority: selectedCaseData.priority,
                tracking_id: selectedCaseData.tracking_id,
                report_type: selectedCaseData.report_type
              },
              caseContent: decryptedContent,
              companyDocuments,
              customPrompt: query.trim()
            }
          });

          if (error) throw error;
          analysisResponse = data.analysis || 'No analysis generated';

          // Store for saving
          setCurrentAnalysisData({
            caseData: selectedCaseData,
            customPrompt: query.trim(),
            companyDocuments,
            analysis: analysisResponse
          });
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: analysisResponse,
          mode: 'deep-dive',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Log analysis event
        if (user && organization?.id) {
          await auditLogger.log({
            eventType: 'case.ai_analysis',
            category: 'case_management',
            action: isFollowUp ? 'chat' : 'analyze',
            severity: 'low',
            actorType: 'user',
            actorId: user.id,
            actorEmail: user.email,
            organizationId: organization.id,
            targetType: 'case',
            targetId: selectedCaseId,
            targetName: selectedCaseData?.title,
            summary: `AI ${isFollowUp ? 'chat' : 'analysis'} on case: ${selectedCaseData?.title}`,
            metadata: {
              is_follow_up: isFollowUp,
              documents_analyzed: companyDocuments.length
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error processing query:', error);
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process query. Please try again.",
        variant: "destructive",
      });

      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseCardClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentMode('deep-dive');
    loadCaseData(caseId);
    
    // Add system message to chat
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Switched to analyzing case ${caseData.tracking_id}. Ask me anything about this case.`,
        mode: 'deep-dive',
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ai-helper-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadPreviewContent = async () => {
    if (!selectedCaseId) return;

    setIsLoadingPreview(true);
    try {
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', selectedCaseId)
        .single();

      if (caseError) throw caseError;

      let decryptedContent = '';
      if (caseData.encrypted_content && caseData.organization_id) {
        try {
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
      }

      let fullContent = `Case: ${caseData.title}\n\n${decryptedContent}`;
      
      if (selectedDocs.length > 0) {
        const docNames = selectedDocs.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return doc ? doc.name : 'Unknown';
        }).join(', ');
        fullContent += `\n\nDocuments to be analyzed: ${docNames}`;
      }

      setPreviewContent(fullContent);
      setShowPIIPreview(true);
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

  const saveAnalysis = async () => {
    if (!currentAnalysisData || !organization?.id || !selectedCaseId) {
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
        description: "Analysis has been saved successfully."
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

  const handleClearChat = () => {
    setMessages([]);
    setSelectedCaseId('');
    setSelectedCaseData(null);
    setCurrentMode(null);
    setCurrentAnalysisData(null);
    setIsEmptyState(true);
    navigate('/dashboard/ai-assistant');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery(inputQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleQuery(suggestion);
  };

  // Empty State UI
  if (isEmptyState) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Ask questions about your cases or get detailed analysis. I'll automatically understand what you need.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="flex gap-2">
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or analyze a case..."
                className="h-12 text-base"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleQuery(inputQuery)}
                disabled={!inputQuery.trim() || isLoading}
                size="lg"
                className="h-12 px-6"
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Or try one of these:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getSuggestedQueries(null).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface UI
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            {currentMode && (
              <Badge variant={currentMode === 'rag' ? 'secondary' : 'default'}>
                {currentMode === 'rag' ? 'Search Mode' : 'Analysis Mode'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {currentMode === 'rag' 
              ? 'Searching across all cases' 
              : selectedCaseData 
                ? `Analyzing: ${selectedCaseData.tracking_id}`
                : 'Query and analyze your cases'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentMode === 'deep-dive' && selectedCaseId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPreviewContent}
                disabled={isLoadingPreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview PII
              </Button>
              {currentAnalysisData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveAnalysis}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Analysis
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={handleClearChat}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Case Selection (for deep-dive mode) */}
      {currentMode === 'deep-dive' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Select value={selectedCaseId} onValueChange={(value) => {
                  setSelectedCaseId(value);
                  loadCaseData(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case to analyze..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((caseItem) => (
                      <SelectItem key={caseItem.id} value={caseItem.id}>
                        {caseItem.tracking_id} - {caseItem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Policy'}
                </Button>
                {selectedDocs.length > 0 && (
                  <Badge variant="secondary">
                    {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} selected
                  </Badge>
                )}
              </div>
            </div>
            {documents.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Available documents:</p>
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc) => (
                    <Button
                      key={doc.id}
                      variant={selectedDocs.includes(doc.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedDocs(prev => 
                          prev.includes(doc.id) 
                            ? prev.filter(id => id !== doc.id)
                            : [...prev, doc.id]
                        );
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {doc.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="h-[calc(100vh-300px)] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className="max-w-[85%] space-y-3">
                  <div
                    className={cn(
                      'rounded-lg px-5 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border'
                    )}
                  >
                    {message.role === 'assistant' && message.mode === 'deep-dive' ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(formatMarkdownToHtml(message.content)) 
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">
                        {message.content}
                      </p>
                    )}
                    <p className={cn(
                      'text-xs mt-2',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Case Cards for RAG responses */}
                  {message.role === 'assistant' && message.cases && message.cases.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {message.cases.map((caseData) => (
                        <div
                          key={caseData.id}
                          onClick={() => handleCaseCardClick(caseData.id)}
                          className="cursor-pointer"
                        >
                          <CaseCard
                            caseId={caseData.id}
                            trackingId={caseData.tracking_id}
                            title={caseData.title}
                            status={caseData.status}
                            priority={caseData.priority}
                            created_at={caseData.created_at}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {currentMode === 'rag' ? 'Searching your cases...' : 'Analyzing case...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentMode === 'deep-dive' 
                    ? "Ask a follow-up question about this case..."
                    : "Ask a question about your cases..."
                }
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleQuery(inputQuery)}
                disabled={!inputQuery.trim() || isLoading}
                size="default"
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI • Your queries are logged for audit purposes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PII Preview Modal */}
      {showPIIPreview && selectedCaseData && (
        <PIIPreviewModal
          originalText={previewContent}
          caseTitle={selectedCaseData.title}
          onConfirm={() => {
            setShowPIIPreview(false);
            // Continue with analysis
          }}
          onCancel={() => setShowPIIPreview(false)}
        />
      )}
    </div>
  );
};

export default AIAssistantView;

