/**
 * React Hook for Real-time PII Detection
 * 
 * Provides debounced PII detection for form inputs with OpenRedact support
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const detectPIIInText = useCallback(async (textToScan: string) => {
    if (!textToScan || textToScan.trim().length === 0) {
      setDetections([]);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);

    try {
      // Use OpenRedaction API via Edge Function
      const { data, error } = await supabase.functions.invoke('detect-pii', {
        body: {
          text: textToScan,
          enable_ai: true
        }
      });

      if (error) {
        console.error('[usePIIDetector] API error:', error);
        setDetections([]);
        return;
      }

      // Map API response to hook format
      const result: PIIDetectionResult['detections'] = (data?.detections || []).map((det: any) => ({
        type: det.type,
        text: det.original || det.value || '',
        position: { start: det.start || det.position?.start || 0, end: det.end || det.position?.end || 0 },
        severity: det.severity || (det.type === 'SSN' || det.type === 'EMAIL' || det.type === 'PHONE' ? 'high' : 'medium'),
      }));

      setDetections(result);
    } catch (error) {
      console.error('[usePIIDetector] Error detecting PII:', error);
      setDetections([]);
    } finally {
      setIsDetecting(false);
    }
  }, [organizationId]);

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

