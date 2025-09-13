-- Phase 1.3: Strategic Indexes and Performance Optimization (Supabase-safe)

-- ============================================================================
-- CONTENT PACKS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_content_packs_status ON public.content_packs(status);
CREATE INDEX IF NOT EXISTS idx_content_packs_published ON public.content_packs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_content_packs_category_subject ON public.content_packs(category, subject);
CREATE INDEX IF NOT EXISTS idx_content_packs_access_level ON public.content_packs(access_level);

CREATE INDEX IF NOT EXISTS idx_content_packs_download_count ON public.content_packs(download_count);
CREATE INDEX IF NOT EXISTS idx_content_packs_rating ON public.content_packs(rating_average, rating_count);
CREATE INDEX IF NOT EXISTS idx_content_packs_created_at ON public.content_packs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_packs_created_by ON public.content_packs(created_by);
CREATE INDEX IF NOT EXISTS idx_content_packs_updated_at ON public.content_packs(updated_at);

CREATE INDEX IF NOT EXISTS idx_content_packs_published_category_difficulty 
    ON public.content_packs(is_published, category, difficulty) 
    WHERE is_published = true;

-- ============================================================================
-- PASSAGES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_passages_type_subject ON public.passages(passage_type, subject);
CREATE INDEX IF NOT EXISTS idx_passages_difficulty ON public.passages(difficulty);
CREATE INDEX IF NOT EXISTS idx_passages_reading_level ON public.passages(reading_level);

CREATE INDEX IF NOT EXISTS idx_passages_word_count ON public.passages(word_count);
CREATE INDEX IF NOT EXISTS idx_passages_estimated_time ON public.passages(estimated_time);

CREATE INDEX IF NOT EXISTS idx_passages_author ON public.passages(author) WHERE author IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_passages_publication_date ON public.passages(publication_date) WHERE publication_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_passages_created_by ON public.passages(created_by);
CREATE INDEX IF NOT EXISTS idx_passages_created_at ON public.passages(created_at);

CREATE INDEX IF NOT EXISTS idx_passages_key_concepts_gin ON public.passages USING GIN(key_concepts);

-- ============================================================================
-- GRAPHS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_graphs_type_subject ON public.graphs(graph_type, subject);
CREATE INDEX IF NOT EXISTS idx_graphs_interactive ON public.graphs(is_interactive);

CREATE INDEX IF NOT EXISTS idx_graphs_created_by ON public.graphs(created_by);
CREATE INDEX IF NOT EXISTS idx_graphs_created_at ON public.graphs(created_at);

-- ============================================================================
-- QUESTIONS INDEXES
-- ============================================================================

-- Delivery / ordering
CREATE INDEX IF NOT EXISTS idx_questions_pack_id_number ON public.questions(pack_id, question_number);
CREATE INDEX IF NOT EXISTS idx_questions_pack_id_active ON public.questions(pack_id, is_active) WHERE is_active = true;

