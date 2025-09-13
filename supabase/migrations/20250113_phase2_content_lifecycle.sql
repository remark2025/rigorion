-- Phase 2.1: Content Lifecycle and Versioning System
-- Implements content authoring, validation, deployment, and version management

-- ============================================================================
-- CONTENT VALIDATIONS - Quality Assurance System
-- ============================================================================

CREATE TABLE public.content_validations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference (polymorphic)
    content_type text NOT NULL CHECK (content_type IN ('question', 'passage', 'graph', 'interactive_solution', 'content_pack')),
    content_id uuid NOT NULL,
    
    -- Validation details
    validation_type validation_type NOT NULL,
    status validation_status NOT NULL DEFAULT 'pending',
    
    -- Validation results
    message text NOT NULL,
    details jsonb, -- Detailed validation results
    score numeric(5,2), -- Quality score 0-100
    
    -- Rule and automation
    rule_id text, -- Which validation rule triggered this
    automated boolean NOT NULL DEFAULT false,
    
    -- Review information
    reviewer_id uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    
    -- Timestamps
    validated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT chk_validation_score_valid CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    CONSTRAINT chk_validation_reviewed CHECK ((status IN ('passed', 'failed')) = (reviewed_at IS NOT NULL))
);

-- ============================================================================
-- CONTENT DEPLOYMENTS - Release Management
-- ============================================================================

CREATE TABLE public.content_deployments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Deployment metadata
    deployment_name text NOT NULL,
    description text,
    version version_string NOT NULL,
    
    -- Status tracking
    status deployment_status NOT NULL DEFAULT 'in_progress',
    
    -- Deployment metrics
    pack_count integer NOT NULL DEFAULT 0,
    question_count integer NOT NULL DEFAULT 0,
    deployed_packs integer DEFAULT 0,
    deployed_questions integer DEFAULT 0,
    skipped_packs integer DEFAULT 0,
    error_count integer DEFAULT 0,
    
    -- Content information
    total_size_bytes bigint NOT NULL DEFAULT 0,
    manifest_data jsonb, -- Deployment manifest
    
    -- Error tracking
    errors jsonb, -- Array of error objects
    warnings jsonb, -- Array of warning objects
    
    -- Rollback information
    previous_deployment_id uuid REFERENCES public.content_deployments(id),
    rollback_reason text,
    
    -- Timing
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    estimated_duration interval,
    
    -- Audit
    created_by uuid NOT NULL REFERENCES auth.users(id),
    notes text,
    
    -- Constraints
    CONSTRAINT chk_deployment_counts CHECK (
        deployed_packs <= pack_count AND 
        deployed_questions <= question_count AND
        error_count >= 0
    )
);

-- ============================================================================
-- QUESTION VERSIONS - Immutable Content Snapshots
-- ============================================================================

CREATE TABLE public.question_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    revision_number integer NOT NULL,
    
    -- Version metadata
    version_type text NOT NULL DEFAULT 'minor' CHECK (version_type IN ('major', 'minor', 'patch', 'draft')),
    change_description text,
    
    -- Complete content snapshot
    content_snapshot jsonb NOT NULL, -- Full question data at this revision
    
    -- Performance comparison
    previous_success_rate percentage,
    current_success_rate percentage,
    performance_change numeric(6,3), -- Percentage point change
    
    -- A/B testing data
    test_group_id text,
    test_variant text,
    test_sample_size integer,
    
    -- Approval workflow
    requires_approval boolean DEFAULT false,
    approved_by uuid REFERENCES auth.users(id),
    approved_at timestamptz,
    rejection_reason text,
    
    -- Publishing
    is_published boolean NOT NULL DEFAULT false,
    published_at timestamptz,
    
    -- Timestamps and audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT uq_question_versions_revision UNIQUE (question_id, revision_number),
    CONSTRAINT chk_question_versions_positive_revision CHECK (revision_number > 0),
    CONSTRAINT chk_question_versions_approval CHECK (
        (NOT requires_approval) OR 
        (is_published = false) OR 
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);

-- ============================================================================
-- CONTENT APPROVAL WORKFLOW
-- ============================================================================

CREATE TABLE public.content_approvals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference (polymorphic)
    content_type text NOT NULL CHECK (content_type IN ('question', 'passage', 'graph', 'interactive_solution', 'content_pack')),
    content_id uuid NOT NULL,
    content_version text, -- Version identifier
    
    -- Workflow status
    approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    
    -- Review details
    reviewer_id uuid REFERENCES auth.users(id),
    review_notes text,
    requested_changes jsonb, -- Array of change request objects
    
    -- Priority and urgency
    priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    due_date timestamptz,
    
    -- Review timeline
    assigned_at timestamptz,
    reviewed_at timestamptz,
    
    -- Timestamps
    requested_at timestamptz NOT NULL DEFAULT now(),
    requested_by uuid NOT NULL REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT chk_approval_reviewed CHECK (
        (approval_status = 'pending') OR 
        (reviewed_at IS NOT NULL AND reviewer_id IS NOT NULL)
    )
);

