-- Phase 2.2: Authoring Infrastructure - Tags, Relationships, and Writing Components
-- Implements flexible content tagging, multi-passage questions, and writing prompts

-- ============================================================================
-- CONTENT TAGS - Hierarchical Tagging System
-- ============================================================================

CREATE TABLE public.content_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tag identification
    name text NOT NULL,
    slug text UNIQUE NOT NULL, -- URL-safe version
    
    -- Tag classification
    category text NOT NULL DEFAULT 'general' CHECK (category IN (
        'skill', 'topic', 'subtopic', 'difficulty', 'format', 'source', 
        'cognitive_load', 'bloom_taxonomy', 'learning_objective', 'general'
    )),
    
    -- Hierarchical structure
    parent_tag_id uuid REFERENCES public.content_tags(id) ON DELETE SET NULL,
    
    -- Tag metadata
    description text,
    color_hex text CHECK (color_hex ~ '^#[A-Fa-f0-9]{6}$'),
    icon_name text,
    
    -- Educational metadata
    learning_objective text,
    bloom_level text CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
    cognitive_complexity text CHECK (cognitive_complexity IN ('low', 'medium', 'high')),
    
    -- Usage tracking
    usage_count integer DEFAULT 0,
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    is_system_tag boolean NOT NULL DEFAULT false, -- System vs user-created
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_content_tags_name_not_empty CHECK (char_length(trim(name)) > 0),
    CONSTRAINT chk_content_tags_no_self_parent CHECK (id != parent_tag_id)
);

-- ============================================================================
-- CONTENT TAG ASSIGNMENTS - Many-to-Many Relationships
-- ============================================================================

CREATE TABLE public.content_tag_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference (polymorphic)
    content_type text NOT NULL CHECK (content_type IN (
        'question', 'passage', 'graph', 'interactive_solution', 'content_pack', 'solution_step'
    )),
    content_id uuid NOT NULL,
    
    -- Tag reference
    tag_id uuid NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    confidence_score numeric(3,2) DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
    assigned_by_ai boolean NOT NULL DEFAULT false,
    ai_model_version text,
    
    -- Manual override
    manually_verified boolean DEFAULT false,
    
    -- Timestamps and audit
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    
    -- Unique constraint (one tag per content item)
    CONSTRAINT uq_content_tag_assignments UNIQUE (content_type, content_id, tag_id)
);

-- ============================================================================
-- QUESTION PASSAGES - Multi-passage Question Support
-- ============================================================================

CREATE TABLE public.question_passages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    passage_id uuid NOT NULL REFERENCES public.passages(id) ON DELETE CASCADE,
    
    -- Relationship metadata
    role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'secondary', 'reference', 'evidence', 'contrast')),
    sequence_order integer NOT NULL DEFAULT 1,
    
    -- Usage instructions
    instructions text, -- How this passage relates to the question
    citation_required boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT uq_question_passages UNIQUE (question_id, passage_id),
    CONSTRAINT chk_question_passages_positive_order CHECK (sequence_order > 0)
);

-- ============================================================================
-- WRITING PROMPTS - Essay and Writing Components
-- ============================================================================

CREATE TABLE public.writing_prompts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id text UNIQUE NOT NULL, -- e.g., 'WRITING-ARG-001'
    
    -- Content
    title text NOT NULL,
    prompt_text text NOT NULL,
    
    -- Classification
    prompt_type text NOT NULL CHECK (prompt_type IN (
        'argumentative', 'informative', 'narrative', 'analytical', 
        'persuasive', 'expository', 'creative', 'reflective'
    )),
    subject subject NOT NULL DEFAULT 'writing',
    difficulty difficulty NOT NULL DEFAULT 'medium',
    
    -- Requirements
    word_count_min integer DEFAULT 300,
    word_count_max integer DEFAULT 650,
    time_limit_minutes integer DEFAULT 50,
    
    -- Source materials
    source_passages uuid[] DEFAULT '{}', -- Array of passage IDs
    source_documents jsonb, -- Additional source materials
    requires_citations boolean DEFAULT false,
    
    -- Grading and assessment
    rubric jsonb, -- Detailed scoring rubric
    sample_responses jsonb, -- Array of sample responses with scores
    key_criteria text[] DEFAULT '{}',
    
    -- Support materials
    planning_template jsonb, -- Essay planning template
    vocabulary_support jsonb, -- Key vocabulary and definitions
    transition_phrases jsonb, -- Suggested transition phrases
    
    -- Educational metadata
    learning_objectives text[],
    prerequisite_skills text[],
    
    -- Status
    status content_status NOT NULL DEFAULT 'draft',
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_writing_prompts_word_count CHECK (
        word_count_min IS NULL OR word_count_max IS NULL OR word_count_min <= word_count_max
    ),
    CONSTRAINT chk_writing_prompts_time_positive CHECK (
        time_limit_minutes IS NULL OR time_limit_minutes > 0
    )
);

