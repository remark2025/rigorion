-- Comprehensive SAT Questions with Interactive Solutions
-- This includes Math, Reading, and Writing questions with various interactive features

-- First, let's add more content packs
INSERT INTO public.content_packs (id, title, slug, description, subject, version, status) VALUES 
('pack-math-advanced', 'Advanced SAT Math', 'advanced-sat-math', 'Complex math problems with interactive step-by-step solutions', 'math', '1.0', 'published'),
('pack-reading-comp', 'SAT Reading Comprehension', 'sat-reading-comp', 'Reading passages with analysis and comprehension questions', 'reading', '1.0', 'published'),
('pack-writing-grammar', 'SAT Writing & Language', 'sat-writing-grammar', 'Grammar, style, and writing mechanics questions', 'writing', '1.0', 'published')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =======================
-- INTERACTIVE MATH QUESTIONS
-- =======================

-- Question 1: Complex Numbers (Advanced Math)
INSERT INTO public.questions (
  id, public_id, pack_id, content, question_type, subject, topic, subtopic, 
  difficulty, choices, correct_answer, solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases, has_interactive, status
) VALUES (
  gen_random_uuid(), 'MATH-COMPLEX-001', 'pack-math-advanced',
  'If z = 3 + 4i and w = 1 - 2i, what is the value of z × w in the form a + bi?',
  'multiple_choice', 'math', 'Complex Numbers', 'Multiplication',
  'hard', 
  '["11 - 2i", "11 + 2i", "7 - 2i", "-5 + 10i"]'::json,
  'A', 
  'To multiply complex numbers: (3 + 4i)(1 - 2i) = 3(1) + 3(-2i) + 4i(1) + 4i(-2i) = 3 - 6i + 4i - 8i² = 3 - 2i - 8(-1) = 3 - 2i + 8 = 11 - 2i',
  'When multiplying complex numbers, use FOIL and remember that i² = -1',
  'Remember: i² = -1 when simplifying',
  true, 240, 
  '["complex numbers", "multiplication", "imaginary unit", "FOIL"]'::text[],
  true, 'published'
);

-- Solution steps for Complex Numbers
INSERT INTO public.solution_steps (id, question_id, step_number, title, description, step_type, explanation, hint, from_expression, to_expression) VALUES
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-COMPLEX-001'), 1, 'Set up multiplication', 'Write out the multiplication of two complex numbers', 'setup', 'We need to multiply (3 + 4i) × (1 - 2i)', 'Use the distributive property (FOIL)', '(3 + 4i) × (1 - 2i)', '(3 + 4i)(1 - 2i)'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-COMPLEX-001'), 2, 'Apply FOIL method', 'Multiply each term in the first complex number by each term in the second', 'calculation', 'First: 3 × 1 = 3, Outer: 3 × (-2i) = -6i, Inner: 4i × 1 = 4i, Last: 4i × (-2i) = -8i²', 'Remember i² = -1', '(3 + 4i)(1 - 2i)', '3 - 6i + 4i - 8i²'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-COMPLEX-001'), 3, 'Simplify i² term', 'Replace i² with -1 and simplify', 'simplification', 'Since i² = -1, we have -8i² = -8(-1) = 8', 'i² always equals -1', '3 - 6i + 4i - 8i²', '3 - 6i + 4i + 8'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-COMPLEX-001'), 4, 'Combine like terms', 'Add real parts and imaginary parts separately', 'combination', 'Real parts: 3 + 8 = 11, Imaginary parts: -6i + 4i = -2i', 'Group real and imaginary terms', '3 - 6i + 4i + 8', '11 - 2i');

-- Interactive solution for Complex Numbers
INSERT INTO public.interactive_solutions (
  id, question_id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload
) VALUES (
  gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-COMPLEX-001'),
  'step_by_step_builder', true,
  '{"type": "complex_plane", "xRange": [-2, 12], "yRange": [-3, 5], "gridlines": true, "axes": true, "interactive": true}'::json,
  '["z", "w", "product"]'::json,
  '[{"id": "step1", "type": "input", "prompt": "Enter the first term after FOIL"}, {"id": "step2", "type": "calculation", "operation": "multiply"}, {"id": "step3", "type": "simplification", "rule": "i_squared"}]'::json,
  '[{"step": 2, "points": 2}, {"step": 4, "points": 3}]'::json,
  '{
    "type": "interactive_complex_multiplication",
    "title": "Complex Number Multiplication Visualizer",
    "description": "Step through multiplying two complex numbers with visual representation on the complex plane",
    "components": {
      "complex_plane": {
        "show_points": true,
        "show_vectors": true,
        "animate_multiplication": true,
        "highlight_steps": true
      },
      "step_builder": {
        "allow_input": true,
        "validate_steps": true,
        "show_hints": true,
        "track_progress": true
      },
      "calculation_area": {
        "show_foil_breakdown": true,
        "highlight_like_terms": true,
        "animate_simplification": true
      }
    },
    "initial_values": {
      "z": {"real": 3, "imaginary": 4},
      "w": {"real": 1, "imaginary": -2}
    }
  }'::json
);

