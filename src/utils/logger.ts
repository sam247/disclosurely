/**
 * Centralized Logging System for Disclosurely
 * 
 * This provides structured logging with different levels, contexts, and automatic
 * error tracking. All logs are sent to a central endpoint for analysis.
 */

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
  CASE_MANAGEMENT = 'case_management'
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
}

class Logger {
  private sessionId: string;
  private requestId: string;
  private userId?: string;
  private organizationId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.requestId = this.generateRequestId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    
    return {
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
  }

  private async sendLog(logEntry: LogEntry): Promise<void> {
    try {
      // Send to our custom log endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      // Fallback to console if logging fails
      console.error('Failed to send log:', error);
    }
  }

  private log(level: LogLevel, context: LogContext, message: string, data?: any, error?: Error) {
    const logEntry = this.createLogEntry(level, context, message, data, error);
    
    // Always log to console for immediate debugging
    const consoleMethod = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'error' : 
                         level === LogLevel.WARN ? 'warn' : 'log';
    
    console[consoleMethod](`[${level.toUpperCase()}] ${context}: ${message}`, data || '', error || '');
    
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

  // AI Analysis methods
  async triggerAIAnalysis(timeRange: string = '24h', logLevel: string = 'ERROR') {
    try {
      this.info(LogContext.AI_ANALYSIS, `Triggering AI analysis for ${timeRange}`, { timeRange, logLevel });
      
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'recent', timeRange, logLevel })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.info(LogContext.AI_ANALYSIS, 'AI analysis completed', result);
        return result;
      } else {
        throw new Error(`AI analysis failed: ${response.status}`);
      }
    } catch (error) {
      this.error(LogContext.AI_ANALYSIS, 'AI analysis trigger failed', error as Error);
      throw error;
    }
  }

  async checkSystemHealth() {
    try {
      this.info(LogContext.MONITORING, 'Checking system health');
      
      const response = await fetch('/api/monitor-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enableRealTimeAnalysis: true })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.info(LogContext.MONITORING, `System health check: ${result.status}`, result);
        return result;
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.error(LogContext.MONITORING, 'System health check failed', error as Error);
      throw error;
    }
  }

  // Enhanced error logging with automatic AI analysis for critical errors
  criticalWithAI(context: LogContext, message: string, error?: Error, data?: any) {
    this.critical(context, message, error, data);
    
    // Automatically trigger AI analysis for critical errors
    setTimeout(() => {
      this.triggerAIAnalysis('1h', 'CRITICAL').catch(() => {
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
  
  // AI Analysis convenience methods
  triggerAIAnalysis: (timeRange?: string, logLevel?: string) => logger.triggerAIAnalysis(timeRange, logLevel),
  checkSystemHealth: () => logger.checkSystemHealth(),
  criticalWithAI: (context: LogContext, message: string, error?: Error, data?: any) => logger.criticalWithAI(context, message, error, data),
};
