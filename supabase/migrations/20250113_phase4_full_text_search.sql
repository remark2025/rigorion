-- Phase 4.1: Full-Text Search with tsvector and GIN Indexes (Trigger-based, Supabase-safe)

-- ======================================================================
-- EXTENSIONS
-- ======================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Ensure we have pgcrypto (used elsewhere for UUIDs)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================================================
-- TEXT SEARCH CONFIGURATION (guarded create)
-- ======================================================================
DO $$
BEGIN
  -- Create a custom config only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'sat_english'
  ) THEN
    -- Copy from built-in english
    CREATE TEXT SEARCH CONFIGURATION sat_english (COPY = english);
    -- Optional: attach a simple dictionary for special SAT terms (kept simple)
    -- Note: CREATE TEXT SEARCH DICTIONARY has no IF NOT EXISTS; guard it.
    IF NOT EXISTS (
      SELECT 1 FROM pg_ts_dict WHERE dictname = 'sat_terms'
    ) THEN
      CREATE TEXT SEARCH DICTIONARY sat_terms ( TEMPLATE = simple, STOPWORDS = english );
    END IF;
    -- You can ALTER MAPPING on sat_english to include sat_terms or unaccent if desired.
    -- Example (commented until you finalize):
    -- ALTER TEXT SEARCH CONFIGURATION sat_english
    --   ALTER MAPPING FOR asciiword, asciihword, hword_asciipart
    --   WITH unaccent, english_stem;
  END IF;
END$$;

-- ======================================================================
-- UTILITY: updated_at trigger (safe re-create)
-- ======================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- FTS REFRESH FUNCTIONS (one per table for clarity)
-- ======================================================================

-- PASSAGES
CREATE OR REPLACE FUNCTION public.passages_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.content, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.author, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.key_concepts, '{}'), ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- QUESTIONS
CREATE OR REPLACE FUNCTION public.questions_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.content, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.solution_text, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.explanation, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.hint, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.topic, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.subtopic, '')), 'D')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.key_phrases, '{}'), ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- GRAPHS
CREATE OR REPLACE FUNCTION public.graphs_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.alt_text, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.detailed_description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- WRITING PROMPTS
CREATE OR REPLACE FUNCTION public.writing_prompts_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.prompt_text, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.learning_objectives, '{}'), ' ')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.key_criteria, '{}'), ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CONTENT PACKS
CREATE OR REPLACE FUNCTION public.content_packs_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.tags, '{}'), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SOLUTION STEPS
CREATE OR REPLACE FUNCTION public.solution_steps_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.explanation, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.hint, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(NEW.related_concepts, '{}'), ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CONTENT TAGS
CREATE OR REPLACE FUNCTION public.content_tags_update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.name, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(NEW.learning_objective, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- ADD COLUMNS (non-generated) + BACKFILL + TRIGGERS
-- ======================================================================

-- PASSAGES
ALTER TABLE public.passages
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
-- Backfill
UPDATE public.passages p SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(p.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(p.content, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(p.author, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(p.key_concepts, '{}'), ' ')), 'D');
-- Trigger
DROP TRIGGER IF EXISTS trg_passages_search_vector ON public.passages;
CREATE TRIGGER trg_passages_search_vector
  BEFORE INSERT OR UPDATE ON public.passages
  FOR EACH ROW EXECUTE FUNCTION public.passages_update_search_vector();

-- QUESTIONS
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.questions q SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(q.content, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(q.solution_text, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(q.explanation, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(q.hint, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(q.topic, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(q.subtopic, '')), 'D')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(q.key_phrases, '{}'), ' ')), 'D');
DROP TRIGGER IF EXISTS trg_questions_search_vector ON public.questions;
CREATE TRIGGER trg_questions_search_vector
  BEFORE INSERT OR UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.questions_update_search_vector();

-- GRAPHS
ALTER TABLE public.graphs
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.graphs g SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(g.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(g.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(g.alt_text, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(g.detailed_description, '')), 'C');
DROP TRIGGER IF EXISTS trg_graphs_search_vector ON public.graphs;
CREATE TRIGGER trg_graphs_search_vector
  BEFORE INSERT OR UPDATE ON public.graphs
  FOR EACH ROW EXECUTE FUNCTION public.graphs_update_search_vector();

-- WRITING PROMPTS
ALTER TABLE public.writing_prompts
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.writing_prompts wp SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(wp.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(wp.prompt_text, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(wp.learning_objectives, '{}'), ' ')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(wp.key_criteria, '{}'), ' ')), 'D');
DROP TRIGGER IF EXISTS trg_writing_prompts_search_vector ON public.writing_prompts;
CREATE TRIGGER trg_writing_prompts_search_vector
  BEFORE INSERT OR UPDATE ON public.writing_prompts
  FOR EACH ROW EXECUTE FUNCTION public.writing_prompts_update_search_vector();

