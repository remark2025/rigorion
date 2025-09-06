import { Question } from "@/types/QuestionInterface";

// Comprehensive sample questions covering all chapters, subjects, and exam numbers
export const comprehensiveSampleQuestions: Question[] = [
  // Interactive Math Questions - Chapter 1: Heart of Algebra
  {
    id: "MATH-INTERACTIVE-001",
    number: 0,
    content: "🧮 INTERACTIVE MATH QUESTION: The graph of y = ax² + bx + c passes through the points (0, 6), (2, -2), and (4, 6). What is the value of the coefficient 'a'?",
    difficulty: "medium",
    chapter: "Chapter 1",
    module: "All SAT Math",
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
    },
    quote: {
      text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
      source: "William Paul Thurston"
    }
  },
  // Math Questions - Chapter 1: Heart of Algebra
  {
    id: "MATH-001",
    number: 1,
    content: "If 3x + 5 = 17, what is the value of x?",
    solution: "Solving: 3x + 5 = 17, subtract 5 from both sides: 3x = 12, divide by 3: x = 4",
    difficulty: "easy",
    chapter: "Chapter 1", 
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 1,
    choices: ["2", "3", "4", "5"],
    correctAnswer: "4",
    explanation: "Solve by isolating x using inverse operations",
    solutionSteps: [
      "Start with: 3x + 5 = 17",
      "Subtract 5 from both sides: 3x = 12", 
      "Divide both sides by 3: x = 4"
    ],
    quote: {
      text: "The only way to learn mathematics is to do mathematics.",
      source: "Paul Halmos"
    }
  },
  {
    id: "MATH-002", 
    number: 2,
    content: "What is the slope of the line passing through points (2, 3) and (6, 11)?",
    solution: "Using slope formula: m = (y₂ - y₁)/(x₂ - x₁) = (11 - 3)/(6 - 2) = 8/4 = 2",
    difficulty: "medium",
    chapter: "Chapter 1",
    module: "All SAT Math", 
    bookmarked: false,
    examNumber: 1,
    choices: ["1", "2", "3", "4"],
    correctAnswer: "2",
    explanation: "Use the slope formula with the given coordinates",
    solutionSteps: [
      "Identify points: (2, 3) and (6, 11)",
      "Apply slope formula: m = (y₂ - y₁)/(x₂ - x₁)",
      "Substitute: m = (11 - 3)/(6 - 2) = 8/4 = 2"
    ],
    quote: {
      text: "Success is the result of preparation, hard work, and learning from failure.",
      source: "Colin Powell"
    }
  },

  // Math Questions - Chapter 2: Problem Solving and Data Analysis  
  {
    id: "MATH-003",
    number: 3, 
    content: "A survey shows that 60% of 250 students prefer pizza. How many students prefer pizza?",
    solution: "60% of 250 = 0.6 × 250 = 150 students",
    difficulty: "easy",
    chapter: "Chapter 2",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 2,
    choices: ["120", "135", "150", "165"],
    correctAnswer: "150",
    explanation: "Convert percentage to decimal and multiply",
    solutionSteps: [
      "Convert 60% to decimal: 0.6",
      "Multiply by total: 0.6 × 250 = 150"
    ],
    quote: {
      text: "The expert in anything was once a beginner.",
      source: "Helen Hayes"
    }
  },
  {
    id: "MATH-004",
    number: 4,
    content: "The mean of 5 numbers is 12. If four of the numbers are 8, 10, 14, and 16, what is the fifth number?",
    solution: "Mean = Sum/Count, so 12 = Sum/5, Sum = 60. Fifth number = 60 - (8+10+14+16) = 60 - 48 = 12",
    difficulty: "medium", 
    chapter: "Chapter 2",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 2,
    choices: ["10", "11", "12", "13"],
    correctAnswer: "12",
    explanation: "Use the mean formula to find the missing value",
    solutionSteps: [
      "Mean = Sum ÷ Count, so 12 = Sum ÷ 5",
      "Therefore Sum = 60",
      "Sum of known numbers: 8 + 10 + 14 + 16 = 48", 
      "Fifth number = 60 - 48 = 12"
    ],
    quote: {
      text: "Genius is one percent inspiration, ninety-nine percent perspiration.",
      source: "Thomas Edison"
    }
  },

  // Math Questions - Chapter 3: Passport to Advanced Math
  {
    id: "MATH-005",
    number: 5,
    content: "If f(x) = x² + 3x - 2, what is f(-1)?",
    solution: "f(-1) = (-1)² + 3(-1) - 2 = 1 - 3 - 2 = -4",
    difficulty: "medium",
    chapter: "Chapter 3",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 3,
    choices: ["-6", "-4", "-2", "0"],
    correctAnswer: "-4", 
    explanation: "Substitute x = -1 into the function",
    solutionSteps: [
      "Given: f(x) = x² + 3x - 2",
      "Substitute x = -1: f(-1) = (-1)² + 3(-1) - 2",
      "Calculate: f(-1) = 1 - 3 - 2 = -4"
    ],
    quote: {
      text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
      source: "William Paul Thurston"
    }
  },
  {
    id: "MATH-006",
    number: 6,
    content: "What is the area of a circle with radius 5 cm?",
    solution: "Using the formula A = πr², the area is calculated as 25π cm²",
    difficulty: "medium",
    chapter: "Chapter 3",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 3,
    choices: ["25π cm²", "10π cm²", "5π cm²", "100π cm²"],
    correctAnswer: "25π cm²",
    explanation: "Use the circle area formula A = πr²",
    solutionSteps: [
      "Start with the area formula: A = πr²",
      "Substitute the radius: r = 5cm", 
      "Calculate: A = π(5)² = 25π cm²"
    ],
    quote: {
      text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
      source: "Richard Feynman"
    }
  },

  // Reading Questions - Chapter 4: Reading Comprehension
  {
    id: "READ-001",
    number: 7,
    content: "Based on the passage, the author's primary purpose is to:",
    solution: "The author aims to inform readers about climate change effects",
    difficulty: "medium",
    chapter: "Chapter 4",
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 4,
    choices: [
      "Entertain readers with stories",
      "Persuade readers to take action", 
      "Inform about climate change effects",
      "Compare different viewpoints"
    ],
    correctAnswer: "Inform about climate change effects",
    explanation: "The passage presents factual information about climate impacts",
    solutionSteps: [
      "Identify the passage's main theme",
      "Look for the author's intent signals",
      "Determine if the purpose is to inform, persuade, or entertain"
    ],
    quote: {
      text: "Reading is to the mind what exercise is to the body.",
      source: "Joseph Addison"
    },
    passage: {
      title: "The Digital Revolution and Its Impact on Modern Society",
      content: "The digital revolution has fundamentally transformed how we communicate, work, and interact with information in the 21st century. Beginning with the widespread adoption of personal computers in the 1980s and accelerating with the emergence of the internet in the 1990s, this technological transformation has reshaped nearly every aspect of human society. From smartphones that connect billions of people instantly to artificial intelligence systems that can process vast amounts of data, digital technologies have created unprecedented opportunities for innovation, education, and global collaboration.\n\nHowever, this digital transformation has also introduced significant challenges that society continues to grapple with today. The rise of social media platforms has revolutionized how information spreads, but it has also created new venues for misinformation and cyberbullying. Privacy concerns have become paramount as personal data is collected and analyzed by corporations and governments on an unprecedented scale. The digital divide between those with access to technology and those without has created new forms of inequality, particularly affecting rural communities and lower-income populations who may lack reliable internet access or digital literacy skills.\n\nThe economic implications of the digital revolution are equally complex and far-reaching. While technology has created entirely new industries and job categories, it has also led to the automation of many traditional roles, displacing workers in manufacturing, retail, and service sectors. The gig economy, enabled by digital platforms, has provided flexibility for many workers but has also reduced job security and traditional employment benefits. Meanwhile, a handful of technology companies have accumulated enormous wealth and influence, raising concerns about market concentration and the power these entities wield over information flow and economic activity.\n\nLooking toward the future, the digital revolution shows no signs of slowing down. Emerging technologies such as quantum computing, advanced artificial intelligence, and the Internet of Things promise to bring even more dramatic changes to how we live and work. As these technologies continue to evolve, society faces the ongoing challenge of harnessing their benefits while mitigating their risks. This will require thoughtful regulation, investment in digital education and infrastructure, and a commitment to ensuring that the benefits of technological progress are shared broadly rather than concentrated among a privileged few. The choices we make today about how to develop and deploy these technologies will shape the world for generations to come.",
      source: "Technology and Society Quarterly"
    }
  },
  {
    id: "READ-002", 
    number: 8,
    content: "Which choice best describes the relationship between the two passages?",
    solution: "The passages present contrasting viewpoints on the same topic",
    difficulty: "hard",
    chapter: "Chapter 4", 
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 4,
    choices: [
      "They support the same conclusion",
      "They present contrasting viewpoints",
      "One passage refutes the other completely", 
      "They discuss unrelated topics"
    ],
    correctAnswer: "They present contrasting viewpoints",
    explanation: "Look for opposing arguments or different perspectives",
    solutionSteps: [
      "Identify the main argument in each passage",
      "Compare the authors' positions",
      "Determine the relationship between their viewpoints"
    ],
    quote: {
      text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      source: "Dr. Seuss"
    }
  },

  // Writing Questions - Chapter 5: Writing and Language
  {
    id: "WRITE-001",
    number: 9,
    content: "Which choice provides the most effective transition between sentences?",
    solution: "However, provides the best contrast between the ideas",
    difficulty: "medium", 
    chapter: "Chapter 5",
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 5,
    choices: [
      "Therefore,", 
      "However,",
      "In addition,",
      "For example,"
    ],
    correctAnswer: "However,",
    explanation: "The context requires a contrasting transition word",
    solutionSteps: [
      "Identify the relationship between sentences",
      "Determine if contrast, addition, or example is needed", 
      "Choose the appropriate transition word"
    ]
  },
  {
    id: "WRITE-002",
    number: 10,
    content: "Which choice maintains the sentence's focus on environmental benefits?",
    solution: "The revision should emphasize ecological advantages",
    difficulty: "medium",
    chapter: "Chapter 5", 
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 5,
    choices: [
      "Solar panels reduce electricity costs significantly",
      "Solar panels provide clean, renewable energy",
      "Solar panels are becoming more affordable",
      "Solar panels require minimal maintenance"
    ],
    correctAnswer: "Solar panels provide clean, renewable energy",
    explanation: "This choice directly addresses environmental benefits",
    solutionSteps: [
      "Identify the sentence's intended focus",
      "Eliminate options that shift to other topics",
      "Choose the option that best maintains the environmental theme"
    ]
  },

  // Additional questions for each exam to ensure no "unavailable" messages
  {
    id: "MATH-007",
    number: 11,
    content: "Solve for y: 2y - 8 = 14",
    solution: "2y - 8 = 14, add 8: 2y = 22, divide by 2: y = 11",
    difficulty: "easy",
    chapter: "Chapter 1",
    module: "All SAT Math", 
    bookmarked: false,
    examNumber: 1,
    choices: ["9", "10", "11", "12"],
    correctAnswer: "11",
    explanation: "Isolate y using inverse operations",
    solutionSteps: [
      "Start with: 2y - 8 = 14",
      "Add 8 to both sides: 2y = 22",
      "Divide by 2: y = 11"
    ]
  },
  {
    id: "MATH-008",
    number: 12,
    content: "What is 25% of 80?", 
    solution: "25% of 80 = 0.25 × 80 = 20",
    difficulty: "easy",
    chapter: "Chapter 2",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 2,
    choices: ["15", "20", "25", "30"],
    correctAnswer: "20",
    explanation: "Convert percentage to decimal and multiply",
    solutionSteps: [
      "Convert 25% to decimal: 0.25",
      "Multiply: 0.25 × 80 = 20"
    ]
  },
  {
    id: "MATH-009",
    number: 13,
    content: "Simplify: (x + 3)(x - 2)",
    solution: "(x + 3)(x - 2) = x² - 2x + 3x - 6 = x² + x - 6",
    difficulty: "medium",
    chapter: "Chapter 3",
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 3,
    choices: ["x² - x - 6", "x² + x - 6", "x² - x + 6", "x² + x + 6"],
    correctAnswer: "x² + x - 6",
    explanation: "Use FOIL method to expand",
    solutionSteps: [
      "First: x × x = x²",
      "Outer: x × (-2) = -2x", 
      "Inner: 3 × x = 3x",
      "Last: 3 × (-2) = -6",
      "Combine: x² - 2x + 3x - 6 = x² + x - 6"
    ]
  },
  {
    id: "READ-003",
    number: 14,
    content: "The author uses the metaphor of 'a bridge between worlds' to:",
    solution: "The metaphor emphasizes connection and transition between different concepts",
    difficulty: "medium",
    chapter: "Chapter 4",
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 4,
    choices: [
      "Show physical distance",
      "Emphasize connection between concepts",
      "Describe architectural features",
      "Illustrate time progression"
    ],
    correctAnswer: "Emphasize connection between concepts",
    explanation: "Metaphors create comparisons to convey deeper meaning",
    solutionSteps: [
      "Identify what the metaphor compares",
      "Consider the context and purpose",
      "Determine the intended meaning or effect"
    ]
  },
  {
    id: "WRITE-003",
    number: 15,
    content: "Which choice correctly uses parallel structure?",
    solution: "The sentence should maintain consistent grammatical form",
    difficulty: "medium",
    chapter: "Chapter 5",
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 5,
    choices: [
      "She enjoys reading, writing, and to paint",
      "She enjoys reading, writing, and painting", 
      "She enjoys to read, writing, and painting",
      "She enjoys reading, to write, and painting"
    ],
    correctAnswer: "She enjoys reading, writing, and painting",
    explanation: "All items in the series should have the same grammatical form",
    solutionSteps: [
      "Identify the series of items",
      "Check that all items use the same grammatical structure",
      "Ensure parallel construction throughout"
    ]
  },

  // Additional SAT Reading questions for better module coverage
  {
    id: "READ-004",
    number: 16,
    content: "In the context of the passage, what does the author mean by 'a watershed moment'?",
    solution: "The author uses 'watershed moment' to describe a critical turning point that changed everything",
    difficulty: "medium",
    chapter: "Chapter 1",
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 1,
    choices: [
      "A moment near water",
      "A critical turning point",
      "A confused situation", 
      "A celebratory event"
    ],
    correctAnswer: "A critical turning point",
    explanation: "Watershed moment is an idiom meaning a pivotal point in time",
    solutionSteps: [
      "Identify the phrase in context",
      "Consider figurative vs literal meaning",
      "Choose the meaning that fits the passage's tone"
    ],
    passage: {
      title: "Climate Change and Its Global Impact",
      content: `Climate change represents one of the most pressing challenges of our time, fundamentally altering weather patterns and ecosystem dynamics across the globe. Scientists have reached a consensus that anthropogenic factors—primarily the emission of greenhouse gases from industrial activities—are the predominant drivers of current warming trends.

This realization marked a watershed moment in environmental science, fundamentally changing how we approach conservation and policy-making. The ramifications of this phenomenon are far-reaching and multifaceted. Rising sea levels threaten coastal communities, while increasingly erratic precipitation patterns disrupt agricultural systems worldwide.

However, the situation is not entirely without hope. Innovative technologies, such as renewable energy systems and carbon capture mechanisms, offer potential pathways to mitigation. Furthermore, international cooperation through agreements like the Paris Climate Accord demonstrates a collective commitment to addressing this global crisis.`,
      source: "Environmental Science Quarterly, 2024"
    }
  },
  {
    id: "READ-005", 
    number: 17,
    content: "The data in the graph supports which claim from the passage?",
    solution: "The graph shows increasing trends that support the author's argument about growth",
    difficulty: "hard",
    chapter: "Chapter 2",
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 2,
    choices: [
      "Technology adoption is slowing down",
      "Growth rates are increasing steadily",
      "There are no clear patterns",
      "The data contradicts the text"
    ],
    correctAnswer: "Growth rates are increasing steadily",
    explanation: "Look for correlation between visual data and textual claims",
    solutionSteps: [
      "Identify the relevant claim in the passage",
      "Examine the graph data carefully",
      "Match the data trend to the textual argument"
    ]
  },
  {
    id: "READ-006",
    number: 18, 
    content: "Which choice best maintains the cohesive focus of the paragraph?",
    solution: "The sentence should relate directly to the main topic without introducing new themes",
    difficulty: "medium",
    chapter: "Chapter 3",
    module: "SAT Reading",
    bookmarked: false,
    examNumber: 3,
    choices: [
      "Scientists have made remarkable discoveries lately",
      "The research confirms our initial hypothesis about ocean temperatures",
      "Many people enjoy swimming in the ocean",
      "Funding for research projects varies significantly"
    ],
    correctAnswer: "The research confirms our initial hypothesis about ocean temperatures",
    explanation: "This choice directly relates to the paragraph's research focus",
    solutionSteps: [
      "Identify the paragraph's main topic",
      "Eliminate choices that introduce new themes", 
      "Select the choice that best supports the focus"
    ]
  },

  // Additional SAT Writing questions for better module coverage
  {
    id: "WRITE-004",
    number: 19,
    content: "Which choice results in the most effective sentence?",
    solution: "The most concise and clear option without redundancy",
    difficulty: "medium",
    chapter: "Chapter 1", 
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 1,
    choices: [
      "The student's performance was really very exceptionally outstanding",
      "The student's performance was exceptional",
      "The student's performance was really exceptional and outstanding",
      "The performance of the student was very exceptionally outstanding"
    ],
    correctAnswer: "The student's performance was exceptional",
    explanation: "Eliminate redundant words and phrases for clarity",
    solutionSteps: [
      "Identify redundant or unnecessary words",
      "Choose the most concise option",
      "Ensure the meaning remains clear"
    ],
    quote: {
      text: "The secret to getting ahead is getting started.",
      source: "Mark Twain"
    }
  },
  {
    id: "WRITE-005",
    number: 20,
    content: "Should the writer add this sentence to the paragraph?",
    solution: "Evaluate whether the sentence supports the paragraph's purpose and maintains focus",
    difficulty: "medium",
    chapter: "Chapter 2",
    module: "SAT Writing", 
    bookmarked: false,
    examNumber: 2,
    choices: [
      "Yes, because it provides essential background information",
      "Yes, because it creates an interesting contrast",
      "No, because it contradicts information presented earlier",
      "No, because it introduces an irrelevant detail"
    ],
    correctAnswer: "No, because it introduces an irrelevant detail",
    explanation: "The sentence doesn't support the paragraph's main focus",
    solutionSteps: [
      "Identify the paragraph's main purpose",
      "Determine if the sentence supports that purpose",
      "Consider whether it adds value or creates distraction"
    ],
    quote: {
      text: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
      source: "Aristotle"
    }
  },
  {
    id: "WRITE-006",
    number: 21,
    content: "Which choice correctly punctuates the sentence?",
    solution: "Use proper comma placement for clarity and grammatical correctness",
    difficulty: "easy",
    chapter: "Chapter 3",
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 3,
    choices: [
      "Although the weather was cold, we decided to go hiking.",
      "Although the weather was cold we decided to go hiking.",
      "Although, the weather was cold, we decided to go hiking.",
      "Although the weather was cold, we decided, to go hiking."
    ],
    correctAnswer: "Although the weather was cold, we decided to go hiking.",
    explanation: "Use a comma after an introductory dependent clause",
    solutionSteps: [
      "Identify the dependent clause",
      "Place comma after the introductory clause",
      "Ensure no unnecessary commas are added"
    ]
  },
  {
    id: "WRITE-007",
    number: 22,
    content: "Which choice best combines the two sentences?",
    solution: "Create a smooth, logical connection between related ideas",
    difficulty: "medium",
    chapter: "Chapter 4",
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 4,
    choices: [
      "The experiment failed, and the results were inconclusive, but we learned valuable lessons.",
      "The experiment failed; however, we learned valuable lessons from the inconclusive results.",
      "Although the experiment failed and results were inconclusive, we learned valuable lessons.",
      "The experiment failed, the results were inconclusive, we learned valuable lessons."
    ],
    correctAnswer: "Although the experiment failed and results were inconclusive, we learned valuable lessons.",
    explanation: "This choice creates the clearest logical relationship",
    solutionSteps: [
      "Identify the relationship between the ideas",
      "Choose appropriate connecting words",
      "Ensure proper punctuation and flow"
    ]
  },
  {
    id: "WRITE-008",
    number: 23,
    content: "Which choice provides the most precise word?",
    solution: "Select the word that best fits the specific context and meaning",
    difficulty: "medium", 
    chapter: "Chapter 5",
    module: "SAT Writing",
    bookmarked: false,
    examNumber: 5,
    choices: [
      "The scientist found the results",
      "The scientist discovered the results", 
      "The scientist obtained the results",
      "The scientist got the results"
    ],
    correctAnswer: "The scientist obtained the results",
    explanation: "Obtained is most precise for acquiring research results",
    solutionSteps: [
      "Consider the specific context",
      "Evaluate the precision of each word choice",
      "Select the most appropriate and precise option"
    ]
  },

  // Math Question with Graph Example
  {
    id: "MATH-GRAPH-001",
    number: 24,
    content: "The graph shows the relationship between the number of hours studied and test scores. Based on the graph, what is the approximate test score for a student who studied for 6 hours?",
    solution: "Looking at the graph, at x = 6 hours, the corresponding y-value (test score) is approximately 85.",
    difficulty: "medium",
    chapter: "Chapter 2", 
    module: "All SAT Math",
    bookmarked: false,
    examNumber: 3,
    choices: ["75", "80", "85", "90"],
    correctAnswer: "85",
    explanation: "Read the y-value from the graph at x = 6 hours",
    graph: {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIC0tPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjEiLz4KICAKICA8IS0tIEdyaWQgTGluZXMgLS0+CiAgPGRlZnM+CiAgICA8cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2YwZjBmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KICAKICA8IS0tIEF4ZXMgLS0+CiAgPGxpbmUgeDE9IjQwIiB5MT0iMjUwIiB4Mj0iMzYwIiB5Mj0iMjUwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxsaW5lIHgxPSI0MCIgeTE9IjI1MCIgeDI9IjQwIiB5Mj0iNTAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSBBcnJvd3MgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSIzNjAsMjUwIDM1NSwyNDUgMzU1LDI1NSIgZmlsbD0iIzMzMyIvPgogIDxwb2x5Z29uIHBvaW50cz0iNDAsNTAgNDUsNTUgMzUsNTUiIGZpbGw9IiMzMzMiLz4KICAKICA8IS0tIFgtYXhpcyBsYWJlbHMgLS0+CiAgPHRleHQgeD0iNDAiIHk9IjI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj4wPC90ZXh0PgogIDx0ZXh0IHg9IjEyMCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPjI8L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIyNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCI+NDwvdGV4dD4KICA8dGV4dCB4PSIyODAiIHk9IjI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj42PC90ZXh0PgogIDx0ZXh0IHg9IjM2MCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPjg8L3RleHQ+CiAgCiAgPCEtLSBZLWF4aXMgbGFiZWxzIC0tPgogIDx0ZXh0IHg9IjI1IiB5PSIyNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCI+NDA8L3RleHQ+CiAgPHRleHQgeD0iMjUiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj41MDwvdGV4dD4KICA8dGV4dCB4PSIyNSIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPjYwPC90ZXh0PgogIDx0ZXh0IHg9IjI1IiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCI+NzA8L3RleHQ+CiAgPHRleHQgeD0iMjUiIHk9IjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPjgwPC90ZXh0PgogIDx0ZXh0IHg9IjI1IiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj45MDwvdGV4dD4KICAKICA8IS0tIERhdGEgcG9pbnRzIC0tPgogIDxjaXJjbGUgY3g9IjQwIiBjeT0iMjMwIiByPSI0IiBmaWxsPSIjMDA3Y2JhIi8+CiAgPGNpcmNsZSBjeD0iMTIwIiBjeT0iMjAwIiByPSI0IiBmaWxsPSIjMDA3Y2JhIi8+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTYwIiByPSI0IiBmaWxsPSIjMDA3Y2JhIi8+CiAgPGNpcmNsZSBjeD0iMjgwIiBjeT0iMTEwIiByPSI0IiBmaWxsPSIjMDA3Y2JhIi8+CiAgPGNpcmNsZSBjeD0iMzYwIiBjeT0iODAiIHI9IjQiIGZpbGw9IiMwMDdjYmEiLz4KICAKICA8IS0tIExpbmUgY29ubmVjdGluZyBwb2ludHMgLS0+CiAgPHBhdGggZD0iTSA0MCAyMzAgTCAxMjAgMjAwIEwgMjAwIDE2MCBMIDI4MCAxMTAgTCAzNjAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwN2NiYSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSBBeGlzIGxhYmVscyAtLT4KICA8dGV4dCB4PSIyMDAiIHk9IjI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCI+SG91cnMgU3R1ZGllZDwvdGV4dD4KICA8dGV4dCB4PSIxNSIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSgtOTAgMTUgMTUwKSI+VGVzdCBTY29yZTwvdGV4dD4KPC9zdmc+"
    },
    solutionSteps: [
      "Locate x = 6 on the horizontal axis (Hours Studied)",
      "Follow the vertical line up to the data point",
      "Read the corresponding y-value (Test Score) from the vertical axis",
      "The test score at 6 hours is approximately 85"
    ],
    quote: {
      text: "A graph is worth a thousand words.",
      source: "Mathematical Wisdom"
    }
  },

  // SAT Writing Questions
  {
    id: "writing-essay-1",
    number: 24,
    content: "Some educators argue that social media use among teenagers should be strictly limited during school hours to improve mental health and academic focus. Others contend that social media is an important tool for communication and learning that should not be restricted. Write an essay in which you develop a position on whether schools should limit students' social media use during school hours. Use appropriate evidence and examples to support your argument.",
    choices: [], // Writing questions don't have multiple choice answers
    correctAnswer: "", // Essays are evaluated differently
    solution: "This is an argumentative essay prompt. Students should choose a clear position (for or against limiting social media), provide strong evidence, address counterarguments, and maintain a logical structure throughout their response.",
    difficulty: "intermediate" as const,
    chapter: "Writing and Language",
    module: "writing" as const,
    examNumber: 1,
    hint: "Choose a clear position early and stick to it. Use specific examples and evidence to support your argument. Don't forget to address the opposing viewpoint.",
    explanation: "SAT Essay questions require students to take a position on an issue and defend it with evidence and reasoning. The key is to have a clear thesis, organize your thoughts logically, and use specific examples.",
    calculatorAllowed: false,
    type: "essay" as const,
    topics: ["Social Media", "Education", "Youth Policy"],
    estimatedTime: 50,
    topic: "Education and Technology",
    bookmarked: false,
    level: "medium" as const
  },

  {
    id: "writing-essay-2", 
    number: 25,
    content: "Artificial intelligence and automation are rapidly changing the job market. While some argue that AI will create new opportunities and increase productivity, others worry about widespread unemployment and economic inequality. Write an essay in which you argue whether the benefits of AI advancement outweigh the potential risks to employment. Use specific examples and evidence to support your position.",
    choices: [],
    correctAnswer: "",
    solution: "This argumentative essay requires students to weigh benefits against risks of AI technology. Strong essays will include specific examples, consider economic implications, and address counterarguments while maintaining a clear position.",
    difficulty: "advanced" as const,
    chapter: "Writing and Language",
    module: "writing" as const,
    examNumber: 1,
    hint: "Consider both immediate and long-term effects of AI on employment. Use specific examples from industries already affected by automation.",
    explanation: "Advanced essay prompts like this require sophisticated analysis of complex issues. Students must demonstrate understanding of economic concepts while constructing a persuasive argument.",
    calculatorAllowed: false,
    type: "essay" as const,
    topics: ["Technology", "Economics", "Future of Work"],
    estimatedTime: 50,
    topic: "Technology and Society",
    bookmarked: false,
    level: "hard" as const
  },

  {
    id: "writing-narrative-1",
    number: 26,
    content: "Write a narrative essay about a time when you experienced a significant failure, setback, or disappointment. Focus not just on what happened, but on how the experience changed your perspective, approach, or understanding of yourself. Your essay should include vivid details about the experience, your emotional journey through it, and the lasting impact it has had on your life.",
    choices: [],
    correctAnswer: "",
    solution: "This personal narrative essay should include: engaging opening, background context, detailed main event, challenges faced, personal growth, and reflection on lasting impact. Focus on storytelling with meaningful reflection.",
    difficulty: "intermediate" as const,
    chapter: "Writing and Language", 
    module: "writing" as const,
    examNumber: 1,
    hint: "Use sensory details and show your emotions throughout the experience. The key is to demonstrate personal growth and learning from the setback.",
    explanation: "Narrative essays require students to tell a compelling personal story while reflecting on its significance. Good narratives balance storytelling with introspection.",
    calculatorAllowed: false,
    type: "essay" as const,
    topics: ["Personal Growth", "Resilience", "Life Lessons"],
    estimatedTime: 50,
    topic: "Personal Experience",
    bookmarked: false,
    level: "medium" as const
  }
];

export default comprehensiveSampleQuestions;