import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { buildProgressSnapshotFromInteractions } from '@/services/interactionAnalytics';

export function useSimpleProgress() {
  const { session } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      setProgressData(buildProgressSnapshotFromInteractions('guest'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const localSnapshot = buildProgressSnapshotFromInteractions(session.user.id);
      if (localSnapshot) {
        setProgressData(localSnapshot);
        return;
      }

      console.log('🚀 Fetching progress for user via edge function:', session.user.id);
      const { data, error } = await supabase.functions.invoke(
        `simple-progress?userId=${session.user.id}`,
        { method: 'GET' }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch progress');
      }

      setProgressData({
        ...data.data,
        dataSource: 'edge_function'
      });

    } catch (err: any) {
      console.error('💥 Progress fetch error:', err);
      setError(err.message || 'Failed to load progress');

      const fallbackSnapshot = buildProgressSnapshotFromInteractions(session?.user?.id);
      if (fallbackSnapshot) {
        setProgressData(fallbackSnapshot);
      } else {
        setProgressData({
          userId: session?.user?.id || 'guest',
          totalProgressPercent: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          unattemptedQuestions: 100,
          questionsAnsweredToday: 0,
          streak: 0,
          averageScore: 0,
          rank: 1000,
          projectedScore: 400,
          speed: 50,
          easyAccuracy: 0,
          easyAvgTime: 0,
          easyCompleted: 0,
          easyTotal: 50,
          mediumAccuracy: 0,
          mediumAvgTime: 0,
          mediumCompleted: 0,
          mediumTotal: 50,
          hardAccuracy: 0,
          hardAvgTime: 0,
          hardCompleted: 0,
          hardTotal: 30,
          averageTime: 0,
          correctAnswerAvgTime: 0,
          incorrectAnswerAvgTime: 0,
          longestQuestionTime: 0,
          performanceGraph: [],
          skillAnalytics: [],
          dataSource: 'error_fallback'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const listener = () => fetchProgress();
    window.addEventListener('practice-interaction-logged', listener);
    window.addEventListener('practice-interactions-cleared', listener);
    return () => {
      window.removeEventListener('practice-interaction-logged', listener);
      window.removeEventListener('practice-interactions-cleared', listener);
    };
  }, [fetchProgress]);

  return {
    progressData,
    isLoading,
    error,
    refetch: fetchProgress
  };
}
