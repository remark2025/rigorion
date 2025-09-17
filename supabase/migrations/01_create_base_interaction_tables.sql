-- Base Schema: Create core interaction tracking tables
-- This is the foundation migration for the analytics system

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Main interaction tracking table
CREATE TABLE IF NOT EXISTS public.question_interactions (
  user_id               uuid      NOT NULL,
  question_public_id    text      NOT NULL,               -- e.g., "MATH-001" from your packs
  attempt_number        smallint  NOT NULL DEFAULT 1,
  attempted_at          timestamptz NOT NULL DEFAULT now(),
  duration_seconds      integer   NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  is_correct            boolean,
  confidence_level      smallint  CHECK (confidence_level BETWEEN 1 AND 5),
  hint_checked          boolean   NOT NULL DEFAULT false,
  solution_checked      boolean   NOT NULL DEFAULT false,
  objective_progress    smallint  CHECK (objective_progress BETWEEN 0 AND 100),
  idempotency_key       uuid      DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  
  -- Enhanced skill tracking fields
  module                text,     -- 'math', 'reading', 'writing'
  chapter               integer,
  exam                  integer,
  level                 text,     -- 'easy', 'medium', 'difficult'
  topic                 text,
  question_type         text,
  
  PRIMARY KEY (user_id, question_public_id, attempt_number)
);

-- Bookmarks table for user-saved questions
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id             uuid NOT NULL,
  question_public_id  text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_public_id)
);

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_qi_user_created ON public.question_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qi_user_attempted ON public.question_interactions(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qi_question ON public.question_interactions(question_public_id);
CREATE INDEX IF NOT EXISTS idx_qi_idempotency ON public.question_interactions(user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_question ON public.bookmarks(question_public_id);

-- Row Level Security
ALTER TABLE public.question_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "qi_read" ON public.question_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "qi_insert" ON public.question_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qi_update" ON public.question_interactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bm_read" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bm_insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm_delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_interactions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;

-- Add table comments
COMMENT ON TABLE public.question_interactions IS 'Core table for tracking all question interaction events and analytics';
COMMENT ON TABLE public.bookmarks IS 'User bookmarked questions for later review';

COMMENT ON COLUMN public.question_interactions.user_id IS 'User who attempted the question';
COMMENT ON COLUMN public.question_interactions.question_public_id IS 'Public identifier for the question (e.g., MATH-001)';
COMMENT ON COLUMN public.question_interactions.attempt_number IS 'Sequential attempt number for this user+question combination';
COMMENT ON COLUMN public.question_interactions.duration_seconds IS 'Time spent on question (0-3600 seconds)';
COMMENT ON COLUMN public.question_interactions.idempotency_key IS 'Unique key to prevent duplicate submissions';
COMMENT ON COLUMN public.question_interactions.module IS 'Subject module: math, reading, writing';
COMMENT ON COLUMN public.question_interactions.level IS 'Difficulty level: easy, medium, difficult';