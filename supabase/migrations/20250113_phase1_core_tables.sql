-- ============================================================
-- 0) EXTENSIONS (for gen_random_uuid)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1) DOMAINS (idempotent creation via DO blocks)
-- ============================================================

-- version_string: semantic version like 1.0.0 / 2.1.3-beta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'version_string'
  ) THEN
    CREATE DOMAIN version_string AS text
      CHECK (VALUE ~ '^\d+\.\d+\.\d+(-[0-9A-Za-z\.-]+)?$');
  END IF;
END$$;

-- duration_seconds: non-negative integer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'duration_seconds'
  ) THEN
    CREATE DOMAIN duration_seconds AS integer
      CHECK (VALUE >= 0);
  END IF;
END$$;

-- percentage: 0..100 with two decimals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'percentage'
  ) THEN
    CREATE DOMAIN percentage AS numeric(5,2)
      CHECK (VALUE >= 0 AND VALUE <= 100);
  END IF;
END$$;

-- content_hash: allow sha256 or other hashes; nullable is fine
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'content_hash'
  ) THEN
    CREATE DOMAIN content_hash AS text
      CHECK (
        VALUE IS NULL
        OR VALUE ~ '^[A-Fa-f0-9]{32}$'           -- md5
        OR VALUE ~ '^[A-Fa-f0-9]{40}$'           -- sha1
        OR VALUE ~ '^[A-Fa-f0-9]{64}$'           -- sha256
        OR VALUE ~ '^[A-Fa-f0-9]{128}$'          -- sha512
      );
  END IF;
END$$;

-- ============================================================
-- 2) ENUMS (create if missing; add missing values if needed)
-- ============================================================

-- pack_category
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='pack_category') THEN
    CREATE TYPE pack_category AS ENUM ('math','reading','writing','mixed');
  END IF;
END$$;

-- subject
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='subject') THEN
    CREATE TYPE subject AS ENUM ('math','reading','writing','science');
  END IF;
END$$;

-- difficulty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='difficulty') THEN
    CREATE TYPE difficulty AS ENUM ('easy','medium','hard');
  END IF;
END$$;

-- content_status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='content_status') THEN
    CREATE TYPE content_status AS ENUM ('draft','review','published','archived');
  END IF;
END$$;

-- question_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='question_type') THEN
    CREATE TYPE question_type AS ENUM ('multiple_choice','grid_in','essay','interactive');
  END IF;
END$$;

-- passage_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='passage_type') THEN
    CREATE TYPE passage_type AS ENUM ('fiction','nonfiction','poetry','historical','scientific','persuasive');
  END IF;
END$$;

-- graph_type (ensure it includes 'function_graph')
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='graph_type') THEN
    CREATE TYPE graph_type AS ENUM (
      'coordinate_plane','bar_chart','line_graph','pie_chart',
      'scatter_plot','histogram','function_graph'
    );
  ELSE
    -- add 'function_graph' if it’s missing
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typname='graph_type' AND e.enumlabel='function_graph'
    ) THEN
      ALTER TYPE graph_type ADD VALUE 'function_graph';
    END IF;
  END IF;
END$$;

-- step_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='step_type') THEN
    CREATE TYPE step_type AS ENUM ('concept','calculation','analysis','verification','insight');
  END IF;
END$$;

-- interaction_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='interaction_type') THEN
    CREATE TYPE interaction_type AS ENUM ('fill_blank','input','slider','multiple_choice','drag_drop');
  END IF;
END$$;

-- calculator_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='calculator_type') THEN
    CREATE TYPE calculator_type AS ENUM ('basic','scientific','graphing');
  END IF;
END$$;

-- solution_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='solution_type') THEN
    CREATE TYPE solution_type AS ENUM ('graph','calculator','diagram','simulation','step_by_step');
  END IF;
END$$;

-- ============================================================
-- 3) TABLES (Phase 1.2) - use IF NOT EXISTS to avoid data loss
-- ============================================================

