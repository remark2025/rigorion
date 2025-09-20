// Mock reading analysis service with pre-crafted educational responses
interface ReadingAnalysis {
  patterns: Array<{
    type: string;
    description: string;
    examples: string[];
    importance: 'high' | 'medium' | 'low';
  }>;
  simplification: {
    mainIdea: string;
    keyPoints: string[];
    summary: string;
    readingLevel: string;
  };
  ideaTracing: Array<{
    idea: string;
    development: string[];
    connections: string[];
    evidence: string[];
  }>;
  questions: Array<{
    type: string;
    question: string;
    answer: string;
    explanation: string;
  }>;
}

// Pre-analyzed responses for different passage types
const MOCK_ANALYSES: { [key: string]: ReadingAnalysis } = {
  // AI Technology passage
  'artificial intelligence': {
    patterns: [
      {
        type: 'Chronological Development',
        description: 'The passage traces AI evolution from the 1950s to present day, showing clear temporal progression.',
        examples: ['1950s inception', 'early rule-based systems', 'machine learning breakthrough', 'current deep learning era'],
        importance: 'high'
      },
      {
        type: 'Cause and Effect',
        description: 'The text shows how limitations of early systems led to new developments.',
        examples: ['Rule-based limitations → machine learning', 'Pattern recognition needs → deep learning'],
        importance: 'high'
      },
      {
        type: 'Problem-Solution Structure',
        description: 'Each paragraph presents challenges and subsequent solutions in AI development.',
        examples: ['Unexpected situations → learning algorithms', 'Complex patterns → neural networks'],
        importance: 'medium'
      }
    ],
    simplification: {
      mainIdea: 'Artificial Intelligence has evolved from simple rule-based systems to sophisticated learning machines, raising both opportunities and concerns about our technological future.',
      keyPoints: [
        'AI started with basic rule-based systems in the 1950s',
        'Machine learning enabled systems to learn from data',
        'Deep learning neural networks can recognize complex patterns',
        'AI integration into daily life is accelerating rapidly',
        'Future AGI could revolutionize human capabilities'
      ],
      summary: 'This passage explains how AI has progressed from simple programmed instructions to complex learning systems. Early AI was limited because it could only follow pre-written rules. Modern AI uses neural networks to learn patterns and improve over time. Today, AI is everywhere - in phones, streaming services, and cars. The future goal is AGI, which would be as smart as humans across many different tasks.',
      readingLevel: 'Grade 11-12 (Advanced High School)'
    },
    ideaTracing: [
      {
        idea: 'AI Evolution Timeline',
        development: [
          'Introduced in paragraph 1 as dramatic evolution since 1950s',
          'Detailed in paragraph 2 with rule-based systems',
          'Advanced in paragraph 3 with machine learning breakthrough',
          'Culminated in paragraph 6 with AGI as future goal'
        ],
        connections: ['Links to technological progression', 'Connects to human-machine relationship'],
        evidence: ['Specific dates (1950s)', 'Technical terms (neural networks)', 'Real examples (smartphones, cars)']
      },
      {
        idea: 'Human-AI Relationship',
        development: [
          'Hinted at in paragraph 1 with "mimic human reasoning"',
          'Explored in paragraph 4 with concerns about displacement',
          'Reinforced in paragraph 5 with ubiquity requiring understanding',
          'Projected in paragraph 6 with AGI implications'
        ],
        connections: ['Links to ethical considerations', 'Connects to daily life integration'],
        evidence: ['Job displacement concerns', 'Privacy issues', 'Essential for navigation']
      }
    ],
    questions: [
      {
        type: 'Main Idea',
        question: 'What is the central purpose of this passage?',
        answer: 'To trace the evolution of artificial intelligence and discuss its current and future implications.',
        explanation: 'The passage systematically follows AI development through time while addressing both capabilities and concerns.'
      },
      {
        type: 'Supporting Detail',
        question: 'According to the passage, what limitation did early rule-based AI systems have?',
        answer: 'They could not handle unexpected situations or learn from new data.',
        explanation: 'Paragraph 2 explicitly states this limitation that led to the development of machine learning.'
      }
    ]
  },

  // Climate Change passage
  'climate change': {
    patterns: [
      {
        type: 'Argument Structure',
        description: 'The passage presents evidence for climate change followed by counterarguments and rebuttals.',
        examples: ['Scientific evidence presentation', 'Skeptic arguments', 'Data-driven rebuttals'],
        importance: 'high'
      },
      {
        type: 'Evidence and Examples',
        description: 'Multiple types of evidence support the main argument about climate change.',
        examples: ['Temperature records', 'Ice sheet measurements', 'Sea level data', 'Weather pattern changes'],
        importance: 'high'
      }
    ],
    simplification: {
      mainIdea: 'Scientific evidence overwhelmingly shows that climate change is real and primarily caused by human activities.',
      keyPoints: [
        'Global temperatures have risen significantly since industrial revolution',
        'Ice sheets and glaciers are melting at accelerating rates',
        'Sea levels are rising due to thermal expansion and ice melt',
        'Weather patterns are becoming more extreme and unpredictable'
      ],
      summary: 'Climate change is happening and humans are the main cause. Scientists have lots of proof: temperatures are getting hotter, ice is melting faster, oceans are rising, and weather is getting more extreme. Some people disagree, but the evidence is very strong.',
      readingLevel: 'Grade 9-10 (High School)'
    },
    ideaTracing: [
      {
        idea: 'Scientific Consensus',
        development: [
          'Introduced with overwhelming evidence statement',
          'Supported by multiple measurement types',
          'Reinforced through peer review process',
          'Contrasted with minority skeptical views'
        ],
        connections: ['Links to policy implications', 'Connects to future projections'],
        evidence: ['97% scientist agreement', 'Peer-reviewed studies', 'Independent research confirmation']
      }
    ],
    questions: [
      {
        type: 'Main Idea',
        question: 'What is the author\'s primary argument about climate change?',
        answer: 'Climate change is scientifically proven and primarily caused by human activities.',
        explanation: 'The passage systematically presents evidence supporting anthropogenic climate change.'
      }
    ]
  },

  // Generic fallback for unknown passages
  'default': {
    patterns: [
      {
        type: 'Expository Structure',
        description: 'The passage presents information in a clear, organized manner.',
        examples: ['Topic introduction', 'Supporting details', 'Examples and evidence'],
        importance: 'medium'
      },
      {
        type: 'Sequential Organization',
        description: 'Ideas are presented in logical order to build understanding.',
        examples: ['Progressive development', 'Building complexity', 'Conclusion synthesis'],
        importance: 'medium'
      }
    ],
    simplification: {
      mainIdea: 'This passage discusses a complex topic by breaking it down into understandable parts.',
      keyPoints: [
        'The topic is introduced with basic concepts',
        'Supporting details provide depth and context',
        'Examples help illustrate key points',
        'The conclusion ties ideas together'
      ],
      summary: 'This text explains a topic by starting with simple ideas and adding more details. It uses examples to help readers understand and ends by connecting all the ideas together.',
      readingLevel: 'Grade 10-11 (High School)'
    },
    ideaTracing: [
      {
        idea: 'Main Topic Development',
        development: [
          'Introduced in opening paragraph',
          'Expanded with supporting details',
          'Illustrated through examples',
          'Summarized in conclusion'
        ],
        connections: ['Links to broader themes', 'Connects to real-world applications'],
        evidence: ['Specific examples', 'Expert opinions', 'Statistical data']
      }
    ],
    questions: [
      {
        type: 'Main Idea',
        question: 'What is the central focus of this passage?',
        answer: 'The passage explores a specific topic through detailed analysis and examples.',
        explanation: 'The structure and content work together to provide comprehensive coverage of the subject.'
      },
      {
        type: 'Structure',
        question: 'How does the author organize the information?',
        answer: 'Through logical progression from basic concepts to more complex ideas.',
        explanation: 'This organizational pattern helps readers build understanding systematically.'
      }
    ]
  }
};

