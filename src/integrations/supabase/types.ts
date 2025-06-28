export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_notifications: {
        Row: {
          email_address: string
          id: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          report_id: string | null
          sent_at: string
          subject: string
          user_id: string
        }
        Insert: {
          email_address: string
          id?: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          report_id?: string | null
          sent_at?: string
          subject: string
          user_id: string
        }
        Update: {
          email_address?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          report_id?: string | null
          sent_at?: string
          subject?: string
          user_id?: string
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
          custom_logo_url: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          custom_logo_url?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          custom_logo_url?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
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
          report_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          encrypted_file_url: string
          encryption_metadata: Json
          file_size: number
          filename: string
          id?: string
          report_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          encrypted_file_url?: string
          encryption_metadata?: Json
          file_size?: number
          filename?: string
          id?: string
          report_id?: string
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
          assigned_to: string | null
          created_at: string
          due_date: string | null
          encrypted_content: string
          encryption_key_hash: string
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
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          encrypted_content: string
          encryption_key_hash: string
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
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          encrypted_content?: string
          encryption_key_hash?: string
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
      [_ in never]: never
    }
    Functions: {
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
      user_has_role: {
        Args: {
          p_user_id: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      report_status:
        | "new"
        | "in_review"
        | "investigating"
        | "resolved"
        | "closed"
      report_type: "anonymous" | "confidential"
      user_role: "admin" | "case_handler" | "reviewer" | "org_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      ],
      report_type: ["anonymous", "confidential"],
      user_role: ["admin", "case_handler", "reviewer", "org_admin"],
    },
  },
} as const
