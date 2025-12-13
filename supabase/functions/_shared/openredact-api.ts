/**
 * OpenRedaction.com API Client
 * 
 * Uses the hosted API with both regex and AI for maximum PII detection coverage
 * API Documentation: https://openredaction.com/docs/api-reference
 */

const OPENREDACT_API_URL = 'https://openredaction-api.onrender.com';
const OPENREDACT_API_KEY = Deno.env.get('OPENREDACT_API_KEY');

export interface OpenRedactAPIResult {
  redacted_text?: string;
  text?: string; // Original text (for detection endpoint)
  detections?: Array<{
    type: string;
    value: string;
    position: { start: number; end: number };
    severity?: 'high' | 'medium' | 'low';
    confidence?: number;
  }>;
  entities?: Array<{
    type: string;
    value: string;
    start: number;
    end: number;
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
 * Uses POST /v1/ai-detect endpoint
 */
export async function callOpenRedactAPI(
  request: OpenRedactAPIRequest
): Promise<OpenRedactAPIResult> {
  // API key is optional for free tier, but required for Pro tier
  // We'll include it if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (OPENREDACT_API_KEY) {
    headers['x-api-key'] = OPENREDACT_API_KEY;
  }

  try {
    const response = await fetch(`${OPENREDACT_API_URL}/v1/ai-detect`, {
      method: 'POST',
      headers,
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
    
    // Map API response to our format
    // The API returns entities array, we need to map it to detections
    const detections = data.entities?.map((entity: any) => ({
      type: entity.type,
      value: entity.value,
      position: { start: entity.start, end: entity.end },
      confidence: entity.confidence,
      severity: getSeverityFromType(entity.type),
    })) || [];
    
    return {
      redacted_text: data.redacted_text || data.text,
      detections,
      stats: {
        processingTime: 0, // API doesn't return this
        piiCount: detections.length,
      },
    };
  } catch (error) {
    console.error('[OpenRedact API] Error calling API:', error);
    throw error;
  }
}

/**
 * Detect PII using OpenRedaction.com API (detection only, no redaction)
 * Uses POST /v1/ai-detect endpoint
 */
export async function detectPIIWithAPI(
  text: string,
  enableAI: boolean = true
): Promise<OpenRedactAPIResult['detections']> {
  // API key is optional for free tier, but required for Pro tier
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (OPENREDACT_API_KEY) {
    headers['x-api-key'] = OPENREDACT_API_KEY;
  }

  try {
    const response = await fetch(`${OPENREDACT_API_URL}/v1/ai-detect`, {
      method: 'POST',
      headers,
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
    
    // Map API response entities to detections format
    const detections = data.entities?.map((entity: any) => ({
      type: entity.type,
      value: entity.value,
      position: { start: entity.start, end: entity.end },
      confidence: entity.confidence,
      severity: getSeverityFromType(entity.type),
    })) || [];
    
    return detections;
  } catch (error) {
    console.error('[OpenRedact API] Error detecting PII:', error);
    throw error;
  }
}

/**
 * Map entity types to severity levels
 */
function getSeverityFromType(type: string): 'high' | 'medium' | 'low' {
  const highSeverityTypes = ['SSN', 'CREDIT_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'DATE_OF_BIRTH'];
  const mediumSeverityTypes = ['EMAIL', 'PHONE', 'ADDRESS', 'IP_ADDRESS'];
  
  if (highSeverityTypes.includes(type)) return 'high';
  if (mediumSeverityTypes.includes(type)) return 'medium';
  return 'low';
}
