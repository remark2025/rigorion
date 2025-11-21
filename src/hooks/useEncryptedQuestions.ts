import { useState, useEffect } from 'react';
import { QuestionVaultService } from '../services/QuestionVaultService';

// Global vault service instance
const vaultService = new QuestionVaultService();

export interface UseEncryptedQuestionResult {
  question: any | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load encrypted questions
 * Falls back to existing question loading if encryption not available
 */
export function useEncryptedQuestion(
  questionId: string | null,
  fallbackQuestion?: any
): UseEncryptedQuestionResult {
  const [question, setQuestion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    if (!questionId) {
      setQuestion(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try encrypted service first
      const encryptedQuestion = await vaultService.getQuestion(questionId);
      setQuestion(encryptedQuestion);
    } catch (encryptionError) {
      console.warn('Encrypted question failed, using fallback:', encryptionError);
      
      // Fall back to provided question or existing system
      if (fallbackQuestion) {
        setQuestion(fallbackQuestion);
      } else {
        setError('Question not available');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId, fallbackQuestion]);

  return {
    question,
    isLoading,
    error,
    refetch: fetchQuestion,
  };
}

/**
 * Hook for batch question loading (e.g., for a test section)
 */
export function useEncryptedQuestionBatch(questionIds: string[]) {
  const [questions, setQuestions] = useState<Map<string, any>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const loadQuestion = async (questionId: string) => {
    if (questions.has(questionId) || loadingIds.has(questionId)) {
      return;
    }

    setLoadingIds(prev => new Set(prev).add(questionId));

    try {
      const question = await vaultService.getQuestion(questionId);
      setQuestions(prev => new Map(prev).set(questionId, question));
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(questionId);
        return newErrors;
      });
    } catch (error: any) {
      setErrors(prev => new Map(prev).set(questionId, error.message));
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  // Load all questions on mount or when IDs change
  useEffect(() => {
    questionIds.forEach(id => loadQuestion(id));
  }, [questionIds]);

  return {
    questions,
    isLoading: loadingIds.size > 0,
    errors,
    loadQuestion,
  };
}

/**
 * Prefetch hook for performance optimization
 */
export function useQuestionPrefetch() {
  const prefetch = async (questionIds: string[]) => {
    // Load questions in background without affecting UI
    const promises = questionIds.map(async (id) => {
      try {
        await vaultService.getQuestion(id);
      } catch (error) {
        console.debug(`Prefetch failed for ${id}:`, error);
      }
    });

    await Promise.allSettled(promises);
  };

  return { prefetch };
}