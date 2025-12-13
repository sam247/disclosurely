/**
 * React Hook for Real-time PII Detection
 * 
 * Provides debounced PII detection for form inputs with OpenRedact support
 */

import { useState, useEffect, useCallback } from 'react';
import { useFeatureFlag } from './useFeatureFlag';
import { scanForPrivacyRisks } from '@/utils/privacyDetection';
import { detectPII } from '@/utils/pii-detector-client';

export interface PIIDetectionResult {
  hasPII: boolean;
  detections: Array<{
    type: string;
    text: string;
    position: { start: number; end: number };
    severity: 'high' | 'medium' | 'low';
  }>;
  isDetecting: boolean;
}

export interface UsePIIDetectorOptions {
  debounce?: number;
  enableContextAnalysis?: boolean;
  confidenceThreshold?: number;
  organizationId?: string;
}

/**
 * Hook for real-time PII detection with debouncing
 * 
 * @param text - Text to scan for PII
 * @param options - Configuration options
 * @returns Detection result with hasPII, detections, and isDetecting state
 * 
 * @example
 * const { hasPII, detections, isDetecting } = usePIIDetector(reportText, {
 *   debounce: 500,
 *   organizationId: orgId
 * });
 */
export function usePIIDetector(
  text: string,
  options: UsePIIDetectorOptions = {}
): PIIDetectionResult {
  const {
    debounce = 500,
    enableContextAnalysis = true,
    confidenceThreshold = 0.4,
    organizationId,
  } = options;

  const [detections, setDetections] = useState<PIIDetectionResult['detections']>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  // Check if OpenRedact feature flag is enabled
  const { data: useOpenRedact = false } = useFeatureFlag('use_openredact', organizationId);

  const detectPIIInText = useCallback(async (textToScan: string) => {
    if (!textToScan || textToScan.trim().length === 0) {
      setDetections([]);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);

    try {
      let result: PIIDetectionResult['detections'] = [];

      // OpenRedact uses Node.js fs/path modules and cannot run in the browser
      // For client-side, always use legacy implementation
      // OpenRedact is only used in server-side edge functions
      // The feature flag check is kept for future API endpoint implementation
      if (false) { // Disabled: OpenRedact is Node.js only
        // Future: Call API endpoint that uses OpenRedact server-side
      } else {
        // Use legacy detection
        const privacyRisks = await scanForPrivacyRisks(textToScan, organizationId);
        result = privacyRisks.map(risk => ({
          type: risk.type,
          text: risk.text,
          position: risk.position,
          severity: risk.severity,
        }));
      }

      setDetections(result);
    } catch (error) {
      console.error('[usePIIDetector] Error detecting PII:', error);
      setDetections([]);
    } finally {
      setIsDetecting(false);
    }
  }, [useOpenRedact, confidenceThreshold, enableContextAnalysis, organizationId]);

  // Debounced detection
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      detectPIIInText(text);
    }, debounce);

    return () => clearTimeout(timeoutId);
  }, [text, debounce, detectPIIInText]);

  return {
    hasPII: detections.length > 0,
    detections,
    isDetecting,
  };
}

