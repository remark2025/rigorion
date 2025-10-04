export interface PassageQuestion {
  id: number;
  text: string;
  type: 'main-idea' | 'inference' | 'evidence' | 'vocabulary' | 'purpose' | 'tone';
  options: string[];
  correctAnswer: number;
  hint: string;
}

export interface PassageHighlights {
  evidence: string[];
  toneShifters: string[];
  transitions: string[];
  difficult: Record<string, string>;
}

export interface PassageContent {
  id: number;
  title: string;
  text: string;
  highlights: PassageHighlights;
  questions: PassageQuestion[];
}

export interface PassageMetadata {
  id: number;
  title: string;
  category: 'Science' | 'History' | 'Literature' | 'Social Science' | 'Technology';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  imageUrl: string;
  author?: string;
  description?: string;
  estimatedTime?: number; // minutes
  tags?: string[];
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  description?: string;
}