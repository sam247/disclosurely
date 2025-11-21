/**
 * Server-side PII Scanner (PRIVACY FIX C2)
 * Scans text for Personally Identifiable Information before encryption
 * This is a server-side version of the client-side privacy detection
 */

export interface PIIDetection {
  type: 'email' | 'phone' | 'employeeId' | 'ssn' | 'creditCard' | 'ipAddress' | 'url' | 'possibleName' | 'standaloneName' | 'specificDate' | 'address';
  text: string;
  position: { start: number; end: number };
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface PIIScanResult {
  detected: PIIDetection[];
  hasPII: boolean;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
}

// PII detection patterns (server-side version)
const PII_PATTERNS = {
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    severity: 'high' as const,
    description: 'Email addresses can identify you',
  },
  phone: {
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: 'high' as const,
    description: 'Phone numbers can identify you',
  },
  employeeId: {
    pattern: /\b(EMP|emp|EMPLOYEE|Employee|ID|id|Staff|STAFF|Office|OFFICE)[-_\s#:]*[A-Z0-9]{2,3}[-_]?\d{3,8}\b/gi,
    severity: 'high' as const,
    description: 'Employee/Office IDs can identify you',
  },
  ssn: {
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    severity: 'high' as const,
    description: 'Social Security Numbers must be protected',
  },
  creditCard: {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    severity: 'medium' as const,
    description: 'Credit card numbers detected',
  },
  ipAddress: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    severity: 'medium' as const,
    description: 'IP addresses can be used to trace you',
  },
  url: {
    pattern: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
    severity: 'low' as const,
    description: 'URLs may contain identifying information',
  },
  possibleName: {
    pattern: /\b(my\s+name\s+is|I\s+am|my\s+(?:manager|supervisor|boss|colleague|coworker)|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
    severity: 'high' as const,
    description: 'Names detected - highly identifying',
  },
  standaloneName: {
    pattern: /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g,
    severity: 'medium' as const,
    description: 'Possible full name detected',
  },
      // Check against static false positives
      for (const fpPattern of STATIC_FALSE_POSITIVES) {
        if (fpPattern.test(match)) return false;
      }
      
      // Check against business phrases
      for (const bpPattern of BUSINESS_PHRASES) {
        if (bpPattern.test(match)) return false;
      }
      
      // Check context - names are less likely after certain words
      const beforeContext = text.substring(Math.max(0, matchIndex - 30), matchIndex).toLowerCase();
      const afterContext = text.substring(matchIndex + match.length, Math.min(text.length, matchIndex + match.length + 30)).toLowerCase();
      
      // Exclude if it's clearly a business term
      const businessIndicators = [
        'report', 'expense', 'fraud', 'misconduct', 'violation', 'policy',
        'hiring', 'recruitment', 'process', 'procedure', 'system', 'department'
      ];
      
      const contextText = (beforeContext + ' ' + afterContext).toLowerCase();
      if (businessIndicators.some(indicator => contextText.includes(indicator))) {
        // Check if the match itself contains business terms
        const matchLower = match.toLowerCase();
        if (businessIndicators.some(indicator => matchLower.includes(indicator))) {
          return false;
        }
      }
      
      // Names are more likely after personal pronouns or titles
      const nameIndicators = ['my', 'i am', 'mr.', 'mrs.', 'ms.', 'dr.', 'professor', 'manager', 'supervisor'];
      if (nameIndicators.some(indicator => beforeContext.includes(indicator))) {
        return true; // More likely to be a name
      }
      
      // If it's just two capitalized words without context, be more conservative
      // Only flag if it looks like a typical name pattern (first name + last name)
      const words = match.split(/\s+/);
      if (words.length === 2) {
        // Common first names (very basic check)
        const commonFirstNames = ['john', 'jane', 'michael', 'sarah', 'david', 'emily', 'james', 'mary', 'robert', 'lisa'];
        const firstWord = words[0].toLowerCase();
        // If first word is a common name, more likely to be a real name
        if (commonFirstNames.includes(firstWord)) {
          return true;
        }
        // Otherwise, require more context
        return nameIndicators.some(indicator => beforeContext.includes(indicator));
      }
      
      return true; // Default to flagging (conservative approach)
    },
  },
  specificDate: {
    pattern: /\b(?:on|since|from|started|joined|hired)\s+(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)),?\s+\d{4}\b/gi,
    severity: 'low' as const,
    description: 'Specific dates (hire date, etc.) could narrow identification',
  },
  address: {
    pattern: /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Circle|Cir))[,\s]+[A-Z][a-z]+[,\s]+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/gi,
    severity: 'high' as const,
    description: 'Street addresses can identify locations',
  },
};

// Common false positives to exclude (static list)
const STATIC_FALSE_POSITIVES = [
  /New York/gi,
  /United Kingdom/gi,
  /United States/gi,
  /Los Angeles/gi,
  /San Francisco/gi,
  /New Jersey/gi,
  /New Mexico/gi,
  /North Carolina/gi,
  /South Carolina/gi,
  /New Hampshire/gi,
  /Rhode Island/gi,
  /Hiring Friends/gi,
  /Fraudulent Expenses/gi,
  /Data Protection/gi,
  /Human Resources/gi,
  /Chief Executive/gi,
  /Client Services/gi,
  /Team Lead/gi,
  /Account Manager/gi,
  /Senior Account/gi,
];