-- CONTENT PACKS
CREATE TABLE IF NOT EXISTS public.content_packs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    description text,
    version version_string NOT NULL DEFAULT '1.0.0',
    category pack_category NOT NULL DEFAULT 'mixed',
    subject subject,
    difficulty difficulty,
    tags text[] DEFAULT '{}',
    question_count integer NOT NULL DEFAULT 0,
    estimated_duration duration_seconds,
    file_path text,
    content_hash content_hash,
    size_bytes bigint DEFAULT 0,
    status content_status NOT NULL DEFAULT 'draft',
    is_published boolean GENERATED ALWAYS AS (status = 'published') STORED,
    is_premium boolean NOT NULL DEFAULT false,
    access_level text DEFAULT 'free' CHECK (access_level IN ('free','premium','internal')),
    download_count bigint DEFAULT 0,
    rating_average numeric(3,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    cache_control text DEFAULT 'public, max-age=31536000, immutable',
    etag text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT uq_content_packs_slug UNIQUE (slug)
);

-- PASSAGES
CREATE TABLE IF NOT EXISTS public.passages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id text UNIQUE NOT NULL,
    title text,
    content text NOT NULL,
    passage_type passage_type NOT NULL DEFAULT 'nonfiction',
    subject subject NOT NULL DEFAULT 'reading',
    difficulty difficulty,
    source text,
    author text,
    publication_date date,
    copyright_info text,
    word_count integer,
    reading_level text,
    estimated_time duration_seconds DEFAULT 300,
    key_concepts text[] DEFAULT '{}',
    vocabulary_level difficulty DEFAULT 'medium',
    paragraphs jsonb,
    footnotes jsonb,
    formatting_notes text,
    search_vector tsvector,
    alt_descriptions jsonb,
    accessibility_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT chk_passage_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT chk_passage_word_count CHECK (word_count IS NULL OR word_count > 0)
);

-- GRAPHS
CREATE TABLE IF NOT EXISTS public.graphs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id text UNIQUE NOT NULL,
    title text,
    description text,
    graph_type graph_type NOT NULL,
    subject subject NOT NULL,
    image_url text,
    svg_data text,
    canvas_data jsonb,
    is_interactive boolean NOT NULL DEFAULT false,
    interaction_config jsonb,
    functions jsonb,
    coordinate_system jsonb,
    domain_range jsonb,
    data_points jsonb,
    axis_labels jsonb,
    legend_info jsonb,
    theme text DEFAULT 'default',
    color_scheme jsonb,
    dimensions jsonb,
    alt_text text NOT NULL,
    detailed_description text,
    tactile_description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT chk_graph_alt_text_not_empty CHECK (char_length(trim(alt_text)) > 0),
    CONSTRAINT chk_graph_has_visual_data CHECK (
        image_url IS NOT NULL OR svg_data IS NOT NULL OR canvas_data IS NOT NULL
    )
);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id uuid NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
    question_number integer NOT NULL,
    public_id text UNIQUE NOT NULL,
    content text NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    subject subject NOT NULL,
    topic text,
    subtopic text,
    difficulty difficulty NOT NULL DEFAULT 'medium',
    choices jsonb,
    correct_answer text,
    passage_id uuid REFERENCES public.passages(id) ON DELETE SET NULL,
    primary_graph_id uuid REFERENCES public.graphs(id) ON DELETE SET NULL,
    solution_text text,
    explanation text,
    hint text,
    calculator_allowed boolean DEFAULT true,
    estimated_time duration_seconds DEFAULT 90,
    key_phrases text[] DEFAULT '{}',
    average_time duration_seconds,
    success_rate percentage,
    discrimination_index numeric(4,3),
    points_possible integer DEFAULT 1,
    partial_credit boolean DEFAULT false,
    status content_status NOT NULL DEFAULT 'draft',
    is_active boolean GENERATED ALWAYS AS (status = 'published') STORED,
    screen_reader_text text,
    accessibility_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT uq_questions_pack_number UNIQUE (pack_id, question_number),
    CONSTRAINT uq_questions_public_id UNIQUE (public_id),
    CONSTRAINT chk_question_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT chk_question_positive_points CHECK (points_possible > 0),
    CONSTRAINT chk_multiple_choice_has_choices CHECK (
      question_type != 'multiple_choice'
      OR (choices IS NOT NULL AND jsonb_array_length(choices) >= 2)
    )
);

