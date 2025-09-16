/**
 * Script to populate the database with interactive questions from core.json
 * Run this script to import your core.json content into the Supabase database
 */

import { createClient } from '@supabase/supabase-js';

// Your core.json content with interactive solutions
const coreContent = {
  "packId": "core",
  "hash": "core-interactive-v1.2.0",
  "content": {
    "id": "core",
    "title": "SAT Core Practice - Interactive",
    "description": "Enhanced SAT practice questions with interactive step builders",
    "questions": [
      {
        "id": "CORE-001",
        "number": 1,
        "content": "If 3x + 5 = 17, what is the value of x?",
        "difficulty": "easy",
        "chapter": "Linear Equations",
        "module": "All SAT Math",
        "bookmarked": false,
        "examNumber": 1,
        "choices": ["3", "4", "5", "6"],
        "correctAnswer": "4",
        "solution": "3x + 5 = 17 → 3x = 12 → x = 4",
        "explanation": "Solving for x: subtract 5 from both sides, then divide by 3.",
        "hint": "To solve for x, first subtract 5 from both sides, then divide by 3.",
        "calculatorAllowed": false,
        "solutionSteps": [
          "Start with: 3x + 5 = 17",
          "Subtract 5 from both sides: 3x = 12", 
          "Divide both sides by 3: x = 4"
        ],
        "interactiveSolution": {
          "hasInteractiveGraph": false,
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
              "description": "The unknown value we're solving for"
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
          "renderPayload": {
            "algebraSteps": true,
            "showWork": true,
            "allowInputValidation": true
          }
        }
      },
      {
        "id": "CORE-002", 
        "number": 2,
        "content": "A triangle has sides of length 5, 12, and 13. What type of triangle is it?",
        "difficulty": "medium",
        "chapter": "Triangle Classification",
        "module": "All SAT Math",
        "bookmarked": false,
        "examNumber": 1,
        "choices": ["Acute", "Right", "Obtuse", "Equilateral"],
        "correctAnswer": "Right",
        "solution": "Check: 5² + 12² = 25 + 144 = 169 = 13²",
        "explanation": "This is a right triangle because 5² + 12² = 13²",
        "hint": "Use the Pythagorean theorem: check if a² + b² = c²",
        "calculatorAllowed": true,
        "solutionSteps": [
          "Identify the longest side: 13",
          "Calculate: 5² + 12² = 25 + 144 = 169",
          "Compare: 13² = 169, so 5² + 12² = 13²",
          "This satisfies the Pythagorean theorem, so it's a right triangle"
        ],
        "interactiveSolution": {
          "hasInteractiveGraph": true,
          "graphConfig": {
            "type": "geometric",
            "xRange": [0, 15],
            "yRange": [0, 15],
            "showGrid": true,
            "showAxis": true,
            "title": "Triangle with sides 5, 12, 13"
          },
          "parameters": [
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
          ],
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
            },
            {
              "id": "step-3",
              "title": "Calculate c²",
              "description": "Square the longest side",
              "fromExpression": {
                "latex": "c^2 = 13^2",
                "display": "c² = 13²"
              },
              "toExpression": {
                "latex": "= 169",
                "display": "= 169"
              },
              "explanation": "13² = 13 × 13 = 169",
              "hint": "What is 13 × 13?",
              "interactive": {
                "type": "input",
                "correctAnswer": "169"
              }
            },
            {
              "id": "step-4",
              "title": "Compare Results",
              "description": "Check if a² + b² = c²",
              "fromExpression": {
                "latex": "a^2 + b^2 = 169, \\quad c^2 = 169",
                "display": "a² + b² = 169,  c² = 169"
              },
              "toExpression": {
                "latex": "\\text{Since } a^2 + b^2 = c^2 \\text{, it's a right triangle}",
                "display": "Since a² + b² = c², it's a right triangle"
              },
              "explanation": "Because the Pythagorean theorem holds, this is a right triangle",
              "hint": "What does it mean when a² + b² = c²?"
            }
          ],
          "renderPayload": {
            "triangleVisualization": true,
            "showPythagoreanCheck": true,
            "highlightRightAngle": true,
            "interactiveCalculator": true
          }
        }
      },
      {
        "id": "CORE-003",
        "number": 3,
        "content": "If f(x) = 2x² - 3x + 1, what is f(2)?",
        "difficulty": "hard",
        "chapter": "Function Evaluation",
        "module": "All SAT Math",
        "bookmarked": false,
        "examNumber": 1,
        "choices": ["3", "5", "7", "9"],
        "correctAnswer": "3",
        "solution": "f(2) = 2(2)² - 3(2) + 1 = 8 - 6 + 1 = 3",
        "explanation": "Substitute x = 2 and follow order of operations",
        "hint": "Substitute x = 2 and follow the order of operations",
        "calculatorAllowed": false,
        "solutionSteps": [
          "Substitute x = 2: f(2) = 2(2)² - 3(2) + 1",
          "Calculate the exponent: 2² = 4",
          "Multiply: 2(4) = 8 and 3(2) = 6", 
          "Combine: 8 - 6 + 1 = 3"
        ],
        "interactiveSolution": {
          "hasInteractiveGraph": true,
          "graphConfig": {
            "type": "quadratic",
            "xRange": [-2, 4],
            "yRange": [-2, 10],
            "showGrid": true,
            "showAxis": true,
            "title": "f(x) = 2x² - 3x + 1"
          },
          "parameters": [
            {
              "name": "x",
              "label": "Input value (x)",
              "value": 2,
              "min": -3,
              "max": 5,
              "step": 0.5,
              "description": "The x-value we're evaluating the function at"
            }
          ],
          "solutionSteps": [
            {
              "id": "step-1",
              "title": "Write the Function",
              "description": "Start with the given function",
              "fromExpression": {
                "latex": "f(x) = 2x^2 - 3x + 1",
                "display": "f(x) = 2x² - 3x + 1"
              },
              "toExpression": {
                "latex": "f(2) = 2(2)^2 - 3(2) + 1",
                "display": "f(2) = 2(2)² - 3(2) + 1"
              },
              "explanation": "Replace every x with 2 in the function",
              "hint": "Substitute x = 2 into the function"
            },
            {
              "id": "step-2",
              "title": "Calculate the Exponent",
              "description": "Evaluate 2² first (order of operations)",
              "fromExpression": {
                "latex": "f(2) = 2(2)^2 - 3(2) + 1",
                "display": "f(2) = 2(2)² - 3(2) + 1"
              },
              "toExpression": {
                "latex": "f(2) = 2(4) - 3(2) + 1",
                "display": "f(2) = 2(4) - 3(2) + 1"
              },
              "explanation": "2² = 2 × 2 = 4",
              "hint": "What is 2 squared?",
              "interactive": {
                "type": "input",
                "correctAnswer": "4"
              }
            },
            {
              "id": "step-3",
              "title": "Perform Multiplications",
              "description": "Multiply coefficients with their terms",
              "fromExpression": {
                "latex": "f(2) = 2(4) - 3(2) + 1",
                "display": "f(2) = 2(4) - 3(2) + 1"
              },
              "toExpression": {
                "latex": "f(2) = 8 - 6 + 1",
                "display": "f(2) = 8 - 6 + 1"
              },
              "explanation": "2 × 4 = 8 and 3 × 2 = 6",
              "hint": "Calculate 2×4 and 3×2",
              "interactive": {
                "type": "fill-blank",
                "blanks": ["8", "6"],
                "correctAnswer": ["8", "6"]
              }
            },
            {
              "id": "step-4",
              "title": "Combine Terms",
              "description": "Add and subtract from left to right",
              "fromExpression": {
                "latex": "f(2) = 8 - 6 + 1",
                "display": "f(2) = 8 - 6 + 1"
              },
              "toExpression": {
                "latex": "f(2) = 3",
                "display": "f(2) = 3"
              },
              "explanation": "8 - 6 = 2, then 2 + 1 = 3",
              "hint": "Work from left to right: first 8-6, then add 1",
              "interactive": {
                "type": "input",
                "correctAnswer": "3"
              }
            }
          ],
          "renderPayload": {
            "functionGraph": true,
            "highlightPoint": {"x": 2, "y": 3},
            "showCalculationSteps": true,
            "allowParameterChange": true
          }
        }
      },
      {
        "id": "CORE-009",
        "number": 9,
        "content": "What is the area of a circle with diameter 10 units?",
        "difficulty": "hard",
        "chapter": "Circle Geometry",
        "module": "All SAT Math",
        "bookmarked": false,
        "examNumber": 1,
        "choices": ["25π", "50π", "100π", "200π"],
        "correctAnswer": "25π",
        "solution": "Diameter = 10, so radius = 5. Area = π(5)² = 25π",
        "explanation": "Convert diameter to radius, then use A = πr²",
        "hint": "Remember that radius = diameter ÷ 2, and the area formula is A = πr²",
        "calculatorAllowed": true,
        "solutionSteps": [
          "Find the radius: r = diameter ÷ 2 = 10 ÷ 2 = 5",
          "Apply the area formula: A = πr²",
          "Calculate: A = π(5)² = 25π square units"
        ],
        "interactiveSolution": {
          "hasInteractiveGraph": true,
          "graphConfig": {
            "type": "circle",
            "xRange": [-8, 8],
            "yRange": [-8, 8],
            "showGrid": true,
            "showAxis": true,
            "title": "Circle with diameter 10 units"
          },
          "parameters": [
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
          ],
          "solutionSteps": [
            {
              "id": "step-1",
              "title": "Find the Radius",
              "description": "Convert diameter to radius",
              "fromExpression": {
                "latex": "\\text{diameter} = 10",
                "display": "diameter = 10"
              },
              "toExpression": {
                "latex": "\\text{radius} = \\frac{\\text{diameter}}{2} = \\frac{10}{2} = 5",
                "display": "radius = diameter ÷ 2 = 10 ÷ 2 = 5"
              },
              "explanation": "The radius is always half the diameter",
              "hint": "What is 10 divided by 2?",
              "interactive": {
                "type": "input",
                "correctAnswer": "5"
              }
            },
            {
              "id": "step-2",
              "title": "Apply the Area Formula",
              "description": "Use A = πr² to find the area",
              "fromExpression": {
                "latex": "A = \\pi r^2",
                "display": "A = πr²"
              },
              "toExpression": {
                "latex": "A = \\pi (5)^2",
                "display": "A = π(5)²"
              },
              "explanation": "Substitute the radius value into the area formula",
              "hint": "Replace r with 5 in the formula A = πr²"
            },
            {
              "id": "step-3",
              "title": "Calculate the Result",
              "description": "Evaluate the expression",
              "fromExpression": {
                "latex": "A = \\pi (5)^2",
                "display": "A = π(5)²"
              },
              "toExpression": {
                "latex": "A = 25\\pi",
                "display": "A = 25π"
              },
              "explanation": "5² = 25, so the area is 25π square units",
              "hint": "What is 5 squared?",
              "interactive": {
                "type": "input",
                "correctAnswer": "25"
              }
            }
          ],
          "renderPayload": {
            "circleVisualization": true,
            "showRadius": true,
            "showDiameter": true,
            "highlightArea": true,
            "showFormula": true
          }
        }
      }
    ],
    "version": "1.0.0",
    "generatedAt": "2025-08-20T21:00:00.000Z"
  }
};

async function populateDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://zmsqscxqxlhhehzwbylv.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
  
  try {
    console.log('🚀 Starting database population...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/populate-interactive-questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coreContent)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Database population successful!');
      console.log('📊 Results:', result.results);
    } else {
      console.error('❌ Database population failed:', result.error);
      if (result.results?.errors) {
        console.error('🔍 Detailed errors:', result.results.errors);
      }
    }
    
  } catch (error) {
    console.error('💥 Exception during database population:', error);
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

export { populateDatabase, coreContent };