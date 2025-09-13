-- Phase 1.3: Strategic Indexes and Performance Optimization
-- Creates indexes for common query patterns and analytics

-- ============================================================================
-- CONTENT PACKS INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_content_packs_status ON public.content_packs(status);
CREATE INDEX idx_content_packs_published ON public.content_packs(is_published) WHERE is_published = true;
CREATE INDEX idx_content_packs_category_subject ON public.content_packs(category, subject);
CREATE INDEX idx_content_packs_access_level ON public.content_packs(access_level);

-- Analytics and sorting
CREATE INDEX idx_content_packs_download_count ON public.content_packs(download_count DESC);
CREATE INDEX idx_content_packs_rating ON public.content_packs(rating_average DESC, rating_count DESC);
CREATE INDEX idx_content_packs_created_at ON public.content_packs(created_at DESC);

-- Content management
CREATE INDEX idx_content_packs_created_by ON public.content_packs(created_by);
CREATE INDEX idx_content_packs_updated_at ON public.content_packs(updated_at DESC);

-- Composite index for common filtering
CREATE INDEX idx_content_packs_published_category_difficulty 
    ON public.content_packs(is_published, category, difficulty) 
    WHERE is_published = true;

-- ============================================================================
-- PASSAGES INDEXES
-- ============================================================================

-- Content classification
CREATE INDEX idx_passages_type_subject ON public.passages(passage_type, subject);
CREATE INDEX idx_passages_difficulty ON public.passages(difficulty);
CREATE INDEX idx_passages_reading_level ON public.passages(reading_level);

-- Content analysis
CREATE INDEX idx_passages_word_count ON public.passages(word_count);
CREATE INDEX idx_passages_estimated_time ON public.passages(estimated_time);

-- Source and metadata
CREATE INDEX idx_passages_author ON public.passages(author) WHERE author IS NOT NULL;
CREATE INDEX idx_passages_publication_date ON public.passages(publication_date) WHERE publication_date IS NOT NULL;

-- Content management
CREATE INDEX idx_passages_created_by ON public.passages(created_by);
CREATE INDEX idx_passages_created_at ON public.passages(created_at DESC);

-- GIN indexes for array fields
CREATE INDEX idx_passages_key_concepts_gin ON public.passages USING GIN(key_concepts);

-- ============================================================================
-- GRAPHS INDEXES
-- ============================================================================

-- Graph classification
CREATE INDEX idx_graphs_type_subject ON public.graphs(graph_type, subject);
CREATE INDEX idx_graphs_interactive ON public.graphs(is_interactive);

-- Content management
CREATE INDEX idx_graphs_created_by ON public.graphs(created_by);
CREATE INDEX idx_graphs_created_at ON public.graphs(created_at DESC);

-- ============================================================================
-- QUESTIONS INDEXES
-- ============================================================================

-- Pack and ordering (critical for question delivery)
CREATE INDEX idx_questions_pack_id_number ON public.questions(pack_id, question_number);
CREATE INDEX idx_questions_pack_id_active ON public.questions(pack_id, is_active) WHERE is_active = true;

-- Content classification (most common filters)
CREATE INDEX idx_questions_subject_topic_difficulty ON public.questions(subject, topic, difficulty);
CREATE INDEX idx_questions_type_subject ON public.questions(question_type, subject);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_status ON public.questions(status);

-- Foreign key relationships (for joins)
CREATE INDEX idx_questions_passage_id ON public.questions(passage_id) WHERE passage_id IS NOT NULL;
CREATE INDEX idx_questions_primary_graph_id ON public.questions(primary_graph_id) WHERE primary_graph_id IS NOT NULL;

-- Analytics and performance metrics
CREATE INDEX idx_questions_success_rate ON public.questions(success_rate DESC NULLS LAST);
CREATE INDEX idx_questions_average_time ON public.questions(average_time);
CREATE INDEX idx_questions_discrimination_index ON public.questions(discrimination_index DESC NULLS LAST);

-- Question metadata
CREATE INDEX idx_questions_calculator_allowed ON public.questions(calculator_allowed);
CREATE INDEX idx_questions_estimated_time ON public.questions(estimated_time);

-- Content management
CREATE INDEX idx_questions_created_by ON public.questions(created_by);
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX idx_questions_updated_at ON public.questions(updated_at DESC);

-- GIN indexes for array fields
CREATE INDEX idx_questions_key_phrases_gin ON public.questions USING GIN(key_phrases);

-- Composite indexes for common query patterns
CREATE INDEX idx_questions_active_subject_difficulty 
    ON public.questions(is_active, subject, difficulty) 
    WHERE is_active = true;

CREATE INDEX idx_questions_pack_active_subject 
    ON public.questions(pack_id, is_active, subject) 
    WHERE is_active = true;

-- ============================================================================
-- SOLUTION STEPS INDEXES
-- ============================================================================

-- Question relationship (critical for solution delivery)
CREATE INDEX idx_solution_steps_question_id_number ON public.solution_steps(question_id, step_number);

-- Step classification
CREATE INDEX idx_solution_steps_type ON public.solution_steps(step_type);
CREATE INDEX idx_solution_steps_interactive ON public.solution_steps(is_interactive);
CREATE INDEX idx_solution_steps_has_checkpoint ON public.solution_steps(has_checkpoint);

-- Performance metrics
CREATE INDEX idx_solution_steps_estimated_time ON public.solution_steps(estimated_time);
CREATE INDEX idx_solution_steps_difficulty ON public.solution_steps(difficulty);

-- Foreign key relationships
CREATE INDEX idx_solution_steps_diagram_id ON public.solution_steps(diagram_id) WHERE diagram_id IS NOT NULL;

