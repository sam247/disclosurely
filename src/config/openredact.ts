/**
 * OpenRedact Configuration for Disclosurely
 * 
 * This configuration file defines settings for OpenRedact PII detection
 * across frontend and backend components.
 */

export interface OpenRedactConfig {
  frontend: {
    enableContextAnalysis: boolean;
    confidenceThreshold: number;
    debounce: number;
    cacheSize: number;
  };
  backend: {
    enableContextAnalysis: boolean;
    enableCache: boolean;
    cacheSize: number;
    confidenceThreshold: number;
    customPatterns?: Array<{
      type: string;
      regex: RegExp;
      placeholder: string;
      priority: number;
      severity: 'high' | 'medium' | 'low';
    }>;
  };
  compliance: {
    generateReports: boolean;
    auditLogPath?: string;
    reportFormat: 'html' | 'json';
  };
}

export const openRedactConfig: OpenRedactConfig = {
  // Frontend (client-side) configuration
  frontend: {
    enableContextAnalysis: true,
    confidenceThreshold: 0.4, // Lower threshold = catch more potential PII (strict for anonymous reports)
    debounce: 500, // ms - debounce time for real-time detection
    cacheSize: 100, // Number of detection results to cache
  },

  // Backend (server-side) configuration
  backend: {
    enableContextAnalysis: true,
    enableCache: true,
    cacheSize: 1000, // Number of detection results to cache
    confidenceThreshold: 0.6, // Balanced threshold for analysis
    customPatterns: [
      // Disclosurely-specific patterns for workplace reports
      {
        type: 'EMPLOYEE_ID',
        regex: /\b(?:EMP|EMPLOYEE|STAFF|OFFICE)[-\s#:]*[A-Z0-9]{2,3}[-_]?\d{3,8}\b/gi,
        placeholder: '[EMP_ID_{n}]',
        priority: 85,
        severity: 'high',
      },
      {
        type: 'CASE_TRACKING_ID',
        regex: /\b(?:CASE|REPORT|TRACKING)[-\s#:]*[A-Z0-9]{4,12}\b/gi,
        placeholder: '[CASE_ID_{n}]',
        priority: 80,
        severity: 'medium',
      },
    ],
  },

  // Compliance settings
  compliance: {
    generateReports: true,
    reportFormat: 'html',
  },
};

/**
 * Get OpenRedact configuration for a specific environment
 */
export function getOpenRedactConfig(environment: 'frontend' | 'backend' = 'backend'): OpenRedactConfig['frontend'] | OpenRedactConfig['backend'] {
  return openRedactConfig[environment];
}

