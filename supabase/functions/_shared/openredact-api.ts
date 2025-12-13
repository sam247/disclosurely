/**
 * OpenRedaction.com API Client
 * 
 * Uses the hosted API with both regex and AI for maximum PII detection coverage
 */

const OPENREDACT_API_URL = 'https://api.openredaction.com';
const OPENREDACT_API_KEY = Deno.env.get('OPENREDACT_API_KEY');

export interface OpenRedactAPIResult {
  redacted_text: string;
  detections?: Array<{
    type: string;
    value: string;
    position: { start: number; end: number };
    severity?: 'high' | 'medium' | 'low';
    confidence?: number;
  }>;
  stats?: {
    processingTime: number;
    piiCount: number;
  };
}

export interface OpenRedactAPIRequest {
  text: string;
  enable_ai?: boolean; // Use AI assist for better coverage
  entity_types?: string[]; // Optional: specific entity types to detect
}

/**
 * Call OpenRedaction.com API for PII detection and redaction
 */
export async function callOpenRedactAPI(
  request: OpenRedactAPIRequest
): Promise<OpenRedactAPIResult> {
  if (!OPENREDACT_API_KEY) {
    throw new Error('OPENREDACT_API_KEY not configured');
  }

  try {
    const response = await fetch(`${OPENREDACT_API_URL}/redact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENREDACT_API_KEY}`,
      },
      body: JSON.stringify({
        text: request.text,
        enable_ai: request.enable_ai ?? true, // Default to true for maximum coverage
        entity_types: request.entity_types, // Optional
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRedact API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[OpenRedact API] Error calling API:', error);
    throw error;
  }
}

/**
 * Detect PII using OpenRedaction.com API (detection only, no redaction)
 */
export async function detectPIIWithAPI(
  text: string,
  enableAI: boolean = true
): Promise<OpenRedactAPIResult['detections']> {
  if (!OPENREDACT_API_KEY) {
    throw new Error('OPENREDACT_API_KEY not configured');
  }

  try {
    const response = await fetch(`${OPENREDACT_API_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENREDACT_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        enable_ai: enableAI,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRedact API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data.detections || [];
  } catch (error) {
    console.error('[OpenRedact API] Error detecting PII:', error);
    throw error;
  }
}
