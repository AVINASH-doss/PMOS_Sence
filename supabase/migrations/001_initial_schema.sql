-- ============================================================
-- PMOS Sense — Supabase Database Setup
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);


-- =====================
-- 2. ASSESSMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.assessments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  answers                 JSONB NOT NULL,
  overall_score           INTEGER NOT NULL,
  risk_range              TEXT NOT NULL,
  menstrual_score         INTEGER NOT NULL DEFAULT 0,
  androgen_score          INTEGER NOT NULL DEFAULT 0,
  metabolic_score         INTEGER NOT NULL DEFAULT 0,
  lifestyle_score         INTEGER NOT NULL DEFAULT 0,
  family_reproductive_score INTEGER,
  bmi                     NUMERIC(5,1),
  bmi_category            TEXT,
  pattern_scores          JSONB NOT NULL DEFAULT '[]'::jsonb,
  contributing_factors    JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_analysis             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own assessments
CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON public.assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);


-- =====================
-- 3. CYCLE ENTRIES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.cycle_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start_date DATE NOT NULL,
  period_end_date   DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cycle_entries ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own cycle entries
CREATE POLICY "Users can view own cycle entries"
  ON public.cycle_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle entries"
  ON public.cycle_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle entries"
  ON public.cycle_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle entries"
  ON public.cycle_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cycle_entries_user_id ON public.cycle_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_entries_start_date ON public.cycle_entries(period_start_date);


-- =====================
-- DONE
-- =====================
-- All tables have RLS enabled.
-- All policies use auth.uid() to ensure user data isolation.
-- No service_role key is used in the frontend.
