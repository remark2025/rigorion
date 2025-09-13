-- Phase 3.1: Enhanced Interactive Solutions with Unified Render Payload
-- Implements unified frontend contract, multimedia support, and AI collaboration features

-- ============================================================================
-- MULTIMEDIA ASSETS - Rich Media Support
-- ============================================================================

CREATE TABLE public.multimedia_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asset identification
    filename text NOT NULL,
    original_filename text NOT NULL,
    
    -- Asset type and format
    asset_type text NOT NULL CHECK (asset_type IN (
        'image', 'video', 'audio', 'animation', 'interactive_widget', 'document'
    )),
    mime_type text NOT NULL,
    file_extension text NOT NULL,
    
    -- Storage information
    file_url text NOT NULL,
    cdn_url text,
    storage_path text NOT NULL,
    
    -- File metadata
    file_size_bytes bigint NOT NULL,
    duration_seconds integer, -- For video/audio
    dimensions jsonb, -- {"width": 1920, "height": 1080} for visual media
    
    -- Processing status
    processing_status text DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'processing', 'completed', 'failed', 'optimizing'
    )),
    processing_error text,
    
    -- Optimized versions
    thumbnails jsonb, -- Array of thumbnail objects
    compressed_versions jsonb, -- Different quality/size versions
    transcripts jsonb, -- For video/audio accessibility
    
    -- Accessibility
    alt_text text,
    description text,
    caption text,
    
    -- Usage tracking
    usage_count integer DEFAULT 0,
    
    -- Content classification
    subject subject,
    difficulty difficulty,
    educational_purpose text[] DEFAULT '{}',
    
    -- Copyright and licensing
    license_type text DEFAULT 'internal',
    copyright_holder text,
    attribution_text text,
    
    -- Timestamps and audit
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_multimedia_assets_positive_size CHECK (file_size_bytes > 0),
    CONSTRAINT chk_multimedia_assets_duration CHECK (
        (asset_type NOT IN ('video', 'audio')) OR 
        (duration_seconds IS NOT NULL AND duration_seconds > 0)
    )
);

-- ============================================================================
-- INTERACTIVE COMPONENTS - Reusable Interactive Elements
-- ============================================================================

CREATE TABLE public.interactive_components (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Component identification
    name text NOT NULL,
    component_type text NOT NULL CHECK (component_type IN (
        'graph_plotter', 'calculator', 'slider', 'drag_drop', 'fill_blank', 
        'multiple_choice', 'input_field', 'drawing_canvas', 'simulation',
        'timer', 'progress_tracker', 'hint_system'
    )),
    
    -- Component configuration
    config_schema jsonb NOT NULL, -- JSON Schema for component configuration
    default_config jsonb NOT NULL, -- Default configuration values
    
    -- Rendering information
    render_component text NOT NULL, -- React component name
    css_classes text[] DEFAULT '{}',
    required_libraries text[] DEFAULT '{}',
    
    -- Behavior configuration
    interaction_events text[] DEFAULT '{}', -- Events this component can trigger
    data_bindings text[] DEFAULT '{}', -- Data properties this component accepts
    
    -- Educational metadata
    learning_objectives text[] DEFAULT '{}',
    cognitive_load_level text CHECK (cognitive_load_level IN ('low', 'medium', 'high')),
    
    -- Accessibility features
    accessibility_features jsonb, -- WCAG compliance features
    keyboard_navigation boolean DEFAULT true,
    screen_reader_support boolean DEFAULT true,
    
    -- Version and compatibility
    version version_string NOT NULL DEFAULT '1.0.0',
    compatibility_notes text,
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    is_system_component boolean NOT NULL DEFAULT false,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- ============================================================================
-- ENHANCED INTERACTIVE SOLUTIONS - Extended Functionality
-- ============================================================================

-- Add new columns to existing interactive_solutions table
ALTER TABLE public.interactive_solutions 
ADD COLUMN IF NOT EXISTS multimedia_assets uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interactive_components uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS accessibility_config jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS performance_metrics jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_model_version text,
ADD COLUMN IF NOT EXISTS ai_confidence_score numeric(3,2) CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1.0));

-- ============================================================================
-- RENDER PAYLOAD GENERATION SYSTEM
-- ============================================================================

-- Function to generate unified render payload for interactive solutions
CREATE OR REPLACE FUNCTION public.generate_interactive_render_payload(solution_id uuid)
RETURNS jsonb AS $$
DECLARE
    solution_record public.interactive_solutions%ROWTYPE;
    question_record public.questions%ROWTYPE;
    render_payload jsonb;
    component_configs jsonb[];
    multimedia_data jsonb[];
    i uuid;