-- Question 2: Quadratic Functions with Graph Analysis
INSERT INTO public.questions (
  id, public_id, pack_id, content, question_type, subject, topic, subtopic, 
  difficulty, choices, correct_answer, solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases, has_interactive, status
) VALUES (
  gen_random_uuid(), 'MATH-QUAD-GRAPH-001', 'pack-math-advanced',
  'The function f(x) = -2x² + 8x - 6 represents the height of a projectile. At what x-value does the projectile reach its maximum height?',
  'multiple_choice', 'math', 'Quadratic Functions', 'Vertex Form',
  'medium', 
  '["x = 2", "x = 3", "x = 4", "x = 6"]'::json,
  'A', 
  'For a quadratic f(x) = ax² + bx + c, the vertex x-coordinate is x = -b/(2a). Here a = -2, b = 8, so x = -8/(2(-2)) = -8/(-4) = 2',
  'The maximum occurs at the vertex of the parabola since a < 0',
  'Use the vertex formula: x = -b/(2a)',
  true, 180, 
  '["quadratic function", "vertex", "maximum", "parabola"]'::text[],
  true, 'published'
);

-- Solution steps for Quadratic Graph
INSERT INTO public.solution_steps (id, question_id, step_number, title, description, step_type, explanation, hint, from_expression, to_expression) VALUES
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-QUAD-GRAPH-001'), 1, 'Identify coefficients', 'Extract a, b, c from the quadratic function', 'identification', 'In f(x) = -2x² + 8x - 6, we have a = -2, b = 8, c = -6', 'Compare with f(x) = ax² + bx + c', 'f(x) = -2x² + 8x - 6', 'a = -2, b = 8, c = -6'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-QUAD-GRAPH-001'), 2, 'Apply vertex formula', 'Use x = -b/(2a) to find the vertex x-coordinate', 'formula_application', 'The vertex x-coordinate is x = -b/(2a) = -8/(2(-2))', 'This formula gives the axis of symmetry', 'x = -b/(2a)', 'x = -8/(2(-2))'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-QUAD-GRAPH-001'), 3, 'Calculate the result', 'Simplify the fraction to get the answer', 'calculation', 'x = -8/(-4) = 2', 'Be careful with the negative signs', 'x = -8/(2(-2))', 'x = 2');

-- Interactive solution for Quadratic Graph
INSERT INTO public.interactive_solutions (
  id, question_id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload
) VALUES (
  gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-QUAD-GRAPH-001'),
  'graphical_analysis', true,
  '{"type": "function_graph", "xRange": [-1, 5], "yRange": [-10, 5], "gridlines": true, "axes": true, "interactive": true, "show_vertex": true}'::json,
  '["a", "b", "c", "vertex_x", "vertex_y"]'::json,
  '[{"id": "identify", "type": "coefficient_identification"}, {"id": "vertex_formula", "type": "formula_application"}, {"id": "graph_analysis", "type": "interactive_graph"}]'::json,
  '[{"step": 1, "points": 1}, {"step": 2, "points": 2}, {"step": 3, "points": 2}]'::json,
  '{
    "type": "interactive_quadratic_analyzer",
    "title": "Quadratic Function Vertex Finder",
    "description": "Explore how to find the vertex of a quadratic function both algebraically and graphically",
    "components": {
      "graph": {
        "show_parabola": true,
        "highlight_vertex": true,
        "show_axis_of_symmetry": true,
        "allow_dragging": false,
        "show_coordinates": true
      },
      "coefficient_panel": {
        "editable": false,
        "highlight_on_hover": true,
        "show_relationships": true
      },
      "formula_builder": {
        "step_by_step": true,
        "show_substitution": true,
        "validate_input": true
      }
    },
    "function_data": {
      "equation": "f(x) = -2x² + 8x - 6",
      "coefficients": {"a": -2, "b": 8, "c": -6},
      "vertex": {"x": 2, "y": 2},
      "domain": [-1, 5],
      "range": [-10, 5]
    }
  }'::json
);

