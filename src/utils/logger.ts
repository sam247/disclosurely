/**
 * Enhanced Centralized Logging System for Disclosurely
 * 
 * Features:
 * - Structured logging with PII sanitization
 * - Sentry integration for critical errors
 * - AI-powered log analysis via Supabase edge functions
 * - Local storage (IndexedDB) for offline troubleshooting
 * - Automatic error pattern detection
 * - Performance monitoring
 */

import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum LogContext {
  FRONTEND = 'frontend',
  EDGE_FUNCTION = 'edge_function',
  DATABASE = 'database',
  AUTH = 'auth',
  ENCRYPTION = 'encryption',
  AUDIT = 'audit',
  SUBMISSION = 'submission',
  MESSAGING = 'messaging',
  AI_ANALYSIS = 'ai_analysis',
  MONITORING = 'monitoring',
  SYSTEM = 'system',
  CASE_MANAGEMENT = 'case_management',
  CUSTOM_DOMAIN = 'custom_domain', // For CNAME/domain setup troubleshooting
  NETWORK = 'network',
  SECURITY = 'security'
}

/**
 * Sanitize log data to remove PII (PRIVACY FIX C3)
 * Removes emails, phones, names, IPs, and other identifying information
 */
function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  // If data is a string, check for PII patterns
  if (typeof data === 'string') {
    let sanitized = data;
    // Remove email addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    // Remove phone numbers (various formats)
    sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
    // Remove IP addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
    // Remove SSN patterns
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
    return sanitized;
  }
  
  // If data is an object, recursively sanitize
  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive keys entirely or hash them
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('ssn') || 
          lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret') ||
          lowerKey.includes('key') || lowerKey.includes('ip') || lowerKey.includes('address')) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey.includes('name') && typeof value === 'string' && value.length > 0) {
        // Hash names instead of removing
        sanitized[key] = `[NAME_${value.length}_CHARS]`;
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  // If data is an array, sanitize each element
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }
  
  return data;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  errorType?: string;
  errorCode?: string;
  performance?: {
    duration?: number;
    memoryUsage?: number;
  };
}

interface ErrorPattern {
  pattern: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  context: LogContext;
}

class Logger {
  private sessionId: string;
  private requestId: string;
  private userId?: string;
  private organizationId?: string;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private dbName = 'disclosurely_logs';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private maxLocalLogs = 1000; // Keep last 1000 logs locally

