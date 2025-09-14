import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSimpleProgress() {
  const { session } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚀 Fetching progress for user:', session.user.id);

        // Call our simple-progress Edge Function directly
        const { data, error } = await supabase.functions.invoke(`simple-progress?userId=${session.user.id}`, {
          method: 'GET'
        });

        if (error) {
          console.error('❌ Progress function error:', error);
          throw error;
        }

        if (!data?.success) {
          console.error('❌ Progress function failed:', data);
          throw new Error(data?.error || 'Failed to fetch progress');
        }

        console.log('✅ Progress data loaded:', data.data);
        setProgressData(data.data);

      } catch (err: any) {
        console.error('💥 Progress fetch error:', err);
        setError(err.message || 'Failed to load progress');
        
        // Set fallback data so page doesn't stay loading forever
        setProgressData({
          userId: session.user.id,
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [session?.user?.id]);

  return {
    progressData,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // Re-trigger useEffect
      setProgressData(null);
    }
  };
}