export type MathGraphType = 'linear' | 'quadratic' | 'exponential' | 'absolute' | 'polynomial';

export interface MathGraphConfig {
  type: MathGraphType;
  xRange: [number, number];
  yRange: [number, number];
  showGrid: boolean;
  showAxis: boolean;
  title: string;
}

export interface MathParameter {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description?: string;
  units?: string;
}

export interface MathExpression {
  latex: string;
  display: string;
  editable?: boolean;
  placeholder?: string;
}

export interface MathInteractivePrompt {
  type: 'fill-blank' | 'drag-drop' | 'multiple-choice' | 'input';
  options?: string[];
  blanks?: string[];
  correctAnswer?: string;
}

export interface MathSolutionStep {
  id: string;
  title: string;
  description: string;
  fromExpression: MathExpression;
  toExpression: MathExpression;
  explanation: string;
  hint?: string;
  interactive?: MathInteractivePrompt;
}

export interface MathInteractiveProblem {
  id: string;
  title?: string;
  question: string;
  objective?: string;
  overview?: string;
  defaultEquation?: string;
  graphConfig: MathGraphConfig;
  parameters: MathParameter[];
  solutionSteps: MathSolutionStep[];
  tags?: string[];
  calculatorAllowed?: boolean;
}

export type MathDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface MathPracticeQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation: string;
  difficulty: MathDifficulty;
  skillFocus: string;
  calculatorAllowed: boolean;
  source?: string;
  strategyTip?: string;
}

export interface MathModuleMetadata {
  id: string;
  title: string;
  skill: string;
  category: string;
  difficulty: MathDifficulty;
  questionCount: number;
  imageUrl: string;
  description: string;
  estimatedTime: number; // minutes
  tags?: string[];
  previewEquation?: string;
}

export interface MathModule extends MathModuleMetadata {
  interactiveProblem: MathInteractiveProblem;
  questionBank: MathPracticeQuestion[];
  learningObjectives?: string[];
  strategyTips?: string[];
  relatedSkills?: string[];
  references?: Array<{ title: string; url: string }>;
}

export type MathModuleId = MathModuleMetadata['id'];

