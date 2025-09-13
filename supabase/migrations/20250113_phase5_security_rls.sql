-- Phase 5.1: Security with Row Level Security Policies
-- Implements comprehensive security, role-based access control, and audit logging

-- ============================================================================
-- USER ROLES AND PERMISSIONS SYSTEM
-- ============================================================================

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Role information
    role_name text NOT NULL UNIQUE CHECK (role_name IN (
        'super_admin', 'admin', 'content_manager', 'author', 'reviewer', 
        'educator', 'premium_user', 'free_user', 'trial_user', 'guest'
    )),
    role_display_name text NOT NULL,
    description text,
    
    -- Permissions
    permissions jsonb NOT NULL DEFAULT '{}', -- Array of permission strings
    
    -- Hierarchy and inheritance
    inherits_from_role text REFERENCES public.user_roles(role_name),
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- User role assignments
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and role
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name text NOT NULL REFERENCES public.user_roles(role_name),
    
    -- Assignment context
    scope text DEFAULT 'global' CHECK (scope IN ('global', 'pack', 'subject', 'organization')),
    scope_id uuid, -- Pack ID, subject ID, etc.
    
    -- Assignment details
    assigned_by uuid REFERENCES auth.users(id),
    assigned_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz,
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    
    -- Unique constraint
    CONSTRAINT uq_user_role_assignments UNIQUE (user_id, role_name, scope, scope_id)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Core content tables
ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_solutions ENABLE ROW LEVEL SECURITY;

-- Authoring and content management
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_collection_items ENABLE ROW LEVEL SECURITY;

-- Content lifecycle and versioning
ALTER TABLE public.content_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Interactive and multimedia
ALTER TABLE public.multimedia_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_performance_logs ENABLE ROW LEVEL SECURITY;

