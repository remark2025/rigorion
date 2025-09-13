-- Phase 1.1: PostgreSQL Enums and Types for SAT Content System
-- Establishes consistent type definitions across the application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENUMS FOR TYPE CONSISTENCY
-- ============================================================================

-- Question-related enums
CREATE TYPE question_type AS ENUM ('multiple_choice', 'grid_in', 'essay', 'interactive');
CREATE TYPE subject AS ENUM ('math', 'reading', 'writing', 'science');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE topic_category AS ENUM ('algebra', 'geometry', 'trigonometry', 'statistics', 'reading_comprehension', 'grammar', 'writing_structure');

-- Content-related enums
CREATE TYPE passage_type AS ENUM ('fiction', 'nonfiction', 'poetry', 'historical', 'scientific', 'persuasive', 'informational');
CREATE TYPE content_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE validation_status AS ENUM ('passed', 'failed', 'warning', 'pending');

-- Interactive solution enums
CREATE TYPE solution_type AS ENUM ('graph', 'calculator', 'diagram', 'simulation', 'step_by_step', 'multimedia');
CREATE TYPE graph_type AS ENUM ('quadratic', 'linear', 'exponential', 'absolute', 'polynomial', 'coordinate_plane', 'bar_chart', 'line_graph', 'pie_chart', 'scatter_plot', 'histogram');
CREATE TYPE interaction_type AS ENUM ('fill_blank', 'drag_drop', 'multiple_choice', 'input', 'slider', 'toggle');

-- Assessment and analytics enums
CREATE TYPE confidence_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
CREATE TYPE step_type AS ENUM ('concept', 'calculation', 'analysis', 'verification', 'insight', 'practice');
CREATE TYPE calculator_type AS ENUM ('basic', 'scientific', 'graphing', 'none');

-- Content management enums
CREATE TYPE pack_category AS ENUM ('math', 'reading', 'writing', 'mixed', 'diagnostic', 'practice_test');
CREATE TYPE deployment_status AS ENUM ('in_progress', 'completed', 'completed_with_errors', 'failed', 'rolled_back');
CREATE TYPE validation_type AS ENUM ('structure', 'content', 'educational', 'technical', 'accessibility');

-- User interaction enums
CREATE TYPE interaction_event AS ENUM ('question_start', 'question_complete', 'hint_viewed', 'solution_viewed', 'bookmark_added', 'bookmark_removed');

-- ============================================================================
-- HELPER FUNCTIONS FOR ENUM MANAGEMENT
-- ============================================================================

-- Function to add enum values safely (for future migrations)
CREATE OR REPLACE FUNCTION safe_add_enum_value(enum_name text, new_value text)
RETURNS void AS $$
BEGIN
    -- Check if the value already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = enum_name AND e.enumlabel = new_value
    ) THEN
        EXECUTE format('ALTER TYPE %I ADD VALUE %L', enum_name, new_value);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get all enum values for a type
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS text[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = enum_name
        ORDER BY e.enumsortorder
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPOSITE TYPES FOR STRUCTURED DATA
-- ============================================================================

-- Graph configuration composite type
CREATE TYPE graph_config_type AS (
    type graph_type,
    x_range int4range,
    y_range int4range,
    show_grid boolean,
    show_axis boolean,
    title text
);

-- Interactive parameter composite type
CREATE TYPE interactive_parameter_type AS (
    name text,
    label text,
    param_type text, -- 'number', 'boolean', 'choice'
    min_value numeric,
    max_value numeric,
    step_value numeric,
    default_value text,
    description text
);

-- Mathematical expression composite type
CREATE TYPE math_expression_type AS (
    latex text,
    display text,
    editable boolean,
    placeholder text
);

-- Assessment point composite type
CREATE TYPE assessment_point_type AS (
    id text,
    prompt text,
    answer_type text, -- 'text', 'number', 'choice', 'boolean'
    correct_answer text,
    options text[],
    explanation text
);

-- ============================================================================
-- DOMAIN TYPES FOR VALIDATION
-- ============================================================================

-- Score domain (0-1600 for SAT)
CREATE DOMAIN sat_score AS integer 
    CHECK (VALUE >= 200 AND VALUE <= 1600);

-- Percentage domain
CREATE DOMAIN percentage AS numeric(5,2) 
    CHECK (VALUE >= 0 AND VALUE <= 100);

-- Time duration domain (in seconds, max 1 hour)
CREATE DOMAIN duration_seconds AS integer 
    CHECK (VALUE >= 0 AND VALUE <= 3600);

-- Content hash domain
CREATE DOMAIN content_hash AS text 
    CHECK (char_length(VALUE) = 64); -- SHA-256 hash length

-- Version string domain
CREATE DOMAIN version_string AS text 
    CHECK (VALUE ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$'); -- Semantic versioning

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TYPE question_type IS 'Types of questions in the SAT system';
COMMENT ON TYPE subject IS 'Subject areas for SAT content';
COMMENT ON TYPE difficulty IS 'Question difficulty levels';
COMMENT ON TYPE passage_type IS 'Types of reading passages';
COMMENT ON TYPE solution_type IS 'Types of interactive solutions';
COMMENT ON TYPE graph_type IS 'Types of graphs and visual content';
COMMENT ON TYPE interaction_type IS 'Types of interactive elements';

COMMENT ON DOMAIN sat_score IS 'Valid SAT score range (200-1600)';
COMMENT ON DOMAIN percentage IS 'Percentage value (0-100)';
COMMENT ON DOMAIN duration_seconds IS 'Time duration in seconds (max 1 hour)';
COMMENT ON DOMAIN content_hash IS 'SHA-256 content hash for integrity';
COMMENT ON DOMAIN version_string IS 'Semantic version string (e.g., 1.0.0)';

COMMENT ON FUNCTION safe_add_enum_value(text, text) IS 'Safely add new enum value if it does not exist';
COMMENT ON FUNCTION get_enum_values(text) IS 'Get all enum values for a given enum type';