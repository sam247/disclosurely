import { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
  Trash2,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/utils';
import { PIIPreviewModal } from '@/components/PIIPreviewModal';
import { decryptReport } from '@/utils/encryption';
import { auditLogger } from '@/utils/auditLogger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { sanitizeHtml } from '@/utils/sanitizer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

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
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [isLoadingSavedAnalyses, setIsLoadingSavedAnalyses] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const { isOrgAdmin, loading: rolesLoading, roles, isAdmin } = useUserRoles();
  
  // Check if user is a case handler (has case_handler role)
  // System admins bypass case handler restrictions
  const hasCaseHandlerRole = roles.includes('case_handler');
  const shouldRestrictCaseHandler = hasCaseHandlerRole && !isAdmin;
  
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for caseId in URL params
  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (caseId && caseId !== selectedCaseId) {
      setSelectedCaseId(caseId);
      loadCaseData(caseId);
    }
  }, [searchParams]);

  // Load cases, documents, and saved analyses on mount
  useEffect(() => {
    if (user && organization?.id) {
      loadCases();
      loadDocuments();
      loadSavedAnalyses();
    }
  }, [user, organization?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update empty state - keep empty state visible when case is selected but not analyzed yet
  useEffect(() => {
    // Show empty state if no messages AND (no case selected OR case hasn't been analyzed) AND not showing PII choice
    setIsEmptyState(messages.length === 0 && (!selectedCaseId || !hasAnalyzedCase) && !showPIIChoice);
  }, [messages, selectedCaseId, hasAnalyzedCase, showPIIChoice]);

  const loadCases = async () => {
    if (!user || !organization?.id) return;
    
    setIsLoadingCases(true);
    try {
      let casesQuery = supabase
        .from('reports')
        .select('id, tracking_id, title, status, created_at, priority, assigned_to')
        .eq('organization_id', organization.id)
        .neq('status', 'archived')
        .is('deleted_at', null) // Exclude deleted cases
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by assigned_to for case handlers (unless they're a system admin)
      if (shouldRestrictCaseHandler && rolesLoading === false && user?.id) {
        casesQuery = casesQuery.eq('assigned_to', user.id);
      }

      const { data, error } = await casesQuery;

      if (error) throw error;
      setCases(Array.isArray(data) ? data : []);
    } catch (error) {
      // Error loading cases
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
      // Error loading documents
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
            // Error decrypting case content
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


            if (extractError) {
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
              // No text extracted from PDF
              companyDocuments.push({
                name: doc.name,
                content: `[PDF Document: ${doc.name} - No text could be extracted. This may be an image-based PDF. Response: ${JSON.stringify(extractData)}]`
              });
            }
          } catch (error: any) {
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
    // Calculate PII stats only from case description (exclude document PII)
    let piiMetadata = undefined;
    if (data.metadata && data.metadata.pii_redacted) {

      // Detect PII in case description only (not documents)
      const { detectPII } = await import('@/utils/pii-detector-client');
      const caseOnlyPII = await detectPII(decryptedContent, organization?.id);
      
      // Build stats from case-only PII detection (safe guards if detections missing)
      const caseStats: Record<string, number> = {};
      const detections = Array.isArray(caseOnlyPII?.detections) ? caseOnlyPII.detections : [];
      detections.forEach((detection: any) => {
        const type = detection?.type || 'unknown';
        caseStats[type] = (caseStats[type] || 0) + 1;
      });
      
      // Only show metadata if case has PII (ignore document PII in count)
      const casePIICount = Object.values(caseStats).reduce((sum, count) => sum + count, 0);
      const redactionMapKeys = data.metadata?.redaction_map ? Object.keys(data.metadata.redaction_map).length : 0;
      

      if (casePIICount > 0 || redactionMapKeys > 0) {
        piiMetadata = {
          redacted: true,
          stats: caseStats, // Use case-only stats, not document stats
          redactionMap: data.metadata.redaction_map // Keep full redaction map for display
        };
      }
    }

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
            // Error extracting PDF for follow-up
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
        // Error decrypting case for follow-up
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
      let fullCasesQuery = supabase
        .from('reports')
        .select('id, tracking_id, title, status, priority, report_type, tags, assigned_to')
        .eq('organization_id', organization.id)
        .neq('status', 'archived')
        .is('deleted_at', null)
        .limit(100);

      // Filter by assigned_to for case handlers (unless they're a system admin)
      if (shouldRestrictCaseHandler && rolesLoading === false && user?.id) {
        fullCasesQuery = fullCasesQuery.eq('assigned_to', user.id);
      }

      const { data: fullCasesData } = await fullCasesQuery;
      
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
        setIsLoading(false);
        responseContent = await handleFollowUp(query);
      } else if (selectedCaseId) {
        // Initial case analysis - run with explicit PII preference
        
        // Ensure case data is loaded
        if (!selectedCaseData) {
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
        setIsLoading(false);
        responseContent = await handleFollowUp(query);
      } else if (selectedCaseId) {
        // Initial case analysis - run with user's PII preference
        
        // Ensure case data is loaded
        if (!selectedCaseData) {
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
      return;
    }

    // Set pending query from current input, or use default
    setPendingAnalysisQuery(inputQuery.trim() || "Analyze this case");

    // Ensure case data is loaded
    if (!selectedCaseData) {
      await loadCaseData(selectedCaseId);
    }

    setIsLoadingPreview(true);
    try {
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', selectedCaseId)
        .single();

      if (caseError) {
        throw caseError;
      }

      if (!caseData) {
        throw new Error('Case not found');
      }


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
          // Error decrypting case content
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

      setPreviewContent(fullContent);
      setShowPIIPreview(true);
    } catch (error: any) {
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

  const loadSavedAnalyses = async () => {
    if (!organization?.id || !user) return;
    
    setIsLoadingSavedAnalyses(true);
    try {
      let analysesQuery = supabase
        .from('ai_case_analyses')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by created_by for case handlers (only show their own analyses, unless they're a system admin)
      if (shouldRestrictCaseHandler && rolesLoading === false && user?.id) {
        analysesQuery = analysesQuery.eq('created_by', user.id);
      }

      const { data, error } = await analysesQuery;

      if (error) throw error;
      setSavedAnalyses(Array.isArray(data) ? data : []);
    } catch (error) {
      // Error loading saved analyses
    } finally {
      setIsLoadingSavedAnalyses(false);
    }
  };

  const loadSavedAnalysis = async (analysisId: string) => {
    try {
      const analysis = savedAnalyses.find(a => a.id === analysisId);
      if (!analysis) return;

      // Load the case data
      const { data: caseData, error: caseError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', analysis.case_id)
        .single();

      if (caseError) throw caseError;

      // Set the case as selected
      setSelectedCaseId(analysis.case_id);
      setSelectedCaseData(caseData);
      setHasAnalyzedCase(true);

      // Create messages from saved analysis
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Analyze this case: ${analysis.tracking_id}`,
        timestamp: new Date(analysis.created_at)
      };

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: analysis.analysis_content,
        timestamp: new Date(analysis.created_at)
      };

      setMessages([userMessage, aiMessage]);
      setIsEmptyState(false);
      setShowPIIChoice(false);

      toast({
        title: "Analysis Loaded",
        description: `Loaded saved analysis for ${analysis.tracking_id}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load saved analysis.",
        variant: "destructive"
      });
    }
  };

  const deleteSavedAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('ai_case_analyses')
        .delete()
        .eq('id', analysisId)
        .eq('created_by', user?.id);

      if (error) throw error;

      setSavedAnalyses(prev => prev.filter(a => a.id !== analysisId));
      toast({
        title: "Deleted",
        description: "Saved analysis deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete saved analysis.",
        variant: "destructive"
      });
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

      // Reload saved analyses
      await loadSavedAnalyses();

      toast({
        title: "✅ Analysis Saved",
        description: "Analysis has been saved successfully."
      });
    } catch (error) {
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

  // ============================================================================
  // LOCKED: AI Assistant Layout & Scroll Control - DO NOT MODIFY WITHOUT EXPLICIT APPROVAL
  // ============================================================================
  // This useLayoutEffect is CRITICAL for:
  // 1. Preventing page scroll (both mobile and desktop)
  // 2. Removing all padding around the window (breaking out of DashboardLayout padding)
  // 3. Ensuring full-width/full-height layout with no white gaps
  // 4. Handling zoom correctly on desktop
  //
  // Key points:
  // - useLayoutEffect runs synchronously before browser paint (prevents scrollbar flash)
  // - Body is set to position: fixed with exact viewport height (both mobile and desktop)
  // - Container uses negative margins to break out of DashboardLayout's p-4 md:p-6 padding
  // - Width calculation accounts for sidebar (260px) to fill entire available space
  // - Height calculation accounts for header (64px) to fill entire available space
  // - All padding removed (margin: negative padding values, padding: 0)
  //
  // DO NOT:
  // - Change useLayoutEffect back to useEffect (causes scrollbar flash)
  // - Remove negative margin calculations (causes white padding gaps)
  // - Change the body position: fixed logic
  // - Modify width/height calculations without accounting for sidebar/header
  // - Remove overflow: hidden constraints
  // - Add any padding or margins to the root container
  // ============================================================================
  useLayoutEffect(() => {
    const updateLayout = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const headerHeight = 64; // DashboardLayout header is h-16 (64px)
      const calculatedHeight = viewportHeight - headerHeight;

      // Constrain body to prevent page scroll (both mobile and desktop for zoom handling)
      document.body.style.overflow = 'hidden';
      document.body.style.height = `${viewportHeight}px`;
      document.body.style.maxHeight = `${viewportHeight}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';

      // Set container height and prevent overflow
      if (containerRef.current) {
        // Account for DashboardLayout padding: p-4 (1rem = 16px) on mobile, md:p-6 (1.5rem = 24px) on desktop
        const isMobileLayout = window.innerWidth < 768;
        const layoutPadding = isMobileLayout ? 16 : 24;
        
        // Get the main content element (parent with padding)
        const mainContent = containerRef.current.closest('main');
        if (mainContent) {
          // On mobile, AI Assistant sidebar is hidden (hidden md:flex), so full width is available
          // On desktop, AI Assistant sidebar is 260px wide (w-[260px])
          // DashboardLayout sidebar is also hidden on mobile (drawer), visible on desktop
          const sidebarWidth = isMobileLayout ? 0 : 260;
          const availableWidth = window.innerWidth - sidebarWidth;
          const availableHeight = calculatedHeight;
          
          // Break out of padding with negative margins and fill full available space
          // This eliminates all white padding areas around the window
          containerRef.current.style.height = `${availableHeight}px`;
          containerRef.current.style.maxHeight = `${availableHeight}px`;
          containerRef.current.style.overflow = 'hidden';
          containerRef.current.style.width = `${availableWidth}px`;
          containerRef.current.style.maxWidth = `${availableWidth}px`;
          containerRef.current.style.marginLeft = `-${layoutPadding}px`;
          containerRef.current.style.marginRight = `-${layoutPadding}px`;
          containerRef.current.style.marginTop = `-${layoutPadding}px`;
          containerRef.current.style.marginBottom = `-${layoutPadding}px`;
          containerRef.current.style.padding = '0';
        } else {
          // Fallback if main element not found
          containerRef.current.style.height = `${calculatedHeight}px`;
          containerRef.current.style.maxHeight = `${calculatedHeight}px`;
          containerRef.current.style.overflow = 'hidden';
          containerRef.current.style.width = '100%';
          containerRef.current.style.maxWidth = '100%';
          containerRef.current.style.margin = `-${layoutPadding}px`;
          containerRef.current.style.padding = '0';
        }
      }

    };

    updateLayout();
    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      // Reset body styles on unmount
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.maxHeight = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
    };
  }, [isMobile]);


  // ============================================================================
  // LOCKED: Root Container Structure - DO NOT MODIFY WITHOUT EXPLICIT APPROVAL
  // ============================================================================
  // This root container:
  // - Uses flex layout for sidebar + main content
  // - Has zero padding (padding removed via negative margins in useLayoutEffect)
  // - Height/width set dynamically in useLayoutEffect to break out of DashboardLayout padding
  // - Background color ensures no white gaps
  //
  // DO NOT:
  // - Add padding or margins here (use negative margins in useLayoutEffect instead)
  // - Change flex layout structure
  // - Add inline height/width styles (handled in useLayoutEffect)
  // ============================================================================
  return (
    <div 
      ref={containerRef}
      className="flex h-full overflow-hidden bg-background"
      style={{ 
        padding: 0
      }}
      data-ai-assistant-root
    >
      {/* Left Sidebar - Hidden on mobile, shown via drawer */}
      <div className="!hidden md:flex w-[260px] border-r bg-muted/30 flex-col overflow-hidden flex-shrink-0" data-ai-assistant-sidebar>
        <div className="flex flex-col h-full bg-muted/30">
          {/* Scrollable Cases Section */}
          <div className="flex-1 min-h-0 overflow-hidden bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-4 pb-2 bg-muted/30">
                {/* Case Selection Section */}
                <div>
                  <div className="flex items-center gap-1 mb-2 px-2">
                    <h3 className="text-sm font-semibold">Cases</h3>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                            aria-label="Cases information"
                          >
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          align="start"
                          sideOffset={8}
                          className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                        >
                          <p className="text-blue-900">Please select a case to optionally redact PII and analyse</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
              {isLoadingCases ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
            </div>
              ) : (
                <div className="space-y-1">
                  {Array.isArray(cases) && cases.length > 0 ? (
                    cases.map((caseItem) => (
                      <button
                        key={caseItem.id}
                        onClick={() => {
                          setSelectedCaseId(caseItem.id);
                          setHasAnalyzedCase(false);
                          setShowPIIChoice(true);
                          loadCaseData(caseItem.id);
                          setInputQuery("Analyze this case");
                          setIsEmptyState(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          selectedCaseId === caseItem.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="font-medium truncate">{caseItem.tracking_id}</div>
                        <div className={cn(
                          "text-xs truncate",
                          selectedCaseId === caseItem.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {caseItem.title}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No cases available</p>
                  )}
                </div>
              )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Bottom Sections - Documents and Saved Analyses */}
          <div className="flex-shrink-0 border-t bg-muted/30">
            <div className="p-4 space-y-4">
              {/* Document Management Section - Fixed at bottom */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold">Documents</h3>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                            aria-label="Documents information"
                          >
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          align="start"
                          sideOffset={8}
                          className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                        >
                          <p className="text-blue-900">Please select a document to analyse against a case</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.doc"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Upload document"
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
                {isLoadingDocs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Array.isArray(documents) && documents.length > 0 ? (
                      documents.map((doc) => {
                        const isSelected = Array.isArray(selectedDocs) && selectedDocs.includes(doc.id);
                        return (
                          <div key={doc.id} className="flex items-center gap-1 group">
                            <button
                              onClick={() => {
                                setSelectedDocs(prev => {
                                  const prevArray = Array.isArray(prev) ? prev : [];
                                  return prevArray.includes(doc.id)
                                    ? prevArray.filter(id => id !== doc.id)
                                    : [...prevArray, doc.id];
                                });
                              }}
                              className={cn(
                                "flex-1 text-left px-3 py-2 rounded-md text-xs transition-colors truncate",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              )}
                              title={doc.name}
                            >
                              <FileText className="h-3 w-3 inline mr-1" />
                              <span className="truncate">{doc.name}</span>
                              {isSelected && <span className="ml-1">✓</span>}
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDocument(doc);
                              }}
                              title="Delete document"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground px-2">No documents</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Saved Analyses Section - Fixed at bottom, always visible */}
              <div className="flex-shrink-0" data-ai-assistant-saved-analyses>
                <div className="flex items-center gap-1 mb-2 px-2">
                  <h3 className="text-sm font-semibold">Saved Analyses</h3>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                          aria-label="Saved Analyses information"
                        >
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        align="start"
                        sideOffset={8}
                        className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                      >
                        <p className="text-blue-900">Select a previous case to analyse</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {isLoadingSavedAnalyses ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {savedAnalyses.length > 0 ? (
                      savedAnalyses.map((analysis) => (
                        <div key={analysis.id} className="flex items-center gap-1 group">
                          <button
                            onClick={() => loadSavedAnalysis(analysis.id)}
                            className="flex-1 text-left px-3 py-2 rounded-md text-xs transition-colors hover:bg-muted truncate"
                            title={`${analysis.tracking_id} - ${analysis.case_title}`}
                          >
                            <div className="font-medium truncate">{analysis.tracking_id}</div>
                            <div className="text-muted-foreground truncate">{analysis.case_title}</div>
                            <div className="text-muted-foreground text-[10px]">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSavedAnalysis(analysis.id);
                            }}
                            title="Delete saved analysis"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground px-2">No saved analyses</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="left" className="w-[260px] p-0 bg-muted/30">
          <div className="flex flex-col h-full bg-muted/30 overflow-hidden">
            {/* Scrollable Cases Section */}
            <div className="flex-1 min-h-0 overflow-hidden bg-muted/30">
              <ScrollArea className="h-full">
                <div className="p-4 pb-2 bg-muted/30">
                  {/* Case Selection Section */}
                  <div>
                    <div className="flex items-center gap-1 mb-2 px-2">
                      <h3 className="text-sm font-semibold">Cases</h3>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                              aria-label="Cases information"
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            align="start"
                            sideOffset={8}
                            className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                          >
                            <p className="text-blue-900">Please select a case to optionally redact PII and analyse</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {isLoadingCases ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {Array.isArray(cases) && cases.length > 0 ? (
                          cases.map((caseItem) => (
                            <button
                              key={caseItem.id}
                              onClick={() => {
                                setSelectedCaseId(caseItem.id);
                                setHasAnalyzedCase(false);
                                setShowPIIChoice(true);
                                loadCaseData(caseItem.id);
                                setInputQuery("Analyze this case");
                                setIsEmptyState(false);
                                setIsDrawerOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                selectedCaseId === caseItem.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              )}
                            >
                              <div className="font-medium truncate">{caseItem.tracking_id}</div>
                              <div className={cn(
                                "text-xs truncate",
                                selectedCaseId === caseItem.id ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {caseItem.title}
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground px-2">No cases available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Fixed Bottom Sections - Documents and Saved Analyses */}
            <div className="flex-shrink-0 border-t bg-muted/30">
              <div className="p-4 space-y-4">
                {/* Document Management Section */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-semibold">Documents</h3>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                              aria-label="Documents information"
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            align="start"
                            sideOffset={8}
                            className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                          >
                            <p className="text-blue-900">Please select a document to analyse against a case</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      title="Upload document"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                  {isLoadingDocs ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Array.isArray(documents) && documents.length > 0 ? (
                        documents.map((doc) => {
                          const isSelected = Array.isArray(selectedDocs) && selectedDocs.includes(doc.id);
                          return (
                            <div key={doc.id} className="flex items-center gap-1 group">
                              <button
                                onClick={() => {
                                  setSelectedDocs(prev => {
                                    const prevArray = Array.isArray(prev) ? prev : [];
                                    return prevArray.includes(doc.id)
                                      ? prevArray.filter(id => id !== doc.id)
                                      : [...prevArray, doc.id];
                                  });
                                }}
                                className={cn(
                                  "flex-1 text-left px-3 py-2 rounded-md text-xs transition-colors truncate",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                )}
                                title={doc.name}
                              >
                                <FileText className="h-3 w-3 inline mr-1" />
                                <span className="truncate">{doc.name}</span>
                                {isSelected && <span className="ml-1">✓</span>}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDocument(doc);
                                }}
                                title="Delete document"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground px-2">No documents</p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Saved Analyses Section */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 mb-2 px-2">
                    <h3 className="text-sm font-semibold">Saved Analyses</h3>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
                            aria-label="Saved Analyses information"
                          >
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          align="start"
                          sideOffset={8}
                          className="max-w-xs p-3 bg-blue-50 border-blue-200 text-sm"
                        >
                          <p className="text-blue-900">Select a previous case to analyse</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {isLoadingSavedAnalyses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {savedAnalyses.length > 0 ? (
                        savedAnalyses.map((analysis) => (
                          <div key={analysis.id} className="flex items-center gap-1 group">
                            <button
                              onClick={() => {
                                loadSavedAnalysis(analysis.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex-1 text-left px-3 py-2 rounded-md text-xs transition-colors hover:bg-muted truncate"
                              title={`${analysis.tracking_id} - ${analysis.case_title}`}
                            >
                              <div className="font-medium truncate">{analysis.tracking_id}</div>
                              <div className="text-muted-foreground truncate">{analysis.case_title}</div>
                              <div className="text-muted-foreground text-[10px]">
                                {new Date(analysis.created_at).toLocaleDateString()}
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedAnalysis(analysis.id);
                              }}
                              title="Delete saved analysis"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground px-2">No saved analyses</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="w-full md:flex-1 flex flex-col overflow-hidden bg-background" data-ai-assistant-right-panel>
        {/* Toolbar - Full width */}
        <div className="border-b flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 flex-shrink-0 w-full bg-background py-2 sm:py-0 sm:h-14">
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
            {/* Mobile hamburger menu */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-10 sm:h-9 sm:w-9 p-0 md:hidden touch-manipulation z-10"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold">AI Assistant:</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-normal">Analyse cases with or without redaction against company documentation.</p>
            </div>
            {selectedCaseData && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {selectedCaseData.tracking_id}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentAnalysisData && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveAnalysis}
                disabled={isSaving}
                className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Analysis
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              disabled={isLoading}
              className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Chat Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-background" data-ai-assistant-messages>
          {isEmptyState && !showPIIChoice ? (
            <div className="flex flex-col items-center justify-center min-h-full">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Select a case from the sidebar to analyze, or ask a question about your cases.
              </p>
            </div>
          ) : showPIIChoice && selectedCaseId && !hasAnalyzedCase ? (
            <div className="flex flex-col items-center justify-center min-h-full">
              <div className="max-w-2xl w-full space-y-6">
                <div className="text-center space-y-2">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold">AI Assistant</h2>
                  {selectedCaseData && (
                    <p className="text-sm text-muted-foreground">
                      Analyzing: {selectedCaseData.tracking_id} - {selectedCaseData.title}
                    </p>
                    )}
              </div>
                
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold">Privacy Protection</h3>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Choose how to handle personal information in this analysis:
                      </p>
                      <div className="flex gap-3 w-full max-w-md">
                <Button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              setShowPIIChoice(false);
                              setPreservePII(false);
                              const query = inputQuery || "Analyze this case";
                              await handleQueryWithPIIPreference(query, false, true);
                            } catch (error: any) {
                              toast({
                                title: "Analysis Failed",
                                description: error.message || "Failed to start analysis. Please try again.",
                                variant: "destructive"
                              });
                              setShowPIIChoice(true); // Re-show choice on error
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="default"
                          disabled={isLoading || isLoadingPreview}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Analyze with PII Protection
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              setShowPIIChoice(false);
                              setPreservePII(true);
                              const query = inputQuery || "Analyze this case";
                              await handleQueryWithPIIPreference(query, true, true);
                            } catch (error: any) {
                              toast({
                                title: "Analysis Failed",
                                description: error.message || "Failed to start analysis. Please try again.",
                                variant: "destructive"
                              });
                              setShowPIIChoice(true); // Re-show choice on error
                            }
                          }}
                  variant="outline"
                          className="flex-1"
                          size="default"
                          disabled={isLoading || isLoadingPreview}
                >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Analyze Without Redaction'
                          )}
                </Button>
              </div>
                    <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            loadPreviewContent();
                          } catch (error: any) {
                            toast({
                              title: "Preview Failed",
                              description: error.message || "Failed to load preview. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        variant="outline"
                        size="default"
                        className="w-full max-w-md"
                        disabled={isLoading || isLoadingPreview}
                      >
                        {isLoadingPreview ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading Preview...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview PII Detection
                          </>
                        )}
                    </Button>
                </div>
          </CardContent>
        </Card>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
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
                        Thinking…
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {selectedCaseId
                          ? (hasAnalyzedCase
                            ? 'Crafting a response to your follow-up'
                            : 'Analyzing the case with PII protection')
                          : 'Searching across cases'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            </div>
          )}
          </div>

        {/* Input Area - Fixed at Bottom - Full width to match assistant window */}
        <div className="border-t p-4 md:p-6 flex-shrink-0 w-full bg-background" data-ai-assistant-message-bar>
          <div className="w-full">
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
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Powered by AI • Your queries are logged for audit purposes
            </p>
          </div>
        </div>
      </div>

      {/* PII Preview Modal */}
      {showPIIPreview && selectedCaseData && (
        <PIIPreviewModal
          originalText={previewContent}
          caseTitle={selectedCaseData.title}
          onConfirm={async () => {
            setShowPIIPreview(false);
            const query = pendingAnalysisQuery || inputQuery || "Analyze this case";
            setPreservePII(false);
            await handleQueryWithPIIPreference(query, false, true);
            setPendingAnalysisQuery('');
          }}
          onProceedWithoutRedaction={async () => {
            setShowPIIPreview(false);
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
            setSelectedCaseId('');
            setSelectedCaseData(null);
            setHasAnalyzedCase(false);
            setShowPIIChoice(false);
            setMessages([]);
            setCurrentAnalysisData(null);
            setIsEmptyState(true);
          }}
        />
      )}
    </div>
  );
};

export default AIAssistantView;
