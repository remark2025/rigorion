import { useState, useCallback } from 'react';
import { logInteraction } from '@/services/edgeFunctionService';
import { useAuth } from '@/hooks/useAuth';
import { Question } from '@/types/QuestionInterface';

export interface InteractionLogData {
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

export interface InteractionLogger {
  logInteraction: (data: InteractionLogData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useInteractionLogger(): InteractionLogger {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const submitInteraction = useCallback(async (data: InteractionLogData) => {
    if (!session?.user?.id) {
      console.warn('No user session, skipping interaction log');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const interactionPayload = {
        question_id: data.question.public_id || data.question.id,
        is_correct: data.isCorrect,
        time_spent_seconds: Math.max(0, Math.min(3600, data.timeSpentSeconds)),
        attempted_at: new Date().toISOString(),
        
        // Enhanced analytics data
        module: data.question.module as 'math' | 'reading' | 'writing' | undefined,
        chapter: data.question.chapter,
        exam: data.question.exam,
        level: data.question.level as 'easy' | 'medium' | 'difficult' | undefined,
        topic: data.question.topic,
        question_type: data.question.question_type,
        
        // Practice session context
        practice_mode: data.practiceMode,
        practice_session_id: data.practiceSessionId,
        question_index_in_session: data.questionIndexInSession,
        total_questions_in_session: data.totalQuestionsInSession,
        
        // Answer data
        selected_answer: data.selectedAnswer,
        correct_answer: data.question.correct_answer,
        
        // Optional interaction data
        confidence_level: data.confidenceLevel,
        hint_checked: data.hintChecked || false,
        solution_checked: data.solutionChecked || false,
        bookmarked: data.bookmarked || false,
        
        // Generate unique idempotency key for this attempt
        idempotency_key: `${session.user.id}_${data.question.public_id || data.question.id}_${Date.now()}`
      };

      console.log('📊 Logging interaction:', {
        question: data.question.public_id || data.question.id,
        correct: data.isCorrect,
        time: data.timeSpentSeconds,
        mode: data.practiceMode
      });

      const result = await logInteraction(interactionPayload);
      
      if (result.error) {
        throw result.error;
      }

      console.log('✅ Interaction logged successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to log interaction:', errorMessage);
      setError(errorMessage);
      
      // Don't throw error to avoid disrupting user experience
      // Just log it and continue
      
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  return {
    logInteraction: submitInteraction,
    loading,
    error
  };
}

export default useInteractionLogger;