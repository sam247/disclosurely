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
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          result: string
          risk_level: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          result: string
          risk_level?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          result?: string
          risk_level?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      cookie_consents: {
        Row: {
          analytics_cookies: boolean
          consent_given: boolean
          consent_timestamp: string
          expires_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
            referencedRelation: "report_response_times"
            referencedColumns: ["report_id"]
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
      link_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          link_id: string
          metadata: Json | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          link_id: string
          metadata?: Json | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
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
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
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
            referencedRelation: "report_response_times"
            referencedColumns: ["report_id"]
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
          role: Database["public"]["Enums"]["user_role"] | null
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
          role?: Database["public"]["Enums"]["user_role"] | null
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
          role?: Database["public"]["Enums"]["user_role"] | null
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
            referencedRelation: "report_response_times"
            referencedColumns: ["report_id"]
          },
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
            referencedRelation: "report_response_times"
            referencedColumns: ["report_id"]
          },
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
            referencedRelation: "report_response_times"
            referencedColumns: ["report_id"]
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
        }
        Insert: {
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
        }
        Update: {
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
    }
    Views: {
      report_response_times: {
        Row: {
          first_org_response_at: string | null
          organization_id: string | null
          report_created_at: string | null
          report_id: string | null
          response_time_hours: number | null
          status: Database["public"]["Enums"]["report_status"] | null
          title: string | null
          tracking_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
      generate_anonymous_access_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_domain_verification_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_link_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_audit_logs_safe: {
        Args: Record<PropertyKey, never>
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
      get_current_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      log_security_event: {
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
      user_has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      user_is_in_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
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
    }
    Enums: {
      report_status:
        | "new"
        | "in_review"
        | "investigating"
        | "resolved"
        | "closed"
        | "live"
        | "archived"
        | "deleted"
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
      report_status: [
        "new",
        "in_review",
        "investigating",
        "resolved",
        "closed",
        "live",
        "archived",
        "deleted",
      ],
      report_type: ["anonymous", "confidential"],
      user_role: ["admin", "case_handler", "reviewer", "org_admin"],
    },
  },
} as const