// Additional specialized analyses for common SAT passage types
const SPECIALIZED_ANALYSES: { [key: string]: ReadingAnalysis } = {
  'social_media': {
    patterns: [
      {
        type: 'Pro-Con Analysis',
        description: 'The passage systematically examines both benefits and drawbacks of social media.',
        examples: ['Connection benefits vs. isolation risks', 'Information access vs. misinformation'],
        importance: 'high'
      },
      {
        type: 'Generational Perspective',
        description: 'Different age groups are shown to have varying relationships with social media.',
        examples: ['Digital natives vs. traditional users', 'Teen usage patterns vs. adult concerns'],
        importance: 'medium'
      }
    ],
    simplification: {
      mainIdea: 'Social media has both positive and negative effects on individuals and society.',
      keyPoints: [
        'Social media helps people stay connected across distances',
        'It provides easy access to information and news',
        'However, it can lead to addiction and mental health issues',
        'Privacy and misinformation are growing concerns'
      ],
      summary: 'Social media is good and bad. Good: helps people talk to friends and learn things. Bad: can be addictive and spread false information. People need to use it carefully.',
      readingLevel: 'Grade 8-9 (Middle to High School)'
    },
    ideaTracing: [
      {
        idea: 'Digital Connection Paradox',
        development: [
          'Introduced as connectivity benefit',
          'Complicated by quality vs. quantity of connections',
          'Contrasted with real-world relationship impacts',
          'Resolved through balanced usage recommendations'
        ],
        connections: ['Links to mental health research', 'Connects to social psychology'],
        evidence: ['Usage statistics', 'Psychological studies', 'User testimonials']
      }
    ],
    questions: [
      {
        type: 'Compare and Contrast',
        question: 'How does the passage present the benefits and drawbacks of social media?',
        answer: 'By systematically examining both positive connectivity aspects and negative psychological impacts.',
        explanation: 'The balanced approach helps readers understand the complexity of social media\'s role in modern life.'
      }
    ]
  }
};