-- Filtering
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic_difficulty ON public.questions(subject, topic, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_type_subject ON public.questions(question_type, subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);

-- Joins
CREATE INDEX IF NOT EXISTS idx_questions_passage_id ON public.questions(passage_id) WHERE passage_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questions_primary_graph_id ON public.questions(primary_graph_id) WHERE primary_graph_id IS NOT NULL;

-- Analytics metrics
CREATE INDEX IF NOT EXISTS idx_questions_success_rate ON public.questions(success_rate);
CREATE INDEX IF NOT EXISTS idx_questions_average_time ON public.questions(average_time);
CREATE INDEX IF NOT EXISTS idx_questions_discrimination_index ON public.questions(discrimination_index);

-- Metadata
CREATE INDEX IF NOT EXISTS idx_questions_calculator_allowed ON public.questions(calculator_allowed);
CREATE INDEX IF NOT EXISTS idx_questions_estimated_time ON public.questions(estimated_time);

-- Management
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_updated_at ON public.questions(updated_at);

-- Arrays/JSONB
CREATE INDEX IF NOT EXISTS idx_questions_key_phrases_gin ON public.questions USING GIN(key_phrases);

-- Composite for common filters
CREATE INDEX IF NOT EXISTS idx_questions_active_subject_difficulty 
    ON public.questions(is_active, subject, difficulty) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_questions_pack_active_subject 
    ON public.questions(pack_id, is_active, subject) 
    WHERE is_active = true;

-- ============================================================================
-- SOLUTION STEPS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_solution_steps_question_id_number ON public.solution_steps(question_id, step_number);

CREATE INDEX IF NOT EXISTS idx_solution_steps_type ON public.solution_steps(step_type);
CREATE INDEX IF NOT EXISTS idx_solution_steps_interactive ON public.solution_steps(is_interactive);
CREATE INDEX IF NOT EXISTS idx_solution_steps_has_checkpoint ON public.solution_steps(has_checkpoint);

CREATE INDEX IF NOT EXISTS idx_solution_steps_estimated_time ON public.solution_steps(estimated_time);
CREATE INDEX IF NOT EXISTS idx_solution_steps_difficulty ON public.solution_steps(difficulty);

CREATE INDEX IF NOT EXISTS idx_solution_steps_diagram_id ON public.solution_steps(diagram_id) WHERE diagram_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_solution_steps_created_at ON public.solution_steps(created_at);

CREATE INDEX IF NOT EXISTS idx_solution_steps_related_concepts_gin ON public.solution_steps USING GIN(related_concepts);

-- ============================================================================
-- INTERACTIVE SOLUTIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_type ON public.interactive_solutions(solution_type);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_has_graph ON public.interactive_solutions(has_interactive_graph);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_calculator_type ON public.interactive_solutions(calculator_type);

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_completion_time ON public.interactive_solutions(average_completion_time);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_success_rate ON public.interactive_solutions(interaction_success_rate);

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_version ON public.interactive_solutions(version);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_config_hash ON public.interactive_solutions(configuration_hash);

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_created_by ON public.interactive_solutions(created_by);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_created_at ON public.interactive_solutions(created_at);

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_graph_config_gin 
  ON public.interactive_solutions USING GIN(graph_config) WHERE graph_config IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_parameters_gin 
  ON public.interactive_solutions USING GIN(parameters) WHERE parameters IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_interactive_solutions_render_payload_gin 
  ON public.interactive_solutions USING GIN(render_payload) WHERE render_payload IS NOT NULL;

-- ============================================================================
-- CROSS-TABLE ANALYTICS INDEXES (REVISED)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_questions_passage_subject_difficulty 
    ON public.questions(passage_id, subject, difficulty) 
    WHERE passage_id IS NOT NULL;

-- Cached relationship flag for "has interactive" (optional but recommended)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS has_interactive boolean NOT NULL DEFAULT false;

-- Maintain flag via triggers on interactive_solutions
DROP FUNCTION IF EXISTS public.mark_question_has_interactive() CASCADE;
CREATE OR REPLACE FUNCTION public.mark_question_has_interactive()
RETURNS trigger AS $$
BEGIN
  UPDATE public.questions
     SET has_interactive = true,
         updated_at = now()
   WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS public.recompute_question_has_interactive() CASCADE;
CREATE OR REPLACE FUNCTION public.recompute_question_has_interactive()
RETURNS trigger AS $$
DECLARE
  still_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.interactive_solutions
    WHERE question_id = OLD.question_id
  ) INTO still_exists;

  UPDATE public.questions
     SET has_interactive = still_exists,
         updated_at = now()
   WHERE id = OLD.question_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_is_insert_update_mark ON public.interactive_solutions;
CREATE TRIGGER trg_is_insert_update_mark
AFTER INSERT OR UPDATE ON public.interactive_solutions
FOR EACH ROW EXECUTE FUNCTION public.mark_question_has_interactive();

DROP TRIGGER IF EXISTS trg_is_delete_recompute ON public.interactive_solutions;
CREATE TRIGGER trg_is_delete_recompute
AFTER DELETE ON public.interactive_solutions
FOR EACH ROW EXECUTE FUNCTION public.recompute_question_has_interactive();

-- Partial index using the cached flag
CREATE INDEX IF NOT EXISTS idx_questions_has_interactive_true
  ON public.questions(has_interactive)
  WHERE has_interactive = true;

-- Content pack question counts (for analytics)
CREATE INDEX IF NOT EXISTS idx_questions_pack_count 
    ON public.questions(pack_id, is_active) 
    WHERE is_active = true;

-- ============================================================================
-- UNIQUE / CHECK CONSTRAINTS (drop-then-add for idempotency)
-- ============================================================================

-- Ensure one interactive solution per question
ALTER TABLE public.interactive_solutions 
    DROP CONSTRAINT IF EXISTS uq_interactive_solutions_question_id;
