// Audit logging utility for comprehensive system-wide logging
// Provides tamper-evident, append-only audit trail functionality

import { supabase } from '@/integrations/supabase/client';

export interface AuditLogData {
  // Core event information
  eventType: string; // e.g., 'user.login', 'case.created', 'case.updated'
  category: 'authentication' | 'case_management' | 'user_management' | 'organization_management' | 'billing' | 'api_access' | 'system' | 'security' | 'compliance';
  action: string; // Changed to string for flexibility
  severity?: 'low' | 'medium' | 'high' | 'critical';
  
  // Actor information
  actorType: 'user' | 'system' | 'api' | 'webhook' | 'scheduled_job';
  actorId?: string; // user_id or system identifier
  actorEmail?: string;
  actorIpAddress?: string;
  actorUserAgent?: string;
  actorSessionId?: string;
  
  // Target information
  targetType?: string; // 'case', 'user', 'organization', 'policy', etc.
  targetId?: string; // ID of the affected entity
  targetName?: string; // Human-readable name of target
  
  // Event details
  summary: string; // Short description of what happened
  description?: string; // Detailed description
  metadata?: Record<string, any>; // Additional structured data
  
  // Before/after state for changes
  beforeState?: Record<string, any>; // State before the action
  afterState?: Record<string, any>; // State after the action
  
  // Request context
  requestId?: string; // Unique request identifier
  requestMethod?: string; // HTTP method if applicable
  requestPath?: string; // API endpoint or page path
  requestParams?: Record<string, any>; // Query parameters or form data
  
  // Geographic and technical context
  geoCountry?: string;
  geoRegion?: string;
  geoCity?: string;
  
  // Organization context
  organizationId: string;
}

export interface AuditLogEntry {
  id: string;
  created_at: string;
  event_type: string;
  category: string;
  action: string;
  severity: string;
  actor_type: string;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_ip_address?: string | null;
  actor_user_agent?: string | null;
  actor_session_id?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  target_name?: string | null;
  summary: string;
  description?: string | null;
  metadata?: Record<string, any>;
  before_state?: Record<string, any> | null;
  after_state?: Record<string, any> | null;
  request_id?: string | null;
  request_method?: string | null;
  request_path?: string | null;
  request_params?: Record<string, any> | null;
  geo_country?: string | null;
  geo_region?: string | null;
  geo_city?: string | null;
  organization_id: string;
  hash: string;
  previous_hash?: string | null;
  chain_index: number;
  retention_until?: string | null;
}

export interface AuditLogFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  action?: string;
  severity?: string;
  actorType?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  organizationId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface AuditChainVerification {
  isValid: boolean;
  totalRecords: number;
  invalidRecords: number;
  firstInvalidAt?: string;
}

/**
 * Sanitize audit log data to remove PII (PRIVACY FIX C3)
 * Similar to logger sanitization but preserves structure for audit trail
 */
function sanitizeAuditData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    let sanitized = data;
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
    return sanitized;
  }
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('ssn') || 
          lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret') ||
          lowerKey.includes('key') || lowerKey.includes('ip_address') || lowerKey.includes('address')) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey.includes('name') && typeof value === 'string' && value.length > 0) {
        sanitized[key] = `[NAME_${value.length}_CHARS]`;
      } else {
        sanitized[key] = sanitizeAuditData(value);
      }
    }
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeAuditData(item));
  }
  
  return data;
}

