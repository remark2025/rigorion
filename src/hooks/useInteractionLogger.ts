import { useState, useCallback } from 'react';
import { logInteraction } from '@/services/edgeFunctionService';
import { useAuth } from '@/hooks/useAuth';
import {
  InteractionLogInput,
  appendInteractionRecord,
  createStoredInteractionRecord
} from '@/services/interactionStorage';

export type { InteractionLogInput as InteractionLogData } from '@/services/interactionStorage';

export interface InteractionLogger {
  logInteraction: (data: InteractionLogInput) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useInteractionLogger(): InteractionLogger {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const submitInteraction = useCallback(async (data: InteractionLogInput) => {
    const userId = session?.user?.id;
    const localRecord = createStoredInteractionRecord(data, userId);
    appendInteractionRecord(localRecord);

    if (!session?.user?.id) {
      console.warn('No user session, skipping remote interaction log');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Preparing interaction payload for question:', data.question.public_id || data.question.id)
      console.log('📊 Question data:', {
        id: data.question.id,
        public_id: data.question.public_id,
        module: data.question.module,
        chapter: data.question.chapter,
        level: data.question.level,
        topic: data.question.topic,
        correct_answer: data.question.correct_answer
      })
      console.log('📊 Interaction data:', {
        isCorrect: data.isCorrect,
        timeSpentSeconds: data.timeSpentSeconds,
        selectedAnswer: data.selectedAnswer,
        practiceMode: data.practiceMode
      })
      
      const interactionPayload = {
        question_id: data.question.public_id || data.question.id,
        is_correct: data.isCorrect,
        time_spent_seconds: Math.max(0, Math.min(3600, data.timeSpentSeconds)),
        attempted_at: new Date().toISOString(),
        
        // Enhanced analytics data
        module: (() => {
          const moduleStr = data.question.module?.toLowerCase();
          if (moduleStr?.includes('math')) return 'math';
          if (moduleStr?.includes('reading')) return 'reading';
          if (moduleStr?.includes('writing')) return 'writing';
          return null;
        })() as 'math' | 'reading' | 'writing' | null,
        chapter: typeof data.question.chapter === 'number' ? data.question.chapter : null,
        exam: typeof data.question.exam === 'number' ? data.question.exam : null,
        level: data.question.level as 'easy' | 'medium' | 'difficult' | undefined,
        topic: data.question.topic,
        question_type: data.question.question_type,
        
        // Practice session context
        practice_mode: data.practiceMode,
        practice_session_id: data.practiceSessionId,
        question_index_in_session: data.questionIndexInSession,
        total_questions_in_session: data.totalQuestionsInSession,
        
        // Answer data (trimmed payload - removed correct_answer, keeping selected_answer + is_correct)
        selected_answer: data.selectedAnswer,
        
        // Optional interaction data
        confidence_level: data.confidenceLevel,
        hint_checked: data.hintChecked || false,
        solution_checked: data.solutionChecked || false,
        bookmarked: data.bookmarked || false,
        
        // Generate unique idempotency key for this attempt (use crypto.randomUUID for proper UUID format)
        idempotency_key: crypto.randomUUID()
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