export class MockReadingAnalysisService {
  async analyzePassage(passageText: string): Promise<ReadingAnalysis> {
    // Simulate analysis delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine passage type based on content keywords
    const text = passageText.toLowerCase();
    
    if (text.includes('artificial intelligence') || text.includes('machine learning') || text.includes('neural network')) {
      return MOCK_ANALYSES['artificial intelligence'];
    }
    
    if (text.includes('climate change') || text.includes('global warming') || text.includes('greenhouse gas')) {
      return MOCK_ANALYSES['climate change'];
    }
    
    if (text.includes('social media') || text.includes('facebook') || text.includes('instagram') || text.includes('twitter')) {
      return SPECIALIZED_ANALYSES['social_media'];
    }

    // Return default analysis for unrecognized passages
    return MOCK_ANALYSES['default'];
  }

  // Method to get analysis without delay (for quick testing)
  getInstantAnalysis(passageText: string): ReadingAnalysis {
    const text = passageText.toLowerCase();
    
    if (text.includes('artificial intelligence') || text.includes('machine learning')) {
      return MOCK_ANALYSES['artificial intelligence'];
    }
    
    if (text.includes('climate change') || text.includes('global warming')) {
      return MOCK_ANALYSES['climate change'];
    }
    
    if (text.includes('social media')) {
      return SPECIALIZED_ANALYSES['social_media'];
    }

    return MOCK_ANALYSES['default'];
  }

  // Add new analysis to the database (for future expansion)
  addAnalysis(keyword: string, analysis: ReadingAnalysis): void {
    MOCK_ANALYSES[keyword] = analysis;
  }

  // Get available analysis types
  getAvailableAnalyses(): string[] {
    return [...Object.keys(MOCK_ANALYSES), ...Object.keys(SPECIALIZED_ANALYSES)];
  }
}

export const mockReadingService = new MockReadingAnalysisService();