-- CONTENT PACKS
ALTER TABLE public.content_packs
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.content_packs cp SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(cp.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(cp.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(cp.tags, '{}'), ' ')), 'C');
DROP TRIGGER IF EXISTS trg_content_packs_search_vector ON public.content_packs;
CREATE TRIGGER trg_content_packs_search_vector
  BEFORE INSERT OR UPDATE ON public.content_packs
  FOR EACH ROW EXECUTE FUNCTION public.content_packs_update_search_vector();

-- SOLUTION STEPS
ALTER TABLE public.solution_steps
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.solution_steps ss SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(ss.title, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(ss.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(ss.explanation, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(ss.hint, '')), 'C')
  || setweight(to_tsvector('sat_english'::regconfig, array_to_string(coalesce(ss.related_concepts, '{}'), ' ')), 'D');
DROP TRIGGER IF EXISTS trg_solution_steps_search_vector ON public.solution_steps;
CREATE TRIGGER trg_solution_steps_search_vector
  BEFORE INSERT OR UPDATE ON public.solution_steps
  FOR EACH ROW EXECUTE FUNCTION public.solution_steps_update_search_vector();

-- CONTENT TAGS
ALTER TABLE public.content_tags
  ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE public.content_tags ct SET search_vector =
     setweight(to_tsvector('sat_english'::regconfig, coalesce(ct.name, '')), 'A')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(ct.description, '')), 'B')
  || setweight(to_tsvector('sat_english'::regconfig, coalesce(ct.learning_objective, '')), 'C');
DROP TRIGGER IF EXISTS trg_content_tags_search_vector ON public.content_tags;
CREATE TRIGGER trg_content_tags_search_vector
  BEFORE INSERT OR UPDATE ON public.content_tags
  FOR EACH ROW EXECUTE FUNCTION public.content_tags_update_search_vector();

-- ======================================================================
-- INDEXES (GIN for tsvector, trigram for fuzzy)
-- ======================================================================

CREATE INDEX IF NOT EXISTS idx_passages_search_vector_gin       ON public.passages       USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_questions_search_vector_gin      ON public.questions      USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_graphs_search_vector_gin         ON public.graphs         USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_search_vector_gin ON public.writing_prompts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_content_packs_search_vector_gin  ON public.content_packs  USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_solution_steps_search_vector_gin ON public.solution_steps USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_content_tags_search_vector_gin   ON public.content_tags   USING GIN(search_vector);

