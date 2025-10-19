import { MathModule } from '../../types';

export const linearEquationsModule: MathModule = {
  id: 'math-linear-equations',
  title: 'Linear Equations Explorer',
  skill: 'Linear Equations in One Variable',
  category: 'Algebra',
  difficulty: 'Easy',
  questionCount: 6,
  imageUrl: '/resources/sphere-3d-model-3840x2160-10993.jpg',
  description: 'Graph linear equations, interpret slope and intercepts, and solve real SAT-style problems.',
  estimatedTime: 12,
  tags: ['algebra', 'graphs', 'slope', 'intercepts'],
  previewEquation: '3x + 2y = 12',
  interactiveProblem: {
    id: 'linear-standard-form',
    title: 'Convert Standard Form to Slope-Intercept Form',
    question: 'Find the slope and y-intercept of the line 3x + 2y = 12.',
    objective: 'Rewrite linear equations and interpret their graphs.',
    defaultEquation: '3x + 2y = 12',
    graphConfig: {
      type: 'linear',
      xRange: [-2, 6],
      yRange: [-2, 8],
      showGrid: true,
      showAxis: true,
      title: 'Linear Function: y = mx + b'
    },
    parameters: [
      {
        name: 'm',
        label: 'Slope (m)',
        value: -1.5,
        min: -5,
        max: 5,
        step: 0.1,
        description: 'Rate of change of the line'
      },
      {
        name: 'b',
        label: 'Y-intercept (b)',
        value: 6,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Point where the line crosses the y-axis'
      }
    ],
    solutionSteps: [
      {
        id: 'linear-step-1',
        title: 'Isolate the y-term',
        description: 'Move the 3x term to the right-hand side.',
        fromExpression: {
          latex: '3x + 2y = 12',
          display: '3x + 2y = 12'
        },
        toExpression: {
          latex: '2y = -3x + 12',
          display: '2y = -3x + 12'
        },
        explanation: 'Subtract 3x from both sides to keep the equation balanced.',
        hint: 'Whatever you do to one side must be done to the other.'
      },
      {
        id: 'linear-step-2',
        title: 'Solve for y',
        description: 'Divide every term by 2 to isolate y.',
        fromExpression: {
          latex: '2y = -3x + 12',
          display: '2y = -3x + 12'
        },
        toExpression: {
          latex: 'y = -\frac{3}{2}x + 6',
          display: 'y = -1.5x + 6'
        },
        explanation: 'Divide each term by 2: 2y/2 = y, -3x/2 = -1.5x, 12/2 = 6.',
        hint: 'Split the right-hand side term-by-term.',
        interactive: {
          type: 'input',
          correctAnswer: '-1.5'
        }
      },
      {
        id: 'linear-step-3',
        title: 'Interpret slope and intercept',
        description: 'Identify m and b from y = mx + b.',
        fromExpression: {
          latex: 'y = -\frac{3}{2}x + 6',
          display: 'y = -1.5x + 6'
        },
        toExpression: {
          latex: 'm = -\frac{3}{2},\, b = 6',
          display: 'Slope m = -1.5, y-intercept b = 6'
        },
        explanation: 'The coefficient of x is the slope; the constant term is the y-intercept.',
        hint: 'Match the format y = mx + b to the equation you derived.',
        interactive: {
          type: 'multiple-choice',
          options: ['Slope = -1.5, y-intercept = 6', 'Slope = 6, y-intercept = -1.5', 'Slope = 3, y-intercept = -2', 'Slope = -2, y-intercept = 3'],
          correctAnswer: 'Slope = -1.5, y-intercept = 6'
        }
      }
    ],
    tags: ['slope-intercept form', 'graphing'],
    calculatorAllowed: true
  },
  questionBank: [
    {
      id: 'linear-q1',
      prompt: 'Solve for x: 3x + 5 = 17.',
      choices: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
      correctChoiceIndex: 1,
      explanation: 'Subtract 5 from both sides to get 3x = 12, then divide by 3 to find x = 4.',
      difficulty: 'Easy',
      skillFocus: 'One-step linear equations',
      calculatorAllowed: false,
      strategyTip: 'Use inverse operations in the reverse order of the operations performed on x.'
    },
    {
      id: 'linear-q2',
      prompt: 'What is the slope of the line represented by 5y - 10x = 20?',
      choices: ['m = -2', 'm = 2', 'm = \frac{1}{2}', 'm = -\frac{1}{2}'],
      correctChoiceIndex: 1,
      explanation: 'Rewrite in slope-intercept form: 5y = 10x + 20 → y = 2x + 4. The slope is 2.',
      difficulty: 'Medium',
      skillFocus: 'Slope from standard form',
      calculatorAllowed: true,
      strategyTip: 'Always isolate y to clearly read the slope and intercept.'
    },
    {
      id: 'linear-q3',
      prompt: 'A line passes through the points (2, 5) and (6, 13). What is the equation of the line in slope-intercept form?',
      choices: ['y = 2x + 1', 'y = 2x + 5', 'y = 8x - 11', 'y = -2x + 9'],
      correctChoiceIndex: 0,
      explanation: 'Slope m = (13 - 5)/(6 - 2) = 8/4 = 2. Plug in point (2,5): 5 = 2(2) + b → b = 1, so y = 2x + 1.',
      difficulty: 'Medium',
      skillFocus: 'Slope through two points',
      calculatorAllowed: true,
      strategyTip: 'Find slope first, then substitute a point to solve for the intercept.'
    },
    {
      id: 'linear-q4',
      prompt: 'If a line has slope -\frac{3}{4} and passes through (0, 2), which of the following is its equation?',
      choices: ['y = -\frac{3}{4}x + 2', 'y = \frac{3}{4}x + 2', 'y = -\frac{3}{4}x - 2', 'y = \frac{4}{3}x + 2'],
      correctChoiceIndex: 0,
      explanation: 'When the y-intercept is 2, the equation is y = mx + b = -3/4 x + 2.',
      difficulty: 'Easy',
      skillFocus: 'Writing equations from slope and intercept',
      calculatorAllowed: false
    },
    {
      id: 'linear-q5',
      prompt: 'A phone plan costs $1.25 per minute after a $9 monthly fee. Which equation models the total cost C for m minutes?',
      choices: ['C = 1.25m + 9', 'C = 9m + 1.25', 'C = 9m - 1.25', 'C = 1.25m - 9'],
      correctChoiceIndex: 0,
      explanation: 'The fixed monthly fee is the y-intercept (9). The per-minute charge is the slope (1.25), so C = 1.25m + 9.',
      difficulty: 'Easy',
      skillFocus: 'Linear modeling',
      calculatorAllowed: true,
      strategyTip: 'Identify the fixed cost (intercept) and rate of change (slope) in word problems.'
    },
    {
      id: 'linear-q6',
      prompt: 'Which statement is true for the graph of y = -2x + 4?',
      choices: [
        'The line increases from left to right and crosses the y-axis at -4.',
        'The line decreases from left to right and crosses the y-axis at 4.',
        'The line increases from left to right and crosses the y-axis at 4.',
        'The line decreases from left to right and crosses the x-axis at 4.'
      ],
      correctChoiceIndex: 1,
      explanation: 'Slope -2 means the line decreases. When x = 0, y = 4 → y-intercept 4.',
      difficulty: 'Medium',
      skillFocus: 'Graph interpretation',
      calculatorAllowed: false
    }
  ],
  learningObjectives: [
    'Rewrite linear equations between standard and slope-intercept form',
    'Interpret slope and intercepts in graphs and real-world contexts',
    'Model scenarios with linear equations and validate solutions'
  ],
  strategyTips: [
    'Keep equations balanced by performing the same operation on both sides.',
    'Always reduce slope to simplest fractional form for clarity.',
    'Sketch quick intercepts to visualize the line before solving.'
  ],
  relatedSkills: ['Systems of Equations', 'Linear Inequalities'],
  references: [
    { title: 'SAT Official Practice - Linear Equations', url: 'https://satsuite.collegeboard.org/' }
  ]
};
