-- ============================================
-- Ensure enum label exists (safe to re-run)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'graph_type'
      AND e.enumlabel = 'function_graph'
  ) THEN
    ALTER TYPE graph_type ADD VALUE 'function_graph';
  END IF;
END$$;

-- ============================================
-- Helper to build render payload (drop & recreate)
-- ============================================
DROP FUNCTION IF EXISTS public.generate_interactive_render_payload(uuid);

CREATE FUNCTION public.generate_interactive_render_payload(interactive_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
           'type', i.solution_type,
           'graph', i.graph_config,
           'parameters', COALESCE(i.parameters, '[]'::jsonb),
           'steps', COALESCE(i.interactive_steps, '[]'::jsonb),
           'assessments', COALESCE(i.assessment_points, '[]'::jsonb)
         )
  FROM public.interactive_solutions i
  WHERE i.id = interactive_id
$$;

-- ============================================
-- 1) Content pack (idempotent upsert)
-- ============================================
WITH upsert_pack AS (
  INSERT INTO public.content_packs (
    slug, title, description, category, subject, difficulty,
    tags, status, access_level, question_count, created_by
  )
  VALUES (
    'sample-math-algebra-2025',
    'Sample Math Algebra Pack 2025',
    'Demonstration pack showcasing advanced question structure with interactive solutions',
    'math',
    'math',
    'medium',
    ARRAY['algebra','quadratic','interactive','sample'],
    'published',
    'free',
    1,
    auth.uid()
  )
  ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = now()
  RETURNING id
)
SELECT id AS pack_id FROM upsert_pack;

-- ============================================
-- 2) Passage (idempotent)
-- ============================================
INSERT INTO public.passages (
  reference_id, title, content, passage_type, subject, difficulty,
  word_count, estimated_time, key_concepts, created_by
) VALUES (
  'PASSAGE-MATH-CONTEXT-001',
  'Quadratic Functions in Real Life',
  'Quadratic functions appear frequently in physics and engineering. When an object is thrown upward, its height can be modeled by the equation h(t) = -16t² + v₀t + h₀, where h(t) is the height at time t, v₀ is the initial velocity, and h₀ is the initial height. The coefficient -16 represents the effect of gravity (in feet per second squared). Understanding the relationship between these variables allows engineers to predict trajectories and optimize designs.',
  'scientific',
  'math',
  'medium',
  67,
  120,
  ARRAY['quadratic functions','physics applications','trajectory modeling'],
  auth.uid()
)
ON CONFLICT (reference_id) DO NOTHING;

-- ============================================
-- 3) Graph (idempotent UPSERT with svg_data to satisfy constraint)
--    NOTE: include one of image_url/svg_data/canvas_data as NOT NULL.
-- ============================================
INSERT INTO public.graphs (
  reference_id,
  title,
  description,
  graph_type,
  subject,

  -- at least one must be non-null per chk_graph_has_visual_data:
  image_url,
  svg_data,
  canvas_data,

  is_interactive,
  interaction_config,
  functions,
  coordinate_system,
  alt_text,
  detailed_description,
  created_by
)
VALUES (
  'GRAPH-QUAD-TRAJECTORY-001',
  'Projectile Motion Parabola',
  'Interactive graph showing quadratic trajectory',
  'function_graph',
  'math',

  NULL,
  -- single-line minimal SVG to avoid parser issues
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="white"/><line x1="20" y1="180" x2="280" y2="180" stroke="black"/><line x1="20" y1="180" x2="20" y2="20" stroke="black"/><polyline fill="none" stroke="#2563eb" stroke-width="2" points="20,180 60,140 100,110 140,90 180,85 220,95 260,120"/></svg>',
  NULL,

  TRUE,
  NULL,
  '[
    {"equation":"y = -16x^2 + 64x + 80","domain":[0,5],"range":[0,144],"color":"#2563eb","label":"Height vs Time"}
  ]'::jsonb,
  '{
    "x_min":0,"x_max":5,"x_step":1,
    "y_min":0,"y_max":150,"y_step":20,
    "x_label":"Time (seconds)",
    "y_label":"Height (feet)",
    "grid_lines":true,
    "axis_labels":true
  }'::jsonb,
  'Graph showing parabolic trajectory of projectile motion',
  'Interactive coordinate plane displaying a quadratic function representing projectile motion. The parabola opens downward, showing maximum height around 2 seconds.',
  auth.uid()
)
ON CONFLICT (reference_id) DO UPDATE
SET
  title                 = EXCLUDED.title,
  description           = EXCLUDED.description,
  graph_type            = EXCLUDED.graph_type,
  subject               = EXCLUDED.subject,
  -- ensure one visual field is present after update too:
  image_url             = EXCLUDED.image_url,
  svg_data              = EXCLUDED.svg_data,
  canvas_data           = EXCLUDED.canvas_data,
  is_interactive        = EXCLUDED.is_interactive,
  interaction_config    = EXCLUDED.interaction_config,
  functions             = EXCLUDED.functions,
  coordinate_system     = EXCLUDED.coordinate_system,
  alt_text              = EXCLUDED.alt_text,
  detailed_description  = EXCLUDED.detailed_description,
  updated_at            = now();