  constructor() {
    this.sessionId = this.generateSessionId();
    this.requestId = this.generateRequestId();
    this.initIndexedDB();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initIndexedDB(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return; // Not available in SSR
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        // Silent fail - IndexedDB not critical
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.cleanupOldLogs();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
          store.createIndex('context', 'context', { unique: false });
        }
      };
    } catch (error) {
      // Silent fail - IndexedDB not critical
    }
  }

  private async storeLogLocally(logEntry: LogEntry): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      await store.add({
        ...logEntry,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    } catch (error) {
      // Silent fail - local storage not critical
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      let count = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && count >= this.maxLocalLogs) {
          cursor.delete();
          cursor.continue();
        } else if (cursor) {
          count++;
          cursor.continue();
        }
      };
    } catch (error) {
      // Silent fail
    }
  }

  setUserContext(userId?: string, organizationId?: string) {
    this.userId = userId;
    this.organizationId = organizationId;
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  private createLogEntry(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    // Sanitize data to remove PII before logging (PRIVACY FIX C3)
    const sanitizedData = sanitizeLogData(data);
    const sanitizedMessage = sanitizeLogData(message);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof sanitizedMessage === 'string' ? sanitizedMessage : message,
      data: sanitizedData,
      userId: this.userId,
      organizationId: this.organizationId,
      sessionId: this.sessionId,
      requestId: this.requestId,
      stack: error?.stack ? sanitizeLogData(error.stack) as string : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    if (error) {
      entry.errorType = error.constructor.name;
      entry.errorCode = (error as any).code || (error as any).statusCode;
    }

    // Add performance metrics for errors
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      if (typeof performance !== 'undefined' && performance.memory) {
        entry.performance = {
          memoryUsage: (performance as any).memory?.usedJSHeapSize
        };
      }
    }

    return entry;
  }

  private detectErrorPattern(logEntry: LogEntry): void {
    if (logEntry.level !== LogLevel.ERROR && logEntry.level !== LogLevel.CRITICAL) {
      return;
    }

    const patternKey = `${logEntry.context}:${logEntry.message.substring(0, 100)}`;
    const existing = this.errorPatterns.get(patternKey);

    if (existing) {
      existing.count++;
      existing.lastSeen = logEntry.timestamp;
    } else {
      this.errorPatterns.set(patternKey, {
        pattern: logEntry.message,
        count: 1,
        firstSeen: logEntry.timestamp,
        lastSeen: logEntry.timestamp,
        context: logEntry.context
      });
    }

    // Auto-trigger AI analysis if pattern repeats 5+ times in 1 hour
    const pattern = this.errorPatterns.get(patternKey);
    if (pattern && pattern.count >= 5) {
      const timeDiff = new Date(pattern.lastSeen).getTime() - new Date(pattern.firstSeen).getTime();
      if (timeDiff < 3600000) { // 1 hour
        this.triggerAIAnalysis('1h', 'ERROR', logEntry.context).catch(() => {
          // Silent fail
        });
      }
    }
  }

  private async sendLog(logEntry: LogEntry): Promise<void> {
    // Store locally for offline troubleshooting
    await this.storeLogLocally(logEntry);

    // Only send to server in production or if explicitly enabled
    if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_LOG_SERVER === 'true') {
      try {
        // Future: Send to logging endpoint when available
        // For now, logs are stored locally and can be exported
      } catch (error) {
        // Silent fail - don't break the app if logging fails
      }
    }
  }

  private log(level: LogLevel, context: LogContext, message: string, data?: any, error?: Error) {
    const logEntry = this.createLogEntry(level, context, message, data, error);
    
    // Detect error patterns for troubleshooting
    this.detectErrorPattern(logEntry);

    // Send to Sentry for critical errors only (to stay within free tier)
    if (level === LogLevel.CRITICAL && error) {
      Sentry.captureException(error, {
        tags: {
          context: context,
          level: level,
          component: context
        },
        extra: {
          message: logEntry.message,
          data: logEntry.data,
          userId: logEntry.userId,
          organizationId: logEntry.organizationId
        }
      });
    }

    // Send to our logging system
    this.sendLog(logEntry).catch(() => {
      // Silent fail - don't break the app if logging fails
    });
  }

  debug(context: LogContext, message: string, data?: any) {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: LogContext, message: string, data?: any) {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: LogContext, message: string, data?: any) {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: LogContext, message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, context, message, data, error);
  }

  critical(context: LogContext, message: string, error?: Error, data?: any) {
    this.log(LogLevel.CRITICAL, context, message, data, error);
  }

  // Convenience methods for common scenarios
  submissionStart(trackingId: string, data?: any) {
    this.info(LogContext.SUBMISSION, `Submission started for ${trackingId}`, data);
  }

  submissionSuccess(trackingId: string, reportId: string, data?: any) {
    this.info(LogContext.SUBMISSION, `Submission successful: ${trackingId} -> ${reportId}`, data);
  }

  submissionError(trackingId: string, error: Error, data?: any) {
    this.error(LogContext.SUBMISSION, `Submission failed for ${trackingId}`, error, data);
  }

  encryptionSuccess(context: string, data?: any) {
    this.info(LogContext.ENCRYPTION, `Encryption successful: ${context}`, data);
  }

  encryptionError(context: string, error: Error, data?: any) {
    this.error(LogContext.ENCRYPTION, `Encryption failed: ${context}`, error, data);
  }

  edgeFunctionCall(functionName: string, data?: any) {
    this.info(LogContext.EDGE_FUNCTION, `Calling Edge Function: ${functionName}`, data);
  }

  edgeFunctionSuccess(functionName: string, data?: any) {
    this.info(LogContext.EDGE_FUNCTION, `Edge Function success: ${functionName}`, data);
  }

  edgeFunctionError(functionName: string, error: Error, data?: any) {
    this.error(LogContext.EDGE_FUNCTION, `Edge Function error: ${functionName}`, error, data);
  }

  databaseQuery(query: string, data?: any) {
    this.debug(LogContext.DATABASE, `Database query: ${query}`, data);
  }

  databaseError(query: string, error: Error, data?: any) {
    this.error(LogContext.DATABASE, `Database error: ${query}`, error, data);
  }

  // Custom domain/CNAME specific logging
  customDomainError(action: string, error: Error, data?: any) {
    this.error(LogContext.CUSTOM_DOMAIN, `Custom domain ${action} failed`, error, data);
    // Also send to Sentry for CNAME issues (critical infrastructure)
    Sentry.captureException(error, {
      tags: {
        context: LogContext.CUSTOM_DOMAIN,
        action: action,
        component: 'CustomDomain'
      },
      extra: {
        action,
        data: sanitizeLogData(data)
      }
    });
  }

  customDomainInfo(action: string, data?: any) {
    this.info(LogContext.CUSTOM_DOMAIN, `Custom domain ${action}`, data);
  }

  // AI Analysis methods - Enhanced to use Supabase edge functions
  async triggerAIAnalysis(timeRange: string = '24h', logLevel: string = 'ERROR', context?: LogContext): Promise<any> {
    try {
      this.info(LogContext.AI_ANALYSIS, `Triggering AI analysis for ${timeRange}`, { timeRange, logLevel, context });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('analyze-logs-with-ai', {
        body: {
          analysisType: 'recent',
          timeRange,
          logLevel,
          context: context || null
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });
      
      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        this.info(LogContext.AI_ANALYSIS, 'AI analysis completed', response.data);
        return response.data;
      } else {
        throw new Error('No data returned from AI analysis');
      }
    } catch (error) {
      this.error(LogContext.AI_ANALYSIS, 'AI analysis trigger failed', error as Error);
      throw error;
    }
  }

  async checkSystemHealth(): Promise<any> {
    try {
      this.info(LogContext.MONITORING, 'Checking system health');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('monitor-logs-realtime', {
        body: {
          enableRealTimeAnalysis: true
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });
      
      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        this.info(LogContext.MONITORING, `System health check: ${response.data.status || 'unknown'}`, response.data);
        return response.data;
      } else {
        throw new Error('No data returned from health check');
      }
    } catch (error) {
      this.error(LogContext.MONITORING, 'System health check failed', error as Error);
      throw error;
    }
  }

  // Get error patterns for troubleshooting
  getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values());
  }

  // Export logs for troubleshooting
  async exportLogs(limit: number = 100): Promise<LogEntry[]> {
    if (!this.db) {
      return [];
    }

    try {
      const transaction = this.db.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const logs: LogEntry[] = [];
      
      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && logs.length < limit) {
            logs.push(cursor.value);
            cursor.continue();
          } else {
            resolve(logs);
          }
        };
        
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (error) {
      return [];
    }
  }

  // Enhanced error logging with automatic AI analysis for critical errors
  criticalWithAI(context: LogContext, message: string, error?: Error, data?: any) {
    this.critical(context, message, error, data);
    
    // Automatically trigger AI analysis for critical errors (debounced)
    setTimeout(() => {
      this.triggerAIAnalysis('1h', 'CRITICAL', context).catch(() => {
        // Silent fail - don't break the app if AI analysis fails
      });
    }, 1000);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (context: LogContext, message: string, data?: any) => logger.debug(context, message, data),
  info: (context: LogContext, message: string, data?: any) => logger.info(context, message, data),
  warn: (context: LogContext, message: string, data?: any) => logger.warn(context, message, data),
  error: (context: LogContext, message: string, error?: Error, data?: any) => logger.error(context, message, error, data),
  critical: (context: LogContext, message: string, error?: Error, data?: any) => logger.critical(context, message, error, data),
  
  // Convenience methods
  submissionStart: (trackingId: string, data?: any) => logger.submissionStart(trackingId, data),
  submissionSuccess: (trackingId: string, reportId: string, data?: any) => logger.submissionSuccess(trackingId, reportId, data),
  submissionError: (trackingId: string, error: Error, data?: any) => logger.submissionError(trackingId, error, data),
  encryptionSuccess: (context: string, data?: any) => logger.encryptionSuccess(context, data),
  encryptionError: (context: string, error: Error, data?: any) => logger.encryptionError(context, error, data),
  edgeFunctionCall: (functionName: string, data?: any) => logger.edgeFunctionCall(functionName, data),
  edgeFunctionSuccess: (functionName: string, data?: any) => logger.edgeFunctionSuccess(functionName, data),
  edgeFunctionError: (functionName: string, error: Error, data?: any) => logger.edgeFunctionError(functionName, error, data),
  databaseQuery: (query: string, data?: any) => logger.databaseQuery(query, data),
  databaseError: (query: string, error: Error, data?: any) => logger.databaseError(query, error, data),
  
  // Custom domain methods
  customDomainError: (action: string, error: Error, data?: any) => logger.customDomainError(action, error, data),
  customDomainInfo: (action: string, data?: any) => logger.customDomainInfo(action, data),
  
  // AI Analysis convenience methods
  triggerAIAnalysis: (timeRange?: string, logLevel?: string, context?: LogContext) => logger.triggerAIAnalysis(timeRange, logLevel, context),
  checkSystemHealth: () => logger.checkSystemHealth(),
  criticalWithAI: (context: LogContext, message: string, error?: Error, data?: any) => logger.criticalWithAI(context, message, error, data),
  
  // Troubleshooting methods
  getErrorPatterns: () => logger.getErrorPatterns(),
  exportLogs: (limit?: number) => logger.exportLogs(limit),
  
  // Context management
  setUserContext: (userId?: string, organizationId?: string) => logger.setUserContext(userId, organizationId),
  setRequestId: (requestId: string) => logger.setRequestId(requestId),
};
