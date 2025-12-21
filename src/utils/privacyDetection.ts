/**
 * Privacy Detection Utility
 * Scans text for Personally Identifiable Information (PII) that could compromise anonymity
 */

export interface PrivacyRisk {
  type: 'email' | 'phone' | 'employeeId' | 'ssn' | 'creditCard' | 'ipAddress' | 'url' | 'possibleName' | 'standaloneName' | 'specificDate' | 'address';
  text: string;
  redacted: string;
  position: { start: number; end: number };
  severity: 'high' | 'medium' | 'low';
  description: string;
}

// Comprehensive PII detection patterns
const PII_PATTERNS = {
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    severity: 'high' as const,
    description: 'Email addresses can identify you',
    redact: (match: string) => {
      const [name, domain] = match.split('@');
      return `${name.slice(0, 1)}****@${domain}`;
    }
  },
  phone: {
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: 'high' as const,
    description: 'Phone numbers can identify you',
    redact: (match: string) => '***-***-' + match.slice(-4)
  },
  // Employee IDs - now catches alphanumeric patterns
  employeeId: {
    pattern: /\b(EMP|emp|EMPLOYEE|Employee|ID|id|Staff|STAFF|Office|OFFICE)[-_\s#:]*[A-Z0-9]{2,3}[-_]?\d{3,8}\b/gi,
    severity: 'high' as const,
    description: 'Employee/Office IDs can identify you',
    redact: (match: string) => {
      const parts = match.match(/([A-Za-z-_\s#:]+)([A-Z0-9-]+)/);
      if (parts && parts[2]) {
        return parts[1] + '****' + parts[2].slice(-2);
      }
      return 'ID-****';
    }
  },
  ssn: {
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    severity: 'high' as const,
    description: 'Social Security Numbers must be protected',
    redact: () => '***-**-****'
  },
  creditCard: {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    severity: 'medium' as const,
    description: 'Credit card numbers detected',
    redact: (match: string) => '****-****-****-' + match.slice(-4)
  },
  ipAddress: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    severity: 'medium' as const,
    description: 'IP addresses can be used to trace you',
    redact: () => '***.***.***.***.***'
  },
  url: {
    pattern: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
    severity: 'low' as const,
    description: 'URLs may contain identifying information',
    redact: (match: string) => {
      try {
        const url = new URL(match);
        return `${url.protocol}//${url.hostname}/[REDACTED]`;
      } catch {
        return '[URL REDACTED]';
      }
    }
  },
  // Common name patterns - catches various contexts
  possibleName: {
    pattern: /\b(my\s+name\s+is|I\s+am|my\s+(?:manager|supervisor|boss|colleague|coworker)|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
    severity: 'high' as const,
    description: 'Names detected - highly identifying',
    redact: (match: string) => {
      const prefix = match.match(/^(my\s+name\s+is|I\s+am|my\s+(?:manager|supervisor|boss|colleague|coworker)|Mr\.|Mrs\.|Ms\.|Dr\.)/i)?.[0] || '';
      return prefix ? `${prefix} [NAME REDACTED]` : '[NAME REDACTED]';
    }
  },
  // Standalone capitalized names (2+ words) - catches names without context
  standaloneName: {
    pattern: /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g,
    severity: 'medium' as const,
    description: 'Possible full name detected',
    redact: () => '[NAME REDACTED]',
    // Validator to filter out false positives
    validator: (match: string) => {
      const lowerMatch = match.toLowerCase();
      
      // Common business/team terms that aren't names
      const businessTerms = [
        'customer care', 'customer service', 'customer support', 'customer records',
        'human resources', 'hr department', 'it department', 'it support',
        'legal department', 'finance department', 'sales team', 'marketing team',
        'management team', 'executive team', 'board members', 'staff members',
        'team member', 'team members', 'team lead', 'team leader',
        'data breach', 'security breach', 'privacy policy', 'terms service',
        'improper access', 'unauthorized access', 'data access', 'system access',
        'account access', 'user access', 'admin access', 'secure access'
      ];
      
      if (businessTerms.some(term => lowerMatch.includes(term))) {
        return false;
      }
      
      // Common street/address words that aren't names
      const addressWords = [
        'street', 'road', 'lane', 'avenue', 'drive', 'court', 'place', 'way',
        'boulevard', 'circle', 'parkway', 'terrace', 'close', 'grove', 'hill',
        'north', 'south', 'east', 'west', 'upper', 'lower', 'new', 'old',
        'high', 'main', 'church', 'mill', 'bridge', 'green', 'park', 'wood'
      ];
      
      const words = lowerMatch.split(/\s+/);
      if (words.some(word => addressWords.includes(word))) {
        return false;
      }
      
      // Common action/descriptive phrases
      const actionPhrases = [
        'improper', 'unauthorized', 'inappropriate', 'unacceptable',
        'customer', 'client', 'user', 'member', 'employee', 'staff',
        'records', 'data', 'information', 'details', 'files', 'documents'
      ];
      
      // If it starts with an action word, likely not a name
      if (actionPhrases.includes(words[0])) {
        return false;
      }
      
      // If it ends with a business term, likely not a name
      if (words.length >= 2 && businessTerms.some(term => lowerMatch.endsWith(term.split(' ').slice(-1)[0]))) {
        return false;
      }
      
      return true;
    }
  },
  // Specific dates - supports both US and UK formats
  specificDate: {
    pattern: /\b(?:on|since|from|started|joined|hired)\s+(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)),?\s+\d{4}\b/gi,
    severity: 'low' as const,
    description: 'Specific dates (hire date, etc.) could narrow identification',
    redact: (match: string) => {
      const prefix = match.match(/^(?:on|since|from|started|joined|hired)\s+/i)?.[0] || '';
      return `${prefix}[DATE REDACTED]`;
    }
  },
  // Street addresses
  address: {
    pattern: /\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct)\b/gi,
    severity: 'medium' as const,
    description: 'Street addresses can identify locations',
    redact: () => '[ADDRESS REDACTED]'
  }
};

/**
 * Check if OpenRedact feature flag is enabled (client-side helper)
 */
async function isOpenRedactEnabled(organizationId?: string): Promise<boolean> {
  try {
    const { checkFeatureFlag } = await import('@/utils/edgeFunctions');
    return await checkFeatureFlag('use_openredact', organizationId);
  } catch (error) {
    // Error checking OpenRedact feature flag
    return false;
  }
}

/**
 * Use OpenRedact for privacy risk scanning (when feature flag is enabled)
 * NOTE: OpenRedact is Node.js only, so we call an API endpoint instead
 */
async function scanForPrivacyRisksWithOpenRedact(text: string, organizationId?: string): Promise<PrivacyRisk[]> {
  try {
    // OpenRedact uses Node.js fs/path modules, so we can't use it directly in the browser
    // Instead, we'll call an API endpoint that uses OpenRedact server-side
    // For now, fall back to legacy implementation on client-side
    // TODO: Create a client-side API endpoint that uses OpenRedact server-side
    // OpenRedact not available in browser - using legacy implementation
    return [];
  } catch (error) {
    // OpenRedact error, falling back to legacy
    throw error;
  }
}

/**
 * Scan text for privacy risks (PII)
 * Returns array of detected risks with details
 * 
 * Checks feature flag and uses OpenRedact if enabled, otherwise uses legacy implementation
 */
/**
 * Scan text for privacy risks (PII)
 * Returns array of detected risks with details
 * 
 * NOTE: OpenRedact is Node.js only, so client-side always uses legacy implementation
 * OpenRedact is only used in server-side edge functions
 */
export async function scanForPrivacyRisks(text: string, organizationId?: string): Promise<PrivacyRisk[]> {
  // OpenRedact uses Node.js fs/path modules and cannot run in the browser
  // For client-side, always use legacy implementation
  // OpenRedact is only used in server-side edge functions (pii-detector.ts, pii-scanner.ts)
  return scanForPrivacyRisksSync(text);
}

/**
 * Scan text for privacy risks (synchronous version for backward compatibility)
 */
export function scanForPrivacyRisksSync(text: string): PrivacyRisk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const risks: PrivacyRisk[] = [];

  // Scan for each pattern type
  Object.entries(PII_PATTERNS).forEach(([type, config]) => {
    const matches = text.matchAll(config.pattern);

    for (const match of matches) {
      if (match.index !== undefined) {
        const matchedText = match[0];

        // Use validator if it exists to filter false positives
        if ('validator' in config && typeof config.validator === 'function') {
          if (!config.validator(matchedText)) {
            continue; // Skip this match - it's a false positive
          }
        }

        // Skip if this is part of a larger already-detected risk
        const overlaps = risks.some(risk =>
          (match.index! >= risk.position.start && match.index! < risk.position.end) ||
          (match.index! + matchedText.length > risk.position.start && match.index! < risk.position.end)
        );

        if (!overlaps) {
          risks.push({
            type: type as PrivacyRisk['type'],
            text: matchedText,
            redacted: config.redact(matchedText),
            position: {
              start: match.index,
              end: match.index + matchedText.length
            },
            severity: config.severity,
            description: config.description
          });
        }
      }
    }
  });

  // Sort by position in text
  return risks.sort((a, b) => a.position.start - b.position.start);
}

