-- Insert interactive questions from core.json into the database
-- This will replace the existing questions with your interactive content

-- First, clean up existing data to avoid conflicts
DELETE FROM interactive_solutions;
DELETE FROM solution_steps;
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
) ON CONFLICT (pack_id, question_number) DO UPDATE SET
  content = EXCLUDED.content,
  has_interactive = EXCLUDED.has_interactive;

-- Insert interactive solution for CORE-001
INSERT INTO interactive_solutions (
  question_id, solution_type, has_interactive_graph, graph_config, parameters, render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'CORE-001-INTERACTIVE'),
  'step_builder',
  false,
  '{
    "type": "linear",
    "xRange": [-2, 8],
    "yRange": [-5, 25],
    "showGrid": true,
    "showAxis": true,
    "title": "Linear Equation: 3x + 5 = 17"
  }'::jsonb,
  '[
    {
      "name": "x",
      "label": "Variable x",
      "value": 4,
      "min": 0,
      "max": 10,
      "step": 1,
      "description": "The unknown value we are solving for"
    }
  ]'::jsonb,
  '{
    "graphConfig": {
      "type": "linear",
      "xRange": [-2, 8],
      "yRange": [-5, 25],
      "showGrid": true,
      "showAxis": true,
      "title": "Linear Equation: 3x + 5 = 17"
    },
    "parameters": [
      {
        "name": "x",
        "label": "Variable x",
        "value": 4,
        "min": 0,
        "max": 10,
        "step": 1,
        "description": "The unknown value we are solving for"
      }
    ],
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Start with the Equation",
        "description": "We have the linear equation 3x + 5 = 17",
        "fromExpression": {
          "latex": "3x + 5 = 17",
          "display": "3x + 5 = 17"
        },
        "toExpression": {
          "latex": "3x + 5 = 17",
          "display": "3x + 5 = 17"
        },
        "explanation": "This is our starting equation that we need to solve for x",
        "hint": "Identify what operation is done to x first"
      },
      {
        "id": "step-2",
        "title": "Subtract 5 from Both Sides",
        "description": "Eliminate the constant term by subtracting 5",
        "fromExpression": {
          "latex": "3x + 5 = 17",
          "display": "3x + 5 = 17"
        },
        "toExpression": {
          "latex": "3x = 12",
          "display": "3x = 12"
        },
        "explanation": "Subtracting 5 from both sides: (3x + 5) - 5 = 17 - 5",
        "hint": "What do you get when you subtract 5 from 17?",
        "interactive": {
          "type": "input",
          "correctAnswer": "12"
        }
      },
      {
        "id": "step-3",
        "title": "Divide Both Sides by 3",
        "description": "Isolate x by dividing both sides by the coefficient",
        "fromExpression": {
          "latex": "3x = 12",
          "display": "3x = 12"
        },
        "toExpression": {
          "latex": "x = 4",
          "display": "x = 4"
        },
        "explanation": "Dividing both sides by 3: 3x ÷ 3 = 12 ÷ 3",
        "hint": "What is 12 divided by 3?",
        "interactive": {
          "type": "input",
          "correctAnswer": "4"
        }
      }
    ],
    "algebraSteps": true,
    "showWork": true,
    "allowInputValidation": true
  }'::jsonb
);

-- Insert CORE-002: Triangle Classification
INSERT INTO questions (
  public_id, content, question_type, subject, topic, difficulty, 
  choices, correct_answer, solution_text, explanation, hint, 
  calculator_allowed, has_interactive, status
) VALUES (
  'CORE-002', 
  'A triangle has sides of length 5, 12, and 13. What type of triangle is it?',
  'multiple_choice',
  'math',
  'Triangle Classification', 
  'medium',
  '[{"id": "A", "text": "Acute"}, {"id": "B", "text": "Right"}, {"id": "C", "text": "Obtuse"}, {"id": "D", "text": "Equilateral"}]'::jsonb,
  'Right',
  'Check: 5² + 12² = 25 + 144 = 169 = 13²',
  'This is a right triangle because 5² + 12² = 13²',
  'Use the Pythagorean theorem: check if a² + b² = c²',
  true,
  true,
  'published'
);

