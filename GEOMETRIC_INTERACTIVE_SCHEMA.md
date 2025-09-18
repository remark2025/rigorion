# Complete Geometric Interactive Solution Schema

## Overview
This schema defines the complete structure for geometric interactive diagrams that allow students to manipulate, explore, and learn from dynamic geometric constructions.

## Database Fields Structure

### 1. Main Question Table
```sql
questions {
  public_id: 'GEOM-TRIANGLE-001',
  content: 'Question text with geometric problem',
  question_type: 'multiple_choice',
  subject: 'math',
  topic: 'Triangle Geometry',
  difficulty: 'medium',
  choices: jsonb,  -- Answer choices
  correct_answer: 'B',
  has_interactive: true,
  estimated_time: 4  -- minutes
}
```

### 2. Interactive Solutions Table
```sql
interactive_solutions {
  question_id: uuid,
  solution_type: 'geometric_diagram',
  has_interactive_graph: true,
  graph_config: jsonb,      -- Raw geometric configuration
  parameters: jsonb,        -- Adjustable parameters
  render_payload: jsonb     -- Complete frontend payload
}
```

## JSONB Field Structures

### graph_config (Raw Configuration)
```json
{
  "type": "geometric_construction",
  "canvas": {
    "width": 600,
    "height": 400,
    "coordinate_system": "cartesian",
    "grid_enabled": true,
    "grid_spacing": 20,
    "scale": {"pixels_per_unit": 20}
  },
  "viewport": {
    "xRange": [-2, 16],
    "yRange": [-2, 12],
    "center": {"x": 6, "y": 4}
  },
  "interactive_features": {
    "drag_vertices": true,
    "measure_angles": true,
    "measure_lengths": true,
    "show_labels": true
  }
}
```

### parameters (Adjustable Elements)
```json
[
  {
    "name": "angle_A",
    "label": "Angle A (degrees)",
    "value": 30,
    "min": 10,
    "max": 80,
    "step": 1,
    "description": "Angle at vertex A",
    "affects": ["triangle_shape"],
    "locked": false,
    "is_answer": false
  },
  {
    "name": "side_BC",
    "label": "Side BC (units)",
    "value": 6.928,
    "description": "Length we're solving for",
    "is_answer": true
  }
]
```

### render_payload (Complete Frontend Interface)
```json
{
  "version": "2.0.0",
  "solution_type": "geometric_diagram",
  "educational_objective": "Learning goal description",
  
  "geometric_construction": {
    "canvas_setup": {
      "width": 600,
      "height": 400,
      "background_color": "#fafafa",
      "grid_color": "#e0e0e0"
    },
    
    "geometric_elements": [
      {
        "element_id": "triangle_ABC",
        "type": "triangle",
        "vertices": {
          "A": {"x": 2, "y": 2, "draggable": false},
          "B": {"x": 14, "y": 2, "draggable": false},
          "C": {"x": 8, "y": 8.464, "draggable": true}
        },
        "sides": {
          "AB": {"length": 12, "color": "#2563eb", "label": "12 units"},
          "BC": {"length": "calculated", "color": "#dc2626", "label": "BC = ?"}
        },
        "angles": {
          "A": {"measure": 30, "color": "#f59e0b", "label": "30°"},
          "B": {"measure": 60, "color": "#8b5cf6", "label": "60°"},
          "C": {"measure": 90, "show_right_angle_marker": true}
        },
        "animations": [
          {
            "trigger": "load",
            "type": "draw_construction",
            "duration": 2000,
            "sequence": ["vertex_A", "vertex_B", "side_AB", "vertex_C"]
          }
        ]
      }
    ]
  },

  "interactive_steps": [
    {
      "step_id": "step-1",
      "step_number": 1,
      "title": "Identify Triangle Type",
      "description": "Analyze given angles",
      "instruction": "What is angle C?",
      "highlight_elements": ["angle_A", "angle_B"],
      "explanation": "Since A=30° and B=60°, then C=90°",
      "interactive_element": {
        "type": "angle_calculator",
        "prompt": "Calculate angle C:",
        "formula_display": "∠C = 180° - 30° - 60° = ?",
        "expected_answer": 90,
        "validation": {
          "type": "exact",
          "feedback": {
            "correct": "Excellent! This is a right triangle.",
            "incorrect": "Remember angles sum to 180°."
          }
        }
      },
      "time_estimate": 45
    }
  ],

  "assessment_rubric": {
    "total_points": 10,
    "breakdown": {
      "angle_identification": 2,
      "triangle_recognition": 2,
      "ratio_application": 3,
      "calculation": 2,
      "verification": 1
    }
  },

  "accessibility_features": {
    "screen_reader_descriptions": {
      "triangle": "Right triangle ABC with angles 30°, 60°, 90°"
    },
    "keyboard_navigation": {
      "tab_order": ["angle_inputs", "calculations"],
      "hotkeys": {"space": "highlight", "enter": "submit"}
    }
  }
}
```

