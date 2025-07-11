
import { useQuestions } from '@/contexts/QuestionsContext';
import { Question } from '@/types/QuestionInterface';
import { useCallback } from 'react';

export function useSecureQuestions() {
  const { questions, isLoading, error, refreshQuestions } = useQuestions();
  
  // Refresh questions and wait for operation to complete
  const refetch = useCallback(async () => {
    await refreshQuestions();
    return questions;
  }, [refreshQuestions, questions]);
  
  return {
    questions,
    isLoading,
    error,
    refetch
  };
}

export default useSecureQuestions;
