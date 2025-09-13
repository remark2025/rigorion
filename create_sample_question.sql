-- Simple Sample Question Creation Script
-- Run this to create a complete sample question with all features

-- ============================================================================
-- 1. CREATE CONTENT PACK
-- ============================================================================
DO $$
DECLARE
    pack_uuid uuid;
    question_uuid uuid;
    passage_uuid uuid;
    interactive_uuid uuid;
BEGIN
    -- Create content pack
    INSERT INTO public.content_packs (
        slug, title, description, category, subject, difficulty, status, access_level, question_count
    ) VALUES (
        'demo-algebra-pack',
        'Demo Algebra Pack', 
        'Sample pack showing database capabilities',
        'math', 'math', 'medium', 'published', 'free', 1
    ) ON CONFLICT (slug) DO UPDATE SET
        updated_at = now()
    RETURNING id INTO pack_uuid;
    
    RAISE NOTICE 'Created pack: %', pack_uuid;

    -- ============================================================================
    -- 2. CREATE SUPPORTING PASSAGE
    -- ============================================================================
    INSERT INTO public.passages (
        reference_id, title, content, passage_type, subject, difficulty, 
        word_count, estimated_time, key_concepts
    ) VALUES (
        'DEMO-PASSAGE-001',
        'Quadratic Applications',
        'In physics, when an object is thrown upward, its height follows a quadratic pattern. The equation h(t) = -16t² + v₀t + h₀ models this motion, where t is time, v₀ is initial velocity, and h₀ is starting height. Understanding this relationship helps predict maximum heights and landing times.',
        'scientific', 'math', 'medium',
        45, 90,
        ARRAY['quadratic functions', 'physics', 'projectile motion']
    ) RETURNING id INTO passage_uuid;
    
    RAISE NOTICE 'Created passage: %', passage_uuid;

    -- ============================================================================  
    -- 3. CREATE MAIN QUESTION
    -- ============================================================================
    INSERT INTO public.questions (
        pack_id, question_number, public_id, content, question_type, 
        subject, topic, subtopic, difficulty,
        choices, correct_answer, solution_text, explanation, hint,
        calculator_allowed, estimated_time, key_phrases,
        passage_id, status
    ) VALUES (
        pack_uuid, 1, 'DEMO-MATH-001',
        'A ball is thrown upward from 6 feet with initial velocity 48 ft/s. Its height is h(t) = -16t² + 48t + 6. At what time does the ball reach maximum height?',
        'multiple_choice',
        'math', 'Quadratic Functions', 'Vertex and Maximum Values', 'medium',
        '[
            {"id": "A", "text": "0.5 seconds", "explanation": "Too early - this is not the vertex time."},
            {"id": "B", "text": "1.5 seconds", "explanation": "Correct! Using t = -b/(2a) = -48/(2×-16) = 1.5 seconds."},
            {"id": "C", "text": "2.5 seconds", "explanation": "Too late - the ball would be falling by this time."},
            {"id": "D", "text": "3 seconds", "explanation": "Way too late - the ball hits the ground around t = 3.1 seconds."}
        ]'::jsonb,
        'B',
        'To find maximum height time, use the vertex formula: t = -b/(2a). With a = -16 and b = 48: t = -48/(2×-16) = -48/(-32) = 1.5 seconds.',
        'The vertex of a downward-opening parabola (negative a-value) represents the maximum point of the function.',
        'For quadratic ax² + bx + c, the vertex occurs at x = -b/(2a).',
        false, 90,
        ARRAY['vertex formula', 'maximum height', 'quadratic vertex'],
        passage_uuid, 'published'
    ) RETURNING id INTO question_uuid;
    
    RAISE NOTICE 'Created question: %', question_uuid;

    -- ============================================================================
    -- 4. CREATE SOLUTION STEPS  
    -- ============================================================================
    INSERT INTO public.solution_steps (
        question_id, step_number, title, description, step_type,
        from_expression, to_expression, explanation, estimated_time, difficulty
    ) VALUES 
    (question_uuid, 1, 'Identify Quadratic Form', 
     'Recognize the standard form and identify coefficients', 'concept',
     '{"latex": "h(t) = -16t^2 + 48t + 6", "display": "h(t) = -16t² + 48t + 6"}'::jsonb,
     '{"latex": "a = -16, b = 48, c = 6", "display": "a = -16, b = 48, c = 6"}'::jsonb,
     'This is quadratic form at² + bt + c. Since a < 0, parabola opens downward with maximum.', 
     15, 'easy'),
     
    (question_uuid, 2, 'Apply Vertex Formula',
     'Use vertex formula to find time of maximum', 'calculation', 
     '{"latex": "t = -\\frac{b}{2a}", "display": "t = -b/(2a)"}'::jsonb,
     '{"latex": "t = -\\frac{48}{2(-16)} = \\frac{-48}{-32} = 1.5", "display": "t = -48/(2×-16) = 1.5"}'::jsonb,
     'The vertex formula gives the x-coordinate (time) where maximum occurs.',
     25, 'medium'),
     
    (question_uuid, 3, 'Verify Maximum Height',
     'Calculate the actual maximum height at t = 1.5', 'verification',
     '{"latex": "h(1.5) = -16(1.5)^2 + 48(1.5) + 6", "display": "h(1.5) = -16(1.5)² + 48(1.5) + 6"}'::jsonb,
     '{"latex": "h(1.5) = -36 + 72 + 6 = 42 \\text{ feet}", "display": "h(1.5) = -36 + 72 + 6 = 42 feet"}'::jsonb,
     'The maximum height is 42 feet, reached at t = 1.5 seconds.',
     20, 'medium');
    
    RAISE NOTICE 'Created solution steps';

    -- ============================================================================
    -- 5. CREATE INTERACTIVE SOLUTION
    -- ============================================================================
    INSERT INTO public.interactive_solutions (
        question_id, solution_type, has_interactive_graph, 
        graph_config, parameters, interactive_steps, calculator_type, version
    ) VALUES (
        question_uuid, 'graph', true,
        '{
            "type": "quadratic", 
            "xRange": [0, 4], 
            "yRange": [0, 50], 
            "showGrid": true,
            "showAxis": true,
            "title": "Ball Height vs Time"
        }'::jsonb,
        '[
            {
                "name": "v0", 
                "label": "Initial velocity (ft/s)", 
                "value": 48, 
                "min": 20, 
                "max": 80, 
                "step": 4,
                "description": "How fast the ball is thrown upward"
            },
            {
                "name": "h0",
                "label": "Starting height (ft)", 
                "value": 6,
                "min": 0,
                "max": 20,
                "step": 2,
                "description": "Height from which ball is thrown"
            }
        ]'::jsonb,
        '[
            {
                "id": "vertex-exploration",
                "title": "Find the Vertex",
                "description": "Use sliders to see how parameters affect the vertex location",
                "interaction": {
                    "type": "slider",
                    "instruction": "Move the sliders and observe how the maximum point changes"
                }
            }
        ]'::jsonb,
        'basic', '1.0.0'
    ) RETURNING id INTO interactive_uuid;
    
    RAISE NOTICE 'Created interactive solution: %', interactive_uuid;

    -- Generate render payload
    UPDATE public.interactive_solutions 
    SET render_payload = public.generate_interactive_render_payload(id)
    WHERE id = interactive_uuid;
    
    RAISE NOTICE 'Generated render payload';

    -- ============================================================================
    -- 6. ADD TAGS AND LEARNING OBJECTIVES
    -- ============================================================================
    
    -- Create tags if they don't exist
    INSERT INTO public.content_tags (name, slug, category, description, bloom_level) VALUES 
    ('quadratic-vertex', 'quadratic-vertex', 'skill', 'Finding vertex of quadratic functions', 'apply'),
    ('projectile-motion', 'projectile-motion', 'topic', 'Physics applications of quadratics', 'analyze'),
    ('demo-content', 'demo-content', 'general', 'Sample demonstration content', 'understand')
    ON CONFLICT (slug) DO NOTHING;
    
    -- Assign tags
    INSERT INTO public.content_tag_assignments (content_type, content_id, tag_id, confidence_score, manually_verified)
    SELECT 'question', question_uuid, ct.id, 0.95, true
    FROM public.content_tags ct 
    WHERE ct.slug IN ('quadratic-vertex', 'projectile-motion', 'demo-content');
    
    RAISE NOTICE 'Added tags';

    -- Create learning objective if it doesn't exist
    INSERT INTO public.learning_objectives (
        code, title, description, subject, bloom_level, dok_level, mastery_threshold
    ) VALUES (
        'DEMO.ALG.VERTEX', 
        'Find vertex of quadratic functions',
        'Students can identify and calculate the vertex of quadratic functions using algebraic methods',
        'math', 'apply', 2, 75
    ) ON CONFLICT (code) DO NOTHING;
    
    -- Link to learning objective
    INSERT INTO public.content_learning_objectives (content_type, content_id, objective_id, alignment_strength)
    SELECT 'question', question_uuid, lo.id, 'primary'
    FROM public.learning_objectives lo 
    WHERE lo.code = 'DEMO.ALG.VERTEX';
    
    RAISE NOTICE 'Linked learning objective';

    -- ============================================================================
    -- 7. SHOW FINAL RESULT
    -- ============================================================================
    RAISE NOTICE '=== SAMPLE QUESTION CREATED SUCCESSFULLY ===';
    RAISE NOTICE 'Pack ID: %', pack_uuid;
    RAISE NOTICE 'Question ID: %', question_uuid; 
    RAISE NOTICE 'Question Public ID: DEMO-MATH-001';
    RAISE NOTICE 'Interactive Solution ID: %', interactive_uuid;
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show the complete question with all relationships
SELECT 
    q.public_id,
    q.content,
    q.difficulty,
    cp.title as pack_title,
    p.title as passage_title,
    q.has_interactive,
    COUNT(ss.id) as solution_steps_count,
    array_agg(DISTINCT ct.name ORDER BY ct.name) as tags
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
LEFT JOIN public.passages p ON p.id = q.passage_id
LEFT JOIN public.solution_steps ss ON ss.question_id = q.id
LEFT JOIN public.content_tag_assignments cta ON cta.content_type = 'question' AND cta.content_id = q.id
LEFT JOIN public.content_tags ct ON ct.id = cta.tag_id
WHERE q.public_id = 'DEMO-MATH-001'
GROUP BY q.public_id, q.content, q.difficulty, cp.title, p.title, q.has_interactive;

-- Show solution steps
SELECT 
    step_number,
    title,
    description,
    step_type,
    difficulty,
    estimated_time
FROM public.solution_steps 
WHERE question_id = (SELECT id FROM public.questions WHERE public_id = 'DEMO-MATH-001')
ORDER BY step_number;

-- Show interactive solution summary
SELECT 
    solution_type,
    has_interactive_graph,
    calculator_type,
    version,
    CASE WHEN render_payload IS NOT NULL THEN 'Generated' ELSE 'Missing' END as render_payload_status
FROM public.interactive_solutions 
WHERE question_id = (SELECT id FROM public.questions WHERE public_id = 'DEMO-MATH-001');

-- Test search functionality
SELECT 
    content_type,
    title,
    rank,
    highlight
FROM public.search_content('quadratic vertex maximum', ARRAY['question', 'passage'], 'math', 'medium', 5, 0);

COMMENT ON SCRIPT IS 'This script creates a complete sample question demonstrating all key features of the new schema: content packs, questions, passages, solution steps, interactive solutions, tags, learning objectives, and search capabilities.';