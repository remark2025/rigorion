import { Question } from '@/types/QuestionInterface';

export type InteractionModule = 'math' | 'reading' | 'writing' | 'unknown';

export interface InteractionLogInput {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  practiceMode?: 'timed' | 'untimed' | 'mock_test' | 'chapter_review';
  practiceSessionId?: string;
  questionIndexInSession?: number;
  totalQuestionsInSession?: number;
  confidenceLevel?: number;
  hintChecked?: boolean;
  solutionChecked?: boolean;
  bookmarked?: boolean;
}

export interface StoredInteractionRecord {
  id: string;
  userId: string;
  timestamp: string;
  questionId: string;
  questionContent?: string;
  module: InteractionModule;
  chapter: string | number | null;
  topic: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  isCorrect: boolean;
  selectedAnswer: string;
  timeSpentSeconds: number;
  practiceMode: InteractionLogInput['practiceMode'] | null;
  practiceSessionId?: string;
  questionIndexInSession?: number;
  totalQuestionsInSession?: number;
  metadata?: Record<string, unknown>;
}

const INTERACTION_STORAGE_KEY = 'practice_interactions';
const MAX_STORED_INTERACTIONS = 1000;

const clampTime = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(3600, Math.round(value)));
};

const normalizeDifficulty = (input: unknown): 'easy' | 'medium' | 'hard' | null => {
  if (!input) return null;
  const value = String(input).toLowerCase();
  if (value.startsWith('easy')) return 'easy';
  if (value.startsWith('medium') || value.startsWith('mid')) return 'medium';
  if (value.startsWith('hard') || value.startsWith('difficult')) return 'hard';
  return null;
};

const normalizeModule = (question: Question): InteractionModule => {
  const moduleSource = [question.module, question.topic, question.chapter]
    .filter(Boolean)
    .map(value => String(value).toLowerCase());

  if (moduleSource.some(str => str.includes('math') || str.includes('algebra') || str.includes('geometry') || str.includes('statistics')))
    return 'math';
  if (moduleSource.some(str => str.includes('reading') || str.includes('passage')))
    return 'reading';
  if (moduleSource.some(str => str.includes('writing') || str.includes('grammar') || str.includes('essay')))
    return 'writing';
  return 'unknown';
};

export function createStoredInteractionRecord(
  data: InteractionLogInput,
  userId: string | undefined
): StoredInteractionRecord {
  const question = data.question;
  const timestamp = new Date().toISOString();
  const module = normalizeModule(question);
  const difficulty = normalizeDifficulty(question.difficulty ?? question.level);

  return {
    id: `interaction_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    userId: userId || 'guest',
    timestamp,
    questionId: String(question.public_id || question.id || 'unknown'),
    questionContent: typeof question.content === 'string' ? question.content : undefined,
    module,
    chapter: question.chapter ?? null,
    topic: question.topic ?? null,
    difficulty,
    isCorrect: data.isCorrect,
    selectedAnswer: data.selectedAnswer,
    timeSpentSeconds: clampTime(data.timeSpentSeconds),
    practiceMode: data.practiceMode ?? null,
    practiceSessionId: data.practiceSessionId,
    questionIndexInSession: data.questionIndexInSession,
    totalQuestionsInSession: data.totalQuestionsInSession,
    metadata: {
      hintChecked: data.hintChecked || false,
      solutionChecked: data.solutionChecked || false,
      bookmarked: data.bookmarked || false,
      calculatorAllowed: question.calculatorAllowed ?? null,
      moduleRaw: question.module ?? null,
      difficultyRaw: question.difficulty ?? question.level ?? null,
      exam: (question as any).examNumber ?? question.exam ?? null,
    }
  };
}

export function appendInteractionRecord(record: StoredInteractionRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const existing: StoredInteractionRecord[] = loadInteractionRecords();
    existing.push(record);

    if (existing.length > MAX_STORED_INTERACTIONS) {
      existing.splice(0, existing.length - MAX_STORED_INTERACTIONS);
    }

    window.localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('practice-interaction-logged', { detail: record }));
  } catch (error) {
    console.error('Failed to append interaction record:', error);
  }
}

export function loadInteractionRecords(): StoredInteractionRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(INTERACTION_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch (error) {
    console.error('Failed to load interaction records:', error);
    return [];
  }
}

export function clearInteractionRecords(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(INTERACTION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('practice-interactions-cleared'));
}

export const interactionStorageKey = INTERACTION_STORAGE_KEY;

