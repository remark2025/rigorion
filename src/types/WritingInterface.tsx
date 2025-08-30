export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  fixedSentences: string[];
  customSentences: number; // Number of custom sentences student can add
  guidelines: string[];
  examples: string[];
}

export interface WritingTemplate {
  id: string;
  name: string;
  category: 'argumentative' | 'analysis' | 'compare-contrast' | 'narrative' | 'persuasive';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedLength: string; // e.g., "300-400 words"
  timeLimit: number; // in minutes
  sections: TemplateSection[];
  transitionPhrases: {
    [key: string]: string[]; // key is transition type, value is array of phrases
  };
  scoringCriteria: {
    structure: string[];
    coherence: string[];
    development: string[];
    language: string[];
  };
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  templateIds: string[]; // Which templates work best for this prompt
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  keywords: string[];
  sampleResponse?: string;
  rubric: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
}

export interface StudentEssay {
  id: string;
  promptId: string;
  templateId: string;
  content: string;
  sections: {
    [sectionId: string]: {
      fixedUsed: string[];
      customContent: string[];
    };
  };
  submittedAt: Date;
  wordCount: number;
}

export interface AIEvaluation {
  essayId: string;
  overallScore: number; // 1-4 scale
  structureScore: number;
  coherenceScore: number;
  developmentScore: number;
  languageScore: number;
  
  feedback: {
    strengths: string[];
    improvements: string[];
    specificSuggestions: Array<{
      section: string;
      issue: string;
      suggestion: string;
      example: string;
    }>;
  };
  
  templateUsage: {
    sectionsCompleted: number;
    sectionsTotal: number;
    fixedSentencesUsed: number;
    fixedSentencesAvailable: number;
    transitionsUsed: string[];
    missingElements: string[];
  };
  
  nextSteps: string[];
}

// Color schemes for different template categories
export const TEMPLATE_COLORS = {
  argumentative: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    hex: '#DC2626'
  },
  analysis: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    hex: '#2563EB'
  },
  'compare-contrast': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    hex: '#7C3AED'
  },
  narrative: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    hex: '#16A34A'
  },
  persuasive: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    hex: '#EA580C'
  }
} as const;