export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: string | null
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
          created_at?: string
          updated_at?: string
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
          created_at: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
          created_at?: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          domain: string
          embed_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          domain: string
          embed_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          domain?: string
          embed_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          project_id: string
          page_url: string
          started_at: string
          completed_at: string | null
          triggered_by: string
          user_email: string | null
        }
        Insert: {
          id?: string
          project_id: string
          page_url: string
          started_at?: string
          completed_at?: string | null
          triggered_by: string
          user_email?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          page_url?: string
          started_at?: string
          completed_at?: string | null
          triggered_by?: string
          user_email?: string | null
        }
      }
      scan_results: {
        Row: {
          id: string
          scan_id: string
          issue_type: string
          severity: string | null
          element_selector: string | null
          issue_description: string | null
          suggested_fix: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          scan_id: string
          issue_type: string
          severity?: string | null
          element_selector?: string | null
          issue_description?: string | null
          suggested_fix?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          scan_id?: string
          issue_type?: string
          severity?: string | null
          element_selector?: string | null
          issue_description?: string | null
          suggested_fix?: string | null
          metadata?: Json | null
        }
      }
      widget_sessions: {
        Row: {
          id: string
          project_id: string
          page_url: string | null
          user_identifier: string | null
          load_count: number
          last_scan_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          page_url?: string | null
          user_identifier?: string | null
          load_count?: number
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          page_url?: string | null
          user_identifier?: string | null
          load_count?: number
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