BEGIN
    -- Get solution and question data
    SELECT * INTO solution_record FROM public.interactive_solutions WHERE id = solution_id;
    SELECT * INTO question_record FROM public.questions WHERE id = solution_record.question_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Build multimedia assets array
    IF solution_record.multimedia_assets IS NOT NULL THEN
        SELECT array_agg(
            jsonb_build_object(
                'id', ma.id,
                'type', ma.asset_type,
                'url', ma.file_url,
                'cdn_url', ma.cdn_url,
                'alt_text', ma.alt_text,
                'description', ma.description,
                'dimensions', ma.dimensions,
                'thumbnails', ma.thumbnails
            )
        ) INTO multimedia_data
        FROM public.multimedia_assets ma
        WHERE ma.id = ANY(solution_record.multimedia_assets);
    END IF;
    
    -- Build interactive components configuration
    IF solution_record.interactive_components IS NOT NULL THEN
        SELECT array_agg(
            jsonb_build_object(
                'id', ic.id,
                'name', ic.name,
                'type', ic.component_type,
                'render_component', ic.render_component,
                'config_schema', ic.config_schema,
                'default_config', ic.default_config,
                'required_libraries', ic.required_libraries,
                'accessibility_features', ic.accessibility_features
            )
        ) INTO component_configs
        FROM public.interactive_components ic
        WHERE ic.id = ANY(solution_record.interactive_components) AND ic.is_active = true;
    END IF;
    
    -- Build unified render payload
    render_payload := jsonb_build_object(
        'solution_id', solution_record.id,
        'question_id', solution_record.question_id,
        'type', solution_record.solution_type,
        'version', solution_record.version,
        
        -- Core interactive configuration
        'config', jsonb_build_object(
            'graph', CASE 
                WHEN solution_record.has_interactive_graph 
                THEN solution_record.graph_config 
                ELSE NULL 
            END,
            'parameters', solution_record.parameters,
            'calculator_type', solution_record.calculator_type,
            'allowed_functions', solution_record.allowed_functions,
            'simulation', solution_record.simulation_config,
            'model_parameters', solution_record.model_parameters
        ),
        
        -- Step-by-step interactive progression
        'interactive_steps', solution_record.interactive_steps,
        
        -- Assessment and checkpoints
        'assessment_points', solution_record.assessment_points,
        'checkpoint_triggers', solution_record.checkpoint_triggers,
        
        -- Multimedia and components
        'multimedia_assets', COALESCE(multimedia_data, ARRAY[]::jsonb[]),
        'interactive_components', COALESCE(component_configs, ARRAY[]::jsonb[]),
        
        -- Accessibility and performance
        'accessibility', solution_record.accessibility_config,
        'performance_config', jsonb_build_object(
            'preload_assets', true,
            'lazy_load_steps', jsonb_array_length(solution_record.interactive_steps) > 5,
            'cache_duration', 3600
        ),
        
        -- Context information
        'question_context', jsonb_build_object(
            'subject', question_record.subject,
            'difficulty', question_record.difficulty,
            'estimated_time', question_record.estimated_time,
            'calculator_allowed', question_record.calculator_allowed
        ),
        
        -- AI and metadata
        'ai_metadata', CASE 
            WHEN solution_record.ai_generated 
            THEN jsonb_build_object(
                'generated_by_ai', true,
                'model_version', solution_record.ai_model_version,
                'confidence_score', solution_record.ai_confidence_score
            )
            ELSE jsonb_build_object('generated_by_ai', false)
        END,
        
        -- Rendering metadata
        'render_metadata', jsonb_build_object(
            'generated_at', extract(epoch from now()),
            'cache_key', solution_record.configuration_hash,
            'format_version', '2.0.0'
        )
    );
    
    RETURN render_payload;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AI COLLABORATION FEATURES
-- ============================================================================