-- =======================
-- READING COMPREHENSION QUESTIONS
-- =======================

-- Add a passage first
INSERT INTO public.passages (id, title, content, source, reference_id, word_count, reading_level, passage_type) VALUES (
  gen_random_uuid(), 'The Impact of Climate Change on Ocean Ecosystems', 
  'Climate change represents one of the most pressing challenges of our time, with far-reaching consequences for marine ecosystems worldwide. As global temperatures rise, ocean temperatures increase correspondingly, leading to a cascade of effects that ripple through marine food webs.

One of the most visible impacts is coral bleaching. When water temperatures rise even slightly above normal ranges, corals expel the symbiotic algae living in their tissues, causing them to turn white or "bleach." Without these algae, which provide corals with up to 90% of their energy through photosynthesis, the coral organisms become severely stressed and may die if conditions do not improve quickly.

Beyond coral reefs, rising ocean temperatures affect the distribution of marine species. Many fish species are migrating toward the poles in search of cooler waters, disrupting traditional fishing grounds and local economies dependent on these resources. Additionally, warmer waters hold less dissolved oxygen, creating "dead zones" where marine life cannot survive.

The acidification of oceans, caused by increased absorption of atmospheric carbon dioxide, presents another significant threat. As seawater becomes more acidic, it becomes increasingly difficult for shell-forming organisms like mollusks and some plankton to build and maintain their calcium carbonate structures. This not only affects these species directly but also impacts the entire food web that depends on them.',
  'Environmental Science Quarterly', 'ESQ-2024-001', 287, 'college', 'scientific_article'
);

-- Reading Question 1: Main Idea
INSERT INTO public.questions (
  id, public_id, pack_id, content, question_type, subject, topic, subtopic, 
  difficulty, choices, correct_answer, solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases, has_interactive, status, passage_id
) VALUES (
  gen_random_uuid(), 'READ-CLIMATE-001', 'pack-reading-comp',
  'The primary purpose of this passage is to:',
  'multiple_choice', 'reading', 'Reading Comprehension', 'Main Idea',
  'medium', 
  '["Explain the causes of climate change", "Describe various effects of climate change on marine ecosystems", "Argue for immediate action against global warming", "Compare different ocean conservation strategies"]'::json,
  'B', 
  'The passage systematically describes multiple ways climate change affects marine ecosystems: coral bleaching, species migration, dead zones, and ocean acidification.',
  'The passage focuses on effects rather than causes or solutions',
  'Look for what the passage spends most of its time discussing',
  false, 120, 
  '["main idea", "purpose", "climate change", "marine ecosystems"]'::text[],
  true, 'published', (SELECT id FROM passages WHERE reference_id = 'ESQ-2024-001')
);

-- Solution steps for Reading Question
INSERT INTO public.solution_steps (id, question_id, step_number, title, description, step_type, explanation, hint, from_expression, to_expression) VALUES
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'READ-CLIMATE-001'), 1, 'Identify the topic', 'Determine what the passage is primarily about', 'analysis', 'The passage discusses climate change and its effects on ocean ecosystems', 'Look at the title and opening sentence', 'Passage content', 'Topic: Climate change effects on oceans'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'READ-CLIMATE-001'), 2, 'Analyze the structure', 'Look at how the passage is organized', 'structural_analysis', 'Each paragraph discusses a different effect: coral bleaching, species migration, dead zones, acidification', 'Notice the pattern in paragraph organization', 'Paragraph structure', 'Multiple effects described'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'READ-CLIMATE-001'), 3, 'Evaluate answer choices', 'Compare each option to the passage content', 'evaluation', 'Choice B matches the passage structure of describing various effects', 'Eliminate choices that are too narrow or broad', 'Answer choices', 'Choice B: Describe various effects');

