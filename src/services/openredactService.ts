/**
 * OpenRedact Service Wrapper for Disclosurely
 * 
 * This service provides a unified interface to OpenRedact library
 * with Disclosurely-specific configuration and local learning capability.
 */

import { openRedactConfig } from '@/config/openredact';

// Type definitions (will be replaced with actual OpenRedact types once published)
export interface OpenRedactDetection {
  type: string;
  value: string;
  position: { start: number; end: number };
  severity: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface OpenRedactResult {
  redacted: string;
  detections: OpenRedactDetection[];
  stats?: {
    processingTime: number;
    piiCount: number;
  };
}

export interface LearningStore {
  falsePositives: Array<{
    text: string;
    type: string;
    context?: string;
    timestamp: string;
  }>;
  falseNegatives: Array<{
    text: string;
    type: string;
    context?: string;
    timestamp: string;
  }>;
  patterns: Array<{
    type: string;
    pattern: string;
    confidence: number;
  }>;
}

/**
 * OpenRedact Service Class
 * 
 * Provides PII detection and redaction with local learning capability.
 * Learning data is stored in Supabase storage or local file system.
 */
export class OpenRedactService {
  private detector: any; // Will be OpenRedact instance once published
  private learningStore: LearningStore | null = null;
  private learningStorePath: string;
  private isInitialized: boolean = false;

  constructor(learningStorePath: string = 'pii-learnings') {
    this.learningStorePath = learningStorePath;
  }

  /**
   * Initialize OpenRedact detector
   * This will be called once OpenRedact is published and installed
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // NOTE: OpenRedact uses Node.js fs/path modules and cannot run in the browser
      // This service is for server-side use only (edge functions)
      // For browser/client-side, use API endpoints that call server-side OpenRedact
      console.warn('[OpenRedact] Service is for server-side use only. Use API endpoints from client-side.');
      
      // Load learning store
      await this.loadLearningStore();

      this.isInitialized = true;
    } catch (error) {
      console.error('[OpenRedact] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Detect PII in text
   */
  async detect(text: string): Promise<OpenRedactResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.detector) {
      // Fallback: return empty result if OpenRedact not available
      return {
        redacted: text,
        detections: [],
        stats: {
          processingTime: 0,
          piiCount: 0,
        },
      };
    }

    try {
      // Use actual OpenRedact API
      const result = this.detector.detect(text);
      return this.mapOpenRedactResult(result);
    } catch (error) {
      console.error('[OpenRedact] Detection error:', error);
      throw error;
    }
  }

  /**
   * Record false positive (detected as PII but shouldn't be)
   */
  async recordFalsePositive(
    text: string,
    detectedType: string,
    context?: string
  ): Promise<void> {
    if (!this.learningStore) {
      await this.loadLearningStore();
    }

    if (this.learningStore) {
      this.learningStore.falsePositives.push({
        text,
        type: detectedType,
        context,
        timestamp: new Date().toISOString(),
      });

      await this.saveLearningStore();
    }
  }

  /**
   * Record false negative (should be detected as PII but wasn't)
   */
  async recordFalseNegative(
    text: string,
    expectedType: string,
    context?: string
  ): Promise<void> {
    if (!this.learningStore) {
      await this.loadLearningStore();
    }

    if (this.learningStore) {
      this.learningStore.falseNegatives.push({
        text,
        type: expectedType,
        context,
        timestamp: new Date().toISOString(),
      });

      await this.saveLearningStore();
    }
  }

  /**
   * Load learning store from Supabase storage or local file
   */
  private async loadLearningStore(): Promise<void> {
    try {
      // TODO: Load from Supabase storage
      // For now, initialize empty store
      this.learningStore = {
        falsePositives: [],
        falseNegatives: [],
        patterns: [],
      };
    } catch (error) {
      console.error('[OpenRedact] Error loading learning store:', error);
      this.learningStore = {
        falsePositives: [],
        falseNegatives: [],
        patterns: [],
      };
    }
  }

  /**
   * Save learning store to Supabase storage or local file
   */
  private async saveLearningStore(): Promise<void> {
    if (!this.learningStore) {
      return;
    }

    try {
      // TODO: Save to Supabase storage
      console.log('[OpenRedact] Learning store updated (not yet persisted)');
    } catch (error) {
      console.error('[OpenRedact] Error saving learning store:', error);
    }
  }

  /**
   * Export learnings for contributing back to OpenRedact
   */
  async exportLearnings(options?: {
    minConfidence?: number;
    includeContexts?: boolean;
  }): Promise<LearningStore> {
    if (!this.learningStore) {
      await this.loadLearningStore();
    }

    const learnings = { ...this.learningStore! };

    // Filter by confidence if specified
    if (options?.minConfidence) {
      learnings.patterns = learnings.patterns.filter(
        p => p.confidence >= options.minConfidence!
      );
    }

    // Remove contexts if not included (for privacy)
    if (!options?.includeContexts) {
      learnings.falsePositives = learnings.falsePositives.map(fp => ({
        ...fp,
        context: undefined,
      }));
      learnings.falseNegatives = learnings.falseNegatives.map(fn => ({
        ...fn,
        context: undefined,
      }));
    }

    return learnings;
  }

  /**
   * Map OpenRedact result to our internal format
   */
  private mapOpenRedactResult(result: any): OpenRedactResult {
    // Map OpenRedact result format to our internal format
    return {
      redacted: result.redacted || result.text || '',
      detections: (result.detections || []).map((d: any) => ({
        type: d.type,
        value: d.value || d.text || '',
        position: d.position || { start: 0, end: 0 },
        severity: d.severity || 'medium',
        confidence: d.confidence || 1.0,
      })),
      stats: result.stats || {
        processingTime: result.processingTime || 0,
        piiCount: result.detections?.length || 0,
      },
    };
  }
}

// Singleton instance
let serviceInstance: OpenRedactService | null = null;

/**
 * Get OpenRedact service instance
 */
export function getOpenRedactService(learningStorePath?: string): OpenRedactService {
  if (!serviceInstance) {
    serviceInstance = new OpenRedactService(learningStorePath);
  }
  return serviceInstance;
}

