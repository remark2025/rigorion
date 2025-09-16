-- Quick insert for CORE-001 interactive question
DELETE FROM interactive_solutions WHERE question_id IN (SELECT id FROM questions WHERE public_id LIKE 'CORE-%');
DELETE FROM questions WHERE public_id LIKE 'CORE-%';

-- Insert CORE-001: Linear Equation
INSERT INTO questions (
  public_id, pack_id, question_number, content, question_type, subject, topic, difficulty, 
  choices, correct_answer, solution_text, explanation, hint, 
  calculator_allowed, has_interactive, status
) VALUES (
  'CORE-001-INTERACTIVE', 
  'ecc14889-72b7-4e19-87a2-ceef01918429',
  5001,
  'If 3x + 5 = 17, what is the value of x?',
  'multiple_choice',
  'math',
  'Linear Equations',
  'easy',
  '[{"id": "A", "text": "3"}, {"id": "B", "text": "4"}, {"id": "C", "text": "5"}, {"id": "D", "text": "6"}]'::jsonb,
  '4',
  '3x + 5 = 17 → 3x = 12 → x = 4',
  'Solving for x: subtract 5 from both sides, then divide by 3.',
  'To solve for x, first subtract 5 from both sides, then divide by 3.',
  false,
  true,
  'published'
);

-- Insert interactive solution for CORE-001
INSERT INTO interactive_solutions (
  question_id, has_interactive_graph, render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'CORE-001-INTERACTIVE'),
  false,
  '{
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Start with the Equation",
        "explanation": "We have the linear equation 3x + 5 = 17"
      },
      {
        "id": "step-2",
        "title": "Subtract 5 from Both Sides",
        "explanation": "Subtracting 5 from both sides: (3x + 5) - 5 = 17 - 5 which gives us 3x = 12"
      },
      {
        "id": "step-3",
        "title": "Divide Both Sides by 3",
        "explanation": "Dividing both sides by 3: 3x ÷ 3 = 12 ÷ 3 which gives us x = 4"
      }
    ],
    "algebraSteps": true,
    "showWork": true,
    "allowInputValidation": true
  }'::jsonb
);