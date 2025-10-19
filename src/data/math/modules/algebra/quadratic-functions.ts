import { MathModule } from '../../types';

export const quadraticFunctionsModule: MathModule = {
  id: 'math-quadratic-functions',
  title: 'Quadratic Functions Workshop',
  skill: 'Quadratic Functions',
  category: 'Algebra',
  difficulty: 'Medium',
  questionCount: 6,
  imageUrl: '/resources/hero5.webp',
  description: 'Analyze parabolas, factor quadratics, and interpret vertex form for SAT Math mastery.',
  estimatedTime: 15,
  tags: ['parabolas', 'vertex form', 'factoring'],
  previewEquation: 'y = 2x^2 - 8x + 6',
  interactiveProblem: {
    id: 'quadratic-vertex-analysis',
    title: 'Identify Key Features of a Quadratic',
    question: 'Find the vertex and x-intercepts of y = 2x² - 8x + 6.',
    objective: 'Use completing-the-square and factoring to analyze quadratics.',
    defaultEquation: 'y = 2x^2 - 8x + 6',
    graphConfig: {
      type: 'quadratic',
      xRange: [-2, 6],
      yRange: [-4, 10],
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
        description: 'Controls width and direction of the parabola'
      },
      {
        name: 'b',
        label: 'Coefficient b',
        value: -8,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Shifts the vertex horizontally'
      },
      {
        name: 'c',
        label: 'Constant c',
        value: 6,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Determines the y-intercept'
      }
    ],
    solutionSteps: [
      {
        id: 'quadratic-step-1',
        title: 'Identify coefficients',
        description: 'Compare to the form y = ax² + bx + c.',
        fromExpression: {
          latex: 'y = 2x^2 - 8x + 6',
          display: 'y = 2x² - 8x + 6'
        },
        toExpression: {
          latex: 'a = 2,\, b = -8,\, c = 6',
          display: 'a = 2, b = -8, c = 6'
        },
        explanation: 'Reading coefficients correctly is the foundation for all quadratic analysis.',
        hint: 'Match the equation to y = ax² + bx + c.'
      },
      {
        id: 'quadratic-step-2',
        title: 'Find the vertex x-coordinate',
        description: 'Use the formula x = -b / (2a).',
        fromExpression: {
          latex: 'x = -\frac{b}{2a}',
          display: 'x = -b / (2a)'
        },
        toExpression: {
          latex: 'x = -\frac{-8}{2(2)} = 2',
          display: 'x = -(-8)/(2·2) = 8/4 = 2'
        },
        explanation: 'The vertex lies midway between the zeros on the x-axis.',
        hint: 'Be careful with the negative sign on b.',
        interactive: {
          type: 'input',
          correctAnswer: '2'
        }
      },
      {
        id: 'quadratic-step-3',
        title: 'Find the vertex y-coordinate',
        description: 'Plug x = 2 back into the equation.',
        fromExpression: {
          latex: 'y = 2x^2 - 8x + 6',
          display: 'y = 2(2)² - 8(2) + 6'
        },
        toExpression: {
          latex: 'y = 8 - 16 + 6 = -2',
          display: 'y = 8 - 16 + 6 = -2'
        },
        explanation: 'Vertex is at (2, -2).',
        hint: 'Evaluate step-by-step: 2(4) = 8, 8 - 16 + 6 = -2.',
        interactive: {
          type: 'input',
          correctAnswer: '-2'
        }
      },
      {
        id: 'quadratic-step-4',
        title: 'Factor to find zeros',
        description: 'Set y = 0 and factor the quadratic.',
        fromExpression: {
          latex: '0 = 2x^2 - 8x + 6',
          display: '0 = 2x² - 8x + 6'
        },
        toExpression: {
          latex: '0 = 2(x^2 - 4x + 3)',
          display: '0 = 2(x² - 4x + 3)'
        },
        explanation: 'Factor out the common factor to simplify.',
        hint: 'Divide both sides by 2 first.'
      },
      {
        id: 'quadratic-step-5',
        title: 'Solve the simplified quadratic',
        description: 'Factor x² - 4x + 3.',
        fromExpression: {
          latex: 'x^2 - 4x + 3 = 0',
          display: 'x² - 4x + 3 = 0'
        },
        toExpression: {
          latex: '(x - 1)(x - 3) = 0',
          display: '(x - 1)(x - 3) = 0'
        },
        explanation: 'Set each factor equal to zero to find x = 1 and x = 3.',
        hint: 'Look for two numbers that multiply to 3 and add to -4.',
        interactive: {
          type: 'multiple-choice',
          options: ['x = 1, x = 3', 'x = -1, x = -3', 'x = 2, x = 6', 'x = 0, x = 4'],
          correctAnswer: 'x = 1, x = 3'
        }
      }
    ],
    tags: ['vertex form', 'factoring', 'zeros'],
    calculatorAllowed: true
  },
  questionBank: [
    {
      id: 'quadratic-q1',
      prompt: 'Rewrite y = x² - 6x + 5 in vertex form.',
      choices: ['y = (x - 3)² - 4', 'y = (x - 3)² - 9', 'y = (x + 3)² + 5', 'y = (x - 5)² - 6'],
      correctChoiceIndex: 0,
      explanation: 'Complete the square: x² - 6x + 9 - 9 + 5 → (x - 3)² - 4.',
      difficulty: 'Medium',
      skillFocus: 'Completing the square',
      calculatorAllowed: false,
      strategyTip: 'Add and subtract (b/2)² inside the expression to complete the square.'
    },
    {
      id: 'quadratic-q2',
      prompt: 'What is the axis of symmetry for y = -x² + 4x - 1?',
      choices: ['x = -2', 'x = 2', 'x = 1', 'x = 4'],
      correctChoiceIndex: 1,
      explanation: 'x = -b/(2a) = -4/(2·-1) = 2.',
      difficulty: 'Easy',
      skillFocus: 'Axis of symmetry',
      calculatorAllowed: false
    },
    {
      id: 'quadratic-q3',
      prompt: 'The graph of y = 2(x - 3)² + 5 opens...',
      choices: ['Upward and has a vertex at (3, 5)', 'Upward and has a vertex at (-3, 5)', 'Downward and has a vertex at (3, -5)', 'Downward and has a vertex at (-3, 5)'],
      correctChoiceIndex: 0,
      explanation: 'Coefficient a = 2 > 0 so it opens upward. The vertex is (h, k) = (3, 5).',
      difficulty: 'Easy',
      skillFocus: 'Vertex form interpretation',
      calculatorAllowed: false
    },
    {
      id: 'quadratic-q4',
      prompt: 'Solve 4x² - 25 = 0.',
      choices: ['x = \pm \frac{5}{2}', 'x = \pm \frac{25}{4}', 'x = -\frac{5}{2}, x = \frac{5}{4}', 'x = \pm 5'],
      correctChoiceIndex: 0,
      explanation: '4x² = 25 → x² = 25/4 → x = ±5/2.',
      difficulty: 'Medium',
      skillFocus: 'Difference of squares',
      calculatorAllowed: false
    },
    {
      id: 'quadratic-q5',
      prompt: 'For the projectile y = -16t² + 48t + 5, when does it reach its maximum height?',
      choices: ['t = 0.5 seconds', 't = 1.5 seconds', 't = 3 seconds', 't = 6 seconds'],
      correctChoiceIndex: 1,
      explanation: 'Vertex time t = -b/(2a) = -48/(2·-16) = 48/32 = 1.5 seconds.',
      difficulty: 'Medium',
      skillFocus: 'Applications of vertex',
      calculatorAllowed: true,
      strategyTip: 'Use the vertex formula for maximum/minimum problems.'
    },
    {
      id: 'quadratic-q6',
      prompt: 'The quadratic y = ax² + bx + c has zeros at x = -1 and x = 5 and passes through (0, -10). What is a?',
      choices: ['a = 2', 'a = -2', 'a = 1', 'a = -1'],
      correctChoiceIndex: 0,
      explanation: 'Factor form y = a(x + 1)(x - 5). Substitute (0, -10): -10 = a(1)(-5) → a = 2.',
      difficulty: 'Hard',
      skillFocus: 'Constructing quadratics from zeros',
      calculatorAllowed: true
    }
  ],
  learningObjectives: [
    'Convert between standard, vertex, and factored forms',
    'Use vertex formula to interpret quadratic graphs',
    'Solve quadratic equations by factoring and completing the square'
  ],
  strategyTips: [
    'Identify the best solving method based on the coefficients.',
    'Plot the vertex and axis of symmetry to visualize the parabola quickly.',
    'Check solutions by substituting back into the original equation.'
  ],
  relatedSkills: ['Polynomial Operations', 'Systems of Equations'],
  references: [
    { title: 'Quadratic Functions - Khan Academy', url: 'https://www.khanacademy.org/math/algebra/quadratics' }
  ]
};

