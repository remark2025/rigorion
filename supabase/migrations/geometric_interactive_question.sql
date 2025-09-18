-- Complete Geometric Figure Interactive Diagram Question
-- This demonstrates the full schema for geometric interactive solutions

-- Insert the geometric question
INSERT INTO questions (
  public_id, 
  pack_id, 
  question_number, 
  content, 
  question_type, 
  subject, 
  topic, 
  difficulty, 
  choices, 
  correct_answer, 
  solution_text, 
  explanation, 
  hint, 
  calculator_allowed, 
  has_interactive, 
  status,
  estimated_time
) VALUES (
  'GEOM-TRIANGLE-001', 
  'ecc14889-72b7-4e19-87a2-ceef01918429',
  6001,
  'In triangle ABC, angle A = 30°, angle B = 60°, and side AB = 12 units. What is the length of side BC?',
  'multiple_choice',
  'math',
  'Triangle Geometry',
  'medium',
  '[
    {"id": "A", "text": "6 units"}, 
    {"id": "B", "text": "6√3 units"}, 
    {"id": "C", "text": "12 units"}, 
    {"id": "D", "text": "12√3 units"}
  ]'::jsonb,
  'B',
  'Since angle C = 180° - 30° - 60° = 90°, this is a 30-60-90 triangle. In a 30-60-90 triangle, if the side opposite 30° is x, then the side opposite 60° is x√3. Here AB = 12 (hypotenuse), so BC = 6√3.',
  'This is a 30-60-90 special right triangle. Use the ratios: 1 : √3 : 2 for sides opposite 30°, 60°, and 90° respectively.',
  'Look for special triangle patterns. What is angle C? What type of triangle is this?',
  false,
  true,
  'published',
  4
) ON CONFLICT (pack_id, question_number) DO UPDATE SET
  content = EXCLUDED.content,
  has_interactive = EXCLUDED.has_interactive;

