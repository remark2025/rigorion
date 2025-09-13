-- Phase 1.2: Core Content Tables with UUID PKs and Proper Relationships
-- Creates the main content structure with enhanced relationships

-- ============================================================================
-- CONTENT PACKS - Enhanced from existing
-- ============================================================================

-- Drop existing table if needed and recreate with proper structure
DROP TABLE IF EXISTS public.content_packs CASCADE;

CREATE TABLE public.content_packs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Human-readable identifier for references
    slug text UNIQUE NOT NULL, -- e.g., 'sat-math-algebra-2025'
    
    -- Metadata
    title text NOT NULL,
    description text,
    version version_string NOT NULL DEFAULT '1.0.0',
    
    -- Classification
    category pack_category NOT NULL DEFAULT 'mixed',
    subject subject,
    difficulty difficulty,
    tags text[] DEFAULT '{}',
    
    -- Content metrics
    question_count integer NOT NULL DEFAULT 0,
    estimated_duration duration_seconds,
    
    -- File and content management
    file_path text,
    content_hash content_hash,
    size_bytes bigint DEFAULT 0,
    
    -- Publishing and lifecycle
    status content_status NOT NULL DEFAULT 'draft',
    is_published boolean GENERATED ALWAYS AS (status = 'published') STORED,
    
    -- Access control
    is_premium boolean NOT NULL DEFAULT false,
    access_level text DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'internal')),
    
    -- Analytics
    download_count bigint DEFAULT 0,
    rating_average numeric(3,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    
    -- Caching
    cache_control text DEFAULT 'public, max-age=31536000, immutable',
    etag text,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    created_by uuid REFERENCES auth.users(id),
    
    -- Natural key constraint
    CONSTRAINT uq_content_packs_slug UNIQUE (slug)
);

-- ============================================================================
-- PASSAGES - Reading Content with Rich Structure
-- ============================================================================

CREATE TABLE public.passages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Human-readable reference
    reference_id text UNIQUE NOT NULL, -- e.g., 'PASSAGE-READING-001'
    
    -- Content
    title text,
    content text NOT NULL,
    
    -- Classification
    passage_type passage_type NOT NULL DEFAULT 'nonfiction',
    subject subject NOT NULL DEFAULT 'reading',
    difficulty difficulty,
    
    -- Source information
    source text,
    author text,
    publication_date date,
    copyright_info text,
    
    -- Content analysis
    word_count integer,
    reading_level text,
    estimated_time duration_seconds DEFAULT 300, -- 5 minutes default
    key_concepts text[] DEFAULT '{}',
    vocabulary_level difficulty DEFAULT 'medium',
    
    -- Structure and formatting
    paragraphs jsonb, -- Array of paragraph objects with line numbers, annotations
    footnotes jsonb, -- Footnotes and citations
    formatting_notes text,
    
    -- Full-text search (will be populated in Phase 4)
    search_vector tsvector,
    
    -- Accessibility
    alt_descriptions jsonb, -- For images, charts within passage
    accessibility_notes text,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_passage_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT chk_passage_word_count CHECK (word_count IS NULL OR word_count > 0)
);

-- ============================================================================
-- GRAPHS - Visual Content and Interactive Elements
-- ============================================================================

CREATE TABLE public.graphs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id text UNIQUE NOT NULL, -- e.g., 'GRAPH-MATH-QUAD-001'
    
    -- Metadata
    title text,
    description text,
    
    -- Graph classification
    graph_type graph_type NOT NULL,
    subject subject NOT NULL,
    
    -- Visual data
    image_url text, -- Static image fallback
    svg_data text, -- Scalable vector graphics
    canvas_data jsonb, -- HTML5 canvas drawing instructions
    
    -- Interactive configuration
    is_interactive boolean NOT NULL DEFAULT false,
    interaction_config jsonb,
    
    -- Mathematical graphs specific
    functions jsonb, -- Array of function objects for math graphs
    coordinate_system jsonb, -- Axis configuration, ranges, labels
    domain_range jsonb, -- Mathematical domain and range
    
    -- Data visualization graphs
    data_points jsonb, -- Raw data points for charts
    axis_labels jsonb, -- X and Y axis labeling
    legend_info jsonb, -- Legend configuration
    
    -- Styling and presentation
    theme text DEFAULT 'default',
    color_scheme jsonb,
    dimensions jsonb, -- Width, height, aspect ratio
    
    -- Accessibility compliance
    alt_text text NOT NULL,
    detailed_description text,
    tactile_description text, -- For screen readers
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_graph_alt_text_not_empty CHECK (char_length(trim(alt_text)) > 0),
    CONSTRAINT chk_graph_has_visual_data CHECK (
        image_url IS NOT NULL OR svg_data IS NOT NULL OR canvas_data IS NOT NULL
    )
);

-- ============================================================================
-- QUESTIONS - Main Content with Enhanced Structure
-- ============================================================================

