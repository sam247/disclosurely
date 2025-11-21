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
  Upload, 
  FileText,
  Eye,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/utils';
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
  }>;
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
  const [hasAnalyzedCase, setHasAnalyzedCase] = useState(false); // Track if case has been analyzed
  const [pendingAnalysisQuery, setPendingAnalysisQuery] = useState<string>(''); // Store query while PII preview is open
  const [preservePII, setPreservePII] = useState(false); // Track if user wants to skip PII redaction
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for caseId in URL params
  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (caseId && caseId !== selectedCaseId) {
      setSelectedCaseId(caseId);
      loadCaseData(caseId);
    }
  }, [searchParams]);

  // Load cases and documents on mount
  useEffect(() => {
    if (user && organization?.id) {
      loadCases();
      loadDocuments();
    }
  }, [user, organization?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update empty state
  useEffect(() => {
    setIsEmptyState(messages.length === 0 && !selectedCaseId);
  }, [messages, selectedCaseId]);

  const loadCases = async () => {
    if (!user || !organization?.id) return;
    
    setIsLoadingCases(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, tracking_id, title, status, created_at, priority')
        .eq('organization_id', organization.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCases(Array.isArray(data) ? data : []);
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
      if (!data) throw new Error('Case not found');
      
      setSelectedCaseData(data);
      setHasAnalyzedCase(false); // Reset when case changes
    } catch (error: any) {
      console.error('Error loading case data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load case data.",
        variant: "destructive"
      });
      setSelectedCaseId('');
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
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Handle case analysis (when case is selected)
  const handleCaseAnalysis = async (query: string, skipPIIRedaction: boolean = false) => {
    if (!selectedCaseId || !selectedCaseData || !organization?.id) {
      throw new Error('Case not selected');
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
      } catch (decryptError: any) {
        console.error('Error decrypting case content:', decryptError);
        decryptedContent = `
Case Details:
- Title: ${selectedCaseData.title || 'Not specified'}
- Tracking ID: ${selectedCaseData.tracking_id || 'Not specified'}
- Status: ${selectedCaseData.status || 'Not specified'}
- Priority: ${selectedCaseData.priority || 'Not specified'}
- Report Type: ${selectedCaseData.report_type || 'Not specified'}

Note: Full case content could not be decrypted. Analysis will be based on available metadata.
        `.trim();
      }
    }

    // Process selected documents
    const companyDocuments: Array<{ name: string; content: string }> = [];
    if (Array.isArray(selectedDocs) && selectedDocs.length > 0 && Array.isArray(documents)) {
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
                content: extractData.text.substring(0, 5000) // Limit document size
              });
            }
          } catch (error) {
            console.error(`Error extracting PDF ${doc.name}:`, error);
          }
        } else if (doc) {
          companyDocuments.push({
            name: doc.name,
            content: `[Document: ${doc.name} - ${doc.content_type}]`
          });
        }
      }
    }

    // Build document context
    let documentContext = '';
    if (companyDocuments.length > 0) {
      documentContext = '\n\n**Company Documents:**\n' + companyDocuments.map(doc => 
        `\n**${doc.name}:**\n${doc.content}`
      ).join('\n\n---\n\n');
    }

    // Build analysis prompt
    const analysisPrompt = query.trim() && !query.toLowerCase().includes('analyze') 
      ? query.trim()
      : `Analyze this case and provide:
- Executive summary of the situation
- Risk assessment (severity and urgency)
- Immediate actions needed (next 24-48 hours)
- Investigation steps and timeline
- Legal/compliance considerations
- Strategic recommendations

${decryptedContent}${documentContext}`;

    // Call ai-gateway-generate DIRECTLY from frontend
    const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
      body: {
        preserve_pii: skipPIIRedaction, // Skip PII redaction if user chose to proceed without it
        messages: [
          {
            role: 'system',
            content: `You are an expert compliance consultant and whistleblower case advisor. Your role is to help compliance teams and business managers navigate complex ethical, legal, and regulatory issues with confidence and clarity.

Your expertise includes:
- Whistleblower case analysis and risk assessment
- GDPR, data privacy, and information security regulations
- Employment law, discrimination, and workplace misconduct
- Corporate governance and ethical business practices
- Investigation procedures and evidence preservation
- Stakeholder communication and reputational risk management

Communication style:
- Professional yet approachable - like a trusted advisor
- Use clear, jargon-free language that business managers understand
- Provide specific, actionable guidance with realistic timelines
- Balance legal precision with practical business context
- Acknowledge complexity while offering clear next steps

Response format:
- Start with a brief executive summary of the situation
- Assess risk level and explain your reasoning
- Provide immediate actions (next 24-48 hours)
- Outline investigation steps and timelines
- Highlight legal/compliance considerations
- End with 1-2 strategic questions to guide decision-making

Always consider uploaded company documents (policies, procedures, codes of conduct) when providing guidance. Reference specific policies when relevant.

Remember: Compliance teams need confidence and clarity under pressure. Be the advisor they can trust.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        context: {
          purpose: 'case_analysis',
          report_id: selectedCaseData.id
        }
      },
      headers: {
        'X-Organization-Id': organization.id
      }
    });

    if (error) {
      console.error('AI Gateway error:', error);
      throw new Error(error.message || 'Failed to analyze case');
    }
    
    if (!data) {
      throw new Error('No response from AI service');
    }
    
    // Parse response
    const responseContent = data.choices?.[0]?.message?.content || 
      data.response || 
      data.content || 
      'No analysis generated';

    // Store for saving
    setCurrentAnalysisData({
      caseData: selectedCaseData,
      customPrompt: query.trim(),
      companyDocuments,
      analysis: responseContent
    });

    // Mark case as analyzed after successful analysis
    setHasAnalyzedCase(true);
    return responseContent;
  };

  // Handle follow-up questions (conversational chat about analyzed case)
  const handleFollowUp = async (query: string) => {
    if (!selectedCaseId || !organization?.id) {
      throw new Error('No case selected');
    }

    // Build conversation history (last 4 messages)
    const recentMessages: Array<{ role: string; content: string }> = [];
    if (Array.isArray(messages) && messages.length > 0) {
      const lastMessages = messages.slice(-4);
      for (const msg of lastMessages) {
        if (msg && msg.role && msg.content) {
          recentMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      }
    }
    recentMessages.push({ role: 'user', content: query.trim() });

    // Call ai-gateway-generate DIRECTLY from frontend
    const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are a compliance consultant having a conversational chat about case "${selectedCaseData?.title || 'a compliance case'}". 

Provide SHORT, conversational responses (2-3 paragraphs max). NO headings, NO bullet points - just natural conversation. Be direct and helpful, like chatting with a colleague.`
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

    if (error) {
      console.error('AI Gateway error:', error);
      throw new Error(error.message || 'Failed to generate response');
    }
    
    if (!data) {
      throw new Error('No response from AI service');
    }
    
    // Parse response
    return data.choices?.[0]?.message?.content || 
      data.response || 
      data.content || 
      'No response generated';
  };

  // Handle cross-case search (when no case is selected)
  const handleCrossCaseSearch = async (query: string) => {
    if (!organization?.id) {
      throw new Error('Organization not loaded');
    }

    // Get recent cases from database
    const { data: allCases, error: casesError } = await supabase
      .from('reports')
      .select('id, tracking_id, title, status, priority, created_at, report_type, tags')
      .eq('organization_id', organization.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (casesError) {
      throw new Error('Failed to fetch cases');
    }

    // Build case list for AI context
    const caseList = Array.isArray(allCases) && allCases.length > 0
      ? allCases.map(c => 
          `- ${c.tracking_id}: ${c.title} (${c.status}, Priority: ${c.priority}/5, Type: ${c.report_type || 'N/A'}, Created: ${new Date(c.created_at).toLocaleDateString()})`
        ).join('\n')
      : 'No cases found in the system.';

    // Build conversation history
    const recentMessages: Array<{ role: string; content: string }> = [];
    if (Array.isArray(messages) && messages.length > 0) {
      const lastMessages = messages.slice(-4);
      for (const msg of lastMessages) {
        if (msg && msg.role && msg.content) {
          recentMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      }
    }
    recentMessages.push({ role: 'user', content: query.trim() });

    // Call ai-gateway-generate DIRECTLY from frontend
    const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are a compliance consultant helping search and analyze whistleblowing cases.

AVAILABLE CASES:
${caseList}

Your task:
- Understand the user's query (handle typos, synonyms, and variations - e.g., "harassment" includes "bullying", "discrimination", "hostile work environment")
- Identify which cases are relevant to their query
- Provide a helpful response listing relevant cases with their tracking IDs (DIS-XXXX format)
- If no cases match, suggest alternative search terms or ask for clarification
- Be conversational and helpful

When listing cases, always include the tracking ID (DIS-XXXX format) so users can reference them.`
          },
          ...recentMessages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        context: {
          purpose: 'case_search',
          organization_id: organization.id
        }
      },
      headers: {
        'X-Organization-Id': organization.id
      }
    });

    if (error) {
      console.error('AI Gateway error:', error);
      throw new Error(error.message || 'Failed to search cases');
    }
    
    if (!data) {
      throw new Error('No response from AI service');
    }
    
    // Parse response
    const responseContent = data.choices?.[0]?.message?.content || 
      data.response || 
      data.content || 
      'No response generated';

    // Extract case IDs from response to show case cards
    const caseIdsInResponse: string[] = [];
    const trackingIdPattern = /DIS-[A-Z0-9]{6,}/gi;
    const matches = responseContent.match(trackingIdPattern);
    if (matches && Array.isArray(allCases)) {
      const uniqueTrackingIds = [...new Set(matches)];
      for (const trackingId of uniqueTrackingIds) {
        const foundCase = allCases.find(c => 
          c.tracking_id.toLowerCase() === trackingId.toLowerCase()
        );
        if (foundCase) {
          caseIdsInResponse.push(foundCase.id);
        }
      }
    }

    // Get case data for cards
    const relevantCases = caseIdsInResponse.length > 0 && Array.isArray(allCases)
      ? allCases.filter(c => caseIdsInResponse.includes(c.id)).map(c => ({
          id: c.id,
          tracking_id: c.tracking_id,
          title: c.title,
          status: c.status,
          priority: c.priority,
          created_at: c.created_at
        }))
      : [];

    return { content: responseContent, cases: relevantCases };
  };

  // Main query handler - routes to appropriate function
  const handleQuery = async (query: string) => {
    if (!query.trim() || isLoading || !organization?.id) {
      if (!organization?.id) {
        toast({
          title: "Organization Required",
          description: "Please wait for organization to load.",
          variant: "destructive"
        });
      }
      return;
    }

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
      let responseContent: string;
      let relevantCases: Array<{ id: string; tracking_id: string; title: string; status: string; priority: number; created_at: string }> = [];

      // Simple routing logic:
      // 1. If case is selected AND has been analyzed -> follow-up chat
      // 2. If case is selected AND not analyzed -> show PII preview first, then analyze
      // 3. If no case selected -> cross-case search

      if (selectedCaseId && hasAnalyzedCase) {
        // Follow-up conversation
        console.log('💬 Follow-up conversation');
        setIsLoading(false);
        responseContent = await handleFollowUp(query);
      } else if (selectedCaseId) {
        // Initial case analysis - show PII preview first
        console.log('📊 Case analysis - showing PII preview', { selectedCaseId, hasAnalyzedCase });
        setIsLoading(false);
        setPendingAnalysisQuery(query.trim());
        
        // Ensure case data is loaded before showing preview
        if (!selectedCaseData) {
          await loadCaseData(selectedCaseId);
        }
        
        await loadPreviewContent();
        return; // Exit early, analysis will run after PII preview confirmation
      } else {
        // Cross-case search
        console.log('🔍 Cross-case search');
        setIsLoading(false);
        const result = await handleCrossCaseSearch(query);
        responseContent = result.content;
        relevantCases = result.cases;
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        cases: relevantCases.length > 0 ? relevantCases : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Log event
      if (user && organization?.id) {
        await auditLogger.log({
          eventType: selectedCaseId ? 'case.ai_analysis' : 'case.ai_search',
          category: 'case_management',
          action: selectedCaseId ? (hasAnalyzedCase ? 'chat' : 'analyze') : 'search',
          severity: 'low',
          actorType: 'user',
          actorId: user.id,
          actorEmail: user.email,
          organizationId: organization.id,
          targetType: selectedCaseId ? 'case' : 'query',
          targetId: selectedCaseId || null,
          targetName: selectedCaseData?.title || query.trim(),
          summary: `AI ${selectedCaseId ? (hasAnalyzedCase ? 'chat' : 'analysis') : 'search'}: ${query.trim()}`,
          metadata: {
            is_follow_up: hasAnalyzedCase,
            cases_found: relevantCases.length
          }
        });
      }
    } catch (error: any) {
      console.error('Error processing query:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Error**: ${error.message || "Failed to process your query. Please try again."}\n\nIf this problem persists, please:\n- Check your internet connection\n- Verify the case ID is correct\n- Ensure you have permission to access this case\n- Try refreshing the page`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseCardClick = (caseId: string) => {
    const selectedCase = cases.find(c => c.id === caseId);
    if (selectedCase) {
      setSelectedCaseId(caseId);
      setHasAnalyzedCase(false);
      setIsEmptyState(false);
      loadCaseData(caseId);
      // Populate search box with case analysis prompt
      setInputQuery(`Analyze case ${selectedCase.tracking_id}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !organization?.id) return;

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
            organization_id: organization.id
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
      
      if (Array.isArray(selectedDocs) && selectedDocs.length > 0 && Array.isArray(documents)) {
        const docNames = selectedDocs.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return doc ? doc.name : 'Unknown';
        }).filter(Boolean).join(', ');
        if (docNames) {
          fullContent += `\n\nDocuments to be analyzed: ${docNames}`;
        }
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
    setCurrentAnalysisData(null);
    setHasAnalyzedCase(false);
    setIsEmptyState(true);
    navigate('/dashboard/ai-assistant');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery(inputQuery);
    }
  };

  // Empty State UI
  if (isEmptyState) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
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
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Show case dropdown if available */}
                {Array.isArray(cases) && cases.length > 0 && (
                  <div className="mt-8 w-full max-w-2xl">
                    <p className="text-sm text-muted-foreground mb-2 text-center">Select a case to analyze:</p>
                    <Select 
                      value={selectedCaseId} 
                      onValueChange={(value) => {
                        const selectedCase = cases.find(c => c.id === value);
                        if (selectedCase) {
                          setSelectedCaseId(value);
                          setHasAnalyzedCase(false);
                          setIsEmptyState(false);
                          loadCaseData(value);
                          // Populate search box with case analysis prompt
                          setInputQuery(`Analyze case ${selectedCase.tracking_id}`);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface UI
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
                {selectedCaseData && (
                  <Badge variant="default">
                    Analyzing: {selectedCaseData.tracking_id}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCaseData 
                  ? `Analyzing: ${selectedCaseData.tracking_id} - ${selectedCaseData.title}`
                  : 'Search across all cases or analyze a specific case'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedCaseId && (
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

          {/* Case Selection */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Select value={selectedCaseId} onValueChange={(value) => {
                    const selectedCase = cases.find(c => c.id === value);
                    if (selectedCase) {
                      setSelectedCaseId(value);
                      setHasAnalyzedCase(false);
                      loadCaseData(value);
                      // Populate search box with case analysis prompt
                      setInputQuery(`Analyze case ${selectedCase.tracking_id}`);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case to analyze..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(cases) && cases.length > 0 ? (
                        cases.map((caseItem) => (
                          <SelectItem key={caseItem.id} value={caseItem.id}>
                            {caseItem.tracking_id} - {caseItem.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cases" disabled>
                          No cases available
                        </SelectItem>
                      )}
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
                  {Array.isArray(selectedDocs) && selectedDocs.length > 0 && (
                    <Badge variant="secondary">
                      {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} selected
                    </Badge>
                  )}
                </div>
              </div>
              {Array.isArray(documents) && documents.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Available documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {documents.map((doc) => (
                      <Button
                        key={doc.id}
                        variant={Array.isArray(selectedDocs) && selectedDocs.includes(doc.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedDocs(prev => {
                            const prevArray = Array.isArray(prev) ? prev : [];
                            return prevArray.includes(doc.id) 
                              ? prevArray.filter(id => id !== doc.id)
                              : [...prevArray, doc.id];
                          });
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

          <Card className="flex flex-col" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Area - Fixed height with scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {Array.isArray(messages) && messages.map((message) => (
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
                        {message.role === 'assistant' && selectedCaseId && (message.content.includes('🚨') || message.content.includes('**What\'s the situation?**')) ? (
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

                      {/* Case Cards */}
                      {message.role === 'assistant' && Array.isArray(message.cases) && message.cases.length > 0 && (
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
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {selectedCaseId ? (hasAnalyzedCase ? 'Thinking...' : 'Analyzing case...') : 'Searching your cases...'}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {selectedCaseId ? 'This may take a few moments' : 'Please wait'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedCaseId 
                        ? (hasAnalyzedCase 
                            ? "Ask a follow-up question about this case..."
                            : "Ask me to analyze this case or ask questions about it...")
                        : "Ask a question about your cases or analyze a specific case..."
                    }
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleQuery(inputQuery)}
                    disabled={!inputQuery.trim() || isLoading}
                    size="default"
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
        </div>
      </div>

      {/* PII Preview Modal */}
      {showPIIPreview && selectedCaseData && (
        <PIIPreviewModal
          originalText={previewContent}
          caseTitle={selectedCaseData.title}
          onConfirm={async () => {
            setShowPIIPreview(false);
            // After confirming PII preview, automatically run analysis with redaction
            if (selectedCaseId && selectedCaseData && pendingAnalysisQuery) {
              setPreservePII(false);
              setIsLoading(true);
              try {
                const responseContent = await handleCaseAnalysis(pendingAnalysisQuery, false);
                const aiMessage: ChatMessage = {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseContent,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setHasAnalyzedCase(true);
                setPendingAnalysisQuery('');
              } catch (error: any) {
                console.error('Error in analysis:', error);
                toast({
                  title: "Analysis Failed",
                  description: error.message || "Failed to analyze case.",
                  variant: "destructive"
                });
              } finally {
                setIsLoading(false);
              }
            }
          }}
          onProceedWithoutRedaction={async () => {
            setShowPIIPreview(false);
            // Run analysis without PII redaction
            if (selectedCaseId && selectedCaseData && pendingAnalysisQuery) {
              setPreservePII(true);
              setIsLoading(true);
              try {
                const responseContent = await handleCaseAnalysis(pendingAnalysisQuery, true);
                const aiMessage: ChatMessage = {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseContent,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setHasAnalyzedCase(true);
                setPendingAnalysisQuery('');
              } catch (error: any) {
                console.error('Error in analysis:', error);
                toast({
                  title: "Analysis Failed",
                  description: error.message || "Failed to analyze case.",
                  variant: "destructive"
                });
              } finally {
                setIsLoading(false);
              }
            }
          }}
          onCancel={() => {
            setShowPIIPreview(false);
            setPendingAnalysisQuery('');
            // Reset case selection if user cancels
            setSelectedCaseId('');
            setSelectedCaseData(null);
            setIsEmptyState(true);
          }}
        />
      )}
    </div>
  );
};

export default AIAssistantView;
