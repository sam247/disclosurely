
export interface DataRetentionPolicy {
  id: string;
  organization_id: string;
  data_type: string;
  retention_period_months: number;
  auto_purge_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataExportRequest {
  id: string;
  organization_id: string;
  requested_by?: string;
  email_address: string;
  request_type: 'full_export' | 'report_data' | 'personal_data';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  export_file_url?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

export interface DataErasureRequest {
  id: string;
  organization_id: string;
  requested_by?: string;
  email_address: string;
  erasure_type: 'full_erasure' | 'anonymize_reports' | 'delete_personal_data';
  reason?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  reviewed_at?: string;
  completed_at?: string;
}

export interface CookieConsent {
  id: string;
  organization_id: string;
  ip_address?: string;
  user_agent?: string;
  consent_given: boolean;
  necessary_cookies: boolean;
  analytics_cookies: boolean;
  marketing_cookies: boolean;
  consent_timestamp: string;
  expires_at: string;
}
