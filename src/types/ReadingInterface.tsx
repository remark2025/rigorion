export interface KeyPhrase {
  text: string;
  start: number;
  end: number;
  type: 'key_phrase' | 'evidence' | 'tone_shifter' | 'key_vocabulary';
  explanation?: string;
  importance?: 'high' | 'medium' | 'low';
}

export interface WordSimplification {
  original: string;
  synonym: string;
  explanation?: string;
  start: number;
  end: number;
}

export interface SentenceExplanation {
  sentence: string;
  explanation: string;
  start: number;
  end: number;
  complexity: 'difficult' | 'key';
}

export interface ParagraphIdea {
  paragraphIndex: number;
  mainIdea: string;
  supportingPoints: string[];
  logicalFlow: string;
  conclusion?: string;
  connectionToPrevious?: string;
  connectionToNext?: string;
}

export interface ReadingSolution {
  passageId: string;
  
  // Pattern Recognition View
  patternRecognition: {
    keyPhrases: KeyPhrase[];
    colorScheme: {
      key_phrase: string;      // e.g., "#3B82F6" (blue)
      evidence: string;        // e.g., "#10B981" (green)
      tone_shifter: string;    // e.g., "#F59E0B" (amber)
      key_vocabulary: string;  // e.g., "#8B5CF6" (purple)
    };
    legend: Array<{
      type: 'key_phrase' | 'evidence' | 'tone_shifter' | 'key_vocabulary';
      label: string;
      description: string;
      color: string;
    }>;
  };

  // Simplifier View  
  simplifier: {
    wordSimplifications: WordSimplification[];
    sentenceExplanations: SentenceExplanation[];
    readingLevel: {
      original: number;  // Grade level
      simplified: number;
    };
  };

  // Idea Tracer View
  ideaTracer: {
    overallThesis: string;
    paragraphIdeas: ParagraphIdea[];
    logicalStructure: string;  // "compare-contrast", "problem-solution", "chronological", etc.
    keyTransitions: string[];
    mainConclusion: string;
    rewrittenVersion?: string; // Optional full rewrite
  };
}

// Color scheme constants
export const READING_COLORS = {
  key_phrase: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    hex: '#3B82F6'
  },
  evidence: {
    bg: 'bg-green-100', 
    text: 'text-green-800',
    border: 'border-green-300',
    hex: '#10B981'
  },
  tone_shifter: {
    bg: 'bg-amber-100',
    text: 'text-amber-800', 
    border: 'border-amber-300',
    hex: '#F59E0B'
  },
  key_vocabulary: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300', 
    hex: '#8B5CF6'
  }
} as const;