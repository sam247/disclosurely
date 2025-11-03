export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_case_analyses: {
        Row: {
          analysis_content: string
          case_id: string
          case_title: string
          created_at: string
          created_by: string | null
          document_count: number | null
          id: string
          organization_id: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          analysis_content: string
          case_id: string
          case_title: string
          created_at?: string
          created_by?: string | null
          document_count?: number | null
          id?: string
          organization_id: string
          tracking_id: string
          updated_at?: string
        }
        Update: {
          analysis_content?: string
          case_id?: string
          case_title?: string
          created_at?: string
          created_by?: string | null
          document_count?: number | null
          id?: string
          organization_id?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_gateway_logs: {
        Row: {
          completion_tokens: number
          created_at: string | null
          error_message: string | null
          error_type: string | null
          id: string
          latency_ms: number
          model: string
          organization_id: string
          pii_detected: boolean | null
          pii_entity_count: number | null
          prompt_tokens: number
          purpose: string | null
          redaction_applied: boolean | null
          request_id: string
          total_tokens: number
          user_id: string | null
          vendor: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          latency_ms: number
          model: string
          organization_id: string
          pii_detected?: boolean | null
          pii_entity_count?: number | null
          prompt_tokens?: number
          purpose?: string | null
          redaction_applied?: boolean | null
          request_id: string
          total_tokens?: number
          user_id?: string | null
          vendor: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          latency_ms?: number
          model?: string
          organization_id?: string
          pii_detected?: boolean | null
          pii_entity_count?: number | null
          prompt_tokens?: number
          purpose?: string | null
          redaction_applied?: boolean | null
          request_id?: string
          total_tokens?: number
          user_id?: string | null
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_gateway_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_gateway_policies: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          policy_data: Json
          policy_version: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          policy_data: Json
          policy_version?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          policy_data?: Json
          policy_version?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_gateway_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_gateway_redaction_maps: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          organization_id: string
          redaction_map: Json
          request_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          organization_id: string
          redaction_map: Json
          request_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          organization_id?: string
          redaction_map?: Json
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_gateway_redaction_maps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_gateway_token_usage: {
        Row: {
          created_at: string | null
          date: string
          id: string
          model: string
          organization_id: string
          total_cost_usd: number
          total_requests: number
          total_tokens: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          model: string
          organization_id: string
          total_cost_usd?: number
          total_requests?: number
          total_tokens?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          model?: string
          organization_id?: string
          total_cost_usd?: number
          total_requests?: number
          total_tokens?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_gateway_token_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_helper_documents: {
        Row: {
          content_type: string
          created_at: string
          file_path: string
          file_size: number
          id: string
          name: string
          organization_id: string
          uploaded_by: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          name: string
          organization_id: string
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          name?: string
          organization_id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_ip_address: unknown
          actor_session_id: string | null
          actor_type: string
          actor_user_agent: string | null
          after_state: Json | null
          archive_location: string | null
          archived_at: string | null
          before_state: Json | null
          category: string
          chain_index: number
          created_at: string
          description: string | null
          event_type: string
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          hash: string
          id: string
          metadata: Json | null
          organization_id: string
          previous_hash: string | null
          request_id: string | null
          request_method: string | null
          request_params: Json | null
          request_path: string | null
          retention_until: string | null
          severity: string
          summary: string
          target_id: string | null
          target_name: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_ip_address?: unknown
          actor_session_id?: string | null
          actor_type: string
          actor_user_agent?: string | null
          after_state?: Json | null
          archive_location?: string | null
          archived_at?: string | null
          before_state?: Json | null
          category: string
          chain_index?: number
          created_at?: string
          description?: string | null
          event_type: string
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          hash: string
          id?: string
          metadata?: Json | null
          organization_id: string
          previous_hash?: string | null
          request_id?: string | null
          request_method?: string | null
          request_params?: Json | null
          request_path?: string | null
          retention_until?: string | null
          severity?: string
          summary: string
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_ip_address?: unknown
          actor_session_id?: string | null
          actor_type?: string
          actor_user_agent?: string | null
          after_state?: Json | null
          archive_location?: string | null
          archived_at?: string | null
          before_state?: Json | null
          category?: string
          chain_index?: number
          created_at?: string
          description?: string | null
          event_type?: string
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          hash?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          previous_hash?: string | null
          request_id?: string | null
          request_method?: string | null
          request_params?: Json | null
          request_path?: string | null
          retention_until?: string | null
          severity?: string
          summary?: string
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          organization_id: string
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          organization_id: string
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_calendar: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          due_date: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          is_recurring: boolean | null
          last_reminder_sent_at: string | null
          organization_id: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          related_policy_id: string | null
          related_risk_id: string | null
          reminder_days_before: number[] | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          is_recurring?: boolean | null
          last_reminder_sent_at?: string | null
          organization_id: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          related_policy_id?: string | null
          related_risk_id?: string | null
          reminder_days_before?: number[] | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          last_reminder_sent_at?: string | null
          organization_id?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          related_policy_id?: string | null
          related_risk_id?: string | null
          reminder_days_before?: number[] | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_calendar_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_calendar_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_calendar_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_calendar_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_calendar_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
          {
            foreignKeyName: "compliance_calendar_related_risk_id_fkey"
            columns: ["related_risk_id"]
            isOneToOne: false
            referencedRelation: "compliance_risks"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence: {
        Row: {
          content_type: string | null
          description: string | null
          evidence_name: string
          evidence_type: string
          file_path: string
          file_size: number | null
          id: string
          organization_id: string
          related_policy_id: string | null
          related_report_id: string | null
          related_risk_id: string | null
          retention_period_months: number | null
          scheduled_deletion_date: string | null
          tags: string[] | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          description?: string | null
          evidence_name: string
          evidence_type: string
          file_path: string
          file_size?: number | null
          id?: string
          organization_id: string
          related_policy_id?: string | null
          related_report_id?: string | null
          related_risk_id?: string | null
          retention_period_months?: number | null
          scheduled_deletion_date?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          description?: string | null
          evidence_name?: string
          evidence_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          organization_id?: string
          related_policy_id?: string | null
          related_report_id?: string | null
          related_risk_id?: string | null
          retention_period_months?: number | null
          scheduled_deletion_date?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
          {
            foreignKeyName: "compliance_evidence_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_related_risk_id_fkey"
            columns: ["related_risk_id"]
            isOneToOne: false
            referencedRelation: "compliance_risks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_policies: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          file_path: string | null
          id: string
          next_review_date: string | null
          organization_id: string
          owner_id: string | null
          owner_name: string | null
          policy_content: string | null
          policy_description: string | null
          policy_name: string
          policy_type: string
          review_date: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          file_path?: string | null
          id?: string
          next_review_date?: string | null
          organization_id: string
          owner_id?: string | null
          owner_name?: string | null
          policy_content?: string | null
          policy_description?: string | null
          policy_name: string
          policy_type: string
          review_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          file_path?: string | null
          id?: string
          next_review_date?: string | null
          organization_id?: string
          owner_id?: string | null
          owner_name?: string | null
          policy_content?: string | null
          policy_description?: string | null
          policy_name?: string
          policy_type?: string
          review_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_policy_versions: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          changes_summary: string | null
          file_path: string | null
          id: string
          policy_content: string | null
          policy_id: string
          version: number
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          changes_summary?: string | null
          file_path?: string | null
          id?: string
          policy_content?: string | null
          policy_id: string
          version: number
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          changes_summary?: string | null
          file_path?: string | null
          id?: string
          policy_content?: string | null
          policy_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_policy_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
        ]
      }
      compliance_risks: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          impact: number
          last_reviewed_at: string | null
          likelihood: number
          mitigation_plan: string | null
          mitigation_status: string
          next_review_date: string | null
          organization_id: string
          owner_id: string | null
          owner_name: string | null
          related_policy_id: string | null
          related_report_id: string | null
          residual_impact: number | null
          residual_likelihood: number | null
          residual_score: number | null
          risk_description: string | null
          risk_score: number | null
          risk_title: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact: number
          last_reviewed_at?: string | null
          likelihood: number
          mitigation_plan?: string | null
          mitigation_status?: string
          next_review_date?: string | null
          organization_id: string
          owner_id?: string | null
          owner_name?: string | null
          related_policy_id?: string | null
          related_report_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_score?: number | null
          risk_description?: string | null
          risk_score?: number | null
          risk_title: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact?: number
          last_reviewed_at?: string | null
          likelihood?: number
          mitigation_plan?: string | null
          mitigation_status?: string
          next_review_date?: string | null
          organization_id?: string
          owner_id?: string | null
          owner_name?: string | null
          related_policy_id?: string | null
          related_report_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_score?: number | null
          risk_description?: string | null
          risk_score?: number | null
          risk_title?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_risks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_risks_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_risks_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
          {
            foreignKeyName: "compliance_risks_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consents: {
        Row: {
          analytics_cookies: boolean
          consent_given: boolean
          consent_timestamp: string
          expires_at: string
          id: string
          ip_address: unknown
          marketing_cookies: boolean
          necessary_cookies: boolean
          organization_id: string
          user_agent: string | null
        }
        Insert: {
          analytics_cookies?: boolean
          consent_given?: boolean
          consent_timestamp?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          marketing_cookies?: boolean
          necessary_cookies?: boolean
          organization_id: string
          user_agent?: string | null
        }
        Update: {
          analytics_cookies?: boolean
          consent_given?: boolean
          consent_timestamp?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          marketing_cookies?: boolean
          necessary_cookies?: boolean
          organization_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          activated_at: string | null
          created_at: string | null
          created_by: string | null
          dns_record_type: string | null
          dns_record_value: string | null
          domain_name: string
          error_message: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_checked_at: string | null
          organization_id: string
          root_domain: string
          status: string
          subdomain: string
          updated_at: string | null
          verification_method: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          dns_record_type?: string | null
          dns_record_value?: string | null
          domain_name: string
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_checked_at?: string | null
          organization_id: string
          root_domain: string
          status?: string
          subdomain: string
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          dns_record_type?: string | null
          dns_record_value?: string | null
          domain_name?: string
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_checked_at?: string | null
          organization_id?: string
          root_domain?: string
          status?: string
          subdomain?: string
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_erasure_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          email_address: string
          erasure_type: string
          id: string
          organization_id: string
          reason: string | null
          requested_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email_address: string
          erasure_type: string
          id?: string
          organization_id: string
          reason?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email_address?: string
          erasure_type?: string
          id?: string
          organization_id?: string
          reason?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_erasure_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_erasure_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_erasure_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          email_address: string
          expires_at: string | null
          export_file_url: string | null
          id: string
          organization_id: string
          request_type: string
          requested_by: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email_address: string
          expires_at?: string | null
          export_file_url?: string | null
          id?: string
          organization_id: string
          request_type: string
          requested_by?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email_address?: string
          expires_at?: string | null
          export_file_url?: string | null
          id?: string
          organization_id?: string
          request_type?: string
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_export_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          auto_purge_enabled: boolean
          created_at: string
          data_type: string
          id: string
          organization_id: string
          retention_period_months: number
          updated_at: string
        }
        Insert: {
          auto_purge_enabled?: boolean
          created_at?: string
          data_type: string
          id?: string
          organization_id: string
          retention_period_months?: number
          updated_at?: string
        }
        Update: {
          auto_purge_enabled?: boolean
          created_at?: string
          data_type?: string
          id?: string
          organization_id?: string
          retention_period_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_verifications: {
        Row: {
          created_at: string
          domain: string
          id: string
          organization_id: string
          updated_at: string
          verification_token: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          organization_id: string
          updated_at?: string
          verification_token: string
          verification_type?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          organization_id?: string
          updated_at?: string
          verification_token?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string
          email_address: string
          id: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          report_id: string | null
          sent_at: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_address: string
          id?: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          report_id?: string | null
          sent_at?: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          report_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          organization_overrides: Json | null
          rollout_percentage: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          organization_overrides?: Json | null
          rollout_percentage?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          organization_overrides?: Json | null
          rollout_percentage?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      global_seo_settings: {
        Row: {
          created_at: string
          default_meta_description: string | null
          default_meta_title: string | null
          default_og_image: string | null
          default_twitter_image: string | null
          facebook_pixel_id: string | null
          global_robots_txt: string | null
          global_sitemap_xml: string | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_meta_description?: string | null
          default_meta_title?: string | null
          default_og_image?: string | null
          default_twitter_image?: string | null
          facebook_pixel_id?: string | null
          global_robots_txt?: string | null
          global_sitemap_xml?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_meta_description?: string | null
          default_meta_title?: string | null
          default_og_image?: string | null
          default_twitter_image?: string | null
          facebook_pixel_id?: string | null
          global_robots_txt?: string | null
          global_sitemap_xml?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_seo_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      link_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          link_id: string
          metadata: Json | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          link_id: string
          metadata?: Json | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          link_id?: string
          metadata?: Json | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "organization_links"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          organization_id: string
          report_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          organization_id: string
          report_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string
          report_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_links: {
        Row: {
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          department: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          link_token: string
          location: string | null
          name: string
          organization_id: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_token: string
          location?: string | null
          name: string
          organization_id: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_token?: string
          location?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_color: string | null
          created_at: string
          custom_domain: string | null
          custom_domain_enabled: boolean | null
          custom_logo_url: string | null
          description: string | null
          domain: string
          domain_verification_token: string | null
          domain_verified: boolean | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          notification_email: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_enabled?: boolean | null
          custom_logo_url?: string | null
          description?: string | null
          domain: string
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          notification_email?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_enabled?: boolean | null
          custom_logo_url?: string | null
          description?: string | null
          domain?: string
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          notification_email?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          page_identifier: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          page_identifier: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          page_identifier?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string
          created_at: string
          id: string
          ip_address: string | null
          notes: string | null
          organization_id: string
          policy_id: string
          policy_version: number
          signature_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          organization_id: string
          policy_id: string
          policy_version: number
          signature_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          organization_id?: string
          policy_id?: string
          policy_version?: number
          signature_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
        ]
      }
      policy_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          due_date: string | null
          id: string
          organization_id: string
          policy_id: string
          reminder_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id: string
          policy_id: string
          reminder_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id?: string
          policy_id?: string
          reminder_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          mfa_enabled: boolean | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_attachments: {
        Row: {
          content_type: string
          created_at: string
          encrypted_file_url: string
          encryption_metadata: Json
          file_size: number
          filename: string
          id: string
          original_filename: string | null
          report_id: string
          uploaded_by_whistleblower: boolean | null
        }
        Insert: {
          content_type: string
          created_at?: string
          encrypted_file_url: string
          encryption_metadata: Json
          file_size: number
          filename: string
          id?: string
          original_filename?: string | null
          report_id: string
          uploaded_by_whistleblower?: boolean | null
        }
        Update: {
          content_type?: string
          created_at?: string
          encrypted_file_url?: string
          encryption_metadata?: Json
          file_size?: number
          filename?: string
          id?: string
          original_filename?: string | null
          report_id?: string
          uploaded_by_whistleblower?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "report_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_messages: {
        Row: {
          created_at: string
          encrypted_message: string
          id: string
          is_read: boolean | null
          report_id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          created_at?: string
          encrypted_message: string
          id?: string
          is_read?: boolean | null
          report_id: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          created_at?: string
          encrypted_message?: string
          id?: string
          is_read?: boolean | null
          report_id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_confidential: boolean | null
          report_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_confidential?: boolean | null
          report_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_confidential?: boolean | null
          report_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_notes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_assessed_at: string | null
          ai_assessment_version: string | null
          ai_impact_score: number | null
          ai_likelihood_score: number | null
          ai_risk_assessment: Json | null
          ai_risk_level: string | null
          ai_risk_score: number | null
          anonymous_access_token: string | null
          archived_at: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          encrypted_content: string
          encryption_key_hash: string
          first_read_at: string | null
          id: string
          manual_risk_level: number | null
          organization_id: string
          priority: number | null
          report_type: Database["public"]["Enums"]["report_type"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          submitted_by_email: string | null
          submitted_via_link_id: string | null
          tags: string[] | null
          title: string
          tracking_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_assessed_at?: string | null
          ai_assessment_version?: string | null
          ai_impact_score?: number | null
          ai_likelihood_score?: number | null
          ai_risk_assessment?: Json | null
          ai_risk_level?: string | null
          ai_risk_score?: number | null
          anonymous_access_token?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          encrypted_content: string
          encryption_key_hash: string
          first_read_at?: string | null
          id?: string
          manual_risk_level?: number | null
          organization_id: string
          priority?: number | null
          report_type?: Database["public"]["Enums"]["report_type"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          submitted_by_email?: string | null
          submitted_via_link_id?: string | null
          tags?: string[] | null
          title: string
          tracking_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_assessed_at?: string | null
          ai_assessment_version?: string | null
          ai_impact_score?: number | null
          ai_likelihood_score?: number | null
          ai_risk_assessment?: Json | null
          ai_risk_level?: string | null
          ai_risk_score?: number | null
          anonymous_access_token?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          encrypted_content?: string
          encryption_key_hash?: string
          first_read_at?: string | null
          id?: string
          manual_risk_level?: number | null
          organization_id?: string
          priority?: number | null
          report_type?: Database["public"]["Enums"]["report_type"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          submitted_by_email?: string | null
          submitted_via_link_id?: string | null
          tags?: string[] | null
          title?: string
          tracking_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_submitted_via_link_id_fkey"
            columns: ["submitted_via_link_id"]
            isOneToOne: false
            referencedRelation: "organization_links"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          message: string
          organization_id: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          type: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          message: string
          organization_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          type: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          message?: string
          organization_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          type?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          organization_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          id: string
          lang: string
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          organization_id: string
          page_identifier: string
          robots_txt: string | null
          sitemap_xml: string | null
          structured_data_json: Json | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          lang?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          organization_id: string
          page_identifier: string
          robots_txt?: string | null
          sitemap_xml?: string | null
          structured_data_json?: Json | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          lang?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          organization_id?: string
          page_identifier?: string
          robots_txt?: string | null
          sitemap_xml?: string | null
          structured_data_json?: Json | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          ai_analysis: Json | null
          ai_analyzed_at: string | null
          ai_confidence_score: number | null
          ai_insights: string[] | null
          ai_pattern_match: string | null
          ai_recommendations: string[] | null
          ai_severity_score: number | null
          context: string
          created_at: string | null
          data: Json | null
          id: string
          level: string
          message: string
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          stack_trace: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_insights?: string[] | null
          ai_pattern_match?: string | null
          ai_recommendations?: string[] | null
          ai_severity_score?: number | null
          context: string
          created_at?: string | null
          data?: Json | null
          id?: string
          level: string
          message: string
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          stack_trace?: string | null
          timestamp: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_insights?: string[] | null
          ai_pattern_match?: string | null
          ai_recommendations?: string[] | null
          ai_severity_score?: number | null
          context?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          level?: string
          message?: string
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          revoked_at: string | null
          revoked_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_log_insights: {
        Row: {
          analyzed_count: number | null
          avg_severity: number | null
          context: string | null
          hour_bucket: string | null
          level: string | null
          log_count: number | null
          patterns: string[] | null
        }
        Relationships: []
      }
      pending_policy_acknowledgments: {
        Row: {
          assigned_at: string | null
          assignment_id: string | null
          current_version: number | null
          due_date: string | null
          first_name: string | null
          last_name: string | null
          organization_id: string | null
          policy_id: string | null
          policy_name: string | null
          policy_type: string | null
          reminder_sent_at: string | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_acknowledgment_summary"
            referencedColumns: ["policy_id"]
          },
        ]
      }
      policy_acknowledgment_summary: {
        Row: {
          acknowledgment_rate: number | null
          organization_id: string | null
          pending_count: number | null
          policy_id: string | null
          policy_name: string | null
          policy_type: string | null
          total_acknowledged: number | null
          total_assigned: number | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_critical_issues: {
        Row: {
          ai_analysis: Json | null
          ai_insights: string[] | null
          ai_recommendations: string[] | null
          context: string | null
          data: Json | null
          level: string | null
          message: string | null
          timestamp: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_token_limit: {
        Args: { p_organization_id: string; p_requested_tokens: number }
        Returns: boolean
      }
      cleanup_expired_redaction_maps: { Args: never; Returns: number }
      cleanup_old_logs: { Args: never; Returns: undefined }
      create_security_alert: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_message: string
          p_organization_id: string
          p_severity?: string
        }
        Returns: string
      }
      enable_feature_for_org: {
        Args: {
          p_enabled?: boolean
          p_feature_name: string
          p_organization_id: string
        }
        Returns: undefined
      }
      encrypt_report_server_side: {
        Args: { p_organization_id: string; p_report_data: Json }
        Returns: {
          encrypted_data: string
          key_hash: string
        }[]
      }
      generate_anonymous_access_token: { Args: never; Returns: string }
      generate_domain_verification_token: { Args: never; Returns: string }
      generate_invitation_token: { Args: never; Returns: string }
      generate_link_token: { Args: never; Returns: string }
      generate_tracking_id: { Args: never; Returns: string }
      get_active_ai_policy: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_audit_logs_safe: {
        Args: never
        Returns: {
          action: string
          created_at: string
          details: Json
          event_type: string
          id: string
          ip_address: unknown
          resource_id: string
          resource_type: string
          result: string
          risk_level: string
          user_agent: string
          user_email: string
          user_id: string
        }[]
      }
      get_current_user_organization_id: { Args: never; Returns: string }
      get_link_analytics_summary: {
        Args: { p_link_id: string }
        Returns: {
          common_referrers: Json
          link_id: string
          total_views: number
          unique_ips: number
        }[]
      }
      get_link_branding: {
        Args: { p_link_token: string }
        Returns: {
          brand_color: string
          custom_logo_url: string
          organization_name: string
          valid: boolean
        }[]
      }
      get_org_admin_emails: {
        Args: { p_org_id: string }
        Returns: {
          email: string
        }[]
      }
      get_organization_branding_by_link: {
        Args: { p_link_token: string }
        Returns: {
          brand_color: string
          custom_logo_url: string
          logo_url: string
          organization_id: string
          organization_name: string
        }[]
      }
      get_organization_by_tracking_id: {
        Args: { p_tracking_id: string }
        Returns: {
          brand_color: string
          custom_logo_url: string
          logo_url: string
          organization_id: string
          organization_name: string
        }[]
      }
      get_profile_minimal: {
        Args: { p_user_id: string }
        Returns: {
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_report_response_times: {
        Args: never
        Returns: {
          first_org_response_at: string
          organization_id: string
          report_created_at: string
          report_id: string
          response_time_hours: number
          status: Database["public"]["Enums"]["report_status"]
          title: string
          tracking_id: string
        }[]
      }
      get_user_organization_safe: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_profile_safe: {
        Args: { p_user_id: string }
        Returns: {
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_feature_enabled: {
        Args: { p_feature_name: string; p_organization_id?: string }
        Returns: boolean
      }
      is_valid_domain: { Args: { domain: string }; Returns: boolean }
      log_link_validation_failure: {
        Args: {
          p_failure_reason: string
          p_ip_address?: string
          p_link_token: string
          p_organization_id?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address: string
          p_success: boolean
          p_user_agent: string
        }
        Returns: undefined
      }
      log_messaging_attempt: {
        Args: {
          p_failure_reason?: string
          p_ip_address?: string
          p_report_id: string
          p_sender_type: string
          p_success: boolean
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_profile_access: {
        Args: { p_access_type: string; p_accessed_user_id: string }
        Returns: undefined
      }
      log_security_event:
        | {
            Args: {
              p_category?: string
              p_details?: Json
              p_event_type: string
              p_organization_id?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_action: string
              p_actor_id?: string
              p_actor_type?: string
              p_category: string
              p_description?: string
              p_event_type: string
              p_ip_address?: string
              p_metadata?: Json
              p_severity?: string
              p_summary?: string
              p_target_id?: string
              p_target_type?: string
              p_user_agent?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_action?: string
              p_category?: string
              p_details?: Json
              p_event_type: string
              p_ip_address?: string
              p_organization_id?: string
              p_severity?: string
              p_user_agent?: string
              p_user_id?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_details?: Json
              p_event_type: string
              p_ip_address?: string
              p_organization_id?: string
              p_severity?: string
              p_user_agent?: string
              p_user_id?: string
            }
            Returns: undefined
          }
      mark_reminder_sent: {
        Args: { assignment_id: string }
        Returns: undefined
      }
      process_notifications_manually: { Args: never; Returns: Json }
      update_overdue_calendar_events: { Args: never; Returns: undefined }
      upsert_token_usage: {
        Args: {
          p_cost: number
          p_date: string
          p_model: string
          p_organization_id: string
          p_tokens: number
        }
        Returns: undefined
      }
      user_has_permission: {
        Args: { p_action: string; p_resource: string; p_user_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      user_is_in_organization:
        | {
            Args: { _organization_id: string; _user_id: string }
            Returns: boolean
          }
        | { Args: { org_id: string }; Returns: boolean }
      validate_anonymous_report_access: {
        Args: { p_access_token: string; p_tracking_id: string }
        Returns: {
          reason: string
          report_id: string
          valid: boolean
        }[]
      }
      validate_organization_link: {
        Args: { link_id: string }
        Returns: {
          reason: string
          valid: boolean
        }[]
      }
      validate_submission_link: {
        Args: { p_link_token: string }
        Returns: {
          custom_fields: Json
          is_valid: boolean
          link_id: string
          organization_id: string
          reason: string
        }[]
      }
      verify_audit_chain: {
        Args: { p_organization_id: string }
        Returns: {
          invalid_records: number
          is_valid: boolean
          total_records: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "org_admin"
        | "case_handler"
        | "reviewer"
        | "compliance_officer"
        | "risk_manager"
        | "policy_owner"
      report_status:
        | "new"
        | "in_review"
        | "investigating"
        | "resolved"
        | "closed"
        | "live"
        | "archived"
        | "deleted"
        | "reviewing"
      report_type: "anonymous" | "confidential"
      user_role: "admin" | "case_handler" | "reviewer" | "org_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "org_admin",
        "case_handler",
        "reviewer",
        "compliance_officer",
        "risk_manager",
        "policy_owner",
      ],
      report_status: [
        "new",
        "in_review",
        "investigating",
        "resolved",
        "closed",
        "live",
        "archived",
        "deleted",
        "reviewing",
      ],
      report_type: ["anonymous", "confidential"],
      user_role: ["admin", "case_handler", "reviewer", "org_admin"],
    },
  },
} as const
