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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          operator_id: string | null
          qr_code: string
          status: Database["public"]["Enums"]["batch_status"]
          validator_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          operator_id?: string | null
          qr_code: string
          status?: Database["public"]["Enums"]["batch_status"]
          validator_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          operator_id?: string | null
          qr_code?: string
          status?: Database["public"]["Enums"]["batch_status"]
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "validators"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          descricao: string | null
          gamma_factor: number
          id: string
          nome: string
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          gamma_factor: number
          id?: string
          nome: string
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          created_at?: string
          descricao?: string | null
          gamma_factor?: number
          id?: string
          nome?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: []
      }
      certificates: {
        Row: {
          assinado_at: string | null
          created_at: string
          event_id: string
          id: string
          numero_sequencial: string
          pdf_url: string | null
          tipo: Database["public"]["Enums"]["certificate_type"]
        }
        Insert: {
          assinado_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          numero_sequencial: string
          pdf_url?: string | null
          tipo?: Database["public"]["Enums"]["certificate_type"]
        }
        Update: {
          assinado_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          numero_sequencial?: string
          pdf_url?: string | null
          tipo?: Database["public"]["Enums"]["certificate_type"]
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "disposal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      compensations: {
        Row: {
          created_at: string
          elp_burned: number
          finalidade: string | null
          id: string
          numero_sequencial: string
          operator_id: string
          pdf_url: string | null
          polygon_tx_hash: string | null
        }
        Insert: {
          created_at?: string
          elp_burned: number
          finalidade?: string | null
          id?: string
          numero_sequencial: string
          operator_id: string
          pdf_url?: string | null
          polygon_tx_hash?: string | null
        }
        Update: {
          created_at?: string
          elp_burned?: number
          finalidade?: string | null
          id?: string
          numero_sequencial?: string
          operator_id?: string
          pdf_url?: string | null
          polygon_tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compensations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      disposal_events: {
        Row: {
          alpha: number
          batch_id: string | null
          beta: number
          category_id: string
          created_at: string
          elp_amount: number | null
          hash_sha256: string | null
          id: string
          operator_id: string
          photo_url: string | null
          polygon_tx_hash: string | null
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          validator_id: string | null
          weight_kg: number
        }
        Insert: {
          alpha?: number
          batch_id?: string | null
          beta?: number
          category_id: string
          created_at?: string
          elp_amount?: number | null
          hash_sha256?: string | null
          id?: string
          operator_id: string
          photo_url?: string | null
          polygon_tx_hash?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          validator_id?: string | null
          weight_kg: number
        }
        Update: {
          alpha?: number
          batch_id?: string | null
          beta?: number
          category_id?: string
          created_at?: string
          elp_amount?: number | null
          hash_sha256?: string | null
          id?: string
          operator_id?: string
          photo_url?: string | null
          polygon_tx_hash?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          validator_id?: string | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "disposal_events_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposal_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposal_events_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disposal_events_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "validators"
            referencedColumns: ["id"]
          },
        ]
      }
      elp_audit_log: {
        Row: {
          algorithm: string
          alpha: number
          beta: number
          category_id: string
          created_at: string
          elp_amount: number
          event_id: string
          gamma_factor: number
          id: string
          input_hash: string
          operator_id: string
          signature: string | null
          signed_at: string
          signed_by_user_id: string
          weight_kg: number
        }
        Insert: {
          algorithm?: string
          alpha: number
          beta: number
          category_id: string
          created_at?: string
          elp_amount: number
          event_id: string
          gamma_factor: number
          id?: string
          input_hash: string
          operator_id: string
          signature?: string | null
          signed_at?: string
          signed_by_user_id: string
          weight_kg: number
        }
        Update: {
          algorithm?: string
          alpha?: number
          beta?: number
          category_id?: string
          created_at?: string
          elp_amount?: number
          event_id?: string
          gamma_factor?: number
          id?: string
          input_hash?: string
          operator_id?: string
          signature?: string | null
          signed_at?: string
          signed_by_user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      kpis: {
        Row: {
          beta_score: number | null
          created_at: string
          id: string
          periodo: string
          scan_rate: number | null
          tx_custo: number | null
          uptime: number | null
          user_id: string
        }
        Insert: {
          beta_score?: number | null
          created_at?: string
          id?: string
          periodo?: string
          scan_rate?: number | null
          tx_custo?: number | null
          uptime?: number | null
          user_id: string
        }
        Update: {
          beta_score?: number | null
          created_at?: string
          id?: string
          periodo?: string
          scan_rate?: number | null
          tx_custo?: number | null
          uptime?: number | null
          user_id?: string
        }
        Relationships: []
      }
      operators: {
        Row: {
          beta_score: number
          cpf_cnpj: string | null
          created_at: string
          id: string
          nome: string
          operation_level: number
          role: Database["public"]["Enums"]["user_role"]
          tipo: Database["public"]["Enums"]["operator_type"]
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          beta_score?: number
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          nome: string
          operation_level?: number
          role?: Database["public"]["Enums"]["user_role"]
          tipo?: Database["public"]["Enums"]["operator_type"]
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          beta_score?: number
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          nome?: string
          operation_level?: number
          role?: Database["public"]["Enums"]["user_role"]
          tipo?: Database["public"]["Enums"]["operator_type"]
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      sinir_reports: {
        Row: {
          csv_url: string | null
          exported_at: string
          id: string
          operator_id: string
          pdf_url: string | null
          periodo_fim: string
          periodo_inicio: string
          total_elp: number
          total_eventos: number
          total_kg: number
        }
        Insert: {
          csv_url?: string | null
          exported_at?: string
          id?: string
          operator_id: string
          pdf_url?: string | null
          periodo_fim: string
          periodo_inicio: string
          total_elp?: number
          total_eventos?: number
          total_kg?: number
        }
        Update: {
          csv_url?: string | null
          exported_at?: string
          id?: string
          operator_id?: string
          pdf_url?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          total_elp?: number
          total_eventos?: number
          total_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "sinir_reports_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      token_supply: {
        Row: {
          hard_cap: number
          id: boolean
          total_emitido: number
          updated_at: string
        }
        Insert: {
          hard_cap?: number
          id?: boolean
          total_emitido?: number
          updated_at?: string
        }
        Update: {
          hard_cap?: number
          id?: boolean
          total_emitido?: number
          updated_at?: string
        }
        Relationships: []
      }
      validators: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          id: string
          licenca: string | null
          nome: string
          tipo: Database["public"]["Enums"]["validator_type"]
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          id?: string
          licenca?: string | null
          nome: string
          tipo: Database["public"]["Enums"]["validator_type"]
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          id?: string
          licenca?: string | null
          nome?: string
          tipo?: Database["public"]["Enums"]["validator_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          created_at: string
          custody: string
          encrypted_pk: string | null
          id: string
          saldo_elp: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          custody?: string
          encrypted_pk?: string | null
          id?: string
          saldo_elp?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          custody?: string
          encrypted_pk?: string | null
          id?: string
          saldo_elp?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_validator: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      batch_status: "pendente" | "validado" | "cancelado"
      certificate_type: "PF" | "PJ"
      event_status: "pendente" | "aprovado" | "rejeitado"
      operator_type: "PF" | "PJ" | "Cooperativa" | "Reciclador"
      risk_level: "alto" | "medio" | "baixo"
      user_role:
        | "operator"
        | "donor_pf"
        | "donor_pj"
        | "buyer"
        | "validator"
        | "admin"
      validator_type: "Cooperativa" | "Transportadora" | "Reciclador"
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
      batch_status: ["pendente", "validado", "cancelado"],
      certificate_type: ["PF", "PJ"],
      event_status: ["pendente", "aprovado", "rejeitado"],
      operator_type: ["PF", "PJ", "Cooperativa", "Reciclador"],
      risk_level: ["alto", "medio", "baixo"],
      user_role: [
        "operator",
        "donor_pf",
        "donor_pj",
        "buyer",
        "validator",
        "admin",
      ],
      validator_type: ["Cooperativa", "Transportadora", "Reciclador"],
    },
  },
} as const
