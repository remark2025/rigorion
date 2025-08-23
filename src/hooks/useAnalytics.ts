import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AnalyticsService, { 
  UserAnalytics, 
  QuestionAnalyticsResponse, 
  SkillAnalytics, 
  PerformanceGraphData 
} from '@/services/analyticsService';
import FallbackAnalyticsService from '@/services/fallbackAnalytics';

interface AnalyticsData {
  userAnalytics: UserAnalytics | null;
  skillAnalytics: SkillAnalytics[];
  performanceGraph: PerformanceGraphData[];
  questionAnalytics: QuestionAnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalytics(timeframe: 'week' | 'month' | 'all' = 'all'): AnalyticsData {
  const { user } = useAuth();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [skillAnalytics, setSkillAnalytics] = useState<SkillAnalytics[]>([]);
  const [performanceGraph, setPerformanceGraph] = useState<PerformanceGraphData[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [userAnalyticsData, skillAnalyticsData, performanceGraphData, questionAnalyticsData] = await Promise.all([
        AnalyticsService.getUserAnalytics(undefined, timeframe, true).catch(err => {
          console.warn('Failed to fetch user analytics:', err);
          return null;
        }),
        AnalyticsService.getSkillAnalytics().catch(err => {
          console.warn('Failed to fetch skill analytics:', err);
          return [];
        }),
        AnalyticsService.getPerformanceGraphData(timeframe).catch(err => {
          console.warn('Failed to fetch performance graph:', err);
          return [];
        }),
        AnalyticsService.getQuestionAnalytics(undefined, 'difficulty', 'desc', 100, true).catch(err => {
          console.warn('Failed to fetch question analytics:', err);
          return null;
        })
      ]);

      console.log('📊 Analytics loaded:', {
        userAnalytics: userAnalyticsData ? 'loaded' : 'fallback',
        skillAnalytics: skillAnalyticsData?.length || 0,
        performanceGraph: performanceGraphData?.length || 0,
        questionAnalytics: questionAnalyticsData ? 'loaded' : 'fallback'
      });
      
      setUserAnalytics(userAnalyticsData);
      setSkillAnalytics(skillAnalyticsData);
      setPerformanceGraph(performanceGraphData);
      setQuestionAnalytics(questionAnalyticsData);

    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      await AnalyticsService.refreshAnalytics(user?.id);
      await fetchAnalytics();
    } catch (err: any) {
      console.error('Analytics refresh error:', err);
      setError(err.message || 'Failed to refresh analytics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeframe]);

  return {
    userAnalytics,
    skillAnalytics,
    performanceGraph,
    questionAnalytics,
    loading,
    error,
    refreshAnalytics
  };
}

// Hook to transform analytics data into Progress page format
export function useProgressData(timeframe: 'week' | 'month' | 'all' = 'all') {
  const analytics = useAnalytics(timeframe);
  
  const progressData = analytics.userAnalytics ? {
    userId: analytics.userAnalytics.summary.total_questions_attempted > 0 ? 'real_user' : 'no_data',
    totalProgressPercent: Math.round(analytics.userAnalytics.summary.accuracy_percentage),
    correctAnswers: analytics.userAnalytics.summary.total_questions_correct,
    incorrectAnswers: analytics.userAnalytics.summary.total_questions_attempted - analytics.userAnalytics.summary.total_questions_correct,
    unattemptedQuestions: Math.max(0, 200 - analytics.userAnalytics.summary.total_questions_attempted), // Assume 200 total questions
    questionsAnsweredToday: analytics.userAnalytics.summary.recent_attempts,
    streak: analytics.userAnalytics.summary.streak_current,
    averageScore: Math.round(analytics.userAnalytics.summary.accuracy_percentage),
    rank: 120, // Would need global ranking system
    projectedScore: Math.round(analytics.userAnalytics.summary.accuracy_percentage),
    speed: Math.round(Math.max(0, 100 - (analytics.userAnalytics.summary.avg_time_per_question / 180) * 100)), // Normalized speed score
    
    // Difficulty-based breakdowns (would need question difficulty mapping)
    easyAccuracy: Math.round(analytics.userAnalytics.summary.accuracy_percentage * 1.1), // Slightly higher for easy
    easyAvgTime: Math.max(1.0, analytics.userAnalytics.summary.avg_time_per_question * 0.7),
    easyCompleted: Math.round(analytics.userAnalytics.summary.total_questions_attempted * 0.4),
    easyTotal: 50,
    
    mediumAccuracy: Math.round(analytics.userAnalytics.summary.accuracy_percentage),
    mediumAvgTime: analytics.userAnalytics.summary.avg_time_per_question,
    mediumCompleted: Math.round(analytics.userAnalytics.summary.total_questions_attempted * 0.4),
    mediumTotal: 50,
    
    hardAccuracy: Math.round(analytics.userAnalytics.summary.accuracy_percentage * 0.8), // Lower for hard
    hardAvgTime: analytics.userAnalytics.summary.avg_time_per_question * 1.5,
    hardCompleted: Math.round(analytics.userAnalytics.summary.total_questions_attempted * 0.2),
    hardTotal: 30,
    
    goalAchievementPercent: Math.round(analytics.userAnalytics.summary.accuracy_percentage),
    averageTime: analytics.userAnalytics.performance.average_time,
    correctAnswerAvgTime: analytics.userAnalytics.performance.average_time * 0.9,
    incorrectAnswerAvgTime: analytics.userAnalytics.performance.average_time * 1.3,
    longestQuestionTime: analytics.userAnalytics.performance.average_time * 2,
    
    performanceGraph: analytics.performanceGraph.length > 0 ? analytics.performanceGraph : generateFallbackGraph(),
    skillAnalytics: analytics.skillAnalytics.length > 0 ? analytics.skillAnalytics : generateFallbackSkills()
  } : generateFallbackProgressData();

  return {
    ...analytics,
    progressData
  };
}

// Fallback data generators
function generateFallbackGraph(): PerformanceGraphData[] {
  // Use realistic performance trend data from fallback service
  const fallbackTrend = FallbackAnalyticsService.getPerformanceTrendData();
  const recentData = fallbackTrend.slice(-15);
  
  return recentData.map(day => ({
    date: day.date,
    attempted: day.questionsAttempted,
    globalAverage: Math.floor(Math.random() * 15) + 10,
    momentum: 0,
    dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mostPracticedSkill: {
      name: day.mathScore > day.readingScore && day.mathScore > day.writingScore ? 'Math' : 
            day.readingScore > day.writingScore ? 'Reading' : 'Writing',
      percentile: Math.max(day.mathScore, day.readingScore, day.writingScore),
      contribution: day.questionsAttempted
    }
  }));
}

function generateFallbackSkills(): SkillAnalytics[] {
  // Use comprehensive fallback analytics from our detailed system
  const allCourses = FallbackAnalyticsService.getAllCourseAnalytics();
  const fallbackSkills: SkillAnalytics[] = [];
  
  console.log('🔧 Generating fallback skills from courses:', allCourses.length);
  
  allCourses.forEach(course => {
    console.log(`📚 Processing course: ${course.courseName} (${course.section}) with ${course.skills.length} skills`);
    course.skills.forEach(skill => {
      fallbackSkills.push({
        skillId: skill.skillId,
        skillName: skill.skillName,
        chapter: skill.chapter,
        section: skill.section,
        correct: skill.correct,
        incorrect: skill.incorrect,
        unattempted: skill.unattempted,
        percentile: skill.percentile,
        difficulty: skill.difficulty,
        averageTime: skill.averageTime,
        lastPracticed: skill.lastPracticed,
        totalQuestions: skill.totalQuestions,
        masteryLevel: skill.masteryLevel,
        weakestConcepts: skill.weakestConcepts,
        recommendedAction: skill.recommendedAction,
        practicePerDay: skill.practicePerDay,
        solvedProblems: skill.solvedProblems,
        globalPercentile: skill.globalPercentile,
        percentileGrowth: skill.percentileGrowth
      });
    });
  });
  
  console.log(`✅ Generated ${fallbackSkills.length} fallback skills:`, fallbackSkills.map(s => `${s.section}: ${s.skillName}`));
  return fallbackSkills;
}

function generateFallbackProgressData() {
  // Use comprehensive progress data from fallback service
  const overallProgress = FallbackAnalyticsService.getOverallProgress();
  
  return {
    userId: 'demo_user',
    totalProgressPercent: overallProgress.overallAccuracy,
    correctAnswers: Math.floor(overallProgress.totalQuestionsAttempted * overallProgress.overallAccuracy / 100),
    incorrectAnswers: Math.floor(overallProgress.totalQuestionsAttempted * (100 - overallProgress.overallAccuracy) / 100),
    unattemptedQuestions: Math.max(0, 300 - overallProgress.totalQuestionsAttempted),
    questionsAnsweredToday: 15,
    streak: overallProgress.studyStreakDays,
    averageScore: overallProgress.overallAccuracy,
    rank: 156,
    projectedScore: overallProgress.overallAccuracy + 5,
    speed: 82,
    easyAccuracy: 92,
    easyAvgTime: 1.8,
    easyCompleted: 65,
    easyTotal: 80,
    mediumAccuracy: overallProgress.overallAccuracy,
    mediumAvgTime: 2.4,
    mediumCompleted: 48,
    mediumTotal: 70,
    hardAccuracy: overallProgress.overallAccuracy - 15,
    hardAvgTime: 3.2,
    hardCompleted: 22,
    hardTotal: 40,
    goalAchievementPercent: overallProgress.weeklyGoalProgress,
    averageTime: 142,
    correctAnswerAvgTime: 128,
    incorrectAnswerAvgTime: 168,
    longestQuestionTime: 285,
    performanceGraph: generateFallbackGraph(),
    skillAnalytics: generateFallbackSkills()
  };
}