-- ============================================
-- 4) Question (idempotent)
-- ============================================
INSERT INTO public.questions (
  pack_id, question_number, public_id, content, question_type,
  subject, topic, subtopic, difficulty,
  choices, correct_answer,
  solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases,
  passage_id, primary_graph_id,
  status, created_by
) VALUES (
  (SELECT id FROM public.content_packs WHERE slug='sample-math-algebra-2025'),
  1,
  'MATH-ALG-QUAD-001',
  'A ball is thrown upward from a height of 80 feet with an initial velocity of 64 feet per second. The height h(t) of the ball at time t seconds is given by the equation h(t) = -16t² + 64t + 80. At what time does the ball reach its maximum height?',
  'multiple_choice',
  'math',
  'Quadratic Functions',
  'Vertex Form and Optimization',
  'medium',
  '[
    {"id":"A","text":"1 second","explanation":"Incorrect. This would be if the coefficient of t were 32."},
    {"id":"B","text":"2 seconds","explanation":"Correct! Using the vertex formula t = -b/(2a) = -64/(2×-16) = 2 seconds."},
    {"id":"C","text":"3 seconds","explanation":"Incorrect. This is beyond the vertex of the parabola."},
    {"id":"D","text":"4 seconds","explanation":"Incorrect. At this time, the ball would be descending rapidly."}
  ]'::jsonb,
  'B',
  'To find the maximum height, we need to find the vertex of the parabola. For a quadratic function f(t) = at² + bt + c, the vertex occurs at t = -b/(2a). Here, a = -16 and b = 64, so t = -64/(2×-16) = -64/(-32) = 2 seconds.',
  'The maximum height occurs at the vertex of the parabolic path. Since the coefficient of t² is negative (-16), the parabola opens downward, confirming this is indeed a maximum.',
  'Remember that for a quadratic function in the form at² + bt + c, the vertex (maximum or minimum) occurs at t = -b/(2a).',
  false,
  90,
  ARRAY['vertex formula','maximum height','quadratic function','parabola vertex'],
  (SELECT id FROM public.passages WHERE reference_id='PASSAGE-MATH-CONTEXT-001'),
  (SELECT id FROM public.graphs   WHERE reference_id='GRAPH-QUAD-TRAJECTORY-001'),
  'published',
  auth.uid()
)
ON CONFLICT (public_id) DO UPDATE
SET
  pack_id          = EXCLUDED.pack_id,
  question_number  = EXCLUDED.question_number,
  content          = EXCLUDED.content,
  topic            = EXCLUDED.topic,
  subtopic         = EXCLUDED.subtopic,
  difficulty       = EXCLUDED.difficulty,
  choices          = EXCLUDED.choices,
  correct_answer   = EXCLUDED.correct_answer,
  solution_text    = EXCLUDED.solution_text,
  explanation      = EXCLUDED.explanation,
  hint             = EXCLUDED.hint,
  calculator_allowed = EXCLUDED.calculator_allowed,
  estimated_time   = EXCLUDED.estimated_time,
  key_phrases      = EXCLUDED.key_phrases,
  passage_id       = EXCLUDED.passage_id,
  primary_graph_id = EXCLUDED.primary_graph_id,
  status           = EXCLUDED.status,
  updated_at       = now();

