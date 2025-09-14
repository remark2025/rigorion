-- Fix the render_payload for MATH-LINEAR-001
UPDATE public.interactive_solutions 
SET render_payload = '{
  "type": "graph",
  "graph": {
    "alt": "Linear graph showing slope calculation between two points",
    "type": "linear",
    "title": "Linear Function: Slope Calculation", 
    "xLabel": "X-axis",
    "xRange": [0, 8],
    "yLabel": "Y-axis", 
    "yRange": [0, 12],
    "showAxis": true,
    "showGrid": true,
    "interactive_elements": ["points", "line", "slope_triangle"]
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Identify the Points", 
      "points": 1,
      "description": "Label the coordinates as (x₁, y₁) and (x₂, y₂)",
      "interaction": {
        "type": "fill_blank",
        "blanks": ["x1", "y1", "x2", "y2"],
        "prompt": "Point 1: (__,__) Point 2: (__,__)",
        "correct_answers": ["2", "3", "6", "11"]
      }
    },
    {
      "id": "step-2",
      "title": "Apply Slope Formula",
      "points": 1, 
      "description": "Calculate m = (y₂ - y₁)/(x₂ - x₁)",
      "interaction": {
        "type": "input",
        "prompt": "What is the slope?",
        "show_work": true,
        "tolerance": 0.1,
        "expected_answer": 2
      }
    }
  ],
  "parameters": [
    {
      "name": "x1",
      "label": "Point 1 X-coordinate",
      "value": 2,
      "min": 0,
      "max": 8,
      "step": 1,
      "locked": true,
      "description": "X-coordinate of first point"
    },
    {
      "name": "y1",
      "label": "Point 1 Y-coordinate", 
      "value": 3,
      "min": 0,
      "max": 12,
      "step": 1,
      "locked": true,
      "description": "Y-coordinate of first point"
    },
    {
      "name": "x2",
      "label": "Point 2 X-coordinate",
      "value": 6,
      "min": 0, 
      "max": 8,
      "step": 1,
      "locked": true,
      "description": "X-coordinate of second point"
    },
    {
      "name": "y2",
      "label": "Point 2 Y-coordinate",
      "value": 11,
      "min": 0,
      "max": 12, 
      "step": 1,
      "locked": true,
      "description": "Y-coordinate of second point"
    }
  ],
  "assessments": [
    {
      "id": "checkpoint-1",
      "points": 1,
      "prompt": "If we moved Point 2 to (8, 15), what would the new slope be?",
      "options": ["2", "3", "4", "6"],
      "answer_type": "choice",
      "explanation": "m = (15-3)/(8-2) = 12/6 = 2. The slope stays the same!",
      "correct_answer": "2"
    }
  ],
  "formatVersion": "2.0.0"
}'::jsonb
WHERE question_id = (SELECT id FROM public.questions WHERE public_id = 'MATH-LINEAR-001');

SELECT 'Fixed render_payload for MATH-LINEAR-001!' as result;