-- Table for tracking AI-generated content
CREATE TABLE public.ai_generated_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference
    content_type text NOT NULL CHECK (content_type IN (
        'question', 'passage', 'graph', 'interactive_solution', 'solution_step'
    )),
    content_id uuid NOT NULL,
    
    -- AI model information
    ai_model_name text NOT NULL,
    model_version text NOT NULL,
    generation_method text CHECK (generation_method IN ('completion', 'fine_tuned', 'prompt_engineering', 'chain_of_thought')),
    
    -- Generation context
    prompt_template text,
    input_data jsonb, -- Data provided to the AI model
    generation_parameters jsonb, -- Temperature, top_p, etc.
    
    -- Quality metrics
    confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
    quality_score numeric(3,2) CHECK (quality_score >= 0 AND quality_score <= 1.0),
    human_rating integer CHECK (human_rating BETWEEN 1 AND 5),
    
    -- Review and validation
    requires_review boolean NOT NULL DEFAULT true,
    reviewed_by uuid REFERENCES auth.users(id),
    approved boolean,
    review_notes text,
    
    -- Usage tracking
    usage_count integer DEFAULT 0,
    success_rate percentage,
    
    -- Timestamps
    generated_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz,
    
    -- Constraints
    CONSTRAINT chk_ai_content_reviewed CHECK (
        (NOT requires_review) OR 
        (approved IS NULL) OR 
        (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    )
);

-- ============================================================================
-- CONTENT SUGGESTIONS - AI Recommendations
-- ============================================================================

CREATE TABLE public.content_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target content
    content_type text NOT NULL CHECK (content_type IN (
        'question', 'passage', 'graph', 'interactive_solution', 'writing_prompt'
    )),
    content_id uuid NOT NULL,
    
    -- Suggestion details
    suggestion_type text NOT NULL CHECK (suggestion_type IN (
        'improve_clarity', 'add_interactivity', 'enhance_accessibility', 
        'adjust_difficulty', 'add_hints', 'improve_explanation',
        'add_multimedia', 'create_variations', 'optimize_performance'
    )),
    
    -- AI analysis
    current_analysis jsonb, -- AI analysis of current content
    suggested_changes jsonb, -- Specific improvement suggestions
    implementation_priority text DEFAULT 'medium' CHECK (implementation_priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Educational justification
    educational_rationale text,
    expected_improvement text,
    learning_impact_score numeric(3,2) CHECK (learning_impact_score >= 0 AND learning_impact_score <= 1.0),
    
    -- Implementation details
    estimated_effort_hours numeric(4,1),
    required_skills text[] DEFAULT '{}',
    
    -- Status tracking
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'implemented', 'rejected', 'deferred')),
    implemented_by uuid REFERENCES auth.users(id),
    rejection_reason text,
    
    -- AI metadata
    ai_model_version text NOT NULL,
    suggestion_confidence numeric(3,2) CHECK (suggestion_confidence >= 0 AND suggestion_confidence <= 1.0),
    
    -- Timestamps
    suggested_at timestamptz NOT NULL DEFAULT now(),
    implemented_at timestamptz,
    
    -- Constraints
    CONSTRAINT chk_suggestions_implemented CHECK (
        (status != 'implemented') OR 
        (implemented_by IS NOT NULL AND implemented_at IS NOT NULL)
    )
);

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Table for tracking interactive solution performance
CREATE TABLE public.interaction_performance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session information
    user_id uuid REFERENCES auth.users(id),
    session_id text NOT NULL,
    solution_id uuid NOT NULL REFERENCES public.interactive_solutions(id),
    
    -- Interaction details
    interaction_type text NOT NULL,
    component_id text, -- Which interactive component
    
    -- Performance metrics
    load_time_ms integer,
    interaction_time_ms integer,
    error_count integer DEFAULT 0,
    success boolean,
    
    -- User behavior
    hint_requests integer DEFAULT 0,
    reset_attempts integer DEFAULT 0,
    parameter_changes jsonb, -- Track parameter adjustments
    
    -- Device and context
    device_type text,
    browser_info text,
    screen_resolution text,
    connection_speed text,
    
    -- Timestamp
    logged_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Multimedia assets
CREATE INDEX idx_multimedia_assets_type ON public.multimedia_assets(asset_type);
CREATE INDEX idx_multimedia_assets_size ON public.multimedia_assets(file_size_bytes);
CREATE INDEX idx_multimedia_assets_subject ON public.multimedia_assets(subject);
CREATE INDEX idx_multimedia_assets_processing ON public.multimedia_assets(processing_status);
CREATE INDEX idx_multimedia_assets_usage ON public.multimedia_assets(usage_count DESC);

-- Interactive components
CREATE INDEX idx_interactive_components_type ON public.interactive_components(component_type);
CREATE INDEX idx_interactive_components_active ON public.interactive_components(is_active) WHERE is_active = true;
CREATE INDEX idx_interactive_components_version ON public.interactive_components(version);

-- AI generated content
CREATE INDEX idx_ai_generated_content_content ON public.ai_generated_content(content_type, content_id);
CREATE INDEX idx_ai_generated_content_model ON public.ai_generated_content(ai_model_name, model_version);
CREATE INDEX idx_ai_generated_content_review ON public.ai_generated_content(requires_review, reviewed_at);
CREATE INDEX idx_ai_generated_content_quality ON public.ai_generated_content(quality_score DESC NULLS LAST);