-- ============================================
-- 5) Solution steps (idempotent upserts by (question_id, step_number))
-- ============================================
INSERT INTO public.solution_steps (
  question_id, step_number, title, description, step_type,
  from_expression, to_expression, explanation, hint,
  estimated_time, difficulty
) VALUES (
  (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001'),
  1,
  'Identify the Quadratic Function',
  'Recognize that h(t) = -16t² + 64t + 80 is in standard form',
  'concept',
  '{"latex":"h(t) = -16t^2 + 64t + 80","display":"h(t) = -16t² + 64t + 80"}'::jsonb,
  '{"latex":"at^2 + bt + c \\text{ where } a = -16, b = 64, c = 80","display":"at² + bt + c where a=-16, b=64, c=80"}'::jsonb,
  'This is a quadratic function in standard form. The negative coefficient of t² means the parabola opens downward, so it has a maximum point.',
  'Look for the pattern at² + bt + c and identify the coefficients.',
  20,
  'easy'
)
ON CONFLICT (question_id, step_number) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    step_type = EXCLUDED.step_type,
    from_expression = EXCLUDED.from_expression,
    to_expression = EXCLUDED.to_expression,
    explanation = EXCLUDED.explanation,
    hint = EXCLUDED.hint,
    estimated_time = EXCLUDED.estimated_time,
    difficulty = EXCLUDED.difficulty,
    updated_at = now();

INSERT INTO public.solution_steps (
  question_id, step_number, title, description, step_type,
  from_expression, to_expression, explanation, hint,
  estimated_time, difficulty
) VALUES (
  (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001'),
  2,
  'Apply the Vertex Formula',
  'Use t = -b/(2a) to find when the maximum occurs',
  'calculation',
  '{"latex":"t = -\\frac{b}{2a}","display":"t = -b/(2a)"}'::jsonb,
  '{"latex":"t = -\\frac{64}{2(-16)} = -\\frac{64}{-32} = 2","display":"t = -64/(2×-16) = -64/(-32) = 2"}'::jsonb,
  'The vertex formula gives the t-coordinate of the vertex. Since a < 0, this is a maximum.',
  'Substitute a = -16 and b = 64 into the vertex formula.',
  30,
  'medium'
)
ON CONFLICT (question_id, step_number) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    step_type = EXCLUDED.step_type,
    from_expression = EXCLUDED.from_expression,
    to_expression = EXCLUDED.to_expression,
    explanation = EXCLUDED.explanation,
    hint = EXCLUDED.hint,
    estimated_time = EXCLUDED.estimated_time,
    difficulty = EXCLUDED.difficulty,
    updated_at = now();

INSERT INTO public.solution_steps (
  question_id, step_number, title, description, step_type,
  from_expression, to_expression, explanation, hint,
  estimated_time, difficulty, related_concepts
) VALUES (
  (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001'),
  3,
  'Verify the Maximum',
  'Confirm that t = 2 gives the maximum height',
  'verification',
  '{"latex":"h(2) = -16(2)^2 + 64(2) + 80","display":"h(2) = -16(2)² + 64(2) + 80"}'::jsonb,
  '{"latex":"h(2) = -64 + 128 + 80 = 144 \\text{ feet}","display":"h(2) = -64 + 128 + 80 = 144 feet"}'::jsonb,
  'The ball reaches 144 feet at t = 2 seconds; derivative test would be zero at the vertex.',
  'Calculate h(2) and sanity-check the result.',
  25,
  'medium',
  ARRAY['derivative test','maximum verification','function evaluation']
)
ON CONFLICT (question_id, step_number) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    step_type = EXCLUDED.step_type,
    from_expression = EXCLUDED.from_expression,
    to_expression = EXCLUDED.to_expression,
    explanation = EXCLUDED.explanation,
    hint = EXCLUDED.hint,
    estimated_time = EXCLUDED.estimated_time,
    difficulty = EXCLUDED.difficulty,
    related_concepts = EXCLUDED.related_concepts,
    updated_at = now();

-- ============================================
-- 6) Interactive solution (idempotent on question_id)
-- ============================================
INSERT INTO public.interactive_solutions (
  question_id, solution_type, has_interactive_graph,
  graph_config, parameters, interactive_steps, assessment_points,
  calculator_type, version, created_by
) VALUES (
  (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001'),
  'graph',
  true,
  '{
    "type":"quadratic",
    "xRange":[0,5],
    "yRange":[0,150],
    "showGrid":true,
    "showAxis":true,
    "title":"Projectile Motion: Height vs Time",
    "interactive_elements":["vertex_point","trace_line","parameter_sliders"]
  }'::jsonb,
  '[
    {"name":"a","label":"Gravity coefficient","value":-16,"min":-20,"max":-10,"step":1,"description":"Controls gravity effect","locked":true},
    {"name":"v0","label":"Initial velocity (ft/s)","value":64,"min":20,"max":100,"step":4,"description":"Initial upward velocity"},
    {"name":"h0","label":"Initial height (ft)","value":80,"min":0,"max":120,"step":10,"description":"Starting height"}
  ]'::jsonb,
  '[
    {"id":"step-1","title":"Identify Key Components","description":"Find a, b, and c",
     "interaction":{"type":"fill_blank","prompt":"In h(t) = -16t² + 64t + 80, a=__, b=__, c=__","blanks":["a","b","c"],"correct_answers":["-16","64","80"]}},
    {"id":"step-2","title":"Apply Vertex Formula","description":"Compute t = -b/(2a)",
     "interaction":{"type":"input","prompt":"Compute t","expected_answer":"2","tolerance":0.1,"show_work":true}},
    {"id":"step-3","title":"Interactive Exploration","description":"Move sliders",
     "interaction":{"type":"slider","parameters":["v0","h0"],
       "observation_questions":["How does v0 change time to max height?","How does h0 change trajectory?"]}}
  ]'::jsonb,
  '[
    {"id":"checkpoint-1","prompt":"What happens to the vertex time if we double the initial velocity?",
     "answer_type":"choice","options":["Doubles","Stays the same","Halves","Quadruples"],
     "correct_answer":"Doubles",
     "explanation":"t = -b/(2a); doubling b doubles t (with a fixed)."}
  ]'::jsonb,
  'basic',
  '2.0.0',
  auth.uid()
)
ON CONFLICT (question_id) DO UPDATE
SET solution_type      = EXCLUDED.solution_type,
    has_interactive_graph = EXCLUDED.has_interactive_graph,
    graph_config       = EXCLUDED.graph_config,
    parameters         = EXCLUDED.parameters,
    interactive_steps  = EXCLUDED.interactive_steps,
    assessment_points  = EXCLUDED.assessment_points,
    calculator_type    = EXCLUDED.calculator_type,
    version            = EXCLUDED.version,
    updated_at         = now();