-- ============================================================================
-- LEARNING OBJECTIVES - Educational Goal Tracking
-- ============================================================================

CREATE TABLE public.learning_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Objective identification
    code text UNIQUE NOT NULL, -- e.g., 'ALG.1.A.1'
    title text NOT NULL,
    description text NOT NULL,
    
    -- Classification
    subject subject NOT NULL,
    grade_level text,
    standard_reference text, -- Common Core, state standards, etc.
    
    -- Taxonomic classification
    bloom_level text CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
    dok_level integer CHECK (dok_level BETWEEN 1 AND 4), -- Depth of Knowledge
    
    -- Hierarchical structure
    parent_objective_id uuid REFERENCES public.learning_objectives(id) ON DELETE SET NULL,
    
    -- Prerequisites
    prerequisite_objectives uuid[] DEFAULT '{}',
    
    -- Assessment criteria
    mastery_threshold percentage DEFAULT 80,
    assessment_methods text[] DEFAULT '{}',
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- ============================================================================
-- CONTENT LEARNING OBJECTIVES - Mapping Content to Goals
-- ============================================================================

CREATE TABLE public.content_learning_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference
    content_type text NOT NULL CHECK (content_type IN (
        'question', 'passage', 'writing_prompt', 'interactive_solution', 'content_pack'
    )),
    content_id uuid NOT NULL,
    
    -- Learning objective reference
    objective_id uuid NOT NULL REFERENCES public.learning_objectives(id) ON DELETE CASCADE,
    
    -- Alignment strength
    alignment_strength text NOT NULL DEFAULT 'primary' CHECK (alignment_strength IN (
        'primary', 'secondary', 'supporting', 'tangential'
    )),
    
    -- Assessment weight
    weight_percentage percentage DEFAULT 100,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    
    -- Unique constraint
    CONSTRAINT uq_content_learning_objectives UNIQUE (content_type, content_id, objective_id)
);

-- ============================================================================
-- CONTENT COLLECTIONS - Curated Content Groups
-- ============================================================================

CREATE TABLE public.content_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Collection metadata
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    
    -- Collection type
    collection_type text NOT NULL CHECK (collection_type IN (
        'playlist', 'curriculum', 'diagnostic', 'practice_set', 
        'theme', 'difficulty_progression', 'skill_building'
    )),
    
    -- Educational metadata
    subject subject,
    difficulty difficulty,
    estimated_duration duration_seconds,
    
    -- Ordering and structure
    sequence_type text DEFAULT 'ordered' CHECK (sequence_type IN ('ordered', 'unordered', 'adaptive')),
    prerequisites uuid[] DEFAULT '{}', -- Other collection IDs
    
    -- Access and visibility
    is_public boolean NOT NULL DEFAULT false,
    access_level text DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'internal')),
    
    -- Status
    status content_status NOT NULL DEFAULT 'draft',
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- ============================================================================
-- CONTENT COLLECTION ITEMS - Items within Collections
-- ============================================================================