-- Interactive solution for Reading
INSERT INTO public.interactive_solutions (
  id, question_id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload
) VALUES (
  gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'READ-CLIMATE-001'),
  'text_analysis', false, null,
  '["main_idea", "supporting_details", "text_structure"]'::json,
  '[{"id": "highlight", "type": "text_highlighting"}, {"id": "structure", "type": "structure_mapping"}, {"id": "elimination", "type": "answer_elimination"}]'::json,
  '[{"step": 1, "points": 1}, {"step": 2, "points": 2}, {"step": 3, "points": 2}]'::json,
  '{
    "type": "interactive_reading_analyzer",
    "title": "Reading Comprehension Strategy Tool",
    "description": "Learn to identify main ideas and analyze text structure",
    "components": {
      "text_highlighter": {
        "allow_highlighting": true,
        "color_coding": {
          "main_idea": "yellow",
          "supporting_details": "blue", 
          "examples": "green"
        },
        "show_annotations": true
      },
      "structure_mapper": {
        "show_paragraph_functions": true,
        "highlight_transitions": true,
        "show_logical_flow": true
      },
      "answer_analyzer": {
        "elimination_tool": true,
        "evidence_finder": true,
        "choice_comparison": true
      }
    },
    "passage_data": {
      "paragraphs": [
        {"id": 1, "function": "introduction", "main_point": "Climate change affects marine ecosystems"},
        {"id": 2, "function": "specific_effect", "main_point": "Coral bleaching explanation"},
        {"id": 3, "function": "additional_effects", "main_point": "Species migration and dead zones"},
        {"id": 4, "function": "another_effect", "main_point": "Ocean acidification"}
      ]
    }
  }'::json
);

-- =======================
-- WRITING & LANGUAGE QUESTIONS  
-- =======================

-- Writing Question 1: Grammar and Style
INSERT INTO public.questions (
  id, public_id, pack_id, content, question_type, subject, topic, subtopic, 
  difficulty, choices, correct_answer, solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases, has_interactive, status
) VALUES (
  gen_random_uuid(), 'WRITE-GRAMMAR-001', 'pack-writing-grammar',
  'The research team, which had been working on the project for three years, [1] finally published their findings. Which choice provides the most effective transition and maintains the formal tone?',
  'multiple_choice', 'writing', 'Grammar', 'Sentence Structure',
  'medium', 
  '["finally published their findings", "ended up publishing their findings", "got around to publishing their findings", "managed to publish their findings"]'::json,
  'A', 
  'Choice A maintains the formal, academic tone appropriate for discussing research. The other choices use informal language (ended up, got around to, managed to) that doesn\'t match the context.',
  'Consider which option maintains consistency with the formal tone established by "research team" and "project"',
  'Look for the choice that matches the formality level of the sentence',
  false, 90, 
  '["grammar", "tone", "formal writing", "transitions"]'::text[],
  true, 'published'
);

-- Solution steps for Writing Question
INSERT INTO public.solution_steps (id, question_id, step_number, title, description, step_type, explanation, hint, from_expression, to_expression) VALUES
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'WRITE-GRAMMAR-001'), 1, 'Identify the tone', 'Determine the appropriate tone for the context', 'analysis', 'The sentence discusses a research team and their project, indicating a formal, academic context', 'Look at words like "research team" and "project"', 'Context analysis', 'Formal, academic tone required'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'WRITE-GRAMMAR-001'), 2, 'Evaluate formality levels', 'Compare the formality of each choice', 'comparison', 'A: formal, B: informal ("ended up"), C: casual ("got around to"), D: implies difficulty ("managed to")', 'Consider which phrases you\'d use in academic writing', 'Choice evaluation', 'A is most formal'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'WRITE-GRAMMAR-001'), 3, 'Check meaning and emphasis', 'Ensure the choice conveys the right meaning', 'verification', 'Choice A emphasizes the completion after a long period, which fits the "three years" context', 'The word "finally" connects well with "three years"', 'Meaning check', 'A provides best emphasis');

-- Interactive solution for Writing
INSERT INTO public.interactive_solutions (
  id, question_id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload
) VALUES (
  gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'WRITE-GRAMMAR-001'),
  'writing_analysis', false, null,
  '["tone", "formality", "context", "word_choice"]'::json,
  '[{"id": "tone_analysis", "type": "context_evaluation"}, {"id": "formality_ranking", "type": "choice_comparison"}, {"id": "style_check", "type": "consistency_verification"}]'::json,
  '[{"step": 1, "points": 1}, {"step": 2, "points": 2}, {"step": 3, "points": 2}]'::json,
  '{
    "type": "interactive_writing_editor",
    "title": "Writing Style and Tone Analyzer",
    "description": "Learn to evaluate tone, formality, and style consistency in writing",
    "components": {
      "tone_meter": {
        "show_formality_scale": true,
        "highlight_tone_markers": true,
        "compare_choices": true
      },
      "context_analyzer": {
        "identify_clues": true,
        "show_expectations": true,
        "highlight_key_words": true
      },
      "choice_comparator": {
        "side_by_side_view": true,
        "formality_rankings": true,
        "appropriateness_scores": true
      }
    },
    "sentence_data": {
      "context": "academic/research",
      "target_audience": "scholarly",
      "formality_level": "high",
      "key_indicators": ["research team", "project", "three years"]
    }
  }'::json
);

