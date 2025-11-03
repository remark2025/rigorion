import { useState, useCallback } from 'react';
import {
  InteractionLogInput,
  appendInteractionRecord,
  createStoredInteractionRecord,
  loadInteractionRecords,
  clearInteractionRecords
} from '@/services/interactionStorage';

export type { InteractionLogInput as InteractionLogData } from '@/services/interactionStorage';

export interface InteractionLogger {
  logInteraction: (data: InteractionLogInput) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Local interaction logger that stores data in localStorage instead of database.
 * Useful for offline mode or when Supabase connectivity is unavailable.
 */
export function useLocalInteractionLogger(): InteractionLogger {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logInteraction = useCallback(async (data: InteractionLogInput) => {
    setLoading(true);
    setError(null);

    try {
      const record = createStoredInteractionRecord(data, undefined);
      appendInteractionRecord(record);

      console.log('📊 Interaction logged locally:', {
        questionId: record.questionId,
        isCorrect: record.isCorrect,
        timeSpent: record.timeSpentSeconds,
        practiceMode: record.practiceMode
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log interaction';
      setError(message);
      console.error('Error logging interaction locally:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logInteraction,
    loading,
    error
  };
}

/**
 * Get all stored interactions from localStorage
 */
export function getStoredInteractions() {
  return loadInteractionRecords();
}

/**
 * Clear all stored interactions
 */
export function clearStoredInteractions(): void {
  clearInteractionRecords();
  console.log('📝 Cleared all stored interactions');
}
