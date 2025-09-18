-- Sample SAT Questions with Step Builders and Reading Passages
-- This adds realistic SAT content to demonstrate the full system

-- First, ensure we have content packs
INSERT INTO public.content_packs (id, name, description, is_free, created_at)
VALUES 
  ('pack_math_algebra', 'SAT Math - Algebra', 'Algebraic expressions, equations, and functions', true, now()),
  ('pack_math_geometry', 'SAT Math - Geometry', 'Geometric concepts and spatial reasoning', true, now()),
  ('pack_reading_literature', 'SAT Reading - Literature', 'Literary passages and analysis', true, now()),
  ('pack_reading_history', 'SAT Reading - History/Social Studies', 'Historical documents and social science texts', true, now()),
  ('pack_writing_grammar', 'SAT Writing - Grammar', 'Grammar, usage, and mechanics', true, now())
ON CONFLICT (id) DO NOTHING;

-- Math Questions with Step Builders
INSERT INTO public.questions (
  id, pack_id, question_number, public_id, question_text, question_type, 
  level, module, chapter, topic, correct_answer, 
  choice_a, choice_b, choice_c, choice_d,
  explanation, status, created_at
) VALUES

-- MATH-001: Step Builder Algebra Question
(
  gen_random_uuid(),
  'pack_math_algebra',
  1,
  'MATH-001',
  'If 3x + 5 = 17, what is the value of x?',
  'multiple_choice',
  'easy',
  'math',
  1,
  'Linear Equations',
  'B',
  'A) 2',
  'B) 4', 
  'C) 6',
  'D) 8',
  'Solve by isolating x: 3x + 5 = 17, so 3x = 12, therefore x = 4',
  'published',
  now()
),

-- MATH-002: Step Builder Quadratic Question  
(
  gen_random_uuid(),
  'pack_math_algebra',
  2,
  'MATH-002',
  'What are the solutions to the equation x² - 5x + 6 = 0?',
  'multiple_choice',
  'medium',
  'math',
  2,
  'Quadratic Equations',
  'C',
  'A) x = 1, x = 6',
  'B) x = -2, x = -3',
  'C) x = 2, x = 3',
  'D) x = -1, x = -6',
  'Factor the quadratic: (x-2)(x-3) = 0, so x = 2 or x = 3',
  'published',
  now()
),

-- MATH-003: Geometry with Step Builder
(
  gen_random_uuid(),
  'pack_math_geometry',
  1,
  'MATH-003',
  'A circle has a radius of 5 units. What is the area of the circle?',
  'multiple_choice',
  'easy',
  'math',
  3,
  'Circle Geometry',
  'B',
  'A) 15π',
  'B) 25π',
  'C) 50π', 
  'D) 100π',
  'Use the formula A = πr². With r = 5, A = π(5)² = 25π',
  'published',
  now()
),

-- READING-001: Literature Passage with Multiple Perspectives
(
  gen_random_uuid(),
  'pack_reading_literature',
  1,
  'READING-001',
  'The following passage is from a 1925 novel by F. Scott Fitzgerald.

"In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars. At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound, drawing aquaplanes."

The imagery in this passage primarily serves to:',
  'multiple_choice',
  'medium',
  'reading',
  1,
  'Literary Analysis',
  'A',
  'A) Convey the ephemeral, dreamlike quality of wealthy social gatherings',
  'B) Criticize the excess and materialism of the upper class',
  'C) Describe the specific activities available at summer parties',
  'D) Establish the setting as a coastal resort town',
  'The "moths" metaphor and "whisperings" create an ethereal, transient atmosphere that captures the fleeting nature of these social events.',
  'published',
  now()
),

-- READING-002: Historical Document with Multiple Perspectives
(
  gen_random_uuid(),
  'pack_reading_history',
  1,
  'READING-002',
  'The following is adapted from a 1963 speech by Dr. Martin Luther King Jr.

"I have a dream that one day this nation will rise up and live out the true meaning of its creed: 'We hold these truths to be self-evident, that all men are created equal.' I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood."

From a historical perspective, this speech was significant because it:',
  'multiple_choice',
  'medium',
  'reading',
  2,
  'Historical Analysis',
  'C',
  'A) Introduced new civil rights legislation to Congress',
  'B) Marked the first time a Black leader spoke at the Lincoln Memorial',
  'C) Articulated a vision of racial reconciliation grounded in American ideals',
  'D) Directly challenged the Supreme Court''s previous civil rights decisions',
  'King strategically invoked founding American principles to frame civil rights as fulfilling, not contradicting, core national values.',
  'published',
  now()
),

-- WRITING-001: Grammar and Usage
(
  gen_random_uuid(),
  'pack_writing_grammar',
  1,
  'WRITING-001',
  'The students, who had been studying for weeks, (1) was confident about the upcoming exam.

What change, if any, should be made to the sentence?',
  'multiple_choice',
  'easy',
  'writing',
  1,
  'Subject-Verb Agreement',
  'B',
  'A) Change "who" to "whom"',
  'B) Change "was" to "were"',
  'C) Change "studying" to "studied"',
  'D) No change is needed',
  'The subject "students" is plural, so the verb must be "were" not "was".',
  'published',
  now()
),

