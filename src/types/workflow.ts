// Workflow Automation Types

export interface AssignmentRule {
  id: string;
  organization_id: string;
  name: string;
  priority: number;
  enabled: boolean;
  conditions: {
    category?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical' | 'any';
    keywords?: string[];
    department?: string;
  };
  assign_to_user_id?: string;
  assign_to_team?: string;
  created_at: string;
  updated_at: string;
}

export interface SLAPolicy {
  id: string;
  organization_id: string;
  name: string;
  critical_response_time: number; // hours
  high_response_time: number; // hours
  medium_response_time: number; // hours
  low_response_time: number; // hours
  escalate_after_breach: boolean;
  escalate_to_user_id?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseEscalation {
  id: string;
  report_id: string;
  escalated_from?: string;
  escalated_to: string;
  reason?: string;
  sla_breached: boolean;
  created_at: string;
}

export interface WorkflowLog {
  id: string;
  report_id: string;
  action: 'auto_assigned' | 'sla_calculated' | 'sla_warning' | 'sla_breached' | 'escalated' | 'manually_reassigned' | 'rule_matched';
  details: Record<string, any>;
  created_at: string;
}

export interface WorkflowEngineRequest {
  action: 'auto_assign' | 'calculate_sla' | 'escalate';
  reportId: string;
  organizationId: string;
  escalateTo?: string;
  reason?: string;
  slaBreached?: boolean;
}

export interface WorkflowEngineResponse {
  success: boolean;
  assigned_to?: string | null;
  rule_name?: string;
  sla_deadline?: string;
  hours?: number;
  message?: string;
  error?: string;
}