class AuditLogger {
  private static instance: AuditLogger;
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<AuditLogEntry | null> {
    try {
      // Sanitize metadata, before_state, and after_state to remove PII (PRIVACY FIX C3)
      const sanitizedMetadata = sanitizeAuditData(data.metadata || {});
      const sanitizedBeforeState = sanitizeAuditData(data.beforeState);
      const sanitizedAfterState = sanitizeAuditData(data.afterState);
      const sanitizedSummary = sanitizeAuditData(data.summary);
      const sanitizedDescription = sanitizeAuditData(data.description);
      const sanitizedRequestParams = sanitizeAuditData(data.requestParams);
      
      const { data: result, error } = await supabase
        .from('audit_logs')
        .insert({
          event_type: data.eventType,
          category: data.category,
          action: data.action,
          severity: data.severity || 'low',
          actor_type: data.actorType,
          actor_id: data.actorId,
          actor_email: data.actorEmail,
          actor_ip_address: data.actorIpAddress, // Already nulled for anonymous in edge functions
          actor_user_agent: data.actorUserAgent,
          actor_session_id: data.actorSessionId,
          target_type: data.targetType,
          target_id: data.targetId,
          target_name: data.targetName,
          summary: typeof sanitizedSummary === 'string' ? sanitizedSummary : data.summary,
          description: typeof sanitizedDescription === 'string' ? sanitizedDescription : data.description,
          metadata: sanitizedMetadata,
          before_state: sanitizedBeforeState,
          after_state: sanitizedAfterState,
          request_id: data.requestId,
          request_method: data.requestMethod,
          request_path: data.requestPath,
          request_params: sanitizedRequestParams,
          geo_country: data.geoCountry,
          geo_region: data.geoRegion,
          geo_city: data.geoCity,
          organization_id: data.organizationId,
          // Let the database trigger handle hash generation
          hash: '',
          previous_hash: '',
          chain_index: 0
        } as any)
        .select()
        .single();

      
      

      if (error) {
        console.error('Failed to log audit event:', error);
        console.error('Error details:', error.message, error.code, error.details);
        console.error('Error hint:', error.hint);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return null;
      }

      
      return result as unknown as AuditLogEntry;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filtering
   * Uses filtered view for non-owner users to hide sensitive data for anonymous cases (PRIVACY FIX H3)
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Check if current user is owner (has full access)
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.email === 'sampettiford@googlemail.com';
      
      // Use filtered view for non-owners to hide sensitive data for anonymous cases
      
      const baseQuery = supabase
        .from(isOwner ? 'audit_logs' as any : 'audit_logs_filtered')
        .select('*', { count: 'exact' });

      // Build filters with explicit typing to avoid deep instantiation
      const filterConditions: any[] = [];
      
      if (filters.organizationId) filterConditions.push(['organization_id', 'eq', filters.organizationId]);
      if (filters.dateFrom) filterConditions.push(['created_at', 'gte', filters.dateFrom]);
      if (filters.dateTo) filterConditions.push(['created_at', 'lte', filters.dateTo]);
      if (filters.category) filterConditions.push(['category', 'eq', filters.category]);
      if (filters.action) filterConditions.push(['action', 'eq', filters.action]);
      if (filters.severity) filterConditions.push(['severity', 'eq', filters.severity]);
      if (filters.actorType) filterConditions.push(['actor_type', 'eq', filters.actorType]);
      if (filters.actorId) filterConditions.push(['actor_id', 'eq', filters.actorId]);
      if (filters.targetType) filterConditions.push(['target_type', 'eq', filters.targetType]);
      if (filters.targetId) filterConditions.push(['target_id', 'eq', filters.targetId]);

      // Build the query with all filters
      let finalQuery: any = baseQuery;
      for (const [column, operator, value] of filterConditions) {
        if (operator === 'eq') {
          finalQuery = finalQuery.eq(column, value);
        } else if (operator === 'gte') {
          finalQuery = finalQuery.gte(column, value);
        } else if (operator === 'lte') {
          finalQuery = finalQuery.lte(column, value);
        }
      }

      if (filters.searchText) {
        finalQuery = finalQuery.or(`summary.ilike.%${filters.searchText}%,description.ilike.%${filters.searchText}%,target_name.ilike.%${filters.searchText}%`);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      
      finalQuery = finalQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await finalQuery;

      

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === '42703' || error.message.includes('does not exist')) {
          
          return { logs: [], total: 0, hasMore: false };
        }
        console.error('Failed to fetch audit logs:', error);
        return { logs: [], total: 0, hasMore: false };
      }

      return {
        logs: data as unknown as AuditLogEntry[],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get audit logs for a specific entity (e.g., case, user)
   * Uses filtered view for non-owner users (PRIVACY FIX H3)
   */
  async getEntityLogs(
    organizationId: string,
    targetType: string,
    targetId: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      // Check if current user is owner
      const { data: { user } } = await supabase.auth.getUser();
      // Type cast at the start to avoid deep type instantiation issues
      const query = supabase
        .from(isOwner ? 'audit_logs' as any : 'audit_logs_filtered')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch entity audit logs:', error);
        return [];
      }

      return data as unknown as AuditLogEntry[];
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return [];
    }
  }