-- Add more diverse questions...

-- Question 3: Statistics and Data Analysis
INSERT INTO public.questions (
  id, public_id, pack_id, content, question_type, subject, topic, subtopic, 
  difficulty, choices, correct_answer, solution_text, explanation, hint,
  calculator_allowed, estimated_time, key_phrases, has_interactive, status
) VALUES (
  gen_random_uuid(), 'MATH-STATS-001', 'pack-math-advanced',
  'A survey of 100 students found that the mean score on a test was 78 with a standard deviation of 12. Assuming the scores are normally distributed, approximately how many students scored between 66 and 90?',
  'multiple_choice', 'math', 'Statistics', 'Normal Distribution',
  'medium', 
  '["68 students", "95 students", "50 students", "34 students"]'::json,
  'A', 
  'The range 66 to 90 represents mean ± 1 standard deviation (78 ± 12). In a normal distribution, approximately 68% of data falls within 1 standard deviation of the mean. 68% of 100 = 68 students.',
  '66 = 78 - 12 and 90 = 78 + 12, so this is the 68-95-99.7 rule',
  'Remember the empirical rule: 68% within 1 SD, 95% within 2 SD',
  true, 150, 
  '["statistics", "normal distribution", "standard deviation", "empirical rule"]'::text[],
  true, 'published'
);

-- Solution steps for Statistics
INSERT INTO public.solution_steps (id, question_id, step_number, title, description, step_type, explanation, hint, from_expression, to_expression) VALUES
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-STATS-001'), 1, 'Identify the bounds', 'Express the range in terms of standard deviations', 'identification', 'Lower bound: 66 = 78 - 12 = μ - σ, Upper bound: 90 = 78 + 12 = μ + σ', 'Compare each bound to the mean', '66 to 90', 'μ - σ to μ + σ'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-STATS-001'), 2, 'Apply empirical rule', 'Use the 68-95-99.7 rule for normal distributions', 'rule_application', '68% of data falls within 1 standard deviation of the mean', 'This is a fundamental property of normal distributions', '1 standard deviation', '68% of data'),
(gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-STATS-001'), 3, 'Calculate number of students', 'Convert percentage to actual count', 'calculation', '68% of 100 students = 0.68 × 100 = 68 students', 'Multiply the percentage by the total', '68% of 100', '68 students');

-- Interactive solution for Statistics
INSERT INTO public.interactive_solutions (
  id, question_id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload
) VALUES (
  gen_random_uuid(), (SELECT id FROM questions WHERE public_id = 'MATH-STATS-001'),
  'statistical_visualization', true,
  '{"type": "normal_distribution", "xRange": [42, 114], "yRange": [0, 0.035], "showCurve": true, "showShading": true, "interactive": true}'::json,
  '["mean", "std_dev", "bounds", "percentage"]'::json,
  '[{"id": "identify_bounds", "type": "range_identification"}, {"id": "apply_rule", "type": "empirical_rule"}, {"id": "calculate", "type": "percentage_calculation"}]'::json,
  '[{"step": 1, "points": 2}, {"step": 2, "points": 2}, {"step": 3, "points": 1}]'::json,
  '{
    "type": "interactive_normal_distribution",
    "title": "Normal Distribution Analysis Tool",
    "description": "Visualize and calculate probabilities using the empirical rule",
    "components": {
      "distribution_curve": {
        "show_bell_curve": true,
        "highlight_regions": true,
        "show_standard_deviations": true,
        "interactive_shading": true
      },
      "empirical_rule_panel": {
        "show_68_95_997": true,
        "highlight_current_range": true,
        "percentage_calculator": true
      },
      "calculation_steps": {
        "step_by_step_breakdown": true,
        "formula_display": true,
        "final_answer_highlight": true
      }
    },
    "distribution_data": {
      "mean": 78,
      "std_deviation": 12,
      "sample_size": 100,
      "target_range": [66, 90],
      "z_scores": [-1, 1]
    }
  }'::json
);

-- Success message
SELECT 'Successfully inserted comprehensive SAT questions with interactive solutions!' as result;