-- Content suggestions
CREATE INDEX idx_content_suggestions_content ON public.content_suggestions(content_type, content_id);
CREATE INDEX idx_content_suggestions_type ON public.content_suggestions(suggestion_type);
CREATE INDEX idx_content_suggestions_status ON public.content_suggestions(status);
CREATE INDEX idx_content_suggestions_priority ON public.content_suggestions(implementation_priority);

-- Performance logs
CREATE INDEX idx_interaction_performance_user ON public.interaction_performance_logs(user_id, logged_at DESC);
CREATE INDEX idx_interaction_performance_solution ON public.interaction_performance_logs(solution_id, logged_at DESC);
CREATE INDEX idx_interaction_performance_session ON public.interaction_performance_logs(session_id);

-- ============================================================================
-- TRIGGERS FOR RENDER PAYLOAD UPDATES
-- ============================================================================

-- Function to update render_payload when interactive_solutions changes
CREATE OR REPLACE FUNCTION public.update_render_payload()
RETURNS trigger AS $$
BEGIN
    -- Regenerate render_payload when configuration changes
    NEW.render_payload = public.generate_interactive_render_payload(NEW.id);
    NEW.updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update render_payload
CREATE TRIGGER trg_interactive_solutions_render_payload
    BEFORE INSERT OR UPDATE OF graph_config, parameters, interactive_steps, assessment_points, multimedia_assets, interactive_components
    ON public.interactive_solutions
    FOR EACH ROW EXECUTE FUNCTION public.update_render_payload();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get interactive solution with full render data
CREATE OR REPLACE FUNCTION public.get_interactive_solution_full(solution_id uuid)
RETURNS jsonb AS $$
DECLARE
    solution_data jsonb;
    render_data jsonb;
BEGIN
    -- Get basic solution data
    SELECT to_jsonb(is2.*) INTO solution_data
    FROM public.interactive_solutions is2
    WHERE is2.id = solution_id;
    
    IF solution_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get render payload
    render_data := public.generate_interactive_render_payload(solution_id);
    
    -- Combine data
    RETURN jsonb_build_object(
        'solution', solution_data,
        'render_payload', render_data,
        'generated_at', extract(epoch from now())
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log interaction performance
CREATE OR REPLACE FUNCTION public.log_interaction_performance(
    user_uuid uuid,
    session_id_param text,
    solution_id_param uuid,
    interaction_type_param text,
    performance_data jsonb
)
RETURNS uuid AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO public.interaction_performance_logs (
        user_id,
        session_id,
        solution_id,
        interaction_type,
        load_time_ms,
        interaction_time_ms,
        error_count,
        success,
        hint_requests,
        reset_attempts,
        parameter_changes,
        device_type,
        browser_info
    ) VALUES (
        user_uuid,
        session_id_param,
        solution_id_param,
        interaction_type_param,
        (performance_data->>'load_time_ms')::integer,
        (performance_data->>'interaction_time_ms')::integer,
        COALESCE((performance_data->>'error_count')::integer, 0),
        COALESCE((performance_data->>'success')::boolean, false),
        COALESCE((performance_data->>'hint_requests')::integer, 0),
        COALESCE((performance_data->>'reset_attempts')::integer, 0),
        performance_data->'parameter_changes',
        performance_data->>'device_type',
        performance_data->>'browser_info'
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER trg_multimedia_assets_updated_at
    BEFORE UPDATE ON public.multimedia_assets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_interactive_components_updated_at
    BEFORE UPDATE ON public.interactive_components
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.multimedia_assets IS 'Rich media assets for interactive content with CDN optimization and accessibility features';
COMMENT ON TABLE public.interactive_components IS 'Reusable interactive components with configuration schemas and accessibility support';
COMMENT ON TABLE public.ai_generated_content IS 'Tracking and quality management for AI-generated educational content';
COMMENT ON TABLE public.content_suggestions IS 'AI-powered suggestions for content improvement and optimization';
COMMENT ON TABLE public.interaction_performance_logs IS 'Performance monitoring for interactive solution usage and optimization';

COMMENT ON FUNCTION public.generate_interactive_render_payload(uuid) IS 'Generates unified JSON payload for frontend interactive solution rendering';
COMMENT ON FUNCTION public.get_interactive_solution_full(uuid) IS 'Returns complete interactive solution data with render payload for frontend consumption';