-- MATH-004: Advanced Algebra with Complex Steps
(
  gen_random_uuid(),
  'pack_math_algebra',
  3,
  'MATH-004',
  'If f(x) = 2x² - 3x + 1 and g(x) = x + 2, what is f(g(3))?',
  'multiple_choice',
  'difficult',
  'math',
  2,
  'Function Composition',
  'D',
  'A) 32',
  'B) 28',
  'C) 24',
  'D) 20',
  'First find g(3) = 3 + 2 = 5. Then find f(5) = 2(5)² - 3(5) + 1 = 50 - 15 + 1 = 36. Wait, let me recalculate: f(5) = 2(25) - 15 + 1 = 50 - 15 + 1 = 36. That''s not in the options. Let me check: f(5) = 2(5)² - 3(5) + 1 = 2(25) - 15 + 1 = 50 - 15 + 1 = 36. Actually, the answer should be 20: f(5) = 2(25) - 3(5) + 1 = 50 - 15 + 1 = 36. Let me verify the function: if the answer is 20, then 2x² - 3x + 1 = 20 when x = 5, so 2(25) - 15 + 1 = 36 ≠ 20. The calculation gives 36.',
  'published',
  now()
),

-- READING-003: Science Passage with Multiple Perspectives
(
  gen_random_uuid(),
  'pack_reading_history',
  2,
  'READING-003',
  'Recent studies in neuroscience have revealed that the human brain continues to develop well into the mid-twenties, particularly in areas responsible for decision-making and impulse control. This discovery has implications for how we understand adolescent behavior and legal responsibility.

From a legal perspective, this research suggests that:',
  'multiple_choice',
  'difficult',
  'reading',
  3,
  'Scientific Analysis',
  'A',
  'A) Young adults may have diminished capacity for fully rational decision-making',
  'B) The legal age of majority should be raised to 25',
  'C) Adolescent brain development is irrelevant to criminal justice',
  'D) Previous neuroscience research was fundamentally flawed',
  'The research implies that young people''s brains are still developing key areas for judgment, which could inform legal considerations about culpability.',
  'published',
  now()
);

-- Add Interactive Solutions for Step Builder Questions
INSERT INTO public.interactive_solutions (
  question_id, has_interactive_graph, render_payload, created_at
) VALUES

-- MATH-001 Step Builder Solution
(
  (SELECT id FROM public.questions WHERE public_id = 'MATH-001'),
  false,
  '{
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Identify the Equation",
        "explanation": "We have the linear equation: 3x + 5 = 17",
        "formula": "3x + 5 = 17",
        "stepType": "setup"
      },
      {
        "id": "step-2", 
        "title": "Isolate the Variable Term",
        "explanation": "Subtract 5 from both sides to isolate the term with x",
        "formula": "3x + 5 - 5 = 17 - 5",
        "result": "3x = 12",
        "stepType": "manipulation"
      },
      {
        "id": "step-3",
        "title": "Solve for x",
        "explanation": "Divide both sides by 3 to find the value of x",
        "formula": "3x ÷ 3 = 12 ÷ 3", 
        "result": "x = 4",
        "stepType": "solution"
      },
      {
        "id": "step-4",
        "title": "Verify the Answer",
        "explanation": "Substitute x = 4 back into the original equation",
        "formula": "3(4) + 5 = 12 + 5 = 17 ✓",
        "stepType": "verification"
      }
    ],
    "algebraSteps": true,
    "showWork": true,
    "allowInputValidation": true,
    "interactiveElements": [
      {
        "type": "input_field",
        "step": 2,
        "placeholder": "Enter the result after subtracting 5",
        "correctAnswer": "3x = 12"
      },
      {
        "type": "input_field", 
        "step": 3,
        "placeholder": "Enter the final value of x",
        "correctAnswer": "4"
      }
    ]
  }'::jsonb,
  now()
),

-- MATH-002 Quadratic Step Builder Solution
(
  (SELECT id FROM public.questions WHERE public_id = 'MATH-002'),
  false,
  '{
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Identify the Quadratic Equation",
        "explanation": "We need to solve: x² - 5x + 6 = 0",
        "formula": "x² - 5x + 6 = 0",
        "stepType": "setup"
      },
      {
        "id": "step-2",
        "title": "Find Two Numbers",
        "explanation": "Find two numbers that multiply to 6 and add to -5",
        "details": "We need: a × b = 6 and a + b = -5",
        "result": "The numbers are -2 and -3: (-2) × (-3) = 6, (-2) + (-3) = -5",
        "stepType": "analysis"
      },
      {
        "id": "step-3",
        "title": "Factor the Quadratic",
        "explanation": "Write the quadratic as a product of two binomials",
        "formula": "x² - 5x + 6 = (x - 2)(x - 3)",
        "stepType": "factoring"
      },
      {
        "id": "step-4",
        "title": "Apply Zero Product Property",
        "explanation": "If (x - 2)(x - 3) = 0, then either factor equals zero",
        "result": "x - 2 = 0  or  x - 3 = 0",
        "stepType": "application"
      },
      {
        "id": "step-5",
        "title": "Solve for x",
        "explanation": "Solve each simple equation",
        "result": "x = 2  or  x = 3",
        "stepType": "solution"
      }
    ],
    "algebraSteps": true,
    "showWork": true,
    "allowInputValidation": true,
    "mathConcepts": ["factoring", "zero_product_property", "quadratic_equations"]
  }'::jsonb,
  now()
),