-- SOLUTION STEPS
CREATE TABLE IF NOT EXISTS public.solution_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    step_number integer NOT NULL,
    title text,
    description text NOT NULL,
    step_type step_type NOT NULL DEFAULT 'concept',
    from_expression jsonb,
    to_expression jsonb,
    diagram_id uuid REFERENCES public.graphs(id) ON DELETE SET NULL,
    image_url text,
    is_interactive boolean DEFAULT false,
    interaction_data jsonb,
    interaction_type interaction_type,
    hint text,
    explanation text,
    common_mistakes jsonb,
    related_concepts text[],
    has_checkpoint boolean DEFAULT false,
    checkpoint_data jsonb,
    estimated_time duration_seconds DEFAULT 30,
    difficulty difficulty,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_solution_steps_question_number UNIQUE (question_id, step_number),
    CONSTRAINT chk_solution_step_description_not_empty CHECK (char_length(trim(description)) > 0),
    CONSTRAINT chk_solution_step_positive_number CHECK (step_number > 0)
);

-- INTERACTIVE SOLUTIONS
CREATE TABLE IF NOT EXISTS public.interactive_solutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    solution_type solution_type NOT NULL,
    has_interactive_graph boolean DEFAULT false,
    graph_config jsonb,
    parameters jsonb,
    calculator_type calculator_type DEFAULT 'basic',
    allowed_functions text[] DEFAULT '{}',
    computation_steps jsonb,
    interactive_steps jsonb,
    simulation_config jsonb,
    model_parameters jsonb,
    assessment_points jsonb,
    checkpoint_triggers text[] DEFAULT '{}',
    render_payload jsonb,
    average_completion_time duration_seconds,
    interaction_success_rate percentage,
    version version_string DEFAULT '1.0.0',
    configuration_hash content_hash,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT chk_interactive_graph_config CHECK (
      (solution_type != 'graph')
      OR (has_interactive_graph = true AND graph_config IS NOT NULL)
    ),
    CONSTRAINT chk_interactive_parameters CHECK (
      (solution_type != 'graph')
      OR (parameters IS NOT NULL AND jsonb_array_length(parameters) > 0)
    )
);

-- ============================================================
-- 4) UPDATED_AT triggers (create trigger function if missing)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_content_packs_updated_at'
  ) THEN
    CREATE TRIGGER trg_content_packs_updated_at
      BEFORE UPDATE ON public.content_packs
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_passages_updated_at'
  ) THEN
    CREATE TRIGGER trg_passages_updated_at
      BEFORE UPDATE ON public.passages
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_graphs_updated_at'
  ) THEN
    CREATE TRIGGER trg_graphs_updated_at
      BEFORE UPDATE ON public.graphs
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_questions_updated_at'
  ) THEN
    CREATE TRIGGER trg_questions_updated_at
      BEFORE UPDATE ON public.questions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_solution_steps_updated_at'
  ) THEN
    CREATE TRIGGER trg_solution_steps_updated_at
      BEFORE UPDATE ON public.solution_steps
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_interactive_solutions_updated_at'
  ) THEN
    CREATE TRIGGER trg_interactive_solutions_updated_at
      BEFORE UPDATE ON public.interactive_solutions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- ============================================================
-- 5) COMMENTS (safe to re-run)
-- ============================================================
COMMENT ON TABLE public.content_packs IS 'Content packages containing groups of related questions and materials';
COMMENT ON TABLE public.passages IS 'Reading passages for comprehension questions with rich metadata';
COMMENT ON TABLE public.graphs IS 'Visual content including static images and interactive graphs';
COMMENT ON TABLE public.questions IS 'Individual questions with content, choices, and metadata';
COMMENT ON TABLE public.solution_steps IS 'Normalized step-by-step solutions for detailed explanations';
COMMENT ON TABLE public.interactive_solutions IS 'Interactive solution configurations for enhanced learning';

COMMENT ON COLUMN public.content_packs.slug IS 'Human-readable identifier for URL-safe references';
COMMENT ON COLUMN public.questions.public_id IS 'Human-readable question identifier for external references';
COMMENT ON COLUMN public.questions.discrimination_index IS 'Psychometric item discrimination (0.0-1.0, higher is better)';
COMMENT ON COLUMN public.interactive_solutions.render_payload IS 'Denormalized JSON payload for frontend rendering';
