/**
 * Intent Detection Utility
 * Detects whether user query is for RAG search or deep-dive analysis
 */

export type QueryIntent = 'rag' | 'deep-dive' | 'ambiguous';

// Patterns that indicate RAG search mode
const RAG_INDICATORS = [
  /show me all/i,
  /find cases/i,
  /what trends/i,
  /how many cases/i,
  /cases about/i,
  /search for/i,
  /list.*cases/i,
  /cases from/i,
  /cases in/i,
  /cases by/i,
  /compare.*cases/i,
  /similar cases/i,
  /all.*cases/i,
  /cases created/i,
  /cases assigned/i,
  /cases with/i,
];

// Patterns that indicate deep-dive analysis mode
const DEEP_DIVE_INDICATORS = [
  /analyze case #/i,
  /case #\d+/i,
  /tell me about this case/i,
  /what should i do/i,
  /provide guidance/i,
  /analyze this/i,
  /review case/i,
  /case analysis/i,
  /help me with/i,
  /what are the risks/i,
  /what actions/i,
  /recommendations for/i,
  /next steps/i,
];

// Case ID pattern (e.g., "DIS-ABC123" or "case DIS-ABC123")
const CASE_ID_PATTERN = /(?:case\s+)?(?:DIS-)?[A-Z0-9]{6,}/i;

/**
 * Detect query intent using pattern matching
 */
export function detectIntent(query: string, context?: { selectedCaseId?: string }): QueryIntent {
  const normalizedQuery = query.toLowerCase().trim();

  // If a case is already selected in context, default to deep-dive
  if (context?.selectedCaseId) {
    // But allow explicit RAG queries to override
    const hasRAGIndicator = RAG_INDICATORS.some(pattern => pattern.test(normalizedQuery));
    if (!hasRAGIndicator) {
      return 'deep-dive';
    }
  }

  // Check for case ID in query
  const hasCaseId = CASE_ID_PATTERN.test(query);
  if (hasCaseId) {
    return 'deep-dive';
  }

  // Count matches for each intent type
  const ragMatches = RAG_INDICATORS.filter(pattern => pattern.test(normalizedQuery)).length;
  const deepDiveMatches = DEEP_DIVE_INDICATORS.filter(pattern => pattern.test(normalizedQuery)).length;

  // If clear winner, return it
  if (ragMatches > 0 && deepDiveMatches === 0) {
    return 'rag';
  }
  if (deepDiveMatches > 0 && ragMatches === 0) {
    return 'deep-dive';
  }

  // If both match or neither match, return ambiguous
  // In ambiguous cases, we can use AI to classify or default to RAG
  return 'ambiguous';
}

/**
 * Extract case ID from query if present
 */
export function extractCaseId(query: string): string | null {
  const match = query.match(CASE_ID_PATTERN);
  if (match) {
    // Normalize case ID format
    let caseId = match[0].replace(/case\s+/i, '').trim();
    if (!caseId.startsWith('DIS-')) {
      // Assume it's a tracking ID format
      caseId = caseId.toUpperCase();
    }
    return caseId;
  }
  return null;
}

/**
 * Get suggested queries based on current mode
 */
export function getSuggestedQueries(mode: 'rag' | 'deep-dive' | null): string[] {
  if (mode === 'rag') {
    return [
      "Show me all harassment cases from this quarter",
      "What are the trends in financial misconduct?",
      "Find cases about workplace safety",
      "How many cases involve policy violations?",
      "Compare safety violations across departments",
      "Cases created in the last 30 days"
    ];
  } else if (mode === 'deep-dive') {
    return [
      "Analyze this case in detail",
      "What are the key risks?",
      "What should I do next?",
      "Provide compliance guidance",
      "What are the legal implications?",
      "Recommend next steps"
    ];
  } else {
    // Default suggestions for empty state
    return [
      "Show me all harassment cases from this quarter",
      "Analyze case #[latest-case-number] in detail",
      "What are the trends in financial misconduct?",
      "Compare safety violations across departments"
    ];
  }
}