-- Insert interactive solution for CORE-002
INSERT INTO interactive_solutions (
  question_id, solution_type, has_interactive_graph, graph_config, parameters, render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'CORE-002'),
  'step_builder',
  true,
  '{
    "type": "geometric",
    "xRange": [0, 15],
    "yRange": [0, 15],
    "showGrid": true,
    "showAxis": true,
    "title": "Triangle with sides 5, 12, 13"
  }'::jsonb,
  '[
    {
      "name": "a",
      "label": "Side a",
      "value": 5,
      "min": 1,
      "max": 20,
      "step": 1,
      "description": "First side of the triangle"
    },
    {
      "name": "b",
      "label": "Side b",
      "value": 12,
      "min": 1,
      "max": 20,
      "step": 1,
      "description": "Second side of the triangle"
    },
    {
      "name": "c",
      "label": "Side c (hypotenuse)",
      "value": 13,
      "min": 1,
      "max": 20,
      "step": 1,
      "description": "Longest side of the triangle"
    }
  ]'::jsonb,
  '{
    "triangleVisualization": true,
    "showPythagoreanCheck": true,
    "highlightRightAngle": true,
    "interactiveCalculator": true,
    "solutionSteps": [
      {
        "id": "step-1",
        "title": "Identify the Longest Side",
        "description": "Find the longest side to use as the hypotenuse",
        "fromExpression": {
          "latex": "\\text{Sides: } 5, 12, 13",
          "display": "Sides: 5, 12, 13"
        },
        "toExpression": {
          "latex": "\\text{Longest side: } c = 13",
          "display": "Longest side: c = 13"
        },
        "explanation": "The longest side (13) will be our potential hypotenuse",
        "hint": "Which of the three numbers is largest?"
      },
      {
        "id": "step-2",
        "title": "Calculate a² + b²",
        "description": "Square the two shorter sides and add them",
        "fromExpression": {
          "latex": "a^2 + b^2 = 5^2 + 12^2",
          "display": "a² + b² = 5² + 12²"
        },
        "toExpression": {
          "latex": "= 25 + 144 = 169",
          "display": "= 25 + 144 = 169"
        },
        "explanation": "5² = 25 and 12² = 144, so 25 + 144 = 169",
        "hint": "What is 5² and what is 12²?",
        "interactive": {
          "type": "input",
          "correctAnswer": "169"
        }
      }
    ]
  }'::jsonb
);

-- Insert CORE-003: Function Evaluation
INSERT INTO questions (
  public_id, content, question_type, subject, topic, difficulty, 
  choices, correct_answer, solution_text, explanation, hint, 
  calculator_allowed, has_interactive, status
) VALUES (
  'CORE-003', 
  'If f(x) = 2x² - 3x + 1, what is f(2)?',
  'multiple_choice',
  'math',
  'Function Evaluation',
  'hard',
  '[{"id": "A", "text": "3"}, {"id": "B", "text": "5"}, {"id": "C", "text": "7"}, {"id": "D", "text": "9"}]'::jsonb,
  '3',
  'f(2) = 2(2)² - 3(2) + 1 = 8 - 6 + 1 = 3',
  'Substitute x = 2 and follow order of operations',
  'Substitute x = 2 and follow the order of operations',
  false,
  true,
  'published'
);

-- Insert interactive solution for CORE-003
INSERT INTO interactive_solutions (
  question_id, solution_type, has_interactive_graph, graph_config, parameters, render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'CORE-003'),
  'step_builder',
  true,
  '{
    "type": "quadratic",
    "xRange": [-2, 4],
    "yRange": [-2, 10],
    "showGrid": true,
    "showAxis": true,
    "title": "f(x) = 2x² - 3x + 1"
  }'::jsonb,
  '[
    {
      "name": "x",
      "label": "Input value (x)",
      "value": 2,
      "min": -3,
      "max": 5,
      "step": 0.5,
      "description": "The x-value we are evaluating the function at"
    }
  ]'::jsonb,
  '{
    "functionGraph": true,
    "highlightPoint": {"x": 2, "y": 3},
    "showCalculationSteps": true,
    "allowParameterChange": true
  }'::jsonb
);

-- Insert CORE-009: Circle Area
INSERT INTO questions (
  public_id, content, question_type, subject, topic, difficulty, 
  choices, correct_answer, solution_text, explanation, hint, 
  calculator_allowed, has_interactive, status
) VALUES (
  'CORE-009', 
  'What is the area of a circle with diameter 10 units?',
  'multiple_choice',
  'math',
  'Circle Geometry',
  'hard',
  '[{"id": "A", "text": "25π"}, {"id": "B", "text": "50π"}, {"id": "C", "text": "100π"}, {"id": "D", "text": "200π"}]'::jsonb,
  '25π',
  'Diameter = 10, so radius = 5. Area = π(5)² = 25π',
  'Convert diameter to radius, then use A = πr²',
  'Remember that radius = diameter ÷ 2, and the area formula is A = πr²',
  true,
  true,
  'published'
);

-- Insert interactive solution for CORE-009
INSERT INTO interactive_solutions (
  question_id, solution_type, has_interactive_graph, graph_config, parameters, render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'CORE-009'),
  'step_builder',
  true,
  '{
    "type": "circle",
    "xRange": [-8, 8],
    "yRange": [-8, 8],
    "showGrid": true,
    "showAxis": true,
    "title": "Circle with diameter 10 units"
  }'::jsonb,
  '[
    {
      "name": "diameter",
      "label": "Diameter",
      "value": 10,
      "min": 2,
      "max": 16,
      "step": 1,
      "description": "The diameter of the circle"
    },
    {
      "name": "radius",
      "label": "Radius",
      "value": 5,
      "min": 1,
      "max": 8,
      "step": 0.5,
      "description": "The radius of the circle (diameter ÷ 2)"
    }
  ]'::jsonb,
  '{
    "circleVisualization": true,
    "showRadius": true,
    "showDiameter": true,
    "highlightArea": true,
    "showFormula": true
  }'::jsonb
);