-- Content management system for automated pack building
-- Tracks content packs, deployments, and validation results

-- Content packs metadata table
CREATE TABLE IF NOT EXISTS public.content_packs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    tags TEXT[], -- Array of tags
    question_count INTEGER NOT NULL DEFAULT 0,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    content_hash TEXT NOT NULL, -- SHA256 hash of content
    file_path TEXT NOT NULL, -- Path in storage
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cache_control TEXT DEFAULT 'public, max-age=31536000, immutable',
    etag TEXT, -- For cache validation
    deployment_id TEXT, -- References content_deployments.id
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deployment tracking table
CREATE TABLE IF NOT EXISTS public.content_deployments (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'completed_with_errors', 'failed', 'rolled_back')),
    pack_count INTEGER NOT NULL DEFAULT 0,
    deployed_packs INTEGER DEFAULT 0,
    skipped_packs INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    total_size BIGINT NOT NULL DEFAULT 0,
    manifest_version TEXT,
    errors JSONB, -- Array of error objects
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Content validation results table
CREATE TABLE IF NOT EXISTS public.content_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id TEXT NOT NULL,
    validation_type TEXT NOT NULL CHECK (validation_type IN ('structure', 'content', 'educational', 'technical')),
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning')),
    message TEXT NOT NULL,
    details JSONB, -- Additional validation details
    rule_id TEXT, -- Which validation rule triggered this
    validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content usage analytics table
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('download', 'view', 'question_start', 'question_complete')),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    metadata JSONB, -- Event-specific data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_packs_difficulty ON public.content_packs(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_packs_category ON public.content_packs(category);
CREATE INDEX IF NOT EXISTS idx_content_packs_active ON public.content_packs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_content_packs_deployment ON public.content_packs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_content_packs_hash ON public.content_packs(content_hash);

CREATE INDEX IF NOT EXISTS idx_content_deployments_status ON public.content_deployments(status);
CREATE INDEX IF NOT EXISTS idx_content_deployments_started ON public.content_deployments(started_at);

CREATE INDEX IF NOT EXISTS idx_content_validations_pack ON public.content_validations(pack_id);
CREATE INDEX IF NOT EXISTS idx_content_validations_status ON public.content_validations(status);
CREATE INDEX IF NOT EXISTS idx_content_validations_type ON public.content_validations(validation_type);

CREATE INDEX IF NOT EXISTS idx_content_analytics_pack ON public.content_analytics(pack_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_user ON public.content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_event ON public.content_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_content_analytics_created ON public.content_analytics(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_packs_updated_at 
    BEFORE UPDATE ON public.content_packs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active content packs
CREATE POLICY "Public read access to active content packs" ON public.content_packs
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all content packs
CREATE POLICY "Authenticated read access to content packs" ON public.content_packs
    FOR SELECT TO authenticated USING (true);

-- Allow service role full access for content management
CREATE POLICY "Service role full access to content packs" ON public.content_packs
    FOR ALL TO service_role USING (true);

-- Similar policies for other tables
CREATE POLICY "Public read access to deployments" ON public.content_deployments
    FOR SELECT USING (status IN ('completed', 'completed_with_errors'));

CREATE POLICY "Service role full access to deployments" ON public.content_deployments
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to validations" ON public.content_validations
    FOR ALL TO service_role USING (true);

-- Analytics policies - users can only see their own data
CREATE POLICY "Users can read own analytics" ON public.content_analytics
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.content_analytics
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to analytics" ON public.content_analytics
    FOR ALL TO service_role USING (true);

-- Helper functions
CREATE OR REPLACE FUNCTION get_pack_analytics(pack_id_param TEXT, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
    total_downloads BIGINT,
    unique_users BIGINT,
    total_questions_attempted BIGINT,
    avg_completion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'download') as total_downloads,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) FILTER (WHERE event_type = 'question_complete') as total_questions_attempted,
        CASE 
            WHEN COUNT(*) FILTER (WHERE event_type = 'question_start') > 0 
            THEN ROUND(
                COUNT(*) FILTER (WHERE event_type = 'question_complete')::numeric / 
                COUNT(*) FILTER (WHERE event_type = 'question_start')::numeric * 100, 
                2
            )
            ELSE 0 
        END as avg_completion_rate
    FROM public.content_analytics 
    WHERE pack_id = pack_id_param
        AND (start_date IS NULL OR created_at::date >= start_date)
        AND (end_date IS NULL OR created_at::date <= end_date);
END;
$$;

-- Function to get deployment status
CREATE OR REPLACE FUNCTION get_latest_deployment()
RETURNS TABLE (
    deployment_id TEXT,
    status TEXT,
    pack_count INTEGER,
    deployed_packs INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.id,
        cd.status,
        cd.pack_count,
        cd.deployed_packs,
        cd.started_at,
        cd.completed_at
    FROM public.content_deployments cd
    ORDER BY cd.started_at DESC
    LIMIT 1;
END;
$$;

-- Function to validate pack accessibility
CREATE OR REPLACE FUNCTION is_pack_accessible(pack_id_param TEXT, user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pack_exists BOOLEAN;
    is_free_pack BOOLEAN;
    user_has_premium BOOLEAN := false;
BEGIN
    -- Check if pack exists and is active
    SELECT EXISTS(
        SELECT 1 FROM public.content_packs 
        WHERE id = pack_id_param AND is_active = true
    ) INTO pack_exists;
    
    IF NOT pack_exists THEN
        RETURN false;
    END IF;
    
    -- Check if it's a free pack (assuming free packs have specific IDs or categories)
    SELECT category IN ('free', 'sample') OR id LIKE 'free-%' 
    FROM public.content_packs 
    WHERE id = pack_id_param
    INTO is_free_pack;
    
    IF is_free_pack THEN
        RETURN true;
    END IF;
    
    -- Check user's premium status if user is provided
    IF user_id_param IS NOT NULL THEN
        SELECT COALESCE(
            (SELECT has_premium_access FROM public.get_subscription_info(user_id_param)),
            false
        ) INTO user_has_premium;
        
        RETURN user_has_premium;
    END IF;
    
    -- Default to false for premium packs without authenticated user
    RETURN false;
END;
$$;

-- Add some sample data for testing
INSERT INTO public.content_packs (id, title, description, difficulty, category, question_count, size_bytes, content_hash, file_path) 
VALUES 
    ('sample-math-basic', 'Basic Math Concepts', 'Introduction to fundamental math concepts', 'beginner', 'math', 10, 1024, 'abc123hash', 'packs/sample-math-basic.json'),
    ('sample-reading-intermediate', 'Reading Comprehension', 'Intermediate reading comprehension exercises', 'intermediate', 'reading', 15, 2048, 'def456hash', 'packs/sample-reading-intermediate.json')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.content_packs IS 'Metadata for content packs including validation and deployment info';
COMMENT ON TABLE public.content_deployments IS 'Tracks content deployment processes and their status';
COMMENT ON TABLE public.content_validations IS 'Stores content validation results and quality checks';
COMMENT ON TABLE public.content_analytics IS 'Analytics data for content usage and performance metrics';