CREATE TABLE public.questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Pack relationship and ordering
    pack_id uuid NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
    question_number integer NOT NULL,
    
    -- Human-readable reference
    public_id text UNIQUE NOT NULL, -- e.g., 'MATH-ALG-001'
    
    -- Core content
    content text NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    
    -- Subject and classification
    subject subject NOT NULL,
    topic text,
    subtopic text,
    difficulty difficulty NOT NULL DEFAULT 'medium',
    
    -- Multiple choice data
    choices jsonb, -- Array of choice objects: [{"id": "A", "text": "...", "explanation": "..."}]
    correct_answer text,
    
    -- Content attachments (foreign keys)
    passage_id uuid REFERENCES public.passages(id) ON DELETE SET NULL,
    primary_graph_id uuid REFERENCES public.graphs(id) ON DELETE SET NULL,
    
    -- Solution content (basic - detailed steps in separate table)
    solution_text text,
    explanation text,
    hint text,
    
    -- Question metadata
    calculator_allowed boolean DEFAULT true,
    estimated_time duration_seconds DEFAULT 90,
    key_phrases text[] DEFAULT '{}',
    
    -- Analytics and difficulty metrics
    average_time duration_seconds,
    success_rate percentage,
    discrimination_index numeric(4,3), -- Item discrimination for psychometrics
    
    -- Assessment configuration
    points_possible integer DEFAULT 1,
    partial_credit boolean DEFAULT false,
    
    -- Status and lifecycle
    status content_status NOT NULL DEFAULT 'draft',
    is_active boolean GENERATED ALWAYS AS (status = 'published') STORED,
    
    -- Accessibility
    screen_reader_text text,
    accessibility_notes text,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT uq_questions_pack_number UNIQUE (pack_id, question_number),
    CONSTRAINT uq_questions_public_id UNIQUE (public_id),
    CONSTRAINT chk_question_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT chk_question_positive_points CHECK (points_possible > 0),
    CONSTRAINT chk_multiple_choice_has_choices CHECK (
        question_type != 'multiple_choice' OR (choices IS NOT NULL AND jsonb_array_length(choices) >= 2)
    )
);

-- ============================================================================
-- SOLUTION STEPS - Normalized Step-by-Step Solutions
-- ============================================================================

CREATE TABLE public.solution_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    step_number integer NOT NULL,
    
    -- Step content
    title text,
    description text NOT NULL,
    step_type step_type NOT NULL DEFAULT 'concept',
    
    -- Mathematical expressions
    from_expression jsonb, -- math_expression_type structure
    to_expression jsonb, -- math_expression_type structure
    
    -- Visual aids
    diagram_id uuid REFERENCES public.graphs(id) ON DELETE SET NULL,
    image_url text,
    
    -- Interactive elements
    is_interactive boolean DEFAULT false,
    interaction_data jsonb,
    interaction_type interaction_type,
    
    -- Learning support
    hint text,
    explanation text,
    common_mistakes jsonb, -- Array of common mistake objects
    related_concepts text[],
    
    -- Assessment checkpoint
    has_checkpoint boolean DEFAULT false,
    checkpoint_data jsonb, -- assessment_point_type structure
    
    -- Timing and difficulty
    estimated_time duration_seconds DEFAULT 30,
    difficulty difficulty,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT uq_solution_steps_question_number UNIQUE (question_id, step_number),
    CONSTRAINT chk_solution_step_description_not_empty CHECK (char_length(trim(description)) > 0),
    CONSTRAINT chk_solution_step_positive_number CHECK (step_number > 0)
);

-- ============================================================================
-- ENHANCED INTERACTIVE SOLUTIONS
-- ============================================================================

-- Drop existing if it exists and recreate with enhanced structure
DROP TABLE IF EXISTS public.interactive_solutions CASCADE;

CREATE TABLE public.interactive_solutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    
    -- Solution classification
    solution_type solution_type NOT NULL,
    
    -- Graph-based interactions
    has_interactive_graph boolean DEFAULT false,
    graph_config jsonb, -- Enhanced graph configuration
    parameters jsonb, -- Array of interactive_parameter_type
    
    -- Calculator and computation
    calculator_type calculator_type DEFAULT 'basic',
    allowed_functions text[] DEFAULT '{}',
    computation_steps jsonb,
    
    -- Interactive step-by-step progression
    interactive_steps jsonb, -- Enhanced step objects with interaction data
    
    -- Simulation and modeling
    simulation_config jsonb,
    model_parameters jsonb,
    
    -- Assessment integration
    assessment_points jsonb, -- Array of assessment_point_type
    checkpoint_triggers text[] DEFAULT '{}',
    
    -- Unified frontend contract (Phase 3.1)
    render_payload jsonb, -- Single JSON for frontend consumption
    
    -- Performance and analytics
    average_completion_time duration_seconds,
    interaction_success_rate percentage,
    
    -- Configuration metadata
    version version_string DEFAULT '1.0.0',
    configuration_hash content_hash,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_interactive_graph_config CHECK (
        (solution_type != 'graph') OR 
        (has_interactive_graph = true AND graph_config IS NOT NULL)
    ),
    CONSTRAINT chk_interactive_parameters CHECK (
        (solution_type != 'graph') OR 
        (parameters IS NOT NULL AND jsonb_array_length(parameters) > 0)
    )
);

-- ============================================================================
-- UPDATED AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER trg_content_packs_updated_at
    BEFORE UPDATE ON public.content_packs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_passages_updated_at
    BEFORE UPDATE ON public.passages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_graphs_updated_at
    BEFORE UPDATE ON public.graphs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_solution_steps_updated_at
    BEFORE UPDATE ON public.solution_steps
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_interactive_solutions_updated_at
    BEFORE UPDATE ON public.interactive_solutions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

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