-- ============================================
-- 7) Render payload update
-- ============================================
UPDATE public.interactive_solutions i
SET render_payload = public.generate_interactive_render_payload(i.id),
    updated_at     = now()
WHERE i.question_id = (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001');

-- ============================================
-- 8) Tags (idempotent)
-- ============================================
INSERT INTO public.content_tags (name, slug, category, description, bloom_level, cognitive_complexity)
VALUES
 ('quadratic-functions','quadratic-functions','topic','Quadratic equations and parabolas','apply','medium'),
 ('vertex-formula','vertex-formula','skill','Using the vertex formula','apply','medium'),
 ('projectile-motion','projectile-motion','topic','Quadratic applications in physics','analyze','high'),
 ('optimization','optimization','skill','Finding extrema of functions','analyze','high'),
 ('interactive-solution','interactive-solution','format','Interactive step-by-step solutions','understand','low')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.content_tag_assignments
  (content_type, content_id, tag_id, confidence_score, assigned_by_ai, manually_verified)
SELECT
  'question', q.id, ct.id, 0.95, false, true
FROM public.questions q
JOIN public.content_tags ct ON ct.slug IN
('quadratic-functions','vertex-formula','projectile-motion','optimization','interactive-solution')
WHERE q.public_id='MATH-ALG-QUAD-001'
ON CONFLICT DO NOTHING;