// Common business/legal phrases that aren't names
const BUSINESS_PHRASES = [
  /Hiring Friends/gi,
  /Fraudulent Expenses/gi,
  /Expense Report/gi,
  /Financial Misconduct/gi,
  /Workplace Behaviour/gi,
  /Code of Conduct/gi,
  /Policy Violation/gi,
  /Internal Audit/gi,
  /Compliance Issue/gi,
];

/**
 * Scan text for PII patterns
 */
export function scanForPII(text: string): PIIScanResult {
  if (!text || typeof text !== 'string') {
    return {
      detected: [],
      hasPII: false,
      highSeverityCount: 0,
      mediumSeverityCount: 0,
      lowSeverityCount: 0,
    };
  }

  const detected: PIIDetection[] = [];
  const processedMatches = new Set<string>(); // Track processed positions to avoid duplicates

  // Scan each PII pattern
  for (const [type, config] of Object.entries(PII_PATTERNS)) {
    const pattern = config.pattern;
    let match;

    // Reset regex lastIndex to ensure fresh search
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;
      const positionKey = `${start}-${end}-${type}`;

      // Skip if we've already processed this position
      if (processedMatches.has(positionKey)) {
        continue;
      }

      // Check for false positives (for name patterns)
      if (type === 'standaloneName' || type === 'possibleName') {
        let isFalsePositive = false;
        
        // Check static false positives
        for (const fpPattern of STATIC_FALSE_POSITIVES) {
          if (fpPattern.test(matchText)) {
            isFalsePositive = true;
            break;
          }
        }
        
        // Check business phrases
        if (!isFalsePositive) {
          for (const bpPattern of BUSINESS_PHRASES) {
            if (bpPattern.test(matchText)) {
              isFalsePositive = true;
              break;
            }
          }
        }
        
        // Additional context-aware validation for standalone names
        if (!isFalsePositive && type === 'standaloneName') {
          const beforeContext = text.substring(Math.max(0, match.index - 30), match.index).toLowerCase();
          const afterContext = text.substring(match.index + matchText.length, Math.min(text.length, match.index + matchText.length + 30)).toLowerCase();
          const contextText = beforeContext + ' ' + afterContext;
          
          // Exclude if it's clearly a business term
          const businessIndicators = [
            'report', 'expense', 'fraud', 'misconduct', 'violation', 'policy',
            'hiring', 'recruitment', 'process', 'procedure', 'system', 'department'
          ];
          
          const matchLower = matchText.toLowerCase();
          if (businessIndicators.some(indicator => matchLower.includes(indicator) || contextText.includes(indicator))) {
            isFalsePositive = true;
          }
          
          // Names are more likely after personal pronouns or titles
          if (!isFalsePositive) {
            const nameIndicators = ['my', 'i am', 'mr.', 'mrs.', 'ms.', 'dr.', 'professor', 'manager', 'supervisor'];
            const isLikelyName = nameIndicators.some(indicator => beforeContext.includes(indicator));
            
            // If no clear name context, be more conservative
            if (!isLikelyName) {
              const words = matchText.split(/\s+/);
              const commonFirstNames = ['john', 'jane', 'michael', 'sarah', 'david', 'emily', 'james', 'mary', 'robert', 'lisa'];
              if (words.length === 2 && !commonFirstNames.includes(words[0].toLowerCase())) {
                // Not a common first name and no context - likely false positive
                isFalsePositive = true;
              }
            }
          }
        }
        
        if (isFalsePositive) {
          continue;
        }
      }

      // Validate credit card using Luhn algorithm
      if (type === 'creditCard') {
        const digits = matchText.replace(/[-\s]/g, '');
        if (!isValidCreditCard(digits)) {
          continue;
        }
      }

      detected.push({
        type: type as PIIDetection['type'],
        text: matchText,
        position: { start, end },
        severity: config.severity,
        description: config.description,
      });

      processedMatches.add(positionKey);
    }
  }

  // Count by severity
  const highSeverityCount = detected.filter(d => d.severity === 'high').length;
  const mediumSeverityCount = detected.filter(d => d.severity === 'medium').length;
  const lowSeverityCount = detected.filter(d => d.severity === 'low').length;

  return {
    detected,
    hasPII: detected.length > 0,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
  };
}

/**
 * Validate credit card using Luhn algorithm
 */
function isValidCreditCard(cardNumber: string): boolean {
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Scan report data object for PII
 */
export function scanReportData(reportData: any): PIIScanResult {
  const allDetections: PIIDetection[] = [];
  let currentOffset = 0;

  // Scan all text fields
  const textFields = [
    reportData.title,
    reportData.description,
    reportData.incident_details,
    reportData.location,
    reportData.witnesses,
    reportData.evidence,
    reportData.additionalDetails,
  ].filter(Boolean);

  for (const field of textFields) {
    if (typeof field === 'string') {
      const result = scanForPII(field);
      // Adjust positions to account for field boundaries
      const adjustedDetections = result.detected.map(detection => ({
        ...detection,
        position: {
          start: detection.position.start + currentOffset,
          end: detection.position.end + currentOffset,
        },
      }));
      allDetections.push(...adjustedDetections);
      currentOffset += field.length + 1; // +1 for separator
    }
  }

  const highSeverityCount = allDetections.filter(d => d.severity === 'high').length;
  const mediumSeverityCount = allDetections.filter(d => d.severity === 'medium').length;
  const lowSeverityCount = allDetections.filter(d => d.severity === 'low').length;

  return {
    detected: allDetections,
    hasPII: allDetections.length > 0,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
  };
}