CREATE TABLE public.content_collection_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Collection reference
    collection_id uuid NOT NULL REFERENCES public.content_collections(id) ON DELETE CASCADE,
    
    -- Content reference
    content_type text NOT NULL CHECK (content_type IN (
        'question', 'passage', 'writing_prompt', 'content_pack'
    )),
    content_id uuid NOT NULL,
    
    -- Ordering and organization
    sequence_order integer NOT NULL,
    section_title text,
    
    -- Item configuration
    is_required boolean DEFAULT true,
    points_possible integer DEFAULT 1,
    
    -- Adaptive parameters
    difficulty_adjustment numeric(3,2) DEFAULT 0.0, -- -1.0 to 1.0
    time_multiplier numeric(3,2) DEFAULT 1.0,
    
    -- Notes and instructions
    instructor_notes text,
    student_instructions text,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    added_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT uq_content_collection_items_order UNIQUE (collection_id, sequence_order),
    CONSTRAINT chk_collection_items_positive_order CHECK (sequence_order > 0),
    CONSTRAINT chk_collection_items_positive_points CHECK (points_possible > 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Content tags
CREATE INDEX idx_content_tags_category ON public.content_tags(category);
CREATE INDEX idx_content_tags_parent ON public.content_tags(parent_tag_id) WHERE parent_tag_id IS NOT NULL;
CREATE INDEX idx_content_tags_active ON public.content_tags(is_active) WHERE is_active = true;
CREATE INDEX idx_content_tags_usage ON public.content_tags(usage_count DESC);
CREATE INDEX idx_content_tags_name_trgm ON public.content_tags USING GIN(name gin_trgm_ops);

-- Content tag assignments
CREATE INDEX idx_content_tag_assignments_content ON public.content_tag_assignments(content_type, content_id);
CREATE INDEX idx_content_tag_assignments_tag ON public.content_tag_assignments(tag_id);
CREATE INDEX idx_content_tag_assignments_ai ON public.content_tag_assignments(assigned_by_ai, confidence_score DESC);

-- Question passages
CREATE INDEX idx_question_passages_question ON public.question_passages(question_id, sequence_order);
CREATE INDEX idx_question_passages_passage ON public.question_passages(passage_id);
CREATE INDEX idx_question_passages_role ON public.question_passages(role);

-- Writing prompts
CREATE INDEX idx_writing_prompts_type_difficulty ON public.writing_prompts(prompt_type, difficulty);
CREATE INDEX idx_writing_prompts_status ON public.writing_prompts(status);
CREATE INDEX idx_writing_prompts_created_by ON public.writing_prompts(created_by);

-- Learning objectives
CREATE INDEX idx_learning_objectives_subject ON public.learning_objectives(subject);
CREATE INDEX idx_learning_objectives_parent ON public.learning_objectives(parent_objective_id) WHERE parent_objective_id IS NOT NULL;
CREATE INDEX idx_learning_objectives_bloom ON public.learning_objectives(bloom_level);
CREATE INDEX idx_learning_objectives_active ON public.learning_objectives(is_active) WHERE is_active = true;

-- Content learning objectives
CREATE INDEX idx_content_learning_objectives_content ON public.content_learning_objectives(content_type, content_id);
CREATE INDEX idx_content_learning_objectives_objective ON public.content_learning_objectives(objective_id);
CREATE INDEX idx_content_learning_objectives_alignment ON public.content_learning_objectives(alignment_strength);

-- Content collections
CREATE INDEX idx_content_collections_type ON public.content_collections(collection_type);
CREATE INDEX idx_content_collections_subject_difficulty ON public.content_collections(subject, difficulty);
CREATE INDEX idx_content_collections_status ON public.content_collections(status);
CREATE INDEX idx_content_collections_public ON public.content_collections(is_public) WHERE is_public = true;

-- Content collection items
CREATE INDEX idx_content_collection_items_collection_order ON public.content_collection_items(collection_id, sequence_order);
CREATE INDEX idx_content_collection_items_content ON public.content_collection_items(content_type, content_id);

-- ============================================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================================

-- View for questions with their tags
CREATE VIEW public.questions_with_tags AS
SELECT 
    q.*,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'tag_id', ct.id,
                'tag_name', ct.name,
                'tag_category', ct.category,
                'confidence_score', cta.confidence_score,
                'assigned_by_ai', cta.assigned_by_ai
            )
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'::jsonb
    ) as tags
FROM public.questions q
LEFT JOIN public.content_tag_assignments cta 
    ON cta.content_type = 'question' AND cta.content_id = q.id