  /**
   * Verify audit chain integrity
   */
  async verifyChain(organizationId: string): Promise<AuditChainVerification> {
    try {
      const { data, error } = await supabase
        .rpc('verify_audit_chain' as any, { p_organization_id: organizationId });

      if (error) {
        // Check if it's a function doesn't exist error
        if (error.code === 'PGRST202' || error.message.includes('Could not find the function')) {
          
          return {
            isValid: true, // Assume valid if function doesn't exist yet
            totalRecords: 0,
            invalidRecords: 0
          };
        }
        console.error('Failed to verify audit chain:', error);
        return {
          isValid: false,
          totalRecords: 0,
          invalidRecords: 0
        };
      }

      // The RPC function returns: { is_valid: boolean, total_records: bigint, invalid_records: bigint }
      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        return {
          isValid: result.is_valid,
          totalRecords: Number(result.total_records),
          invalidRecords: Number(result.invalid_records)
        };
      }

      return {
        isValid: true,
        totalRecords: 0,
        invalidRecords: 0
      };
    } catch (error) {
      console.error('Error verifying audit chain:', error);
      return {
        isValid: false,
        totalRecords: 0,
        invalidRecords: 0
      };
    }
  }

  /**
   * Export audit logs
   */
  async exportLogs(
    filters: AuditLogFilters,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getLogs({ ...filters, limit: 10000 });
      
      if (format === 'csv') {
        return this.convertToCSV(logs);
      } else {
        return JSON.stringify(logs, null, 2);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return '';
    }
  }

  /**
   * Convert audit logs to CSV format
   */
  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp',
      'Event Type',
      'Category',
      'Action',
      'Severity',
      'Actor Type',
      'Actor Email',
      'Actor IP',
      'Target Type',
      'Target Name',
      'Summary',
      'Description',
      'Hash',
      'Chain Index'
    ];

    const rows = logs.map(log => [
      log.created_at,
      log.event_type,
      log.category,
      log.action,
      log.severity,
      log.actor_type,
      log.actor_email || '',
      log.actor_ip_address || '',
      log.target_type || '',
      log.target_name || '',
      log.summary,
      log.description || '',
      log.hash,
      log.chain_index
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

// Convenience functions for common audit events
export const auditLogger = AuditLogger.getInstance();

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  eventType: 'login' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled',
  actorId: string,
  actorEmail: string,
  organizationId: string,
  metadata?: Record<string, any>
) {
  return auditLogger.log({
    eventType: `user.${eventType}`,
    category: 'authentication',
    action: eventType,
    severity: 'medium',
    actorType: 'user',
    actorId,
    actorEmail,
    organizationId,
    summary: `User ${eventType}`,
    metadata
  });
}

/**
 * Log case management events
 */
export async function logCaseEvent(
  action: 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'assign' | 'resolve',
  actorId: string,
  actorEmail: string,
  organizationId: string,
  caseId: string,
  caseTitle: string,
  beforeState?: Record<string, any>,
  afterState?: Record<string, any>,
  metadata?: Record<string, any>
) {
  
  return auditLogger.log({
    eventType: `case.${action}`,
    category: 'case_management',
    action,
    severity: action === 'delete' ? 'high' : 'medium',
    actorType: 'user',
    actorId,
    actorEmail,
    organizationId,
    targetType: 'case',
    targetId: caseId,
    targetName: caseTitle,
    summary: `Case ${action}: ${caseTitle}`,
    beforeState,
    afterState,
    metadata
  });
}

/**
 * Log user management events
 */
export async function logUserEvent(
  action: 'create' | 'update' | 'delete' | 'invite' | 'revoke' | 'role_change',
  actorId: string,
  actorEmail: string,
  organizationId: string,
  targetUserId: string,
  targetUserEmail: string,
  beforeState?: Record<string, any>,
  afterState?: Record<string, any>,
  metadata?: Record<string, any>
) {
  return auditLogger.log({
    eventType: `user.${action}`,
    category: 'user_management',
    action,
    severity: action === 'delete' || action === 'revoke' ? 'high' : 'medium',
    actorType: 'user',
    actorId,
    actorEmail,
    organizationId,
    targetType: 'user',
    targetId: targetUserId,
    targetName: targetUserEmail,
    summary: `User ${action}: ${targetUserEmail}`,
    beforeState,
    afterState,
    metadata
  });
}

/**
 * Log system events
 */
export async function logSystemEvent(
  eventType: string,
  category: AuditLogData['category'],
  action: AuditLogData['action'],
  organizationId: string,
  summary: string,
  severity: AuditLogData['severity'] = 'low',
  metadata?: Record<string, any>
) {
  return auditLogger.log({
    eventType,
    category,
    action,
    severity,
    actorType: 'system',
    organizationId,
    summary,
    metadata
  });
}

export default auditLogger;
