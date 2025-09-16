import { InteractiveSolution } from "@/types/QuestionInterface";

/**
 * Interactive Math Solutions Database
 * Maps question IDs to their interactive solution configurations
 */
export const interactiveSolutions: Record<string, InteractiveSolution> = {
  // Linear Equations
  "CORE-001": {
    hasInteractiveGraph: false,
    graphConfig: {
      type: 'linear',
      xRange: [-2, 8],
      yRange: [-5, 25],
      showGrid: true,
      showAxis: true,
      title: 'Linear Equation: 3x + 5 = 17'
    },
    parameters: [
      {
        name: 'x',
        label: 'Variable x',
        value: 4,
        min: 0,
        max: 10,
        step: 1,
        description: 'The unknown value we are solving for'
      }
    ],
    solutionSteps: [
      {
        id: 'step-1',
        title: 'Start with the Equation',
        description: 'We have the linear equation 3x + 5 = 17',
        fromExpression: {
          latex: '3x + 5 = 17',
          display: '3x + 5 = 17'
        },
        toExpression: {
          latex: '3x + 5 = 17', 
          display: '3x + 5 = 17'
        },
        explanation: 'This is our starting equation that we need to solve for x',
        hint: 'Identify what operation is done to x first'
      },
      {
        id: 'step-2',
        title: 'Subtract 5 from Both Sides',
        description: 'Eliminate the constant term by subtracting 5',
        fromExpression: {
          latex: '3x + 5 = 17',
          display: '3x + 5 = 17'
        },
        toExpression: {
          latex: '3x = 12',
          display: '3x = 12'
        },
        explanation: 'Subtracting 5 from both sides: (3x + 5) - 5 = 17 - 5',
        hint: 'What do you get when you subtract 5 from 17?',
        interactive: {
          type: 'input',
          correctAnswer: '12'
        }
      },
      {
        id: 'step-3',
        title: 'Divide Both Sides by 3',
        description: 'Isolate x by dividing both sides by the coefficient',
        fromExpression: {
          latex: '3x = 12',
          display: '3x = 12'
        },
        toExpression: {
          latex: 'x = 4',
          display: 'x = 4'
        },
        explanation: 'Dividing both sides by 3: 3x ÷ 3 = 12 ÷ 3',
        hint: 'What is 12 divided by 3?',
        interactive: {
          type: 'input',
          correctAnswer: '4'
        }
      }
    ],
    algebraSteps: true,
    showWork: true,
    allowInputValidation: true,
    renderPayload: {
      solutionSteps: [
        {
          id: "step-1",
          title: "Start with the Equation",
          explanation: "We have the linear equation 3x + 5 = 17"
        },
        {
          id: "step-2",
          title: "Subtract 5 from Both Sides", 
          explanation: "Subtracting 5 from both sides: (3x + 5) - 5 = 17 - 5 which gives us 3x = 12"
        },
        {
          id: "step-3",
          title: "Divide Both Sides by 3",
          explanation: "Dividing both sides by 3: 3x ÷ 3 = 12 ÷ 3 which gives us x = 4"
        }
      ],
      algebraSteps: true,
      showWork: true,
      allowInputValidation: true
    }
  },
  
  // Quadratic Functions
  "MATH-INTERACTIVE-001": {
    hasInteractiveGraph: true,
    graphConfig: {
      type: 'quadratic',
      xRange: [-1, 5],
      yRange: [-5, 8],
      showGrid: true,
      showAxis: true,
      title: 'Quadratic Function: y = ax² + bx + c'
    },
    parameters: [
      {
        name: 'a',
        label: 'Coefficient a',
        value: 2,
        min: -5,
        max: 5,
        step: 0.1,
        description: 'Controls the width and direction of the parabola'
      },
      {
        name: 'b',
        label: 'Coefficient b', 
        value: -8,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Affects the horizontal position of the vertex'
      },
      {
        name: 'c',
        label: 'Constant c',
        value: 6,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'The y-intercept of the parabola'
      }
    ],
    solutionSteps: [
      {
        id: 'step-1',
        title: 'Use the First Point',
        description: 'Substitute (0, 6) into y = ax² + bx + c',
        fromExpression: {
          latex: 'y = ax^2 + bx + c',
          display: 'y = ax² + bx + c'
        },
        toExpression: {
          latex: '6 = a(0)^2 + b(0) + c',
          display: '6 = a(0)² + b(0) + c = c'
        },
        explanation: 'When x = 0, all terms with x disappear, leaving only c = 6',
        hint: 'What happens when you substitute x = 0 into the equation?'
      },
      {
        id: 'step-2',
        title: 'Use the Second Point',
        description: 'Substitute (2, -2) into y = ax² + bx + c',
        fromExpression: {
          latex: '-2 = a(2)^2 + b(2) + c',
          display: '-2 = a(2)² + b(2) + c'
        },
        toExpression: {
          latex: '-2 = 4a + 2b + 6',
          display: '-2 = 4a + 2b + 6 → 4a + 2b = -8'
        },
        explanation: 'Substituting and simplifying gives us our first equation with a and b',
        hint: 'Remember that c = 6 from step 1',
        interactive: {
          type: 'input',
          correctAnswer: '-8'
        }
      },
      {
        id: 'step-3', 
        title: 'Use the Third Point',
        description: 'Substitute (4, 6) into y = ax² + bx + c',
        fromExpression: {
          latex: '6 = a(4)^2 + b(4) + c',
          display: '6 = a(4)² + b(4) + c'
        },
        toExpression: {
          latex: '6 = 16a + 4b + 6',
          display: '6 = 16a + 4b + 6 → 16a + 4b = 0'
        },
        explanation: 'This gives us our second equation with a and b',
        hint: 'Subtract 6 from both sides'
      },
      {
        id: 'step-4',
        title: 'Solve the System',
        description: 'Solve the system: 4a + 2b = -8 and 16a + 4b = 0',
        fromExpression: {
          latex: '16a + 4b = 0',
          display: 'From 16a + 4b = 0, we get b = -4a'
        },
        toExpression: {
          latex: '4a + 2(-4a) = -8',
          display: '4a + 2(-4a) = -8 → 4a - 8a = -8 → -4a = -8'
        },
        explanation: 'Substituting b = -4a into the first equation and solving for a',
        hint: 'Divide both sides by -4',
        interactive: {
          type: 'input',
          correctAnswer: '2'
        }
      },
      {
        id: 'step-5',
        title: 'Final Answer',
        description: 'Determine the value of coefficient a',
        fromExpression: {
          latex: '-4a = -8',
          display: '-4a = -8'
        },
        toExpression: {
          latex: 'a = 2',
          display: 'a = 2'
        },
        explanation: 'Therefore, the coefficient a = 2, which means the parabola opens upward with this steepness.',
        hint: 'Divide -8 by -4'
      }
    ]
  },

  // Linear Functions
  "MATH-LINEAR-001": {
    hasInteractiveGraph: true,
    graphConfig: {
      type: 'linear',
      xRange: [-4, 5],
      yRange: [-12, 8],
      showGrid: true,
      showAxis: true,
      title: 'Linear Function: y = mx + b'
    },
    parameters: [
      {
        name: 'm',
        label: 'Slope (m)',
        value: -3,
        min: -5,
        max: 5,
        step: 0.1,
        description: 'The rate of change (rise over run)'
      },
      {
        name: 'b',
        label: 'Y-intercept (b)',
        value: -1,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Where the line crosses the y-axis'
      }
    ],
    solutionSteps: [
      {
        id: 'linear-1',
        title: 'Identify the Points',
        description: 'We have two points on the line',
        fromExpression: {
          latex: 'Point_1 = (-2, 5), Point_2 = (3, -10)',
          display: 'Point₁ = (-2, 5), Point₂ = (3, -10)'
        },
        toExpression: {
          latex: '(x_1, y_1) = (-2, 5), (x_2, y_2) = (3, -10)',
          display: '(x₁, y₁) = (-2, 5), (x₂, y₂) = (3, -10)'
        },
        explanation: 'Label the coordinates for easy reference in the slope formula',
        hint: 'The first point gives us x₁ and y₁, the second gives us x₂ and y₂'
      },
      {
        id: 'linear-2',
        title: 'Apply the Slope Formula',
        description: 'Use m = (y₂ - y₁)/(x₂ - x₁)',
        fromExpression: {
          latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
          display: 'm = (y₂ - y₁)/(x₂ - x₁)'
        },
        toExpression: {
          latex: 'm = \\frac{-10 - 5}{3 - (-2)}',
          display: 'm = (-10 - 5)/(3 - (-2))'
        },
        explanation: 'Substitute the coordinates from our two points',
        hint: 'Be careful with the signs, especially when subtracting negative numbers'
      },
      {
        id: 'linear-3',
        title: 'Calculate the Result',
        description: 'Simplify the fraction',
        fromExpression: {
          latex: 'm = \\frac{-15}{5}',
          display: 'm = -15/5'
        },
        toExpression: {
          latex: 'm = -3',
          display: 'm = -3'
        },
        explanation: 'The slope is -3, meaning the line goes down 3 units for every 1 unit right',
        hint: 'Divide -15 by 5',
        interactive: {
          type: 'input',
          correctAnswer: '-3'
        }
      }
    ]
  },

  // Add more interactive solutions here...
  // "MATH-EXPONENTIAL-001": { ... },
  // "MATH-ABSOLUTE-001": { ... },
  // etc.
};

/**
 * Get interactive solution for a question ID
 */
export function getInteractiveSolution(questionId: string): InteractiveSolution | undefined {
  return interactiveSolutions[questionId];
}

/**
 * Check if a question has an interactive solution
 */
export function hasInteractiveSolution(questionId: string): boolean {
  return questionId in interactiveSolutions;
}

/**
 * Get all question IDs that have interactive solutions
 */
export function getInteractiveQuestionIds(): string[] {
  return Object.keys(interactiveSolutions);
}

/**
 * Get interactive solutions by graph type
 */
export function getInteractiveSolutionsByType(type: 'quadratic' | 'linear' | 'exponential' | 'absolute' | 'polynomial'): Array<{ questionId: string; solution: InteractiveSolution }> {
  return Object.entries(interactiveSolutions)
    .filter(([_, solution]) => solution.graphConfig?.type === type)
    .map(([questionId, solution]) => ({ questionId, solution }));
}