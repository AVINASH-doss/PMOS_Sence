// ============================================================
// PMOS Sense — Database Type Definitions
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      assessments: {
        Row: AssessmentRow;
        Insert: AssessmentInsert;
        Update: AssessmentUpdate;
      };
      cycle_entries: {
        Row: CycleEntryRow;
        Insert: CycleEntryInsert;
        Update: CycleEntryUpdate;
      };
    };
  };
}

// ---- Profiles ----
export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  user_id: string;
  display_name?: string | null;
  date_of_birth?: string | null;
}

export interface ProfileUpdate {
  display_name?: string | null;
  date_of_birth?: string | null;
  updated_at?: string;
}

// ---- Assessments ----
export interface AssessmentRow {
  id: string;
  user_id: string;
  assessment_date: string;
  answers: Record<string, string | number>;
  overall_score: number;
  risk_range: string;
  menstrual_score: number;
  androgen_score: number;
  metabolic_score: number;
  lifestyle_score: number;
  family_reproductive_score: number | null;
  bmi: number | null;
  bmi_category: string | null;
  pattern_scores: Record<string, unknown>[];
  contributing_factors: Record<string, unknown>[];
  ai_analysis: string | null;
  created_at: string;
}

export interface AssessmentInsert {
  user_id: string;
  assessment_date?: string;
  answers: Record<string, string | number>;
  overall_score: number;
  risk_range: string;
  menstrual_score: number;
  androgen_score: number;
  metabolic_score: number;
  lifestyle_score: number;
  family_reproductive_score?: number | null;
  bmi?: number | null;
  bmi_category?: string | null;
  pattern_scores: Record<string, unknown>[];
  contributing_factors: Record<string, unknown>[];
  ai_analysis?: string | null;
}

export interface AssessmentUpdate {
  ai_analysis?: string | null;
}

// ---- Cycle Entries ----
export interface CycleEntryRow {
  id: string;
  user_id: string;
  period_start_date: string;
  period_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleEntryInsert {
  user_id: string;
  period_start_date: string;
  period_end_date?: string | null;
  notes?: string | null;
}

export interface CycleEntryUpdate {
  period_start_date?: string;
  period_end_date?: string | null;
  notes?: string | null;
  updated_at?: string;
}