-- Insert the complete interactive solution
INSERT INTO interactive_solutions (
  question_id, 
  solution_type, 
  has_interactive_graph, 
  graph_config, 
  parameters, 
  render_payload
) VALUES (
  (SELECT id FROM questions WHERE public_id = 'GEOM-TRIANGLE-001'),
  'geometric_diagram',
  true,
  '{
    "type": "geometric_construction",
    "canvas": {
      "width": 600,
      "height": 400,
      "coordinate_system": "cartesian",
      "grid_enabled": true,
      "grid_spacing": 20,
      "axis_labels": {"x": "units", "y": "units"},
      "scale": {"pixels_per_unit": 20}
    },
    "viewport": {
      "xRange": [-2, 16],
      "yRange": [-2, 12],
      "center": {"x": 6, "y": 4},
      "zoom_level": 1.0
    },
    "interactive_features": {
      "drag_vertices": true,
      "measure_angles": true,
      "measure_lengths": true,
      "show_angle_labels": true,
      "show_side_labels": true,
      "highlight_on_hover": true
    }
  }'::jsonb,
  '[
    {
      "name": "angle_A",
      "label": "Angle A (degrees)",
      "value": 30,
      "min": 10,
      "max": 80,
      "step": 1,
      "description": "Angle at vertex A",
      "affects": ["triangle_shape", "side_calculations"],
      "locked": false
    },
    {
      "name": "angle_B", 
      "label": "Angle B (degrees)",
      "value": 60,
      "min": 10,
      "max": 80,
      "step": 1,
      "description": "Angle at vertex B",
      "affects": ["triangle_shape", "side_calculations"],
      "locked": false
    },
    {
      "name": "side_AB",
      "label": "Side AB (units)",
      "value": 12,
      "min": 6,
      "max": 20,
      "step": 0.5,
      "description": "Length of side AB (given)",
      "affects": ["triangle_scale"],
      "locked": true
    },
    {
      "name": "side_BC",
      "label": "Side BC (units)", 
      "value": 6.928,
      "min": 3,
      "max": 15,
      "step": 0.001,
      "description": "Length of side BC (what we are solving for)",
      "affects": ["triangle_shape"],
      "locked": false,
      "is_answer": true
    }
  ]'::jsonb,
  '{
    "version": "2.0.0",
    "solution_type": "geometric_diagram",
    "educational_objective": "Understand 30-60-90 triangle properties and apply trigonometric ratios",
    
    "geometric_construction": {
      "canvas_setup": {
        "width": 600,
        "height": 400,
        "coordinate_system": "cartesian",
        "grid_enabled": true,
        "grid_spacing": 20,
        "background_color": "#fafafa",
        "grid_color": "#e0e0e0",
        "axis_color": "#666666"
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
            "AB": {"length": 12, "color": "#2563eb", "thickness": 3, "label": "12 units"},
            "BC": {"length": "calculated", "color": "#dc2626", "thickness": 3, "label": "BC = ?"},
            "AC": {"length": "calculated", "color": "#059669", "thickness": 2, "label": "AC"}
          },
          "angles": {
            "A": {"measure": 30, "color": "#f59e0b", "arc_radius": 30, "label": "30°"},
            "B": {"measure": 60, "color": "#8b5cf6", "arc_radius": 30, "label": "60°"},
            "C": {"measure": 90, "color": "#ef4444", "arc_radius": 25, "label": "90°", "show_right_angle_marker": true}
          },
          "style": {
            "fill": "rgba(59, 130, 246, 0.1)",
            "stroke": "#2563eb",
            "stroke_width": 2
          },
          "animations": [
            {
              "trigger": "load",
              "type": "draw_construction",
              "duration": 2000,
              "sequence": ["vertex_A", "vertex_B", "side_AB", "vertex_C", "side_BC", "side_AC"]
            },
            {
              "trigger": "step_highlight",
              "type": "highlight_element",
              "duration": 1000,
              "options": {"glow_color": "#fbbf24", "glow_intensity": 0.8}
            }
          ]
        },
        
        {
          "element_id": "angle_markers",
          "type": "angle_arc_collection",
          "arcs": [
            {
              "vertex": "A",
              "radius": 35,
              "start_angle": 0,
              "end_angle": 30,
              "color": "#f59e0b",
              "fill": "rgba(245, 158, 11, 0.2)",
              "label": {"text": "30°", "position": "arc_midpoint", "offset": {"x": 15, "y": -5}}
            },
            {
              "vertex": "B", 
              "radius": 35,
              "start_angle": 120,
              "end_angle": 180,
              "color": "#8b5cf6",
              "fill": "rgba(139, 92, 246, 0.2)",
              "label": {"text": "60°", "position": "arc_midpoint", "offset": {"x": -15, "y": -5}}
            },
            {
              "vertex": "C",
              "type": "right_angle_marker",
              "size": 20,
              "color": "#ef4444"
            }
          ]
        },

        {
          "element_id": "measurements_panel",
          "type": "info_panel",
          "position": {"x": 420, "y": 50},
          "content": {
            "title": "Triangle Measurements",
            "items": [
              {"label": "Angle A", "value": "30°", "dynamic": false},
              {"label": "Angle B", "value": "60°", "dynamic": false},
              {"label": "Angle C", "value": "90°", "dynamic": true},
              {"label": "Side AB", "value": "12 units", "dynamic": false},
              {"label": "Side BC", "value": "calculated", "dynamic": true, "highlight": true},
              {"label": "Side AC", "value": "calculated", "dynamic": true}
            ]
          },
          "style": {
            "background": "rgba(255, 255, 255, 0.95)",
            "border": "1px solid #d1d5db",
            "border_radius": "8px",
            "padding": "12px",
            "font_size": "14px"
          }
        }
      ]
    },

    "interactive_steps": [
      {
        "step_id": "step-1",
        "step_number": 1,
        "title": "Identify Triangle Type",
        "description": "Analyze the given angles to determine what type of triangle this is",
        "instruction": "Look at angles A and B. What is angle C?",
        "highlight_elements": ["angle_A", "angle_B"],
        "explanation": "We have angle A = 30° and angle B = 60°. Since angles in a triangle sum to 180°, angle C = 180° - 30° - 60° = 90°.",
        "interactive_element": {
          "type": "angle_calculator",
          "prompt": "Calculate angle C:",
          "formula_display": "∠C = 180° - ∠A - ∠B = 180° - 30° - 60° = ?",
          "input_type": "number",
          "expected_answer": 90,
          "unit": "degrees",
          "validation": {
            "type": "exact",
            "feedback": {
              "correct": "Excellent! This is a right triangle with a 90° angle at C.",
              "incorrect": "Remember that all angles in a triangle must sum to 180°. Try again."
            }
          }
        },
        "visual_effects": {
          "angle_C_highlight": {
            "type": "pulse_glow",
            "color": "#ef4444",
            "duration": 2000
          }
        },
        "time_estimate": 45
      },

      {
        "step_id": "step-2", 
        "step_number": 2,
        "title": "Recognize Special Triangle",
        "description": "Identify this as a 30-60-90 special right triangle",
        "instruction": "This is a 30-60-90 triangle. What are the side ratios?",
        "highlight_elements": ["triangle_ABC"],
        "explanation": "A 30-60-90 triangle has special side ratios. If the side opposite the 30° angle has length x, then the side opposite 60° has length x√3, and the hypotenuse has length 2x.",
        "reference_diagram": {
          "type": "side_ratio_diagram",
          "position": {"x": 450, "y": 200},
          "content": {
            "title": "30-60-90 Triangle Ratios",
            "ratios": {
              "opposite_30": "x",
              "opposite_60": "x√3", 
              "hypotenuse": "2x"
            },
            "generic_triangle": {
              "show": true,
              "labels": ["30°", "60°", "90°"],
              "side_labels": ["x", "x√3", "2x"]
            }
          }
        },
        "interactive_element": {
          "type": "ratio_matching",
          "prompt": "Match the sides to their ratios:",
          "items": [
            {"side": "Side opposite 30°", "ratio": "x"},
            {"side": "Side opposite 60°", "ratio": "x√3"},
            {"side": "Hypotenuse", "ratio": "2x"}
          ],
          "feedback": {
            "correct": "Perfect! You understand the 30-60-90 triangle ratios.",
            "partial": "Some matches are correct. Remember: 30°→x, 60°→x√3, 90°→2x",
            "incorrect": "Review the 30-60-90 triangle ratios and try again."
          }
        },
        "time_estimate": 60
      },

      {
        "step_id": "step-3",
        "step_number": 3, 
        "title": "Identify Known Information",
        "description": "Determine which sides we know and which we need to find",
        "instruction": "In our triangle, which side is the hypotenuse and what is its length?",
        "highlight_elements": ["side_AB"],
        "explanation": "Side AB = 12 units is opposite the 90° angle (at vertex C), so AB is the hypotenuse. We need to find BC, which is opposite the 30° angle.",
        "visual_effects": {
          "hypotenuse_highlight": {
            "type": "animated_outline",
            "target": "side_AB",
            "color": "#2563eb",
            "thickness": 5,
            "duration": 1500
          }
        },
        "interactive_element": {
          "type": "side_identification",
          "prompt": "Which side is opposite which angle?",
          "diagram_interaction": true,
          "click_targets": [
            {"element": "side_AB", "question": "What angle is this side opposite to?", "answer": "90°"},
            {"element": "side_BC", "question": "What angle is this side opposite to?", "answer": "30°"},
            {"element": "side_AC", "question": "What angle is this side opposite to?", "answer": "60°"}
          ],
          "feedback": {
            "correct": "Great! You correctly identified which sides are opposite which angles.",
            "incorrect": "Remember: the side opposite an angle is the side that does not touch that angle vertex."
          }
        },
        "time_estimate": 50
      },

      {
        "step_id": "step-4",
        "step_number": 4,
        "title": "Apply 30-60-90 Ratios", 
        "description": "Use the special triangle ratios to find the unknown side",
        "instruction": "If the hypotenuse (2x) = 12, what is x? Then what is BC (x√3)?",
        "highlight_elements": ["side_BC"],
        "explanation": "Since the hypotenuse = 2x = 12, we have x = 6. The side opposite 60° (which is BC) = x√3 = 6√3.",
        "calculation_steps": [
          {
            "expression": "Hypotenuse = 2x = 12",
            "result": "x = 6"
          },
          {
            "expression": "BC = x√3 = 6√3",
            "result": "BC = 6√3 ≈ 10.39 units"
          }
        ],
        "interactive_element": {
          "type": "step_by_step_calculation",
          "steps": [
            {
              "prompt": "If 2x = 12, what is x?",
              "input_type": "number",
              "expected_answer": 6,
              "hint": "Divide both sides by 2"
            },
            {
              "prompt": "What is 6√3 in exact form?",
              "input_type": "expression",
              "expected_answer": "6√3",
              "alternatives": ["6*sqrt(3)", "6√3"],
              "hint": "Keep it in exact radical form"
            }
          ],
          "feedback": {
            "step_correct": "Correct! Moving to the next calculation.",
            "final_correct": "Excellent! BC = 6√3 units is the exact answer.",
            "incorrect": "Check your arithmetic and try again."
          }
        },
        "visual_effects": {
          "side_BC_calculation": {
            "type": "animated_measurement",
            "show_calculation_overlay": true,
            "final_value": "6√3"
          }
        },
        "time_estimate": 90
      },

      {
        "step_id": "step-5",
        "step_number": 5,
        "title": "Verify Solution",
        "description": "Check our answer using the Pythagorean theorem",
        "instruction": "Verify that a² + b² = c² with our calculated values",
        "highlight_elements": ["triangle_ABC"],
        "explanation": "Let's verify: AC² + BC² = AB². We have AC = 6, BC = 6√3, AB = 12. So 6² + (6√3)² = 36 + 108 = 144 = 12². ✓",
        "verification_calculation": {
          "method": "pythagorean_theorem",
          "sides": {
            "AC": {"value": 6, "squared": 36},
            "BC": {"value": "6√3", "squared": 108, "decimal_approx": 10.39},
            "AB": {"value": 12, "squared": 144}
          },
          "calculation": "36 + 108 = 144 ✓"
        },
        "interactive_element": {
          "type": "verification_check",
          "prompt": "Calculate (6√3)²:",
          "hint": "(6√3)² = 6² × (√3)² = 36 × 3",
          "expected_answer": 108,
          "follow_up": {
            "prompt": "Now add: 36 + 108 = ?",
            "expected_answer": 144
          },
          "feedback": {
            "correct": "Perfect! Our solution BC = 6√3 is verified.",
            "incorrect": "Remember: (a√b)² = a² × b"
          }
        },
        "time_estimate": 60
      }
    ],

    "assessment_rubric": {
      "total_points": 10,
      "breakdown": {
        "angle_identification": 2,
        "triangle_type_recognition": 2, 
        "ratio_application": 3,
        "calculation_accuracy": 2,
        "verification": 1
      },
      "partial_credit": {
        "method_correct_answer_wrong": 0.7,
        "setup_correct_calculation_error": 0.5,
        "approach_identified_incomplete": 0.3
      }
    },

    "accessibility_features": {
      "screen_reader_descriptions": {
        "triangle": "Right triangle ABC with angle A = 30 degrees, angle B = 60 degrees, angle C = 90 degrees, and side AB = 12 units",
        "construction": "Interactive geometric construction showing triangle formation and measurements",
        "calculations": "Step-by-step calculation showing 30-60-90 triangle ratio application"
      },
      "keyboard_navigation": {
        "tab_order": ["angle_inputs", "side_calculations", "verification_steps"],
        "hotkeys": {
          "space": "highlight_current_element",
          "enter": "submit_current_answer",
          "arrow_keys": "navigate_elements"
        }
      },
      "high_contrast_mode": {
        "available": true,
        "color_scheme": {
          "background": "#000000",
          "foreground": "#ffffff", 
          "highlight": "#ffff00",
          "error": "#ff0000",
          "success": "#00ff00"
        }
      }
    },

    "performance_config": {
      "preload_assets": ["geometric_construction_tools", "angle_measurement_tools"],
      "lazy_load_steps": false,
      "cache_duration": 1800,
      "animation_quality": "high",
      "responsive_breakpoints": {
        "mobile": {"max_width": 768, "canvas_scale": 0.8},
        "tablet": {"max_width": 1024, "canvas_scale": 0.9},
        "desktop": {"min_width": 1025, "canvas_scale": 1.0}
      }
    },

    "educational_metadata": {
      "learning_objectives": [
        "Identify 30-60-90 special right triangles",
        "Apply side ratios in special right triangles", 
        "Use geometric reasoning to solve for unknown sides",
        "Verify solutions using the Pythagorean theorem"
      ],
      "prerequisite_knowledge": [
        "Angle sum property of triangles",
        "Basic trigonometry concepts",
        "Pythagorean theorem",
        "Radical expressions"
      ],
      "common_mistakes": [
        "Confusing which sides are opposite which angles",
        "Incorrectly applying the ratios (using x instead of x√3)",
        "Arithmetic errors with radicals",
        "Forgetting to verify the solution"
      ],
      "extension_activities": [
        "Explore other special right triangles (45-45-90)",
        "Apply to real-world problems (architecture, navigation)",
        "Compare with general trigonometric solutions"
      ]
    }
  }'::jsonb
);