ALTER TABLE public.interactive_solutions 
    ADD CONSTRAINT uq_interactive_solutions_question_id UNIQUE (question_id);

-- Content pack validation
ALTER TABLE public.content_packs 
    DROP CONSTRAINT IF EXISTS chk_content_packs_question_count_positive;
ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_question_count_positive CHECK (question_count >= 0);

ALTER TABLE public.content_packs 
    DROP CONSTRAINT IF EXISTS chk_content_packs_size_bytes_positive;
ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_size_bytes_positive CHECK (size_bytes >= 0);

ALTER TABLE public.content_packs 
    DROP CONSTRAINT IF EXISTS chk_content_packs_rating_valid;
ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_rating_valid CHECK (rating_average >= 0.00 AND rating_average <= 5.00);

ALTER TABLE public.content_packs 
    DROP CONSTRAINT IF EXISTS chk_content_packs_rating_count_positive;
ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_rating_count_positive CHECK (rating_count >= 0);

-- Question validation
ALTER TABLE public.questions 
    DROP CONSTRAINT IF EXISTS chk_questions_question_number_positive;
ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_question_number_positive CHECK (question_number > 0);

ALTER TABLE public.questions 
    DROP CONSTRAINT IF EXISTS chk_questions_success_rate_valid;
ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_success_rate_valid CHECK (success_rate IS NULL OR (success_rate >= 0 AND success_rate <= 100));

ALTER TABLE public.questions 
    DROP CONSTRAINT IF EXISTS chk_questions_discrimination_valid;
ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_discrimination_valid CHECK (discrimination_index IS NULL OR (discrimination_index >= 0.0 AND discrimination_index <= 1.0));

-- Solution steps validation
ALTER TABLE public.solution_steps 
    DROP CONSTRAINT IF EXISTS chk_solution_steps_step_number_positive;
ALTER TABLE public.solution_steps 
    ADD CONSTRAINT chk_solution_steps_step_number_positive CHECK (step_number > 0);

-- Interactive solutions validation
ALTER TABLE public.interactive_solutions 
    DROP CONSTRAINT IF EXISTS chk_interactive_solutions_success_rate_valid;
ALTER TABLE public.interactive_solutions 
    ADD CONSTRAINT chk_interactive_solutions_success_rate_valid CHECK (interaction_success_rate IS NULL OR (interaction_success_rate >= 0 AND interaction_success_rate <= 100));

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.question_performance_summary AS
SELECT 
    q.id,
    q.public_id,
    q.subject,
    q.topic,
    q.difficulty,
    q.success_rate,
    q.average_time,
    q.discrimination_index,
    cp.title as pack_title,
    CASE 
        WHEN q.success_rate IS NOT NULL THEN
            CASE 
                WHEN q.success_rate >= 80 THEN 'Easy'
                WHEN q.success_rate >= 60 THEN 'Medium'
                WHEN q.success_rate >= 40 THEN 'Hard'
                ELSE 'Very Hard'
            END
        ELSE 'No Data'
    END as actual_difficulty,
    q.has_interactive as has_interactive_solution
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
WHERE q.is_active = true;

CREATE OR REPLACE VIEW public.content_pack_statistics AS
SELECT 
    cp.id,
    cp.slug,
    cp.title,
    cp.category,
    cp.subject,
    cp.status,
    cp.question_count,
    COUNT(q.id) as actual_question_count,
    AVG(q.success_rate) as average_success_rate,
    AVG(q.average_time) as average_completion_time,
    COUNT(*) FILTER (WHERE q.has_interactive) as interactive_question_count,
    cp.download_count,
    cp.rating_average,
    cp.rating_count
FROM public.content_packs cp
LEFT JOIN public.questions q ON q.pack_id = cp.id AND q.is_active = true
GROUP BY cp.id, cp.slug, cp.title, cp.category, cp.subject, cp.status, cp.question_count, cp.download_count, cp.rating_average, cp.rating_count;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_questions_subject_topic_difficulty IS 'Primary index for question filtering by subject, topic, and difficulty';
COMMENT ON INDEX idx_questions_pack_id_number IS 'Critical index for sequential question delivery within packs';
COMMENT ON INDEX idx_solution_steps_question_id_number IS 'Essential index for step-by-step solution delivery';

COMMENT ON VIEW public.question_performance_summary IS 'Analytical view for monitoring question performance and difficulty calibration';
COMMENT ON VIEW public.content_pack_statistics IS 'Summary statistics for content pack performance and analytics';