-- ============================================================================
-- CONTENT CHANGE LOG
-- ============================================================================

CREATE TABLE public.content_change_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference
    content_type text NOT NULL CHECK (content_type IN ('question', 'passage', 'graph', 'interactive_solution', 'content_pack')),
    content_id uuid NOT NULL,
    
    -- Change details
    change_type text NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'publish', 'unpublish', 'approve', 'reject')),
    field_name text, -- Specific field that changed
    
    -- Change data
    old_value jsonb,
    new_value jsonb,
    change_summary text,
    
    -- Context
    reason text,
    automated boolean NOT NULL DEFAULT false,
    batch_id uuid, -- For grouping related changes
    
    -- Audit
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamptz NOT NULL DEFAULT now(),
    ip_address inet,
    user_agent text
);

-- ============================================================================
-- CONTENT ANALYTICS TRACKING
-- ============================================================================

-- Enhance existing content_analytics if it exists, otherwise create
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference
    content_type text NOT NULL CHECK (content_type IN ('question', 'passage', 'graph', 'interactive_solution', 'content_pack')),
    content_id uuid NOT NULL,
    
    -- Event tracking
    event_type interaction_event NOT NULL,
    event_data jsonb,
    
    -- User and session
    user_id uuid REFERENCES auth.users(id),
    session_id text,
    anonymous_id text,
    
    -- Performance metrics
    duration_ms integer,
    success boolean,
    confidence_level confidence_level,
    
    -- Context
    device_type text,
    platform text,
    user_agent text,
    referrer text,
    
    -- Timestamp
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- CONTENT USAGE STATISTICS (Materialized View)
-- ============================================================================

-- Materialized view for fast content statistics
CREATE MATERIALIZED VIEW public.content_usage_stats AS
SELECT 
    content_type,
    content_id,
    COUNT(*) as total_interactions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(duration_ms) as avg_duration_ms,
    COUNT(*) FILTER (WHERE success = true) as successful_interactions,
    COUNT(*) FILTER (WHERE success = false) as failed_interactions,
    COUNT(*) FILTER (WHERE event_type = 'question_complete') as completions,
    COUNT(*) FILTER (WHERE event_type = 'hint_viewed') as hint_views,
    COUNT(*) FILTER (WHERE event_type = 'solution_viewed') as solution_views,
    MIN(created_at) as first_interaction,
    MAX(created_at) as last_interaction
FROM public.content_analytics
GROUP BY content_type, content_id;