-- Content management
CREATE INDEX idx_solution_steps_created_at ON public.solution_steps(created_at DESC);

-- GIN indexes for array fields
CREATE INDEX idx_solution_steps_related_concepts_gin ON public.solution_steps USING GIN(related_concepts);

-- ============================================================================
-- INTERACTIVE SOLUTIONS INDEXES
-- ============================================================================

-- Solution classification
CREATE INDEX idx_interactive_solutions_type ON public.interactive_solutions(solution_type);
CREATE INDEX idx_interactive_solutions_has_graph ON public.interactive_solutions(has_interactive_graph);
CREATE INDEX idx_interactive_solutions_calculator_type ON public.interactive_solutions(calculator_type);

-- Performance metrics
CREATE INDEX idx_interactive_solutions_completion_time ON public.interactive_solutions(average_completion_time);
CREATE INDEX idx_interactive_solutions_success_rate ON public.interactive_solutions(interaction_success_rate DESC NULLS LAST);

-- Version and configuration
CREATE INDEX idx_interactive_solutions_version ON public.interactive_solutions(version);
CREATE INDEX idx_interactive_solutions_config_hash ON public.interactive_solutions(configuration_hash);

-- Content management
CREATE INDEX idx_interactive_solutions_created_by ON public.interactive_solutions(created_by);
CREATE INDEX idx_interactive_solutions_created_at ON public.interactive_solutions(created_at DESC);

-- GIN indexes for JSON fields (will be useful for filtering by configuration)
CREATE INDEX idx_interactive_solutions_graph_config_gin ON public.interactive_solutions USING GIN(graph_config) WHERE graph_config IS NOT NULL;
CREATE INDEX idx_interactive_solutions_parameters_gin ON public.interactive_solutions USING GIN(parameters) WHERE parameters IS NOT NULL;
CREATE INDEX idx_interactive_solutions_render_payload_gin ON public.interactive_solutions USING GIN(render_payload) WHERE render_payload IS NOT NULL;

-- ============================================================================
-- CROSS-TABLE ANALYTICS INDEXES
-- ============================================================================

-- Questions with passage relationships (common join pattern)
CREATE INDEX idx_questions_passage_subject_difficulty 
    ON public.questions(passage_id, subject, difficulty) 
    WHERE passage_id IS NOT NULL;

-- Questions with interactive solutions (common join pattern)
CREATE INDEX idx_questions_with_interactive 
    ON public.questions(id) 
    WHERE id IN (SELECT question_id FROM public.interactive_solutions);

-- Content pack question counts (for analytics)
CREATE INDEX idx_questions_pack_count 
    ON public.questions(pack_id, is_active) 
    WHERE is_active = true;

-- ============================================================================
-- UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Ensure one interactive solution per question
ALTER TABLE public.interactive_solutions 
    ADD CONSTRAINT uq_interactive_solutions_question_id UNIQUE (question_id);

-- Ensure step numbers are sequential within questions
-- (This will be enforced via application logic and triggers in Phase 2)

-- ============================================================================
-- CHECK CONSTRAINTS FOR DATA VALIDATION
-- ============================================================================

-- Content pack validation
ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_question_count_positive 
    CHECK (question_count >= 0);

ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_size_bytes_positive 
    CHECK (size_bytes >= 0);

ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_rating_valid 
    CHECK (rating_average >= 0.00 AND rating_average <= 5.00);

ALTER TABLE public.content_packs 
    ADD CONSTRAINT chk_content_packs_rating_count_positive 
    CHECK (rating_count >= 0);

-- Question validation
ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_question_number_positive 
    CHECK (question_number > 0);

ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_success_rate_valid 
    CHECK (success_rate IS NULL OR (success_rate >= 0 AND success_rate <= 100));

ALTER TABLE public.questions 
    ADD CONSTRAINT chk_questions_discrimination_valid 
    CHECK (discrimination_index IS NULL OR (discrimination_index >= 0.0 AND discrimination_index <= 1.0));

-- Solution steps validation
ALTER TABLE public.solution_steps 
    ADD CONSTRAINT chk_solution_steps_step_number_positive 
    CHECK (step_number > 0);

-- Interactive solutions validation
ALTER TABLE public.interactive_solutions 
    ADD CONSTRAINT chk_interactive_solutions_success_rate_valid 
    CHECK (interaction_success_rate IS NULL OR (interaction_success_rate >= 0 AND interaction_success_rate <= 100));

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View for monitoring question performance
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
    EXISTS(SELECT 1 FROM public.interactive_solutions is2 WHERE is2.question_id = q.id) as has_interactive_solution
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
WHERE q.is_active = true;

-- View for content pack statistics
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
    COUNT(CASE WHEN EXISTS(SELECT 1 FROM public.interactive_solutions is2 WHERE is2.question_id = q.id) THEN 1 END) as interactive_question_count,
    cp.download_count,
    cp.rating_average,
    cp.rating_count
FROM public.content_packs cp
LEFT JOIN public.questions q ON q.pack_id = cp.id AND q.is_active = true
GROUP BY cp.id, cp.slug, cp.title, cp.category, cp.subject, cp.status, cp.question_count, cp.download_count, cp.rating_average, cp.rating_count;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_questions_subject_topic_difficulty IS 'Primary index for question filtering by subject, topic, and difficulty';
COMMENT ON INDEX idx_questions_pack_id_number IS 'Critical index for sequential question delivery within packs';
COMMENT ON INDEX idx_solution_steps_question_id_number IS 'Essential index for step-by-step solution delivery';

COMMENT ON VIEW public.question_performance_summary IS 'Analytical view for monitoring question performance and difficulty calibration';
COMMENT ON VIEW public.content_pack_statistics IS 'Summary statistics for content pack performance and analytics';