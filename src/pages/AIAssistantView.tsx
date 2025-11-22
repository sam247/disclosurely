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
  Save,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2
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
  piiMetadata?: {
    redacted: boolean;
    stats?: Record<string, number>;
    redactionMap?: Record<string, string>;
  };
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

// Inline PII Info Component
const PIIInfoInline = ({ piiMetadata, originalContent }: { piiMetadata: { redacted: boolean; stats?: Record<string, number>; redactionMap?: Record<string, string> }; originalContent: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [reportingFalsePositive, setReportingFalsePositive] = useState<string | null>(null);

  const totalPII = piiMetadata.stats ? Object.values(piiMetadata.stats).reduce((sum, count) => sum + count, 0) : 0;
  const redactionMap = piiMetadata.redactionMap || {};

  const handleReportFalsePositive = async (original: string, type: string) => {
    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'Unable to report false positive. Organization not found.',
        variant: 'destructive'
      });
      return;
    }

    setReportingFalsePositive(original);
    
    try {
      // Get context around the detection
      const start = Math.max(0, originalContent.indexOf(original) - 50);
      const end = Math.min(originalContent.length, originalContent.indexOf(original) + original.length + 50);
      const context = originalContent.substring(start, end);

      const { error } = await supabase
        .from('pii_false_positives')
        .insert({
          organization_id: organization.id,
          detected_text: original,
          detection_type: type,
          context: context,
          reported_by: (await supabase.auth.getUser()).data.user?.id || null
        });

      if (error) throw error;

      toast({
        title: 'False Positive Reported',
        description: `"${original}" has been reported. Thank you for helping improve our detection system!`,
      });

      setReportingFalsePositive(null);
    } catch (error: any) {
      console.error('Error reporting false positive:', error);
      toast({
        title: 'Error',
        description: 'Failed to report false positive. Please try again.',
        variant: 'destructive'
      });
      setReportingFalsePositive(null);
    }
  };

  if (!piiMetadata.redacted || totalPII === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-muted">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <Badge variant="secondary" className="bg-green-50 text-green-800 border-green-200">
            {totalPII} item{totalPII !== 1 ? 's' : ''} protected
          </Badge>
          {piiMetadata.stats && Object.entries(piiMetadata.stats).map(([type, count]) => (
            <span key={type} className="text-xs text-muted-foreground">
              {count} {type.toLowerCase()}
            </span>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              View details
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && redactionMap && Object.keys(redactionMap).length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            The following information was automatically redacted for privacy:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(redactionMap).map(([original, placeholder]) => {
              // Extract type from placeholder (e.g., [EMAIL_1] -> EMAIL)
              const typeMatch = placeholder.match(/\[(\w+)_\d+\]/);
              const type = typeMatch ? typeMatch[1] : 'UNKNOWN';
              
              return (
                <div key={placeholder} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-mono text-[10px]">
                      {placeholder}
                    </span>
                    <span className="text-muted-foreground truncate" title={original}>
                      {original}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReportFalsePositive(original, type)}
                    disabled={reportingFalsePositive === original}
                    className="h-6 px-2 text-[10px] flex-shrink-0"
                    title="Report as false positive"
                  >
                    {reportingFalsePositive === original ? (
                      'Reporting...'
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not PII
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [showPIIChoice, setShowPIIChoice] = useState(false); // Show inline PII choice when case selected
  
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

  // Update empty state - keep empty state visible when case is selected but not analyzed yet
  useEffect(() => {
    setIsEmptyState(messages.length === 0 && (!selectedCaseId || !hasAnalyzedCase));
  }, [messages, selectedCaseId, hasAnalyzedCase]);

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
      setSelectedDocs(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(id => id !== doc.id);
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive"
      });
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
            toast({
              title: "Extracting PDF",
              description: `Processing ${doc.name}...`,
            });
            
            const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-pdf-text', {
              body: { filePath: doc.file_path }
            });

            console.log(`[PDF Extract] Response for ${doc.name}:`, { extractData, extractError });

            if (extractError) {
              console.error(`[PDF Extract] Error extracting PDF ${doc.name}:`, extractError);
              toast({
                title: "PDF Extraction Failed",
                description: `Could not extract text from ${doc.name}. The AI will analyze without this document.`,
                variant: "destructive"
              });
              // Still add document with error message so user knows it was attempted
              companyDocuments.push({
                name: doc.name,
                content: `[PDF Document: ${doc.name} - Text extraction failed: ${extractError.message || 'Unknown error'}]`
              });
            } else if (extractData?.text) {
              // Use full extracted text (edge function already limits to 50k chars)
              // Only limit if it's still too large for AI context
              const extractedText = extractData.text;
              console.log(`[PDF Extract] Successfully extracted ${extractedText.length} characters from ${doc.name}`);
              console.log(`[PDF Extract] Preview (first 200 chars):`, extractedText.substring(0, 200));
              
              const maxLength = 100000; // Increased from 5000 to 100k chars
              const finalText = extractedText.length > maxLength 
                ? extractedText.substring(0, maxLength) + `\n\n[Document truncated - showing first ${maxLength.toLocaleString()} characters of ${extractedText.length.toLocaleString()} total]`
                : extractedText;
              
              companyDocuments.push({
                name: doc.name,
                content: finalText
              });
              
              toast({
                title: "PDF Extracted",
                description: `Successfully extracted ${extractedText.length.toLocaleString()} characters from ${doc.name}`,
              });
            } else {
              console.warn(`[PDF Extract] No text extracted from PDF ${doc.name}. Response:`, extractData);
              companyDocuments.push({
                name: doc.name,
                content: `[PDF Document: ${doc.name} - No text could be extracted. This may be an image-based PDF. Response: ${JSON.stringify(extractData)}]`
              });
            }
          } catch (error: any) {
            console.error(`Error extracting PDF ${doc.name}:`, error);
            toast({
              title: "PDF Extraction Error",
              description: `Failed to extract ${doc.name}: ${error.message || 'Unknown error'}`,
              variant: "destructive"
            });
            companyDocuments.push({
              name: doc.name,
              content: `[PDF Document: ${doc.name} - Extraction error: ${error.message || 'Unknown error'}]`
            });
          }
        } else if (doc) {
          // Non-PDF documents
          companyDocuments.push({
            name: doc.name,
            content: `[Document: ${doc.name} - ${doc.content_type || 'Unknown type'}. PDF extraction is only supported for PDF files.]`
          });
        }
      }
    }

    // Build document context
    let documentContext = '';
    if (companyDocuments.length > 0) {
      documentContext = '\n\n=== COMPANY DOCUMENTS ===\n\n' + companyDocuments.map(doc => 
        `DOCUMENT: ${doc.name}\n${doc.content}`
      ).join('\n\n---\n\n');
      console.log(`[Case Analysis] Including ${companyDocuments.length} documents in analysis`);
      console.log(`[Case Analysis] Document context length: ${documentContext.length} characters`);
    } else {
      console.log(`[Case Analysis] No documents selected or extracted`);
    }

    // Build analysis prompt
    const analysisPrompt = query.trim() && !query.toLowerCase().includes('analyze') 
      ? query.trim() + (documentContext ? `\n\n${documentContext}` : '')
      : `Analyze this case and provide:
- Executive summary of the situation
- Risk assessment (severity and urgency)
- Immediate actions needed (next 24-48 hours)
- Investigation steps and timeline
- Legal/compliance considerations
- Strategic recommendations

${decryptedContent}${documentContext}`;
    
    console.log(`[Case Analysis] Final prompt length: ${analysisPrompt.length} characters`);
    console.log(`[Case Analysis] Prompt preview (first 500 chars):`, analysisPrompt.substring(0, 500));

    // Call ai-gateway-generate DIRECTLY from frontend
    const { data, error } = await supabase.functions.invoke('ai-gateway-generate', {
      body: {
        preserve_pii: skipPIIRedaction, // true = preserve PII (don't redact), false = redact PII
        messages: [
          {
            role: 'system',
            content: `You are an expert compliance consultant and whistleblower case advisor. Your role is to help compliance teams and business managers navigate complex ethical, legal, and regulatory issues with confidence and clarity.

CRITICAL: Write in plain, conversational text only. NO markdown formatting whatsoever - no **bold**, no ### headings, no *italics*, no bullet points with dashes, no underscores, no code blocks. Write like you're speaking to a colleague in person. Use natural paragraphs and simple sentences.

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

Response format (write in plain conversational paragraphs, NO markdown):
Cover the situation in natural paragraphs. Start with a brief summary, assess the risk level and explain your reasoning, provide immediate actions for the next 24-48 hours, outline investigation steps and timelines, highlight legal and compliance considerations, and end with 1-2 strategic questions to guide the case handler's decision-making process. These questions should be for the compliance team/case handler to consider internally, NOT questions to ask the whistleblower. Write it all as natural conversation, not structured lists or formatted sections.

IMPORTANT: You are advising compliance professionals and case handlers, NOT communicating with whistleblowers. Your questions should guide internal decision-making (e.g., "How can we strengthen the process?" or "What additional evidence should we gather?"), not ask about the whistleblower's needs or feelings.

CRITICAL: The user's message below contains COMPANY DOCUMENTS that have been extracted and included. These documents are part of the user's message content - they appear after the case details. When the user asks about policies, procedures, or company guidelines, you MUST reference the actual document content that is provided in their message. The documents are clearly marked with "=== COMPANY DOCUMENTS ===" or "DOCUMENT: [name]". Read the entire user message carefully - the documents are there, and you can see and reference their full text content.

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

    // Capture PII metadata from response
    const piiMetadata = data.metadata ? {
      redacted: data.metadata.pii_redacted || false,
      stats: data.metadata.pii_stats,
      redactionMap: data.metadata.redaction_map
    } : undefined;

    // Store for saving
    setCurrentAnalysisData({
      caseData: selectedCaseData,
      customPrompt: query.trim(),
      companyDocuments,
      analysis: responseContent,
      piiMetadata
    });

    // Mark case as analyzed after successful analysis
    setHasAnalyzedCase(true);
    return { content: responseContent, piiMetadata };
  };

  // Handle follow-up questions (conversational chat about analyzed case)
  const handleFollowUp = async (query: string) => {
    if (!selectedCaseId || !organization?.id) {
      throw new Error('No case selected');
    }

    // Load case data if not already loaded
    if (!selectedCaseData) {
      await loadCaseData(selectedCaseId);
    }

    // Load and extract selected documents for follow-up context
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
              const extractedText = extractData.text;
              const maxLength = 100000;
              const finalText = extractedText.length > maxLength 
                ? extractedText.substring(0, maxLength) + `\n\n[Document truncated - showing first ${maxLength.toLocaleString()} characters]`
                : extractedText;
              
              companyDocuments.push({
                name: doc.name,
                content: finalText
              });
            }
          } catch (error) {
            console.error(`Error extracting PDF ${doc.name} for follow-up:`, error);
          }
        }
      }
    }

    // Build document context
    let documentContext = '';
    if (companyDocuments.length > 0) {
      documentContext = '\n\n=== COMPANY DOCUMENTS AVAILABLE ===\n\n' + companyDocuments.map(doc => 
        `DOCUMENT: ${doc.name}\n${doc.content}`
      ).join('\n\n---\n\n');
      console.log(`[Follow-up] Including ${companyDocuments.length} documents in follow-up`);
      console.log(`[Follow-up] Document context length: ${documentContext.length} characters`);
    } else {
      console.log(`[Follow-up] No documents available for follow-up`);
    }

    // Decrypt case content for context
    let caseContext = '';
    if (selectedCaseData?.encrypted_content && selectedCaseData?.organization_id) {
      try {
        const decrypted = await decryptReport(selectedCaseData.encrypted_content, selectedCaseData.organization_id);
        caseContext = `
Case: ${selectedCaseData.tracking_id} - ${selectedCaseData.title}
Category: ${decrypted.category || 'Not specified'}
Description: ${decrypted.description || 'Not provided'}
Location: ${decrypted.location || 'Not specified'}
Date: ${decrypted.dateOfIncident || 'Not specified'}
Status: ${selectedCaseData.status}
Priority: ${selectedCaseData.priority}/5
        `.trim();
      } catch (decryptError: any) {
        console.error('Error decrypting case for follow-up:', decryptError);
        caseContext = `Case: ${selectedCaseData.tracking_id} - ${selectedCaseData.title} (Status: ${selectedCaseData.status}, Priority: ${selectedCaseData.priority}/5)`;
      }
    } else if (selectedCaseData) {
      caseContext = `Case: ${selectedCaseData.tracking_id} - ${selectedCaseData.title} (Status: ${selectedCaseData.status}, Priority: ${selectedCaseData.priority}/5)`;
    }

    // Get all cases for cross-case queries - load if not already loaded
    let allCasesContext = '';
    if (!Array.isArray(cases) || cases.length === 0) {
      await loadCases();
    }
    
    if (Array.isArray(cases) && cases.length > 0) {
      // Fetch full case data including report_type and tags for filtering
      const { data: fullCasesData } = await supabase
        .from('reports')
        .select('id, tracking_id, title, status, priority, report_type, tags')
        .eq('organization_id', organization.id)
        .neq('status', 'archived')
        .limit(100);
      
      if (Array.isArray(fullCasesData) && fullCasesData.length > 0) {
        const harassmentCases = fullCasesData.filter(c => 
          c.report_type?.toLowerCase().includes('harassment') || 
          c.title?.toLowerCase().includes('harassment') ||
          (Array.isArray(c.tags) && c.tags.some((tag: string) => tag.toLowerCase().includes('harassment')))
        );
        allCasesContext = `\n\nYou have access to ${fullCasesData.length} total cases. ${harassmentCases.length} of them are harassment-related.`;
      }
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
            content: `You are a compliance consultant having a conversational chat about cases. You have access to case data and company documents. You can answer questions about specific cases, reference company policies, or discuss patterns across cases.

${caseContext}${documentContext}${allCasesContext}

CRITICAL: The company documents are included in the system context above. They appear in a section marked "=== COMPANY DOCUMENTS AVAILABLE ===". When users ask about policies, procedures, or company guidelines, you MUST reference the actual document content that is provided above. The documents contain the full extracted text - you can see and read everything in them. If a user asks "can you see my policy doc?" or similar, answer YES and reference the specific content from the documents provided above.

CRITICAL: Write in plain, conversational text only. NO markdown formatting whatsoever - no **bold**, no ### headings, no *italics*, no bullet points, no underscores, no code blocks. Write like you're speaking to a colleague in person.

Provide SHORT, conversational responses (2-3 paragraphs max). Just natural conversation with simple paragraphs. Be direct and helpful, like chatting with a colleague. Answer questions using the case data and company documents you have access to.`
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

CRITICAL: Write in plain, conversational text only. NO markdown formatting whatsoever - no **bold**, no ### headings, no *italics*, no bullet points, no underscores, no code blocks. Write like you're speaking to a colleague in person. Use natural paragraphs and simple sentences.

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
  // Helper to handle query with explicit PII preference (avoids state timing issues)
  const handleQueryWithPIIPreference = async (query: string, skipPIIRedaction: boolean, skipUserMessage: boolean = false) => {
    if (!query.trim()) return;

    // Don't add user message if this is auto-started analysis
    if (!skipUserMessage) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
    }
    setInputQuery('');
    setIsLoading(true);

    try {
      let responseContent: string;
      let relevantCases: Array<{ id: string; tracking_id: string; title: string; status: string; priority: number; created_at: string }> = [];

      if (selectedCaseId && hasAnalyzedCase) {
        // Follow-up conversation
        console.log('💬 Follow-up conversation');
        setIsLoading(false);
        responseContent = await handleFollowUp(query);
      } else if (selectedCaseId) {
        // Initial case analysis - run with explicit PII preference
        console.log('📊 Case analysis - running', { selectedCaseId, hasAnalyzedCase, skipPIIRedaction, hasSelectedCaseData: !!selectedCaseData });
        
        // Ensure case data is loaded
        if (!selectedCaseData) {
          console.log('📦 Loading case data...');
          await loadCaseData(selectedCaseId);
        }
        
        // Run analysis with explicit PII preference
        const analysisResult = await handleCaseAnalysis(query.trim(), skipPIIRedaction);
        responseContent = typeof analysisResult === 'string' ? analysisResult : analysisResult.content;
        
        // Store PII metadata for display in message
        const piiMetadata = typeof analysisResult === 'object' ? analysisResult.piiMetadata : undefined;
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          piiMetadata
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setHasAnalyzedCase(true);
        setShowPIIChoice(false);
        setIsLoading(false);
        return; // Exit early, message already added
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
        timestamp: new Date(),
        piiMetadata: undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      // Log event
      if (organization?.id) {
        await auditLogger.logEvent({
          event_type: 'ai_query',
          user_id: user?.id || 'anonymous',
          organization_id: organization.id,
          metadata: {
            query: query.trim(),
            response_length: responseContent.length,
            case_id: selectedCaseId || null,
            cases_found: relevantCases.length
          }
        });
      }
    } catch (error: any) {
      console.error('Query error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Error**: ${error.message || "Failed to process your query. Please try again."}\n\nIf this problem persists, please:\n- Check your internet connection\n- Verify the case ID is correct\n- Ensure you have permission to access this case\n- Try refreshing the page`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process your query.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        // Initial case analysis - run with user's PII preference
        console.log('📊 Case analysis - running', { selectedCaseId, hasAnalyzedCase, preservePII, hasSelectedCaseData: !!selectedCaseData });
        
        // Ensure case data is loaded
        if (!selectedCaseData) {
          console.log('📦 Loading case data...');
          await loadCaseData(selectedCaseId);
        }
        
        // Run analysis with user's PII preference
        const analysisResult = await handleCaseAnalysis(query.trim(), preservePII);
        responseContent = typeof analysisResult === 'string' ? analysisResult : analysisResult.content;
        
        // Store PII metadata for display in message
        const piiMetadata = typeof analysisResult === 'object' ? analysisResult.piiMetadata : undefined;
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          piiMetadata
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setHasAnalyzedCase(true);
        setShowPIIChoice(false); // Hide choice after analysis
        setIsLoading(false);
        return; // Exit early, message already added
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
        timestamp: new Date(),
        piiMetadata: undefined // Cross-case search doesn't use PII redaction
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
      const uploadedFiles: string[] = [];
      
      for (const file of Array.from(files)) {
        // Validate file type
        const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const validExtensions = ['.pdf', '.txt', '.doc', '.docx'];
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported format. Please upload PDF, TXT, DOC, or DOCX files.`,
            variant: "destructive"
          });
          continue;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds the 10MB limit. Please upload a smaller file.`,
            variant: "destructive"
          });
          continue;
        }

        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt.substring(1)}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ai-helper-docs')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { error: dbError } = await supabase
          .from('ai_helper_documents')
          .insert({
            name: file.name,
            file_path: fileName,
            content_type: file.type || 'application/pdf',
            file_size: file.size,
            uploaded_by: user.id,
            organization_id: organization.id
          });

        if (dbError) {
          throw new Error(`Failed to save ${file.name}: ${dbError.message}`);
        }

        uploadedFiles.push(file.name);
      }

      if (uploadedFiles.length > 0) {
        toast({
          title: "Upload Successful",
          description: `${uploadedFiles.length} document(s) uploaded. ${uploadedFiles.length === 1 ? 'Select it below' : 'Select them below'} to include in AI analysis.`
        });

        // Reload documents list
        await loadDocuments();
        
        // Auto-select newly uploaded documents if none are selected
        if (Array.isArray(selectedDocs) && selectedDocs.length === 0) {
          // Get the newly uploaded document IDs
          const { data: newDocs } = await supabase
            .from('ai_helper_documents')
            .select('id, name')
            .eq('organization_id', organization.id)
            .in('name', uploadedFiles)
            .order('created_at', { ascending: false })
            .limit(uploadedFiles.length);
          
          if (newDocs && newDocs.length > 0) {
            setSelectedDocs(newDocs.map(doc => doc.id));
            toast({
              title: "Documents Selected",
              description: "Newly uploaded documents have been automatically selected for analysis.",
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents. Please try again.",
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
    if (!selectedCaseId) {
      console.error('❌ loadPreviewContent: No selectedCaseId');
      return;
    }

    // Set pending query from current input
    setPendingAnalysisQuery(inputQuery.trim());

    // Ensure case data is loaded
    if (!selectedCaseData) {
      await loadCaseData(selectedCaseId);
    }

    console.log('🔍 loadPreviewContent: Starting', { selectedCaseId });
    setIsLoadingPreview(true);
    try {
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', selectedCaseId)
        .single();

      if (caseError) {
        console.error('❌ loadPreviewContent: Database error', caseError);
        throw caseError;
      }

      if (!caseData) {
        console.error('❌ loadPreviewContent: No case data returned');
        throw new Error('Case not found');
      }

      console.log('✅ loadPreviewContent: Case data loaded', { caseId: caseData.id, title: caseData.title });

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
          console.error('⚠️ loadPreviewContent: Error decrypting case content:', decryptError);
          decryptedContent = '[Case content is encrypted and could not be decrypted]';
        }
      } else {
        decryptedContent = '[No case content available]';
      }

      let fullContent = `Case: ${caseData.title || 'Untitled'}\n\n${decryptedContent}`;
      
      if (Array.isArray(selectedDocs) && selectedDocs.length > 0 && Array.isArray(documents)) {
        const docNames = selectedDocs.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return doc ? doc.name : 'Unknown';
        }).filter(Boolean).join(', ');
        if (docNames) {
          fullContent += `\n\nDocuments to be analyzed: ${docNames}`;
        }
      }

      console.log('✅ loadPreviewContent: Setting preview content and opening modal');
      setPreviewContent(fullContent);
      setShowPIIPreview(true);
      console.log('✅ loadPreviewContent: Modal should now be open');
    } catch (error: any) {
      console.error('❌ loadPreviewContent: Error', error);
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to load case content for preview.",
        variant: "destructive"
      });
      // Still try to show preview with minimal content
      setPreviewContent(`Case: ${selectedCaseData?.title || 'Unknown'}\n\n[Error loading case content]`);
      setShowPIIPreview(true);
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
    setShowPIIChoice(false);
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
                {/* Document Upload Section - Compact one-line */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.doc"
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
                      {isUploading ? 'Uploading...' : 'Upload Documents'}
                    </Button>
                    {Array.isArray(selectedDocs) && selectedDocs.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {selectedDocs.length} selected
                      </Badge>
                    )}
                    {Array.isArray(documents) && documents.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {documents.length} available
                      </span>
                    )}
                    {isLoadingDocs && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {Array.isArray(documents) && documents.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Important:</strong> Click on documents below to <strong>select</strong> them for AI analysis. Selected documents (with ✓) will be included in the analysis.
                    </p>
                  )}
                </div>

                {/* Document List - Compact */}
                {Array.isArray(documents) && documents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {documents.map((doc) => {
                      const isSelected = Array.isArray(selectedDocs) && selectedDocs.includes(doc.id);
                      const isPDF = doc.content_type === 'application/pdf';
                      return (
                        <div key={doc.id} className="flex items-center gap-1">
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setSelectedDocs(prev => {
                                const prevArray = Array.isArray(prev) ? prev : [];
                                return prevArray.includes(doc.id) 
                                  ? prevArray.filter(id => id !== doc.id)
                                  : [...prevArray, doc.id];
                              });
                            }}
                            className={cn(
                              isSelected && 'ring-2 ring-primary ring-offset-1',
                              !isPDF && 'opacity-60'
                            )}
                            title={!isPDF ? 'Only PDF files are currently supported for text extraction' : isSelected ? 'Click to deselect' : 'Click to select for AI analysis'}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="max-w-[200px] truncate">{doc.name}</span>
                            {isSelected && <span className="ml-1">✓</span>}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete document"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PII Protection Choice - Inline */}
                {showPIIChoice && selectedCaseId && !hasAnalyzedCase && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">Privacy Protection</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Choose how to handle personal information in this analysis:
                          </p>
                          <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              setShowPIIChoice(false);
                              setPreservePII(false); // Don't preserve = redact PII (show [EMPLOYEE_ID_1])
                              const query = inputQuery || "Analyze this case";
                              // preserve_pii: false means redact PII (backend checks !preserve_pii)
                              // Skip user message for auto-started analysis
                              await handleQueryWithPIIPreference(query, false, true);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Analyze with PII Protection
                          </Button>
                          <Button
                            onClick={async () => {
                              setShowPIIChoice(false);
                              setPreservePII(true); // Preserve = don't redact PII (show personal details)
                              const query = inputQuery || "Analyze this case";
                              // preserve_pii: true means don't redact PII (backend checks !preserve_pii)
                              // Skip user message for auto-started analysis
                              await handleQueryWithPIIPreference(query, true, true);
                            }}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Analyze Without Redaction
                          </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Input
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedCaseId ? "Analyze this case" : "Ask a question or analyze a case..."}
                    className="h-12 text-base"
                    disabled={isLoading || (showPIIChoice && selectedCaseId && !hasAnalyzedCase)}
                  />
                  <Button
                    onClick={() => {
                      // If PII choice not shown yet, show it. Otherwise run analysis
                      if (selectedCaseId && !hasAnalyzedCase && !showPIIChoice) {
                        setShowPIIChoice(true);
                      } else {
                        handleQuery(inputQuery || (selectedCaseId ? "Analyze this case" : ""));
                      }
                    }}
                    disabled={(!inputQuery.trim() && !selectedCaseId) || isLoading}
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
                        setSelectedCaseId(value);
                        setHasAnalyzedCase(false);
                        setShowPIIChoice(true); // Show PII choice when case is selected
                        loadCaseData(value);
                        setInputQuery("Analyze this case");
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
                    setSelectedCaseId(value);
                    setHasAnalyzedCase(false);
                    setShowPIIChoice(true); // Show PII choice when case is selected
                    loadCaseData(value);
                    setInputQuery("Analyze this case");
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
                </div>
              </div>
              {/* Document Selection Section - Compact */}
              {Array.isArray(documents) && documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Important:</strong> Click on documents below to <strong>select</strong> them for AI analysis. Selected documents (with ✓) will be included in the analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {documents.map((doc) => {
                      const isSelected = Array.isArray(selectedDocs) && selectedDocs.includes(doc.id);
                      const isPDF = doc.content_type === 'application/pdf';
                      return (
                        <div key={doc.id} className="flex items-center gap-1">
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setSelectedDocs(prev => {
                                const prevArray = Array.isArray(prev) ? prev : [];
                                return prevArray.includes(doc.id) 
                                  ? prevArray.filter(id => id !== doc.id)
                                  : [...prevArray, doc.id];
                              });
                            }}
                            className={cn(
                              isSelected && 'ring-2 ring-primary ring-offset-1',
                              !isPDF && 'opacity-60'
                            )}
                            title={!isPDF ? 'Only PDF files are currently supported for text extraction' : isSelected ? 'Click to deselect' : 'Click to select for AI analysis'}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="max-w-[200px] truncate">{doc.name}</span>
                            {isSelected && <span className="ml-1">✓</span>}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete document"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
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
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">
                          {message.content}
                        </p>
                        
                        {/* PII Protection Info - Inline Display */}
                        {message.role === 'assistant' && message.piiMetadata?.redacted && (
                          <PIIInfoInline 
                            piiMetadata={message.piiMetadata}
                            originalContent={message.content}
                          />
                        )}
                        
                        <p className={cn(
                          'text-xs mt-2',
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
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
              <div className="border-t p-4 flex-shrink-0 space-y-3">
                {/* PII Protection Choice - Inline */}
                {showPIIChoice && selectedCaseId && !hasAnalyzedCase && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">Privacy Protection</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Choose how to handle personal information in this analysis:
                          </p>
                          <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              setShowPIIChoice(false);
                              setPreservePII(false); // Don't preserve = redact PII (show [EMPLOYEE_ID_1])
                              const query = inputQuery || "Analyze this case";
                              // preserve_pii: false means redact PII (backend checks !preserve_pii)
                              // Skip user message for auto-started analysis
                              await handleQueryWithPIIPreference(query, false, true);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Analyze with PII Protection
                          </Button>
                          <Button
                            onClick={async () => {
                              setShowPIIChoice(false);
                              setPreservePII(true); // Preserve = don't redact PII (show personal details)
                              const query = inputQuery || "Analyze this case";
                              // preserve_pii: true means don't redact PII (backend checks !preserve_pii)
                              // Skip user message for auto-started analysis
                              await handleQueryWithPIIPreference(query, true, true);
                            }}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Analyze Without Redaction
                          </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
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
                    disabled={isLoading || (showPIIChoice && selectedCaseId && !hasAnalyzedCase)}
                  />
                  <Button
                    onClick={() => {
                      // If PII choice not shown yet, show it. Otherwise run analysis
                      if (selectedCaseId && !hasAnalyzedCase && !showPIIChoice) {
                        setShowPIIChoice(true);
                      } else {
                        handleQuery(inputQuery);
                      }
                    }}
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
          onConfirm={() => {
            setShowPIIPreview(false);
            handleQuery(inputQuery);
          }}
          onProceedWithoutRedaction={async () => {
            setShowPIIPreview(false);
            // Run analysis without PII redaction (legacy modal handler - kept for backwards compatibility)
            if (selectedCaseId && selectedCaseData && pendingAnalysisQuery) {
              setPreservePII(true);
              setIsLoading(true);
              try {
                const analysisResult = await handleCaseAnalysis(pendingAnalysisQuery, true);
                const responseContent = typeof analysisResult === 'string' ? analysisResult : analysisResult.content;
                const piiMetadata = typeof analysisResult === 'object' ? analysisResult.piiMetadata : undefined;
                const aiMessage: ChatMessage = {
                  id: `ai-${Date.now()}`,
                  role: 'assistant',
                  content: responseContent,
                  timestamp: new Date(),
                  piiMetadata
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
