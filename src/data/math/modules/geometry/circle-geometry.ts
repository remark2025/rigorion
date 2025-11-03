import { MathModule } from '../../types';

export const circleGeometryModule: MathModule = {
  id: 'math-circle-geometry',
  title: 'Circle Geometry & Properties',
  skill: 'Circle Equations and Properties',
  category: 'Geometry',
  difficulty: 'Medium',
  questionCount: 5,
  imageUrl: '/resources/sphere-3d-model-3840x2160-10993.jpg',
  description: 'Explore circle equations, area, circumference, and chord properties with interactive visualizations.',
  estimatedTime: 15,
  tags: ['geometry', 'circles', 'radius', 'circumference', 'area'],
  previewEquation: '(x - h)² + (y - k)² = r²',
  interactiveProblem: {
    id: 'circle-standard-form',
    title: 'Circle Equation and Properties',
    question: 'Find the center and radius of the circle: (x - 3)² + (y + 2)² = 25',
    objective: 'Identify circle properties from standard form equation.',
    defaultEquation: '(x - 3)² + (y + 2)² = 25',
    graphConfig: {
      type: 'linear',
      xRange: [-5, 10],
      yRange: [-8, 5],
      showGrid: true,
      showAxis: true,
      title: 'Circle: (x - h)² + (y - k)² = r²'
    },
    parameters: [
      {
        name: 'h',
        label: 'Center x-coordinate (h)',
        value: 3,
        min: -5,
        max: 5,
        step: 1,
        description: 'Horizontal position of circle center'
      },
      {
        name: 'k',
        label: 'Center y-coordinate (k)',
        value: -2,
        min: -5,
        max: 5,
        step: 1,
        description: 'Vertical position of circle center'
      },
      {
        name: 'r',
        label: 'Radius (r)',
        value: 5,
        min: 1,
        max: 8,
        step: 0.5,
        description: 'Distance from center to any point on circle'
      }
    ],
    solutionSteps: [
      {
        id: 'circle-step-1',
        title: 'Identify the standard form',
        description: 'Compare with (x - h)² + (y - k)² = r²',
        fromExpression: {
          latex: '(x - 3)^2 + (y + 2)^2 = 25',
          display: '(x - 3)² + (y + 2)² = 25'
        },
        toExpression: {
          latex: '(x - 3)^2 + (y - (-2))^2 = 5^2',
          display: '(x - 3)² + (y - (-2))² = 5²'
        },
        explanation: 'Rewrite y + 2 as y - (-2) to match standard form pattern.',
        hint: 'Remember that (y + k) = (y - (-k))'
      },
      {
        id: 'circle-step-2',
        title: 'Find the center coordinates',
        description: 'Extract h and k values from the equation.',
        fromExpression: {
          latex: '(x - 3)^2 + (y - (-2))^2 = 5^2',
          display: '(x - 3)² + (y - (-2))² = 5²'
        },
        toExpression: {
          latex: 'h = 3, k = -2',
          display: 'Center: (3, -2)'
        },
        explanation: 'The center is at (h, k) = (3, -2).',
        hint: 'The signs inside parentheses are opposite to the center coordinates.',
        interactive: {
          type: 'input',
          correctAnswer: '(3, -2)'
        }
      },
      {
        id: 'circle-step-3',
        title: 'Determine the radius',
        description: 'Find r from the right side of the equation.',
        fromExpression: {
          latex: '(x - 3)^2 + (y + 2)^2 = 25',
          display: '(x - 3)² + (y + 2)² = 25'
        },
        toExpression: {
          latex: 'r^2 = 25 \\Rightarrow r = 5',
          display: 'r² = 25 → r = 5'
        },
        explanation: 'Since r² = 25, we take the positive square root: r = 5.',
        hint: 'Radius is always positive.',
        interactive: {
          type: 'multiple-choice',
          options: ['r = 5', 'r = 25', 'r = ±5', 'r = 625'],
          correctAnswer: 'r = 5'
        }
      }
    ],
    tags: ['circle equation', 'center', 'radius'],
    calculatorAllowed: true
  },
  questionBank: [
    {
      id: 'circle-q1',
      prompt: 'What is the area of a circle with radius 6 units?',
      choices: ['12π square units', '36π square units', '6π square units', '72π square units'],
      correctChoiceIndex: 1,
      explanation: 'Area = πr² = π(6)² = 36π square units.',
      difficulty: 'Easy',
      skillFocus: 'Circle area formula',
      calculatorAllowed: true,
      strategyTip: 'Remember: Area = πr², Circumference = 2πr'
    },
    {
      id: 'circle-q2',
      prompt: 'A circle has center (-2, 4) and radius 7. What is its equation in standard form?',
      choices: [
        '(x + 2)² + (y - 4)² = 49',
        '(x - 2)² + (y + 4)² = 49', 
        '(x + 2)² + (y - 4)² = 7',
        '(x - 2)² + (y - 4)² = 49'
      ],
      correctChoiceIndex: 0,
      explanation: 'Standard form: (x - h)² + (y - k)² = r². With center (-2, 4), we get (x - (-2))² + (y - 4)² = 7² = (x + 2)² + (y - 4)² = 49.',
      difficulty: 'Medium',
      skillFocus: 'Circle equation from center and radius',
      calculatorAllowed: false,
      strategyTip: 'Watch the signs! (x - h) means the center x-coordinate is h.'
    },
    {
      id: 'circle-q3',
      prompt: 'The circumference of a circle is 14π units. What is the diameter?',
      choices: ['7 units', '14 units', '28 units', '49 units'],
      correctChoiceIndex: 1,
      explanation: 'Circumference = 2πr = πd, so 14π = πd. Therefore d = 14 units.',
      difficulty: 'Easy',
      skillFocus: 'Circumference and diameter relationship',
      calculatorAllowed: true,
      strategyTip: 'Diameter = 2 × radius, and Circumference = π × diameter'
    },
    {
      id: 'circle-q4',
      prompt: 'A circle passes through points (0, 0), (8, 0), and (4, 4). What is the center of this circle?',
      choices: ['(4, 2)', '(4, 4)', '(0, 4)', '(8, 4)'],
      correctChoiceIndex: 0,
      explanation: 'The center is equidistant from all three points. By symmetry and calculation, the center is at (4, 2).',
      difficulty: 'Hard',
      skillFocus: 'Finding circle center from three points',
      calculatorAllowed: true,
      strategyTip: 'Use the fact that the center is equidistant from any two points on the circle.'
    },
    {
      id: 'circle-q5',
      prompt: 'In a circle with center O, if chord AB has length 8 and is 3 units from the center, what is the radius?',
      choices: ['4 units', '5 units', '6 units', '7 units'],
      correctChoiceIndex: 1,
      explanation: 'Using the chord-to-center distance formula: r² = (chord/2)² + distance² = 4² + 3² = 16 + 9 = 25, so r = 5.',
      difficulty: 'Hard',
      skillFocus: 'Chord properties and Pythagorean theorem',
      calculatorAllowed: true,
      strategyTip: 'Draw a perpendicular from center to chord - it bisects the chord and forms a right triangle.'
    }
  ],
  learningObjectives: [
    'Write circle equations in standard form given center and radius',
    'Calculate area and circumference using appropriate formulas',
    'Solve problems involving chords, radii, and circle properties'
  ],
  strategyTips: [
    'Always identify whether you need area (πr²) or circumference (2πr)',
    'In circle equations, the signs are opposite to the center coordinates',
    'Draw diagrams to visualize chord and radius relationships'
  ],
  relatedSkills: ['Distance Formula', 'Pythagorean Theorem', 'Coordinate Geometry'],
  references: [
    { title: 'SAT Math Practice - Circle Geometry', url: 'https://satsuite.collegeboard.org/' }
  ]
};