-- Trigram fuzzy/partial matches
CREATE INDEX IF NOT EXISTS idx_questions_content_trgm          ON public.questions      USING GIN(content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_passages_content_trgm           ON public.passages       USING GIN(content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_passages_title_trgm             ON public.passages       USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_title_trgm      ON public.writing_prompts USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_content_packs_title_trgm        ON public.content_packs  USING GIN(title gin_trgm_ops);

-- ======================================================================
-- SEARCH FUNCTIONS
-- ======================================================================

-- Unified search across selected content types
CREATE OR REPLACE FUNCTION public.search_content(
  search_query       text,
  content_types      text[] DEFAULT ARRAY['question','passage','writing_prompt','content_pack'],
  subject_filter     subject DEFAULT NULL,
  difficulty_filter  difficulty DEFAULT NULL,
  limit_results      integer DEFAULT 50,
  offset_results     integer DEFAULT 0
)
RETURNS TABLE (
  content_type text,
  content_id   uuid,
  title        text,
  excerpt      text,
  rank         real,
  subject      subject,
  difficulty   difficulty,
  created_at   timestamptz,
  highlight    text
) AS $$
DECLARE
  ts_query tsquery;
BEGIN
  ts_query := websearch_to_tsquery('sat_english'::regconfig, search_query);
  IF ts_query IS NULL THEN
    ts_query := plainto_tsquery('sat_english'::regconfig, search_query);
  END IF;
  IF ts_query IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  -- QUESTIONS
  SELECT 
    'question',
    q.id,
    COALESCE(q.public_id, q.id::text),
    left(q.content, 200),
    ts_rank(q.search_vector, ts_query),
    q.subject,
    q.difficulty,
    q.created_at,
    ts_headline('sat_english'::regconfig, q.content, ts_query, 'MaxWords=20, MinWords=5')
  FROM public.questions q
  WHERE 'question' = ANY(content_types)
    AND q.search_vector @@ ts_query
    AND (subject_filter IS NULL OR q.subject = subject_filter)
    AND (difficulty_filter IS NULL OR q.difficulty = difficulty_filter)
    AND q.is_active = true

  UNION ALL
  -- PASSAGES
  SELECT
    'passage',
    p.id,
    COALESCE(p.title, p.reference_id),
    left(p.content, 200),
    ts_rank(p.search_vector, ts_query),
    p.subject,
    p.difficulty,
    p.created_at,
    ts_headline('sat_english'::regconfig, coalesce(p.title,'') || ' ' || p.content, ts_query, 'MaxWords=20, MinWords=5')
  FROM public.passages p
  WHERE 'passage' = ANY(content_types)
    AND p.search_vector @@ ts_query
    AND (subject_filter IS NULL OR p.subject = subject_filter)
    AND (difficulty_filter IS NULL OR p.difficulty = difficulty_filter)

  UNION ALL
  -- WRITING PROMPTS
  SELECT
    'writing_prompt',
    wp.id,
    wp.title,
    left(wp.prompt_text, 200),
    ts_rank(wp.search_vector, ts_query),
    wp.subject,
    wp.difficulty,
    wp.created_at,
    ts_headline('sat_english'::regconfig, wp.title || ' ' || wp.prompt_text, ts_query, 'MaxWords=20, MinWords=5')
  FROM public.writing_prompts wp
  WHERE 'writing_prompt' = ANY(content_types)
    AND wp.search_vector @@ ts_query
    AND (subject_filter IS NULL OR wp.subject = subject_filter)
    AND (difficulty_filter IS NULL OR wp.difficulty = difficulty_filter)
    AND wp.status = 'published'

  UNION ALL
  -- CONTENT PACKS
  SELECT
    'content_pack',
    cp.id,
    cp.title,
    COALESCE(cp.description, ''),
    ts_rank(cp.search_vector, ts_query),
    cp.subject,
    cp.difficulty,
    cp.created_at,
    ts_headline('sat_english'::regconfig, cp.title || ' ' || COALESCE(cp.description, ''), ts_query, 'MaxWords=20, MinWords=5')
  FROM public.content_packs cp
  WHERE 'content_pack' = ANY(content_types)
    AND cp.search_vector @@ ts_query
    AND (subject_filter IS NULL OR cp.subject = subject_filter)
    AND (difficulty_filter IS NULL OR cp.difficulty = difficulty_filter)
    AND cp.is_published = true

  ORDER BY rank DESC, created_at DESC
  LIMIT limit_results OFFSET offset_results;

END;
$$ LANGUAGE plpgsql STABLE;

-- Advanced search (kept for questions; extend others as needed)
CREATE OR REPLACE FUNCTION public.search_content_advanced(
  search_query text,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  content_type text,
  content_id uuid,
  title text,
  excerpt text,
  rank real,
  metadata jsonb,
  highlight text
) AS $$
DECLARE
  ts_query tsquery;
  content_types   text[];
  subject_filter  subject;
  difficulty_filter difficulty;
  date_from timestamptz;
  date_to   timestamptz;
  has_interactive boolean;
  pack_id_filter uuid;
  tag_filters text[];
  limit_results integer;
  offset_results integer;
BEGIN
  content_types     := COALESCE((filters->>'content_types')::text[], ARRAY['question','passage','writing_prompt','content_pack']);
  subject_filter    := (filters->>'subject')::subject;
  difficulty_filter := (filters->>'difficulty')::difficulty;
  date_from         := (filters->>'date_from')::timestamptz;
  date_to           := (filters->>'date_to')::timestamptz;
  has_interactive   := (filters->>'has_interactive')::boolean;
  pack_id_filter    := (filters->>'pack_id')::uuid;
  tag_filters       := (filters->'tags')::text[];
  limit_results     := COALESCE((filters->>'limit')::integer, 50);
  offset_results    := COALESCE((filters->>'offset')::integer, 0);

  ts_query := websearch_to_tsquery('sat_english'::regconfig, search_query);
  IF ts_query IS NULL THEN
    ts_query := plainto_tsquery('sat_english'::regconfig, search_query);
  END IF;
  IF ts_query IS NULL THEN
    RETURN;
  END IF;

  IF 'question' = ANY(content_types) THEN
    RETURN QUERY
    SELECT
      'question',
      q.id,
      COALESCE(q.public_id, q.id::text),
      left(q.content, 200),
      ts_rank(q.search_vector, ts_query),
      jsonb_build_object(
        'subject', q.subject,
        'difficulty', q.difficulty,
        'topic', q.topic,
        'calculator_allowed', q.calculator_allowed,
        'estimated_time', q.estimated_time,
        'has_interactive', q.has_interactive
      ),
      ts_headline('sat_english'::regconfig, q.content, ts_query, 'MaxWords=20, MinWords=5')
    FROM public.questions q
    WHERE q.search_vector @@ ts_query
      AND (subject_filter IS NULL OR q.subject = subject_filter)
      AND (difficulty_filter IS NULL OR q.difficulty = difficulty_filter)
      AND (date_from IS NULL OR q.created_at >= date_from)
      AND (date_to   IS NULL OR q.created_at <= date_to)
      AND (pack_id_filter IS NULL OR q.pack_id = pack_id_filter)
      AND (has_interactive IS NULL OR q.has_interactive = has_interactive)
      AND (tag_filters IS NULL OR EXISTS (
        SELECT 1
        FROM public.content_tag_assignments cta
        JOIN public.content_tags ct ON ct.id = cta.tag_id
        WHERE cta.content_type = 'question' AND cta.content_id = q.id
          AND ct.name = ANY(tag_filters)
      ))
      AND q.is_active = true
    ORDER BY ts_rank(q.search_vector, ts_query) DESC, q.created_at DESC
    LIMIT limit_results OFFSET offset_results;
  END IF;

END;
$$ LANGUAGE plpgsql STABLE;

-- Search suggestions (no dynamic SQL)
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  partial_query text,
  limit_suggestions integer DEFAULT 10
)
RETURNS TABLE (
  suggestion text,
  frequency integer,
  category text
) AS $$
BEGIN
  -- Use trigram & topics/tags; avoid ts_stat dynamic SQL for safety
  RETURN QUERY
  (
    -- From question topics
    SELECT q.topic AS suggestion, COUNT(*)::int AS frequency, 'topic'
    FROM public.questions q
    WHERE q.topic IS NOT NULL AND q.topic ILIKE ('%' || partial_query || '%') AND q.is_active
    GROUP BY q.topic
  )
  UNION ALL
  (
    -- From tags
    SELECT ct.name AS suggestion, ct.usage_count AS frequency, 'tag'
    FROM public.content_tags ct
    WHERE ct.name ILIKE ('%' || partial_query || '%') AND ct.is_active
  )
  UNION ALL
  (
    -- From content pack titles
    SELECT cp.title AS suggestion, GREATEST(cp.download_count, 0)::int AS frequency, 'pack'
    FROM public.content_packs cp
    WHERE cp.title ILIKE ('%' || partial_query || '%') AND cp.is_published
  )
  ORDER BY frequency DESC, suggestion
  LIMIT limit_suggestions;
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================================================================
-- SEARCH ANALYTICS
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query text NOT NULL,
  normalized_query text,
  query_type text CHECK (query_type IN ('full_text','advanced','suggestion','autocomplete')),
  filters_applied jsonb,
  content_types text[] DEFAULT '{}',
  results_count integer NOT NULL,
  execution_time_ms numeric(10,3),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  clicked_results integer DEFAULT 0,
  clicked_rank integer[],
  session_converted boolean DEFAULT false,
  user_agent text,
  ip_address inet,
  searched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query       ON public.search_analytics(search_query, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user        ON public.search_analytics(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_performance ON public.search_analytics(execution_time_ms, results_count);

-- Materialized view (no CONCURRENTLY)
DROP MATERIALIZED VIEW IF EXISTS public.popular_search_terms;
CREATE MATERIALIZED VIEW public.popular_search_terms AS
SELECT 
  search_query,
  COUNT(*)                      AS search_count,
  AVG(results_count)            AS avg_results,
  AVG(execution_time_ms)        AS avg_execution_time,
  SUM(clicked_results)          AS total_clicks,
  AVG(NULLIF((clicked_rank)[1], NULL)) AS avg_first_click_rank
FROM public.search_analytics
WHERE searched_at >= now() - interval '30 days'
GROUP BY search_query
HAVING COUNT(*) >= 5
ORDER BY search_count DESC;

-- ======================================================================
-- LOGGING HELPERS
-- ======================================================================
CREATE OR REPLACE FUNCTION public.log_search_query(
  query_text text,
  query_type_param text,
  filters_param jsonb,
  results_count_param integer,
  execution_time_param numeric,
  user_uuid uuid DEFAULT NULL,
  session_id_param text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
  normalized_query text;
BEGIN
  normalized_query := regexp_replace(lower(trim(query_text)), '\s+', ' ', 'g');
  INSERT INTO public.search_analytics (
    search_query, normalized_query, query_type,
    filters_applied, results_count, execution_time_ms,
    user_id, session_id
  ) VALUES (
    query_text, normalized_query, query_type_param,
    filters_param, results_count_param, execution_time_param,
    user_uuid, session_id_param
  )
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_search_click(
  search_log_id uuid,
  clicked_position integer,
  session_converted_param boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE public.search_analytics
  SET clicked_results = clicked_results + 1,
      clicked_rank    = array_append(clicked_rank, clicked_position),
      session_converted = session_converted OR session_converted_param
  WHERE id = search_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_search_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.popular_search_terms;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- COMMENTS
-- ======================================================================
COMMENT ON FUNCTION public.search_content(text, text[], subject, difficulty, integer, integer)
  IS 'Full-text search across content with ranking and highlights';
COMMENT ON FUNCTION public.search_content_advanced(text, jsonb)
  IS 'Advanced search over questions with faceted filters; extend for other types as needed';
COMMENT ON FUNCTION public.get_search_suggestions(text, integer)
  IS 'Lightweight suggestions from topics, tags, and pack titles';
COMMENT ON TABLE public.search_analytics
  IS 'Search queries and performance telemetry';
COMMENT ON MATERIALIZED VIEW public.popular_search_terms
  IS '30-day roll-up of popular queries and engagement';
