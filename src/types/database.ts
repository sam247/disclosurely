
import { Database } from "@/integrations/supabase/types";

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportMessage = Database['public']['Tables']['report_messages']['Row'];
export type ReportNote = Database['public']['Tables']['report_notes']['Row'];
export type CustomDomain = Database['public']['Tables']['custom_domains']['Row'];

export type ReportStatus = Database['public']['Enums']['report_status'];
export type UserRole = Database['public']['Enums']['user_role'];
export type ReportType = Database['public']['Enums']['report_type'];

export interface DecryptedReport {
  id: string;
  title: string;
  content: string;
  category: string;
  incident_date?: string;
  location?: string;
  people_involved?: string;
  evidence_description?: string;
}

export interface EncryptionResult {
  encryptedData: string;
  keyHash: string;
  accessKey: string;
}
