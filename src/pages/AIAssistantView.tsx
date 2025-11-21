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
    if (caseId && caseId !== selectedCaseId) {
      setSelectedCaseId(caseId);
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

  // Update empty state - only show empty state if no messages and no selected case
  useEffect(() => {
    setIsEmptyState(messages.length === 0 && !selectedCaseId);
  }, [messages, selectedCaseId]);
  
  // Keep chat interface visible once user starts chatting
  useEffect(() => {
    if (messages.length > 0) {
      setIsEmptyState(false);
    }
  }, [messages.length]);

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

      if (error) {
        console.error('Error loading case data:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Case not found');
      }
      
      setSelectedCaseData(data);
    } catch (error: any) {
      console.error('Error loading case data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load case data.",
        variant: "destructive"
      });
      // Reset selection on error
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
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleQuery = async (query: string) => {
    console.log('📝 handleQuery called:', { query: query.trim(), isLoading, hasOrg: !!organization?.id });
    
    if (!query.trim() || isLoading) {
      if (!organization?.id) {
        toast({
          title: "Organization Required",
          description: "Please wait for organization to load.",
          variant: "destructive"
        });
      }
      return;
    }

    if (!organization?.id) {
      toast({
        title: "Organization Required",
        description: "Organization not loaded. Please try again.",
        variant: "destructive"
      });
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
      // Detect intent and extract case ID
      const intent = detectIntent(query, { selectedCaseId });
      const caseIdFromQuery = extractCaseId(query);
      console.log('🎯 Intent detection:', { intent, caseIdFromQuery, selectedCaseId });
      
      // If case ID found in query, select that case
      if (caseIdFromQuery) {
        const matchingCase = cases.find(c => 
          c.tracking_id.toLowerCase() === caseIdFromQuery.toLowerCase() ||
          c.id === caseIdFromQuery
        );
        if (matchingCase) {
          setSelectedCaseId(matchingCase.id);
          await loadCaseData(matchingCase.id);
        } else {
          // Case not found in loaded cases, try to load it directly
          console.log('Case not found in loaded cases, attempting direct load:', caseIdFromQuery);
          try {
            const { data: caseData, error: caseError } = await supabase
              .from('reports')
              .select('id, tracking_id, title')
              .ilike('tracking_id', `%${caseIdFromQuery}%`)
              .limit(1)
              .maybeSingle();
            
            if (caseError) {
              throw caseError;
            }
            
            if (caseData) {
              setSelectedCaseId(caseData.id);
              await loadCaseData(caseData.id);
            } else {
              throw new Error(`Case ${caseIdFromQuery} not found`);
            }
          } catch (caseLoadError: any) {
            console.error('Error loading case:', caseLoadError);
            
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: `❌ **Case Not Found**\n\nI couldn't find a case with ID "${caseIdFromQuery}". Please check:\n\n• The case ID is spelled correctly (format: DIS-XXXXXXX)\n• The case exists in your organization\n• You have permission to access this case\n\nWould you like to search for cases instead, or try a different case ID?`,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
            
            toast({
              title: "Case Not Found",
              description: `Could not find case ${caseIdFromQuery}. Please check the case ID and try again.`,
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        }
      }

      // Simplified approach: 
      // - If case selected + analyze intent → analyze that case
      // - Otherwise → search across cases using simple DB query + AI intelligence
      const shouldAnalyzeCase = selectedCaseId && (
        intent === 'deep-dive' || 
        caseIdFromQuery || 
        query.toLowerCase().includes('analyze') ||
        query.toLowerCase().includes('tell me about')
      );

      if (shouldAnalyzeCase) {
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
        let caseDataToUse = selectedCaseData;
        if (!caseDataToUse) {
          // Load case data synchronously
          const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('id', selectedCaseId)
            .single();

          if (error || !data) {
            throw new Error('Failed to load case data. Please try again.');
          }
          
          caseDataToUse = data;
          setSelectedCaseData(data);
        }

        // Decrypt case content
        let decryptedContent = '';
        let decryptionFailed = false;
        if (caseDataToUse?.encrypted_content && caseDataToUse?.organization_id) {
          try {
            const decrypted = await decryptReport(caseDataToUse.encrypted_content, caseDataToUse.organization_id);
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
            decryptionFailed = true;
            // Still provide basic case info for analysis
            decryptedContent = `
Case Details:
- Title: ${caseDataToUse.title || 'Not specified'}
- Tracking ID: ${caseDataToUse.tracking_id || 'Not specified'}
- Status: ${caseDataToUse.status || 'Not specified'}
- Priority: ${caseDataToUse.priority || 'Not specified'}
- Report Type: ${caseDataToUse.report_type || 'Not specified'}
- Created: ${caseDataToUse.created_at || 'Not specified'}

Note: Full case content could not be decrypted. Analysis will be based on available metadata.
Error: ${decryptError?.message || 'Decryption failed'}
            `.trim();
          }
        } else {
          // No encrypted content, use basic info
          decryptedContent = `
Case Details:
- Title: ${caseDataToUse.title || 'Not specified'}
- Tracking ID: ${caseDataToUse.tracking_id || 'Not specified'}
- Status: ${caseDataToUse.status || 'Not specified'}
- Priority: ${caseDataToUse.priority || 'Not specified'}
- Report Type: ${caseDataToUse.report_type || 'Not specified'}
- Created: ${caseDataToUse.created_at || 'Not specified'}
          `.trim();
        }

        // Process selected documents
        const companyDocuments: Array<{ name: string; content: string }> = [];
        if (Array.isArray(selectedDocs) && selectedDocs.length > 0) {
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
            } else if (doc) {
              // Non-PDF documents
              companyDocuments.push({
                name: doc.name,
                content: `[Document: ${doc.name} - ${doc.content_type}]`
              });
            }
          }
        }

        // Check if this is a follow-up question or initial analysis
        const isFollowUp = Array.isArray(messages) && messages.length > 1 && selectedCaseId;
        
        let analysisResponse: string;
        if (isFollowUp) {
          // Follow-up chat message
          const recentMessages: Array<{ role: string; content: string }> = Array.isArray(messages) && messages.length > 0
            ? messages.slice(-4).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content || ''
              }))
            : [];
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

          if (error) {
            console.error('AI Gateway error:', error);
            throw new Error(error.message || 'Failed to generate response');
          }
          
          if (!data) {
            throw new Error('No response from AI service');
          }
          
          // Handle different response formats from ai-gateway-generate
          analysisResponse = data.choices?.[0]?.message?.content || 
            data.response || 
            data.content || 
            'No response generated';
        } else {
          // Initial analysis - call ai-gateway-generate directly (no edge-to-edge calls)
          console.log('Starting case analysis for:', caseDataToUse.tracking_id);
          console.log('Decryption failed:', decryptionFailed);
          console.log('Content length:', decryptedContent.length);
          
          // Build document context
          let documentContext = '';
          if (companyDocuments && companyDocuments.length > 0) {
            documentContext = '\n\n**Company Documents:**\n' + companyDocuments.map(doc => 
              `\n**${doc.name}:**\n${doc.content.substring(0, 2000)}`
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

          const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
            body: {
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
                report_id: caseDataToUse.id
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
          
          // Handle different response formats from ai-gateway-generate
          analysisResponse = data.choices?.[0]?.message?.content || 
            data.response || 
            data.content || 
            'No analysis generated';
          
          // Add note if decryption failed
          if (decryptionFailed && analysisResponse) {
            analysisResponse = `⚠️ **Note**: Full case content could not be decrypted, so this analysis is based on available metadata.\n\n${analysisResponse}`;
          }

          // Add PII redaction note if applicable
          if (data.metadata?.pii_redacted) {
            analysisResponse += '\n\n_🔒 Note: Sensitive information was automatically redacted for privacy during AI analysis._';
          }

          // Store for saving
          setCurrentAnalysisData({
            caseData: caseDataToUse,
            customPrompt: query.trim(),
            companyDocuments,
            analysis: analysisResponse
          });
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: analysisResponse,
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
            summary: `AI ${isFollowUp ? 'chat' : 'analysis'} on case: ${caseDataToUse?.title || selectedCaseData?.title || 'Unknown'}`,
            metadata: {
              is_follow_up: isFollowUp,
              documents_analyzed: companyDocuments.length
            }
          });
        }
      } else {
        // Search across cases - simple approach: query DB + let AI find relevant cases
        console.log('🔍 Searching cases with AI intelligence:', query.trim());
        
        // Get all cases (or recent cases) for the organization
        const { data: allCases, error: casesError } = await supabase
          .from('reports')
          .select('id, tracking_id, title, status, priority, created_at, report_type, tags')
          .eq('organization_id', organization.id)
          .neq('status', 'archived')
          .order('created_at', { ascending: false })
          .limit(50); // Get recent 50 cases
        
        if (casesError) {
          console.error('Error fetching cases:', casesError);
          throw new Error('Failed to fetch cases');
        }

        // Build case list for AI context
        const caseList = (allCases || []).map(c => 
          `- ${c.tracking_id}: ${c.title} (${c.status}, Priority: ${c.priority}/5, Type: ${c.report_type || 'N/A'}, Created: ${new Date(c.created_at).toLocaleDateString()})`
        ).join('\n');

        // Build conversation history
        const recentMessages: Array<{ role: string; content: string }> = Array.isArray(messages) && messages.length > 0
          ? messages.slice(-4).map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content || ''
            }))
          : [];
        recentMessages.push({ role: 'user', content: query.trim() });

        // Call AI Gateway with case list - let AI find relevant cases
        const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
          body: {
            messages: [
              {
                role: 'system',
                content: `You are a compliance consultant helping search and analyze whistleblowing cases.

AVAILABLE CASES:
${caseList || 'No cases found in the system.'}

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
        
        // Parse AI response
        const responseContent = data.choices?.[0]?.message?.content || 
          data.response || 
          data.content || 
          'No response generated';

        // Try to extract case IDs from AI response to show case cards
        const caseIdsInResponse: string[] = [];
        const trackingIdPattern = /DIS-[A-Z0-9]{6,}/gi;
        const matches = responseContent.match(trackingIdPattern);
        if (matches) {
          const uniqueTrackingIds = [...new Set(matches)];
          // Find case IDs from tracking IDs
          for (const trackingId of uniqueTrackingIds) {
            const foundCase = allCases?.find(c => 
              c.tracking_id.toLowerCase() === trackingId.toLowerCase()
            );
            if (foundCase) {
              caseIdsInResponse.push(foundCase.id);
            }
          }
        }

        // Get case data for cards
        const relevantCases = caseIdsInResponse.length > 0
          ? allCases?.filter(c => caseIdsInResponse.includes(c.id)).map(c => ({
              id: c.id,
              tracking_id: c.tracking_id,
              title: c.title,
              status: c.status,
              priority: c.priority,
              created_at: c.created_at
            })) || []
          : [];

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          cases: relevantCases,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Log search event
        if (user && organization?.id) {
          await auditLogger.log({
            eventType: 'case.ai_search',
            category: 'case_management',
            action: 'search',
            severity: 'low',
            actorType: 'user',
            actorId: user.id,
            actorEmail: user.email,
            organizationId: organization.id,
            targetType: 'query',
            targetId: null,
            targetName: query.trim(),
            summary: `AI search query: ${query.trim()}`,
            metadata: {
              intent,
              cases_found: relevantCases.length,
              cases_returned: relevantCases.map(c => c.id)
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error processing query:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      // Add error message to chat so user sees what went wrong
      let errorContent = `❌ **Error**: ${error.message || "Failed to process your query. Please try again."}\n\n`;
      
      // Add specific guidance based on error type
      if (error.message?.includes('decrypt') || error.message?.includes('403')) {
        errorContent += `**Decryption Issue**: The case content could not be decrypted. This might be due to:\n- Permission issues\n- Encryption key mismatch\n- Case belongs to a different organization\n\n`;
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorContent += `**Not Found**: The requested resource could not be found.\n\n`;
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        errorContent += `**Authorization Issue**: You may not have permission to access this resource.\n\n`;
      }
      
      errorContent += `If this problem persists, please:\n- Check your internet connection\n- Verify the case ID is correct\n- Ensure you have permission to access this case\n- Try refreshing the page`;
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorContent,
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
    setSelectedCaseId(caseId);
    loadCaseData(caseId);
    
    // Add system message to chat
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `Switched to analyzing case ${caseData.tracking_id}. Ask me anything about this case.`,
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

          {/* Case Selection - Always available */}
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
                {selectedDocs.length > 0 && (
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

                  {/* Case Cards for RAG responses */}
                  {message.role === 'assistant' && message.cases && Array.isArray(message.cases) && message.cases.length > 0 && (
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
                        {selectedCaseId ? 'Analyzing case...' : 'Searching your cases...'}
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

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedCaseId 
                    ? "Ask a follow-up question about this case or search for other cases..."
                    : "Ask a question about your cases or analyze a specific case..."
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
        </div>
      </div>

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