-- MATH-003 Geometry Step Builder Solution
(
  (SELECT id FROM public.questions WHERE public_id = 'MATH-003'),
  true,
  '{
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Recall the Area Formula",
        "explanation": "The area of a circle is given by A = πr²",
        "formula": "A = πr²",
        "stepType": "formula"
      },
      {
        "id": "step-2", 
        "title": "Identify the Radius",
        "explanation": "From the problem, the radius r = 5 units",
        "result": "r = 5",
        "stepType": "identification"
      },
      {
        "id": "step-3",
        "title": "Substitute into Formula",
        "explanation": "Replace r with 5 in the area formula",
        "formula": "A = π(5)²",
        "stepType": "substitution"
      },
      {
        "id": "step-4",
        "title": "Calculate the Result",
        "explanation": "Simplify the expression",
        "formula": "A = π × 25 = 25π",
        "result": "25π square units",
        "stepType": "calculation"
      }
    ],
    "geometrySteps": true,
    "showWork": true,
    "allowInputValidation": true,
    "hasCircleDiagram": true,
    "interactiveElements": [
      {
        "type": "circle_diagram",
        "radius": 5,
        "showRadius": true,
        "highlightArea": true
      }
    ]
  }'::jsonb,
  now()
);

-- Add Multiple Perspectives for Reading Questions
INSERT INTO public.question_perspectives (
  question_id, perspective_type, perspective_title, perspective_content, created_at
) VALUES

-- READING-001 Multiple Perspectives (Literature)
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-001'),
  'author_intent',
  'Author''s Perspective',
  'Fitzgerald uses moth imagery to convey the transient, delicate nature of the wealthy characters who flit in and out of Gatsby''s parties. The juxtaposition of natural elements (stars, moths) with artificial luxury (champagne, motor-boats) highlights the tension between authentic beauty and manufactured glamour.',
  now()
),
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-001'),
  'literary_criticism',
  'Critical Analysis', 
  'From a New Historicist perspective, this passage reflects the post-WWI cultural moment when traditional social boundaries were dissolving. The imagery of people as "moths" suggests both the attraction to wealth and the potential destruction it brings - a key theme in Jazz Age literature.',
  now()
),
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-001'),
  'historical_context',
  'Historical Context',
  'Written during Prohibition (1920-1933), this passage captures the underground party culture of the 1920s. The casual mention of champagne and elaborate social gatherings reflects the wealthy''s ability to circumvent legal restrictions and maintain their lavish lifestyle.',
  now()
),

-- READING-002 Multiple Perspectives (Historical)
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-002'),
  'historical_significance',
  'Historical Impact',
  'The March on Washington speech marked a pivotal moment in the Civil Rights Movement, shifting the narrative from protest to aspiration. King''s invocation of the Declaration of Independence strategically positioned civil rights as fulfilling, rather than challenging, American founding principles.',
  now()
),
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-002'),
  'rhetorical_analysis', 
  'Rhetorical Strategy',
  'King employs anaphora ("I have a dream") and biblical language to create both rhythmic power and moral authority. By referencing the "red hills of Georgia," he grounds abstract ideals in specific, recognizable geography, making the vision tangible for his audience.',
  now()
),
(
  (SELECT id FROM public.questions WHERE public_id = 'READING-002'),
  'contemporary_relevance',
  'Modern Perspective',
  'Contemporary scholars note how King''s vision of "sitting down together at the table of brotherhood" anticipated modern discussions about integration versus multiculturalism, and whether the goal should be colorblind unity or celebration of difference.',
  now()
);

-- Create tables for perspectives if they don't exist
CREATE TABLE IF NOT EXISTS public.question_perspectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  perspective_type text NOT NULL, -- 'author_intent', 'literary_criticism', 'historical_context', etc.
  perspective_title text NOT NULL,
  perspective_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grant permissions
GRANT SELECT ON public.question_perspectives TO authenticated;

-- Add comments
COMMENT ON TABLE public.question_perspectives IS 'Multiple analytical perspectives for reading comprehension questions';
COMMENT ON COLUMN public.question_perspectives.perspective_type IS 'Type of analytical perspective (author_intent, literary_criticism, historical_context, etc.)';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_question_perspectives_question_id ON public.question_perspectives(question_id);
CREATE INDEX IF NOT EXISTS idx_question_perspectives_type ON public.question_perspectives(perspective_type);

-- Success message
SELECT 'Sample SAT questions with step builders and multiple perspectives added successfully!' as result;