-- ============================================
-- 9) Learning objective + link (idempotent)
-- ============================================
INSERT INTO public.learning_objectives (
  code, title, description, subject, standard_reference, bloom_level, dok_level, mastery_threshold
) VALUES (
  'ALG.F.IF.7a',
  'Graph quadratic functions and show intercepts, maxima, and minima',
  'Students will graph quadratic functions and identify key features including intercepts, maxima, and minima using algebraic methods',
  'math',
  'Common Core State Standards',
  'apply',
  3,
  80
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.content_learning_objectives (
  content_type, content_id, objective_id, alignment_strength, weight_percentage
) VALUES (
  'question',
  (SELECT id FROM public.questions WHERE public_id='MATH-ALG-QUAD-001'),
  (SELECT id FROM public.learning_objectives WHERE code='ALG.F.IF.7a'),
  'primary',
  100
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10) Verify
-- ============================================
SELECT 
  q.public_id,
  q.content,
  q.subject,
  q.topic,
  q.difficulty,
  cp.title AS pack_title,
  p.title  AS passage_title,
  g.title  AS graph_title,
  CASE WHEN is_interactive.question_id IS NOT NULL THEN 'Yes' ELSE 'No' END AS has_interactive,
  array_agg(DISTINCT ct.name) AS tags,
  max(lo.code) AS learning_objective
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
LEFT JOIN public.passages p ON p.id = q.passage_id
LEFT JOIN public.graphs   g ON g.id = q.primary_graph_id
LEFT JOIN public.interactive_solutions is_interactive ON is_interactive.question_id = q.id
LEFT JOIN public.content_tag_assignments cta ON cta.content_type='question' AND cta.content_id=q.id
LEFT JOIN public.content_tags ct ON ct.id = cta.tag_id
LEFT JOIN public.content_learning_objectives clo ON clo.content_type='question' AND clo.content_id=q.id
LEFT JOIN public.learning_objectives lo ON lo.id = clo.objective_id
WHERE q.public_id='MATH-ALG-QUAD-001'
GROUP BY q.public_id, q.content, q.subject, q.topic, q.difficulty,
         cp.title, p.title, g.title, is_interactive.question_id;

SELECT 
  q.public_id,
  jsonb_pretty(isol.render_payload) AS render_payload_preview
FROM public.questions q
JOIN public.interactive_solutions isol ON isol.question_id = q.id
WHERE q.public_id='MATH-ALG-QUAD-001';


-- ============================================
-- Update the interactive solution's render_payload with the new JSON
UPDATE public.interactive_solutions i
SET render_payload = $json$
{
  "formatVersion": "2.0.0",
  "type": "graph",
  "graph": {
    "type": "quadratic",
    "title": "Projectile Motion: Height vs Time",
    "xRange": [0, 5],
    "yRange": [0, 150],
    "xLabel": "Time (seconds)",
    "yLabel": "Height (feet)",
    "showAxis": true,
    "showGrid": true,
    "alt": "Parabolic height vs time for projectile; peak near t=2s.",
    "interactive_elements": ["vertex_point", "trace_line", "parameter_sliders"]
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Identify Key Components",
      "description": "Find a, b, and c",
      "points": 1,
      "interaction": {
        "type": "fill_blank",
        "prompt": "In h(t) = -16t² + 64t + 80, a=__, b=__, c=__",
        "blanks": ["a", "b", "c"],
        "correct_answers": ["-16", "64", "80"]
      }
    },
    {
      "id": "step-2",
      "title": "Apply Vertex Formula",
      "description": "Compute t = -b/(2a)",
      "points": 1,
      "interaction": {
        "type": "input",
        "prompt": "Compute t",
        "expected_answer": 2,
        "tolerance": 0.1,
        "show_work": true
      }
    },
    {
      "id": "step-3",
      "title": "Interactive Exploration",
      "description": "Move sliders",
      "interaction": {
        "type": "slider",
        "parameters": ["v0", "h0"],
        "observation_questions": [
          "How does v0 change time to max height?",
          "How does h0 change trajectory?"
        ]
      }
    }
  ],
  "parameters": [
    {
      "name": "a",
      "label": "Gravity coefficient",
      "value": -16,
      "min": -20,
      "max": -10,
      "step": 1,
      "locked": true,
      "description": "Controls gravity effect"
    },
    {
      "name": "v0",
      "label": "Initial velocity (ft/s)",
      "value": 64,
      "min": 20,
      "max": 100,
      "step": 4,
      "description": "Initial upward velocity"
    },
    {
      "name": "h0",
      "label": "Initial height (ft)",
      "value": 80,
      "min": 0,
      "max": 120,
      "step": 10,
      "description": "Starting height"
    }
  ],
  "assessments": [
    {
      "id": "checkpoint-1",
      "prompt": "What happens to the vertex time if we double the initial velocity?",
      "answer_type": "choice",
      "options": ["Doubles", "Stays the same", "Halves", "Quadruples"],
      "correct_answer": "Doubles",
      "explanation": "t = -b/(2a); doubling b doubles t (with a fixed).",
      "points": 1
    }
  ]
}
$json$::jsonb
WHERE i.question_id = (
  SELECT id FROM public.questions WHERE public_id = 'MATH-ALG-QUAD-001'
);