## Geometric Element Types

### Triangle
```json
{
  "type": "triangle",
  "vertices": {"A": {x, y}, "B": {x, y}, "C": {x, y}},
  "sides": {"AB": {length, color, label}, ...},
  "angles": {"A": {measure, color, label}, ...},
  "style": {"fill": "color", "stroke": "color"}
}
```

### Circle
```json
{
  "type": "circle",
  "center": {"x": 0, "y": 0},
  "radius": 5,
  "style": {"stroke": "#color", "fill": "rgba()"},
  "labels": [{"text": "r=5", "position": {x, y}}]
}
```

### Line/Segment
```json
{
  "type": "line|segment",
  "start": {"x": 0, "y": 0},
  "end": {"x": 5, "y": 3},
  "style": {"stroke": "#color", "stroke_width": 2},
  "markers": ["arrowhead", "tick_marks"]
}
```

### Point
```json
{
  "type": "point",
  "position": {"x": 2, "y": 3},
  "style": {"fill": "#color", "radius": 4},
  "draggable": true,
  "constraints": {"x_min": 0, "x_max": 10}
}
```

### Polygon
```json
{
  "type": "polygon",
  "vertices": [{"x": 0, "y": 0}, {"x": 3, "y": 0}, {"x": 1.5, "y": 2.6}],
  "style": {"fill": "rgba()", "stroke": "#color"},
  "labels": {"centroid": "Triangle"}
}
```

## Interactive Element Types

### Angle Calculator
```json
{
  "type": "angle_calculator",
  "prompt": "Calculate the missing angle:",
  "formula_display": "∠C = 180° - ∠A - ∠B",
  "input_type": "number",
  "expected_answer": 90,
  "unit": "degrees"
}
```

### Distance Measurer
```json
{
  "type": "distance_measurer", 
  "points": ["A", "B"],
  "prompt": "Measure the distance AB:",
  "show_calculation": true,
  "formula": "√[(x₂-x₁)² + (y₂-y₁)²]"
}
```

### Ratio Matcher
```json
{
  "type": "ratio_matching",
  "items": [
    {"side": "Side opposite 30°", "ratio": "x"},
    {"side": "Side opposite 60°", "ratio": "x√3"}
  ]
}
```

### Drag and Drop
```json
{
  "type": "drag_drop_construction",
  "tools": ["point", "line", "circle"],
  "construction_steps": ["Place point A", "Draw line AB"],
  "validation": "geometric_constraint_checking"
}
```

## Animation Types

### Construction Animation
```json
{
  "type": "draw_construction",
  "duration": 2000,
  "sequence": ["vertex_A", "vertex_B", "side_AB"],
  "easing": "ease-in-out"
}
```

### Highlight Animation
```json
{
  "type": "highlight_element",
  "target": "side_BC",
  "effect": "glow|pulse|outline",
  "color": "#fbbf24",
  "duration": 1000
}
```

### Transformation Animation
```json
{
  "type": "geometric_transformation",
  "transformation": "rotation|translation|reflection|scaling",
  "parameters": {"angle": 45, "center": {"x": 0, "y": 0}},
  "duration": 1500
}
```

## Validation Types

### Exact Match
```json
{
  "type": "exact",
  "tolerance": 0.001,
  "case_sensitive": false
}
```

### Range Validation
```json
{
  "type": "range",
  "min": 5.9,
  "max": 6.1,
  "message": "Answer should be approximately 6"
}
```

### Geometric Constraint
```json
{
  "type": "geometric_constraint",
  "constraint": "pythagorean_theorem|angle_sum|parallel_lines",
  "tolerance": 0.01
}
```

## Educational Metadata

### Learning Objectives
- Clear, measurable learning goals
- Aligned with curriculum standards
- Progressive difficulty levels

### Assessment Rubric
- Point allocation per skill
- Partial credit criteria
- Common mistake identification

### Accessibility Features
- Screen reader compatibility
- Keyboard navigation
- High contrast mode
- Multiple representation formats

This schema provides a complete framework for creating rich, interactive geometric learning experiences that adapt to student input and provide immediate feedback.