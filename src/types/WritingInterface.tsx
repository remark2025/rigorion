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
  category: 'argumentative' | 'analysis' | 'compare-contrast' | 'narrative' | 'persuasive' | 'problem-solution' | 'cause-effect' | 'expository';
  description: string;
  difficulty: 'easy' | 'beginner' | 'intermediate' | 'advanced' | 'hard';
  estimatedLength: string; // e.g., "300-400 words"
  timeLimit: number; // in minutes
  sections: TemplateSection[];
  transitionPhrases?: {
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
  submittedAt?: Date;
  createdAt: string;
  timeSpent: number;
  wordCount: number;
  status: 'draft' | 'completed' | 'submitted';
}

// Enhanced SAT-focused correction interface
export interface CorrectionMark {
  id: string;                        // stable for tracking
  type: 'grammar' | 'word_choice' | 'sentence_structure' | 'punctuation' | 'spelling' | 'concision' | 'rhetoric';
  severity: 'minor' | 'major';       // affects scoring
  confidence: number;                // 0–1 for AI/rule certainty
  startIndex: number;
  endIndex: number;
  originalText: string;
  correctedText: string;
  explanation: string;
  grammarRule?: string;              // e.g., "Pronoun case"
  ruleId?: string;                   // internal catalog key
  suggestions?: string[];            // alt phrasings
  autofixSafe?: boolean;             // one-click apply
  icon?: string;                     // accessibility icon
}

// SAT Writing trait-based scoring
export interface SATWritingScore {
  total: number;                     // 0-100
  traits: {
    grammar: number;                 // 40% weight
    structure: number;               // 25% weight  
    concision: number;               // 20% weight
    rhetoric: number;                // 15% weight
  };
  penalties: {
    major: number;                   // count of major errors
    minor: number;                   // count of minor errors
  };
  breakdown: string[];               // explanation of score
}

// SAT rule mastery tracking
export interface RuleMastery {
  ruleId: string;
  ruleName: string;
  category: 'grammar' | 'punctuation' | 'rhetoric';
  attempts: number;
  correct: number;
  lastSeen: Date;
  masteryLevel: 'learning' | 'almost' | 'mastered';
  averageTime: number;               // seconds to fix
}

export interface AIEvaluation {
  essayId: string;
  overallScore: number; // 1-4 scale
  structureScore: number;
  coherenceScore: number;
  developmentScore: number;
  languageScore: number;
  satScore?: SATWritingScore;        // SAT-specific scoring
  corrections?: CorrectionMark[];    // detailed corrections
  
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
  },
  'problem-solution': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    hex: '#EAB308'
  },
  'cause-effect': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    hex: '#4F46E5'
  },
  expository: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-300',
    hex: '#14B8A6'
  }
} as const;