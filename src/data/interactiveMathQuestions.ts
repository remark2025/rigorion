import { Question } from "@/types/QuestionInterface";

export const interactiveMathQuestions: Question[] = [
  {
    id: "math_quadratic_1",
    number: 1,
    content: "The graph of y = ax² + bx + c passes through the points (0, 6), (2, -2), and (4, 6). What is the value of the coefficient 'a'?",
    difficulty: "medium",
    chapter: "Algebra",
    module: "Math",
    bookmarked: false,
    examNumber: 1,
    choices: [
      "a = 1",
      "a = 2", 
      "a = -1",
      "a = 3"
    ],
    correctAnswer: "a = 2",
    explanation: "Using the three given points, we can set up a system of equations to solve for the coefficients.",
    solutionSteps: [
      "Substitute point (0, 6): 6 = a(0)² + b(0) + c → c = 6",
      "Substitute point (2, -2): -2 = a(4) + b(2) + 6 → 4a + 2b = -8",
      "Substitute point (4, 6): 6 = a(16) + b(4) + 6 → 16a + 4b = 0",
      "Solve the system: From 16a + 4b = 0, we get b = -4a",
      "Substitute into 4a + 2b = -8: 4a + 2(-4a) = -8 → 4a - 8a = -8 → -4a = -8 → a = 2"
    ],
    solution: "The coefficient a = 2. This creates a parabola that opens upward and passes through all three given points.",
    hint: "Use the three given points to create a system of three equations with three unknowns (a, b, c).",
    calculatorAllowed: true,
    interactiveSolution: {
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
    }
  },
  
  {
    id: "math_linear_1",
    number: 2,
    content: "A line passes through the points (-2, 5) and (3, -10). What is the slope of this line?",
    difficulty: "easy",
    chapter: "Linear Functions",
    module: "Math", 
    bookmarked: false,
    examNumber: 1,
    choices: [
      "m = -3",
      "m = 3",
      "m = -1/3", 
      "m = 1/3"
    ],
    correctAnswer: "m = -3",
    explanation: "Use the slope formula: m = (y₂ - y₁)/(x₂ - x₁)",
    solutionSteps: [
      "Identify the two points: (-2, 5) and (3, -10)",
      "Apply slope formula: m = (y₂ - y₁)/(x₂ - x₁)",
      "Substitute values: m = (-10 - 5)/(3 - (-2)) = -15/5 = -3"
    ],
    solution: "The slope is -3, indicating the line decreases 3 units vertically for every 1 unit it moves horizontally.",
    hint: "Remember: slope = rise over run = change in y over change in x",
    calculatorAllowed: false,
    interactiveSolution: {
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
          title: 'Calculate the Numerator',
          description: 'Simplify the change in y',
          fromExpression: {
            latex: 'y_2 - y_1 = -10 - 5',
            display: 'y₂ - y₁ = -10 - 5'
          },
          toExpression: {
            latex: 'y_2 - y_1 = -15',
            display: 'y₂ - y₁ = -15'
          },
          explanation: 'The vertical change (rise) is -15 units',
          hint: 'When subtracting a positive from a negative, add the magnitudes and keep the negative sign',
          interactive: {
            type: 'input',
            correctAnswer: '-15'
          }
        },
        {
          id: 'linear-4',
          title: 'Calculate the Denominator',
          description: 'Simplify the change in x',
          fromExpression: {
            latex: 'x_2 - x_1 = 3 - (-2)',
            display: 'x₂ - x₁ = 3 - (-2)'
          },
          toExpression: {
            latex: 'x_2 - x_1 = 3 + 2 = 5',
            display: 'x₂ - x₁ = 3 + 2 = 5'
          },
          explanation: 'The horizontal change (run) is 5 units',
          hint: 'Subtracting a negative is the same as adding: 3 - (-2) = 3 + 2',
          interactive: {
            type: 'input',
            correctAnswer: '5'
          }
        },
        {
          id: 'linear-5',
          title: 'Calculate the Slope',
          description: 'Divide rise by run',
          fromExpression: {
            latex: 'm = \\frac{-15}{5}',
            display: 'm = -15/5'
          },
          toExpression: {
            latex: 'm = -3',
            display: 'm = -3'
          },
          explanation: 'The slope is -3, meaning the line goes down 3 units for every 1 unit right',
          hint: 'Divide -15 by 5'
        }
      ]
    }
  },
  {
    id: "reading_climate_1",
    number: 15,
    content: "According to the passage, what is the primary cause of current climate change trends?",
    difficulty: "medium",
    chapter: "Reading",
    module: "Reading",
    bookmarked: false,
    examNumber: 1,
    choices: [
      "Natural weather variations",
      "Anthropogenic factors from industrial activities", 
      "Solar radiation changes",
      "Ocean current shifts"
    ],
    correctAnswer: "Anthropogenic factors from industrial activities",
    explanation: "The passage states that scientists have reached a consensus that anthropogenic factors—primarily the emission of greenhouse gases from industrial activities—are the predominant drivers of current warming trends.",
    solutionSteps: [
      "Identify the key sentence about climate change causes",
      "Look for the term 'anthropogenic factors'",
      "Note that this refers to human-caused factors",
      "Connect this to industrial activities and greenhouse gas emissions"
    ],
    solution: "The passage clearly identifies anthropogenic factors (human-caused factors), specifically greenhouse gas emissions from industrial activities, as the primary drivers of current climate change trends.",
    hint: "Look for the word 'anthropogenic' in the passage - this is a key scientific term.",
    calculatorAllowed: false,
    passage: {
      title: "Climate Change and Its Global Impact",
      content: `Climate change represents one of the most pressing challenges of our time, fundamentally altering weather patterns and ecosystem dynamics across the globe. Scientists have reached a consensus that anthropogenic factors—primarily the emission of greenhouse gases from industrial activities—are the predominant drivers of current warming trends.

The ramifications of this phenomenon are far-reaching and multifaceted. Rising sea levels threaten coastal communities, while increasingly erratic precipitation patterns disrupt agricultural systems worldwide. Moreover, the thermal expansion of ocean waters, coupled with glacial melting, exacerbates flooding risks in low-lying areas.

However, the situation is not entirely without hope. Innovative technologies, such as renewable energy systems and carbon capture mechanisms, offer potential pathways to mitigation. Furthermore, international cooperation through agreements like the Paris Climate Accord demonstrates a collective commitment to addressing this global crisis.

Nevertheless, skeptics argue that the economic costs of transitioning to sustainable practices may outweigh the benefits, particularly for developing nations already struggling with poverty and infrastructure deficits. This perspective, while understandable, fails to account for the long-term economic devastation that unchecked climate change would inevitably bring.

In conclusion, while the challenge of climate change is undeniably complex and daunting, the convergence of scientific understanding, technological innovation, and political will suggests that meaningful progress is not only possible but essential for the future of humanity.`,
      source: "Scientific Journal on Climate Studies, 2024"
    }
  }
];