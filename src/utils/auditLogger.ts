// Audit logging utility for comprehensive system-wide logging
// Provides tamper-evident, append-only audit trail functionality

import { supabase } from '@/integrations/supabase/client';

export interface AuditLogData {
  // Core event information
  eventType: string; // e.g., 'user.login', 'case.created', 'case.updated'
  category: 'authentication' | 'case_management' | 'user_management' | 'organization_management' | 'billing' | 'api_access' | 'system' | 'security' | 'compliance';
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'archive' | 'restore' | 'invite' | 'revoke';
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

export interface AuditLogEntry extends AuditLogData {
  id: string;
  createdAt: string;
  hash: string;
  previousHash: string;
  chainIndex: number;
  retentionUntil: string;
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
      console.log('AuditLogger: Attempting to log event:', data);
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
          actor_ip_address: data.actorIpAddress,
          actor_user_agent: data.actorUserAgent,
          actor_session_id: data.actorSessionId,
          target_type: data.targetType,
          target_id: data.targetId,
          target_name: data.targetName,
          summary: data.summary,
          description: data.description,
          metadata: data.metadata || {},
          before_state: data.beforeState,
          after_state: data.afterState,
          request_id: data.requestId,
          request_method: data.requestMethod,
          request_path: data.requestPath,
          request_params: data.requestParams,
          geo_country: data.geoCountry,
          geo_region: data.geoRegion,
          geo_city: data.geoCity,
          organization_id: data.organizationId,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to log audit event:', error);
        console.error('Error details:', error.message, error.code, error.details);
        return null;
      }

      return result as AuditLogEntry;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.actorType) {
        query = query.eq('actor_type', filters.actorType);
      }

      if (filters.actorId) {
        query = query.eq('actor_id', filters.actorId);
      }

      if (filters.targetType) {
        query = query.eq('target_type', filters.targetType);
      }

      if (filters.targetId) {
        query = query.eq('target_id', filters.targetId);
      }

      if (filters.searchText) {
        query = query.or(`summary.ilike.%${filters.searchText}%,description.ilike.%${filters.searchText}%,target_name.ilike.%${filters.searchText}%`);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === '42703' || error.message.includes('does not exist')) {
          console.warn('Audit logs table does not exist yet. Migration may not have been applied.');
          return { logs: [], total: 0, hasMore: false };
        }
        console.error('Failed to fetch audit logs:', error);
        return { logs: [], total: 0, hasMore: false };
      }

      return {
        logs: data as AuditLogEntry[],
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
   */
  async getEntityLogs(
    organizationId: string,
    targetType: string,
    targetId: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch entity audit logs:', error);
        return [];
      }

      return data as AuditLogEntry[];
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
        .rpc('verify_audit_chain', { p_organization_id: organizationId });

      if (error) {
        // Check if it's a function doesn't exist error
        if (error.code === 'PGRST202' || error.message.includes('Could not find the function')) {
          console.warn('Audit chain verification function does not exist yet. Migration may not have been applied.');
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
      if (data && data.length > 0) {
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
      log.createdAt,
      log.eventType,
      log.category,
      log.action,
      log.severity,
      log.actorType,
      log.actorEmail || '',
      log.actorIpAddress || '',
      log.targetType || '',
      log.targetName || '',
      log.summary,
      log.description || '',
      log.hash,
      log.chainIndex
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
  console.log('logCaseEvent called with:', { action, actorId, actorEmail, organizationId, caseId, caseTitle });
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
