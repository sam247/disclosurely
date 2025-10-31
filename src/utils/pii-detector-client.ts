/**
 * Client-Side PII Detection for Preview
 * Matches patterns from enhanced server-side detector
 * Used for real-time preview before AI analysis
 */

export interface PIIDetection {
  type: string;
  original: string;
  placeholder: string;
  start: number;
  end: number;
}

export interface RedactionResult {
  redactedText: string;
  detections: PIIDetection[];
  piiCount: number;
  stats: Record<string, number>;
}

/**
 * Luhn algorithm for credit card validation
 */
function validateCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/[\s-]/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate UK National Insurance number
 */
function validateNINumber(ni: string): boolean {
  const normalized = ni.replace(/\s/g, '').toUpperCase();
  const invalidPrefixes = ['BG', 'GB', 'NK', 'KN', 'TN', 'NT', 'ZZ'];
  const prefix = normalized.substring(0, 2);

  if (invalidPrefixes.includes(prefix)) return false;
  if ('DFIQUV'.includes(normalized[0])) return false;
  if ('DFOQUV'.includes(normalized[1])) return false;

  return true;
}

/**
 * Validate IPv4 address
 */
function validateIPv4(ip: string): boolean {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;

  return octets.every(octet => {
    const num = parseInt(octet);
    return num >= 0 && num <= 255 && octet === num.toString();
  });
}

/**
 * Validate email domain
 */
function validateEmail(email: string): boolean {
  const tldPattern = /\.(com|org|net|edu|gov|co\.uk|ac\.uk|io|ai|app|dev|tech|uk|us)$/i;
  return tldPattern.test(email);
}

interface PIIPattern {
  type: string;
  regex: RegExp;
  validator?: (match: string) => boolean;
  priority: number;
}

/**
 * Get PII patterns (matches server-side enhanced detector)
 */
function getPIIPatterns(): PIIPattern[] {
  return [
    // Priority 100: Structured identifiers
    {
      type: 'EMAIL',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      validator: validateEmail,
      priority: 100
    },
    {
      type: 'SSN',
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      priority: 100
    },
    {
      type: 'NI_NUMBER',
      regex: /\b[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]{1}\b/gi,
      validator: validateNINumber,
      priority: 100
    },
    {
      type: 'CREDIT_CARD',
      regex: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
      validator: validateCreditCard,
      priority: 100
    },

    // Priority 90: Phone numbers
    {
      type: 'PHONE_UK_MOBILE',
      regex: /\b(?:0|\+?44\s?)7\d{3}\s?\d{6}\b/g,
      priority: 90
    },
    {
      type: 'PHONE_UK_LANDLINE',
      regex: /\b0\d{2,4}\s?\d{3,4}\s?\d{3,4}\b/g,
      priority: 89
    },
    {
      type: 'PHONE_US',
      regex: /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
      priority: 88
    },

    // Priority 80: Government IDs
    {
      type: 'PASSPORT_UK',
      regex: /\b[0-9]{9}[A-Z]{3}\b/g,
      priority: 80
    },

    // Priority 70: Addresses
    {
      type: 'POSTCODE_UK',
      regex: /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/gi,
      priority: 70
    },

    // Priority 60: Network
    {
      type: 'IP_ADDRESS',
      regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      validator: validateIPv4,
      priority: 60
    },

    // Priority 50: Dates
    {
      type: 'DATE_DDMMYYYY',
      regex: /\b(?:0?[1-9]|[12]\d|3[01])[\/\.-](?:0?[1-9]|1[0-2])[\/\.-](?:19|20)\d{2}\b/g,
      priority: 50
    }
  ];
}

/**
 * Detect PII in text and return redaction result
 */
export function detectPII(text: string): RedactionResult {
  const detections: PIIDetection[] = [];
  const stats: Record<string, number> = {};
  const patterns = getPIIPatterns();

  // Sort by priority (highest first)
  patterns.sort((a, b) => b.priority - a.priority);

  // Track what's been matched to avoid overlaps
  const matchedRanges: Array<{ start: number; end: number }> = [];

  // Check each pattern
  patterns.forEach(pattern => {
    pattern.regex.lastIndex = 0; // Reset regex
    let match;

    while ((match = pattern.regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Check if this overlaps with existing matches
      const overlaps = matchedRanges.some(
        range => 
          (matchStart >= range.start && matchStart < range.end) ||
          (matchEnd > range.start && matchEnd <= range.end)
      );

      if (overlaps) continue;

      // Validate if validator exists
      if (pattern.validator && !pattern.validator(match[0])) {
        continue;
      }

      // Record this match
      matchedRanges.push({ start: matchStart, end: matchEnd });

      // Update stats
      stats[pattern.type] = (stats[pattern.type] || 0) + 1;

      // Create detection
      const count = stats[pattern.type];
      detections.push({
        type: pattern.type,
        original: match[0],
        placeholder: `[${pattern.type}_${count}]`,
        start: matchStart,
        end: matchEnd
      });
    }
  });

  // Sort detections by start position (reverse for replacement)
  detections.sort((a, b) => b.start - a.start);

  // Build redacted text
  let redactedText = text;
  detections.forEach(detection => {
    redactedText = 
      redactedText.substring(0, detection.start) +
      detection.placeholder +
      redactedText.substring(detection.end);
  });

  return {
    redactedText,
    detections: detections.reverse(), // Show in original order
    piiCount: detections.length,
    stats
  };
}

/**
 * Highlight PII in text for display (returns JSX)
 */
export function highlightPIIForDisplay(
  text: string, 
  detections: PIIDetection[]
): Array<{ text: string; isPII: boolean; type?: string; placeholder?: string }> {
  if (detections.length === 0) {
    return [{ text, isPII: false }];
  }

  const parts: Array<{ text: string; isPII: boolean; type?: string; placeholder?: string }> = [];
  let lastIndex = 0;

  // Sort by start position
  const sortedDetections = [...detections].sort((a, b) => a.start - b.start);

  sortedDetections.forEach(detection => {
    // Text before PII
    if (detection.start > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, detection.start),
        isPII: false
      });
    }

    // PII text
    parts.push({
      text: detection.original,
      isPII: true,
      type: detection.type,
      placeholder: detection.placeholder
    });

    lastIndex = detection.end;
  });

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isPII: false
    });
  }

  return parts;
}

/**
 * Format PII type for display
 */
export function formatPIIType(type: string): string {
  const typeMap: Record<string, string> = {
    'EMAIL': 'Email Address',
    'PHONE_UK_MOBILE': 'UK Mobile',
    'PHONE_UK_LANDLINE': 'UK Landline',
    'PHONE_US': 'US Phone',
    'SSN': 'Social Security Number',
    'NI_NUMBER': 'National Insurance',
    'CREDIT_CARD': 'Credit Card',
    'PASSPORT_UK': 'UK Passport',
    'POSTCODE_UK': 'UK Postcode',
    'IP_ADDRESS': 'IP Address',
    'DATE_DDMMYYYY': 'Date'
  };

  return typeMap[type] || type.replace(/_/g, ' ');
}