/**
 * Calculate privacy score (0-100, higher is better)
 */
export function calculatePrivacyScore(risks: PrivacyRisk[]): number {
  if (risks.length === 0) return 100;

  const severityWeights = {
    high: 30,
    medium: 15,
    low: 5
  };

  const totalDeduction = risks.reduce((sum, risk) => {
    return sum + severityWeights[risk.severity];
  }, 0);

  return Math.max(0, 100 - totalDeduction);
}

/**
 * Auto-redact text by replacing all detected PII with redacted versions
 */
export function autoRedactText(text: string, risks: PrivacyRisk[]): string {
  if (risks.length === 0) return text;

  let redactedText = text;

  // Sort risks by position (descending) to maintain correct indices during replacement
  const sortedRisks = [...risks].sort((a, b) => b.position.start - a.position.start);

  sortedRisks.forEach(risk => {
    redactedText =
      redactedText.slice(0, risk.position.start) +
      risk.redacted +
      redactedText.slice(risk.position.end);
  });

  return redactedText;
}

/**
 * Get human-readable summary of privacy risks
 */
export function getPrivacyRiskSummary(risks: PrivacyRisk[]): string {
  if (risks.length === 0) {
    return "No privacy risks detected. Your report appears anonymous.";
  }

  const riskCounts: Record<string, number> = {};
  risks.forEach(risk => {
    riskCounts[risk.type] = (riskCounts[risk.type] || 0) + 1;
  });

  const summaryParts = Object.entries(riskCounts).map(([type, count]) => {
    const label = {
      email: 'email address',
      phone: 'phone number',
      employeeId: 'employee/office ID',
      ssn: 'social security number',
      creditCard: 'credit card number',
      ipAddress: 'IP address',
      url: 'URL',
      possibleName: 'name',
      standaloneName: 'possible name',
      specificDate: 'specific date',
      address: 'address'
    }[type] || type;

    return `${count} ${label}${count > 1 ? 's' : ''}`;
  });

  return `Found ${risks.length} privacy risk${risks.length > 1 ? 's' : ''}: ${summaryParts.join(', ')}`;
}