LEFT JOIN public.content_tags ct ON ct.id = cta.tag_id AND ct.is_active = true
GROUP BY q.id;

-- View for content with learning objectives
CREATE VIEW public.content_with_objectives AS
SELECT 
    clo.content_type,
    clo.content_id,
    jsonb_agg(
        jsonb_build_object(
            'objective_id', lo.id,
            'code', lo.code,
            'title', lo.title,
            'alignment_strength', clo.alignment_strength,
            'weight_percentage', clo.weight_percentage,
            'bloom_level', lo.bloom_level,
            'dok_level', lo.dok_level
        )
    ) as learning_objectives
FROM public.content_learning_objectives clo
JOIN public.learning_objectives lo ON lo.id = clo.objective_id AND lo.is_active = true
GROUP BY clo.content_type, clo.content_id;

-- ============================================================================
-- FUNCTIONS FOR TAG MANAGEMENT
-- ============================================================================

-- Function to automatically increment tag usage count
CREATE OR REPLACE FUNCTION public.increment_tag_usage()
RETURNS trigger AS $$
BEGIN
    UPDATE public.content_tags 
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = NEW.tag_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically decrement tag usage count
CREATE OR REPLACE FUNCTION public.decrement_tag_usage()
RETURNS trigger AS $$
BEGIN
    UPDATE public.content_tags 
    SET usage_count = GREATEST(0, usage_count - 1),
        updated_at = now()
    WHERE id = OLD.tag_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tag usage counting
CREATE TRIGGER trg_content_tag_assignments_increment
    AFTER INSERT ON public.content_tag_assignments
    FOR EACH ROW EXECUTE FUNCTION public.increment_tag_usage();

CREATE TRIGGER trg_content_tag_assignments_decrement
    AFTER DELETE ON public.content_tag_assignments
    FOR EACH ROW EXECUTE FUNCTION public.decrement_tag_usage();

-- Function to get tag hierarchy
CREATE OR REPLACE FUNCTION public.get_tag_hierarchy(tag_id_param uuid)
RETURNS TABLE (
    id uuid,
    name text,
    level integer,
    path text
) AS $$
WITH RECURSIVE tag_hierarchy AS (
    -- Base case: the specified tag
    SELECT 
        ct.id,
        ct.name,
        ct.parent_tag_id,
        0 as level,
        ct.name as path
    FROM public.content_tags ct
    WHERE ct.id = tag_id_param
    
    UNION ALL
    
    -- Recursive case: parent tags
    SELECT 
        ct.id,
        ct.name,
        ct.parent_tag_id,
        th.level + 1,
        ct.name || ' > ' || th.path
    FROM public.content_tags ct
    JOIN tag_hierarchy th ON ct.id = th.parent_tag_id
)
SELECT th.id, th.name, th.level, th.path
FROM tag_hierarchy th
ORDER BY th.level DESC;
$$ LANGUAGE sql;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER trg_content_tags_updated_at
    BEFORE UPDATE ON public.content_tags
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_writing_prompts_updated_at
    BEFORE UPDATE ON public.writing_prompts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_learning_objectives_updated_at
    BEFORE UPDATE ON public.learning_objectives
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_content_collections_updated_at
    BEFORE UPDATE ON public.content_collections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.content_tags IS 'Hierarchical tagging system for content classification and organization';
COMMENT ON TABLE public.content_tag_assignments IS 'Many-to-many relationships between content and tags with AI confidence scoring';
COMMENT ON TABLE public.question_passages IS 'Support for multi-passage questions with defined relationships';
COMMENT ON TABLE public.writing_prompts IS 'Essay and writing prompts with rubrics and support materials';
COMMENT ON TABLE public.learning_objectives IS 'Educational learning objectives with taxonomic classification';
COMMENT ON TABLE public.content_collections IS 'Curated groups of content items for structured learning paths';

COMMENT ON VIEW public.questions_with_tags IS 'Questions enriched with their associated tags for easy querying';
COMMENT ON FUNCTION public.get_tag_hierarchy(uuid) IS 'Returns the complete hierarchy path for a given tag';