-- Index for materialized view refresh
CREATE UNIQUE INDEX idx_content_usage_stats_pk 
    ON public.content_usage_stats(content_type, content_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Content validations
CREATE INDEX idx_content_validations_content ON public.content_validations(content_type, content_id);
CREATE INDEX idx_content_validations_status ON public.content_validations(status);
CREATE INDEX idx_content_validations_type ON public.content_validations(validation_type);
CREATE INDEX idx_content_validations_automated ON public.content_validations(automated);
CREATE INDEX idx_content_validations_score ON public.content_validations(score DESC NULLS LAST);

-- Content deployments
CREATE INDEX idx_content_deployments_status ON public.content_deployments(status);
CREATE INDEX idx_content_deployments_started_at ON public.content_deployments(started_at DESC);
CREATE INDEX idx_content_deployments_created_by ON public.content_deployments(created_by);
CREATE INDEX idx_content_deployments_version ON public.content_deployments(version);

-- Question versions
CREATE INDEX idx_question_versions_question_revision ON public.question_versions(question_id, revision_number DESC);
CREATE INDEX idx_question_versions_published ON public.question_versions(is_published, published_at DESC);
CREATE INDEX idx_question_versions_created_by ON public.question_versions(created_by);
CREATE INDEX idx_question_versions_approval ON public.question_versions(requires_approval, approved_at);

-- Content approvals
CREATE INDEX idx_content_approvals_content ON public.content_approvals(content_type, content_id);
CREATE INDEX idx_content_approvals_status ON public.content_approvals(approval_status);
CREATE INDEX idx_content_approvals_reviewer ON public.content_approvals(reviewer_id);
CREATE INDEX idx_content_approvals_priority ON public.content_approvals(priority, due_date);
CREATE INDEX idx_content_approvals_requested_by ON public.content_approvals(requested_by);

-- Content change log
CREATE INDEX idx_content_change_log_content ON public.content_change_log(content_type, content_id, changed_at DESC);
CREATE INDEX idx_content_change_log_type ON public.content_change_log(change_type);
CREATE INDEX idx_content_change_log_changed_by ON public.content_change_log(changed_by);
CREATE INDEX idx_content_change_log_batch ON public.content_change_log(batch_id) WHERE batch_id IS NOT NULL;

-- Content analytics
CREATE INDEX idx_content_analytics_content ON public.content_analytics(content_type, content_id);
CREATE INDEX idx_content_analytics_event ON public.content_analytics(event_type, created_at DESC);
CREATE INDEX idx_content_analytics_user ON public.content_analytics(user_id, created_at DESC);
CREATE INDEX idx_content_analytics_session ON public.content_analytics(session_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED WORKFLOW
-- ============================================================================

-- Function to create change log entries automatically
CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS trigger AS $$
BEGIN
    -- Log the change
    INSERT INTO public.content_change_log (
        content_type,
        content_id,
        change_type,
        old_value,
        new_value,
        automated,
        changed_by
    ) VALUES (
        TG_ARGV[0], -- content_type passed as trigger argument
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        CASE TG_OP WHEN 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE TG_OP WHEN 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
        true,
        COALESCE(NEW.created_by, NEW.updated_at, OLD.created_by) -- Best effort to get user
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply change logging to core tables
CREATE TRIGGER trg_questions_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.log_content_change('question');

CREATE TRIGGER trg_passages_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.passages
    FOR EACH ROW EXECUTE FUNCTION public.log_content_change('passage');

CREATE TRIGGER trg_graphs_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.graphs
    FOR EACH ROW EXECUTE FUNCTION public.log_content_change('graph');

CREATE TRIGGER trg_interactive_solutions_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.interactive_solutions
    FOR EACH ROW EXECUTE FUNCTION public.log_content_change('interactive_solution');

CREATE TRIGGER trg_content_packs_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.content_packs
    FOR EACH ROW EXECUTE FUNCTION public.log_content_change('content_pack');

-- Function to refresh content usage statistics
CREATE OR REPLACE FUNCTION public.refresh_content_usage_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.content_usage_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get latest version of a question
CREATE OR REPLACE FUNCTION public.get_latest_question_version(question_uuid uuid)
RETURNS uuid AS $$
DECLARE
    latest_version_id uuid;
BEGIN
    SELECT id INTO latest_version_id
    FROM public.question_versions qv
    WHERE qv.question_id = question_uuid
    AND qv.is_published = true
    ORDER BY qv.revision_number DESC
    LIMIT 1;
    
    RETURN latest_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create new question version
CREATE OR REPLACE FUNCTION public.create_question_version(
    question_uuid uuid,
    change_desc text DEFAULT NULL,
    version_type_param text DEFAULT 'minor'
)
RETURNS uuid AS $$
DECLARE
    new_version_id uuid;
    next_revision integer;
    question_data jsonb;
BEGIN
    -- Get next revision number
    SELECT COALESCE(MAX(revision_number), 0) + 1 INTO next_revision
    FROM public.question_versions
    WHERE question_id = question_uuid;
    
    -- Get current question data
    SELECT to_jsonb(q.*) INTO question_data
    FROM public.questions q
    WHERE q.id = question_uuid;
    
    -- Create new version
    INSERT INTO public.question_versions (
        question_id,
        revision_number,
        version_type,
        change_description,
        content_snapshot,
        created_by
    ) VALUES (
        question_uuid,
        next_revision,
        version_type_param,
        change_desc,
        question_data,
        auth.uid()
    )
    RETURNING id INTO new_version_id;
    
    RETURN new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get content validation summary
CREATE OR REPLACE FUNCTION public.get_content_validation_summary(
    content_type_param text,
    content_id_param uuid
)
RETURNS TABLE (
    total_validations bigint,
    passed_validations bigint,
    failed_validations bigint,
    pending_validations bigint,
    average_score numeric,
    latest_validation_date timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'passed'),
        COUNT(*) FILTER (WHERE status = 'failed'),
        COUNT(*) FILTER (WHERE status = 'pending'),
        AVG(score),
        MAX(validated_at)
    FROM public.content_validations cv
    WHERE cv.content_type = content_type_param 
    AND cv.content_id = content_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.content_validations IS 'Quality assurance and validation results for all content types';
COMMENT ON TABLE public.content_deployments IS 'Tracks content deployment processes and release management';
COMMENT ON TABLE public.question_versions IS 'Immutable snapshots of question content for version control and A/B testing';
COMMENT ON TABLE public.content_approvals IS 'Content review and approval workflow management';
COMMENT ON TABLE public.content_change_log IS 'Comprehensive audit log of all content changes';
COMMENT ON MATERIALIZED VIEW public.content_usage_stats IS 'Aggregated content usage statistics for performance monitoring';

COMMENT ON FUNCTION public.create_question_version(uuid, text, text) IS 'Creates a new immutable version of a question with change tracking';
COMMENT ON FUNCTION public.get_content_validation_summary(text, uuid) IS 'Returns validation summary statistics for any content item';