-- Search and analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- User roles and permissions
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UTILITY FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid uuid, role_name_param text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM public.user_role_assignments ura
        WHERE ura.user_id = user_uuid 
        AND ura.role_name = role_name_param
        AND ura.is_active = true
        AND (ura.expires_at IS NULL OR ura.expires_at > now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.user_has_any_role(user_uuid uuid, role_names text[])
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM public.user_role_assignments ura
        WHERE ura.user_id = user_uuid 
        AND ura.role_name = ANY(role_names)
        AND ura.is_active = true
        AND (ura.expires_at IS NULL OR ura.expires_at > now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ur.role_name = ura.role_name
        WHERE ura.user_id = user_uuid 
        AND ura.is_active = true
        AND (ura.expires_at IS NULL OR ura.expires_at > now())
        AND ur.is_active = true
        AND ur.permissions ? permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is content author/owner
CREATE OR REPLACE FUNCTION public.user_is_content_author(user_uuid uuid, content_created_by uuid)
RETURNS boolean AS $$
BEGIN
    RETURN user_uuid = content_created_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check premium access (enhanced from existing)
CREATE OR REPLACE FUNCTION public.user_has_premium_access_enhanced(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
    -- Check subscription status first
    IF public.has_premium_access(user_uuid) THEN
        RETURN true;
    END IF;
    
    -- Check role-based premium access
    RETURN public.user_has_any_role(user_uuid, ARRAY['premium_user', 'educator', 'author', 'reviewer', 'admin', 'super_admin']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR CONTENT PACKS
-- ============================================================================

-- Content packs - public read access to published packs
CREATE POLICY "content_packs_public_read" ON public.content_packs
    FOR SELECT 
    USING (is_published = true AND access_level IN ('free', 'premium'));

-- Content packs - premium users can access premium packs
CREATE POLICY "content_packs_premium_read" ON public.content_packs
    FOR SELECT 
    USING (
        is_published = true 
        AND access_level = 'premium' 
        AND public.user_has_premium_access_enhanced(auth.uid())
    );

-- Content packs - authors can manage their own content
CREATE POLICY "content_packs_author_all" ON public.content_packs
    FOR ALL
    USING (public.user_is_content_author(auth.uid(), created_by))
    WITH CHECK (public.user_is_content_author(auth.uid(), created_by));

-- Content packs - content managers can access all
CREATE POLICY "content_packs_manager_all" ON public.content_packs
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- Content packs - reviewers can read all for review
CREATE POLICY "content_packs_reviewer_read" ON public.content_packs
    FOR SELECT 
    USING (public.user_has_role(auth.uid(), 'reviewer'));

-- ============================================================================
-- RLS POLICIES FOR QUESTIONS
-- ============================================================================

-- Questions - public read access to active questions in published packs
CREATE POLICY "questions_public_read" ON public.questions
    FOR SELECT 
    USING (
        is_active = true 
        AND EXISTS(
            SELECT 1 FROM public.content_packs cp 
            WHERE cp.id = pack_id 
            AND cp.is_published = true 
            AND cp.access_level IN ('free', 'premium')
        )
    );

-- Questions - premium access to premium pack questions
CREATE POLICY "questions_premium_read" ON public.questions
    FOR SELECT 
    USING (
        is_active = true 
        AND public.user_has_premium_access_enhanced(auth.uid())
        AND EXISTS(
            SELECT 1 FROM public.content_packs cp 
            WHERE cp.id = pack_id 
            AND cp.is_published = true 
            AND cp.access_level = 'premium'
        )
    );

-- Questions - authors can manage their own questions
CREATE POLICY "questions_author_all" ON public.questions
    FOR ALL
    USING (public.user_is_content_author(auth.uid(), created_by))
    WITH CHECK (public.user_is_content_author(auth.uid(), created_by));

-- Questions - content managers and reviewers can access all
CREATE POLICY "questions_manager_all" ON public.questions
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- Questions - reviewers can read all
CREATE POLICY "questions_reviewer_read" ON public.questions
    FOR SELECT 
    USING (public.user_has_role(auth.uid(), 'reviewer'));

-- ============================================================================
-- RLS POLICIES FOR PASSAGES
-- ============================================================================

-- Passages - public read access
CREATE POLICY "passages_public_read" ON public.passages
    FOR SELECT 
    USING (true); -- Passages are generally public

-- Passages - authors can manage their own
CREATE POLICY "passages_author_all" ON public.passages
    FOR ALL
    USING (public.user_is_content_author(auth.uid(), created_by))
    WITH CHECK (public.user_is_content_author(auth.uid(), created_by));

-- Passages - content managers can access all
CREATE POLICY "passages_manager_all" ON public.passages
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- ============================================================================
-- RLS POLICIES FOR INTERACTIVE SOLUTIONS
-- ============================================================================

-- Interactive solutions - follow question access patterns
CREATE POLICY "interactive_solutions_public_read" ON public.interactive_solutions
    FOR SELECT 
    USING (
        EXISTS(
            SELECT 1 FROM public.questions q
            JOIN public.content_packs cp ON cp.id = q.pack_id
            WHERE q.id = question_id 
            AND q.is_active = true
            AND cp.is_published = true
            AND cp.access_level IN ('free', 'premium')
        )
    );

-- Interactive solutions - premium access
CREATE POLICY "interactive_solutions_premium_read" ON public.interactive_solutions
    FOR SELECT 
    USING (
        public.user_has_premium_access_enhanced(auth.uid())
        AND EXISTS(
            SELECT 1 FROM public.questions q
            JOIN public.content_packs cp ON cp.id = q.pack_id
            WHERE q.id = question_id 
            AND q.is_active = true
            AND cp.is_published = true
            AND cp.access_level = 'premium'
        )
    );

-- Interactive solutions - authors can manage their own
CREATE POLICY "interactive_solutions_author_all" ON public.interactive_solutions
    FOR ALL
    USING (public.user_is_content_author(auth.uid(), created_by))
    WITH CHECK (public.user_is_content_author(auth.uid(), created_by));

-- Interactive solutions - content managers can access all
CREATE POLICY "interactive_solutions_manager_all" ON public.interactive_solutions
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- ============================================================================
-- RLS POLICIES FOR CONTENT MANAGEMENT
-- ============================================================================

-- Content validations - authors can see validations for their content
CREATE POLICY "content_validations_author_read" ON public.content_validations
    FOR SELECT 
    USING (
        EXISTS(
            -- Check if user owns the content being validated
            SELECT 1 FROM public.questions q WHERE q.id = content_id::uuid AND q.created_by = auth.uid()
            UNION
            SELECT 1 FROM public.passages p WHERE p.id = content_id::uuid AND p.created_by = auth.uid()
            UNION
            SELECT 1 FROM public.graphs g WHERE g.id = content_id::uuid AND g.created_by = auth.uid()
        )
    );

-- Content validations - reviewers and managers can access all
CREATE POLICY "content_validations_reviewer_all" ON public.content_validations
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['reviewer', 'content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['reviewer', 'content_manager', 'admin', 'super_admin']));

-- Content approvals - similar pattern
CREATE POLICY "content_approvals_author_read" ON public.content_approvals
    FOR SELECT 
    USING (
        requested_by = auth.uid() OR
        reviewer_id = auth.uid() OR
        public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin'])
    );

CREATE POLICY "content_approvals_reviewer_all" ON public.content_approvals
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['reviewer', 'content_manager', 'admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['reviewer', 'content_manager', 'admin', 'super_admin']));

-- ============================================================================
-- RLS POLICIES FOR ANALYTICS AND LOGS
-- ============================================================================

-- Content analytics - users can see their own data
CREATE POLICY "content_analytics_own_data" ON public.content_analytics
    FOR SELECT 
    USING (user_id = auth.uid());

-- Content analytics - managers can see all data
CREATE POLICY "content_analytics_manager_read" ON public.content_analytics
    FOR SELECT 
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- Content analytics - users can insert their own data
CREATE POLICY "content_analytics_own_insert" ON public.content_analytics
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Search analytics - similar pattern
CREATE POLICY "search_analytics_own_data" ON public.search_analytics
    FOR SELECT 
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "search_analytics_own_insert" ON public.search_analytics
    FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "search_analytics_manager_read" ON public.search_analytics
    FOR SELECT 
    USING (public.user_has_any_role(auth.uid(), ARRAY['content_manager', 'admin', 'super_admin']));

-- ============================================================================
-- RLS POLICIES FOR USER ROLES
-- ============================================================================

-- User roles - public read for basic role information
CREATE POLICY "user_roles_public_read" ON public.user_roles
    FOR SELECT 
    USING (is_active = true);

-- User roles - only admins can modify
CREATE POLICY "user_roles_admin_all" ON public.user_roles
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['admin', 'super_admin']));

-- User role assignments - users can see their own assignments
CREATE POLICY "user_role_assignments_own_read" ON public.user_role_assignments
    FOR SELECT 
    USING (user_id = auth.uid());

-- User role assignments - admins can manage all
CREATE POLICY "user_role_assignments_admin_all" ON public.user_role_assignments
    FOR ALL
    USING (public.user_has_any_role(auth.uid(), ARRAY['admin', 'super_admin']))
    WITH CHECK (public.user_has_any_role(auth.uid(), ARRAY['admin', 'super_admin']));

-- ============================================================================
-- DEFAULT ROLES AND PERMISSIONS
-- ============================================================================

-- Insert default roles
INSERT INTO public.user_roles (role_name, role_display_name, description, permissions) VALUES
('super_admin', 'Super Administrator', 'Full system access', '["*"]'),
('admin', 'Administrator', 'Administrative access', '["user_management", "content_management", "system_config", "analytics"]'),
('content_manager', 'Content Manager', 'Content creation and management', '["content_create", "content_edit", "content_publish", "content_analytics"]'),
('author', 'Content Author', 'Content creation', '["content_create", "content_edit", "content_draft"]'),
('reviewer', 'Content Reviewer', 'Content review and approval', '["content_review", "content_approve", "content_reject"]'),
('educator', 'Educator', 'Educational features and content', '["premium_content", "class_management", "student_analytics"]'),
('premium_user', 'Premium User', 'Premium content access', '["premium_content", "advanced_analytics", "priority_support"]'),
('free_user', 'Free User', 'Basic content access', '["basic_content", "limited_analytics"]'),
('trial_user', 'Trial User', 'Trial access to premium features', '["premium_content", "limited_time"]'),
('guest', 'Guest', 'Limited guest access', '["public_content"]')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- ROLE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_user_role(
    user_uuid uuid,
    role_name_param text,
    scope_param text DEFAULT 'global',
    scope_id_param uuid DEFAULT NULL,
    expires_at_param timestamptz DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    assignment_id uuid;
BEGIN
    -- Check if role exists
    IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role_name = role_name_param AND is_active = true) THEN
        RAISE EXCEPTION 'Role % does not exist or is not active', role_name_param;
    END IF;
    
    -- Insert or update role assignment
    INSERT INTO public.user_role_assignments (
        user_id,
        role_name,
        scope,
        scope_id,
        expires_at,
        assigned_by
    ) VALUES (
        user_uuid,
        role_name_param,
        scope_param,
        scope_id_param,
        expires_at_param,
        auth.uid()
    )
    ON CONFLICT (user_id, role_name, scope, scope_id) DO UPDATE SET
        is_active = true,
        expires_at = expires_at_param,
        assigned_by = auth.uid(),
        assigned_at = now()
    RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke role from user
CREATE OR REPLACE FUNCTION public.revoke_user_role(
    user_uuid uuid,
    role_name_param text,
    scope_param text DEFAULT 'global',
    scope_id_param uuid DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
    UPDATE public.user_role_assignments
    SET is_active = false
    WHERE user_id = user_uuid 
    AND role_name = role_name_param
    AND scope = scope_param
    AND (scope_id = scope_id_param OR (scope_id IS NULL AND scope_id_param IS NULL));
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_role_assignments_user_active ON public.user_role_assignments(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_role_assignments_role ON public.user_role_assignments(role_name);
CREATE INDEX idx_user_role_assignments_expires ON public.user_role_assignments(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_role_assignments TO authenticated;

-- Grant execute permissions on role functions
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_any_role(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_premium_access_enhanced(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text, text, uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(uuid, text, text, uuid) TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_roles IS 'System roles with hierarchical permissions for role-based access control';
COMMENT ON TABLE public.user_role_assignments IS 'User role assignments with scope and expiration support';
COMMENT ON FUNCTION public.user_has_role(uuid, text) IS 'Check if user has specific active role';
COMMENT ON FUNCTION public.user_has_permission(uuid, text) IS 'Check if user has specific permission through any role';
COMMENT ON FUNCTION public.assign_user_role(uuid, text, text, uuid, timestamptz) IS 'Assign role to user with scope and expiration';
COMMENT ON FUNCTION public.revoke_user_role(uuid, text, text, uuid) IS 'Revoke role from user for specific scope';