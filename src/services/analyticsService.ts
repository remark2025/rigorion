import { supabase } from "@/integrations/supabase/client";

// Types for analytics data
export interface UserAnalytics {
  summary: {
    total_questions_attempted: number;
    total_questions_correct: number;
    accuracy_percentage: number;
    average_confidence: number;
    streak_current: number;
    streak_longest: number;
    skill_level: 'beginner' | 'intermediate' | 'advanced';
    performance_trend: 'improving' | 'declining' | 'stable';
    avg_time_per_question: number;
    recent_attempts: number;
    recent_correct: number;
  };
  performance: {
    timeframe: string;
    recent_accuracy: number;
    average_time: number;
    confidence_trend: number;
    hint_usage_rate: number;
    solution_usage_rate: number;
  };
  recentActivity: Array<{
    question_id: string;
    is_correct: boolean;
    time_spent: number;
    confidence: number;
    used_hint: boolean;
    checked_solution: boolean;
    attempted_at: string;
    attempt_number: number;
  }>;
  patterns: {
    most_active_time: string;
    average_session_length: number;
    questions_per_session: number;
    preferred_difficulty: string;
    learning_velocity: number;
  };
  recommendations: string[];
  generated_at: string;
  data_points: number;
}

export interface QuestionAnalytics {
  question_public_id: string;
  total_attempts: number;
  correct_attempts: number;
  success_rate: number;
  difficulty_score: number;
  average_time_seconds: number;
  average_confidence: number;
  first_attempt_success_percentage: number;
  data_confidence_level: 'reliable' | 'emerging' | 'insufficient_data';
}

export interface TopicStats {
  topic_name: string;
  question_count: number;
  total_attempts: number;
  total_correct: number;
  success_rate: string;
  average_difficulty: string;
  average_time: string;
}

export interface OverallStats {
  total_questions: number;
  total_attempts: number;
  average_success_rate: number;
  average_difficulty: number;
}

export interface QuestionAnalyticsResponse {
  questions: QuestionAnalytics[];
  overall_stats: OverallStats;
  topic_stats: TopicStats[];
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
    total: number;
    percentages: {
      easy: string;
      medium: string;
      hard: string;
      expert: string;
    };
  };
  user_performance: Array<{
    question_id: string;
    total_attempts: number;
    correct_attempts: number;
    success_rate: string;
    best_time: number | null;
    improvement_trend: 'improving' | 'declining' | 'stable';
  }>;
  generated_at: string;
}

// Analytics Service Class
export class AnalyticsService {
  
  /**
   * Get user performance analytics
   */
  static async getUserAnalytics(
    userId?: string,
    timeframe: 'week' | 'month' | 'all' = 'all',
    includeRecentActivity: boolean = true
  ): Promise<UserAnalytics> {
    try {
      // Use Supabase function invocation with query parameters
      const { data, error } = await supabase.functions.invoke('user-analytics', {
        body: {
          userId,
          timeframe,
          includeRecentActivity
        }
      });

      if (error) {
        console.error('Error fetching user analytics:', error);
        throw new Error(error.message || 'Failed to fetch user analytics');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user analytics');
      }

      return data.data;
    } catch (error) {
      console.error('Analytics service error:', error);
      throw error;
    }
  }

  /**
   * Get question analytics (all questions or specific question)
   */
  static async getQuestionAnalytics(
    questionId?: string,
    sortBy: 'difficulty' | 'attempts' | 'success_rate' | 'time' = 'difficulty',
    order: 'asc' | 'desc' = 'desc',
    limit: number = 50,
    includeUserPerformance: boolean = false
  ): Promise<QuestionAnalyticsResponse | any> {
    try {
      // Use Supabase function invocation with query parameters
      const { data, error } = await supabase.functions.invoke('question-analytics', {
        body: {
          questionId,
          sortBy,
          order,
          limit,
          includeUserPerformance
        }
      });

      if (error) {
        console.error('Error fetching question analytics:', error);
        throw new Error(error.message || 'Failed to fetch question analytics');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch question analytics');
      }

      return data.data;
    } catch (error) {
      console.error('Question analytics service error:', error);
      throw error;
    }
  }

  /**
   * Get skill-based analytics (derived from topic stats)
   */
  static async getSkillAnalytics(): Promise<SkillAnalytics[]> {
    try {
      const questionData = await this.getQuestionAnalytics(
        undefined, 'difficulty', 'desc', 200, true
      );

      // Transform topic stats into skill analytics format for Progress page
      const skillAnalytics: SkillAnalytics[] = questionData.topic_stats.map((topic: TopicStats, index: number) => {
        const skillMapping = getSkillMapping(topic.topic_name);
        
        const correct = Math.round(parseFloat(topic.success_rate) * topic.total_attempts / 100);
        const incorrect = topic.total_attempts - correct;
        const successRate = parseFloat(topic.success_rate);
        
        return {
          skillId: `skill_${index + 1}`,
          skillName: skillMapping.name,
          chapter: skillMapping.chapter,
          section: skillMapping.section,
          correct: correct,
          incorrect: incorrect,
          unattempted: Math.max(0, 50 - topic.total_attempts), // Assume 50 questions per skill
          percentile: Math.round(successRate),
          difficulty: mapDifficultyToLevel(parseFloat(topic.average_difficulty)),
          averageTime: parseFloat(topic.average_time),
          lastPracticed: new Date().toISOString(),
          totalQuestions: Math.max(topic.total_attempts, 30), // Minimum for display
          masteryLevel: getMasteryLevel(successRate, topic.total_attempts),
          weakestConcepts: [], // Would need additional analysis
          recommendedAction: getRecommendedAction(successRate, topic.total_attempts),
          // Additional properties for Progress page
          practicePerDay: Math.round((topic.total_attempts / 30) * 10) / 10, // Approximate practice per day
          solvedProblems: correct + incorrect, // Total solved
          globalPercentile: Math.min(95, Math.max(5, Math.round(successRate + Math.random() * 20 - 10))), // Simulated percentile
          percentileGrowth: Math.round((Math.random() - 0.5) * 20) // Random growth between -10 and +10
        };
      });

      return skillAnalytics;
    } catch (error) {
      console.error('Error fetching skill analytics:', error);
      // Return empty array or fallback data
      return [];
    }
  }

  /**
   * Get performance graph data for charts
   */
  static async getPerformanceGraphData(
    timeframe: 'week' | 'month' | 'all' = 'month'
  ): Promise<PerformanceGraphData[]> {
    try {
      const userAnalytics = await this.getUserAnalytics(undefined, timeframe, true);
      
      // Transform recent activity into graph data
      const activityByDate = new Map();
      
      userAnalytics.recentActivity.forEach(activity => {
        const date = new Date(activity.attempted_at).toISOString().slice(0, 10);
        if (!activityByDate.has(date)) {
          activityByDate.set(date, {
            date,
            attempted: 0,
            correct: 0,
            totalTime: 0
          });
        }
        
        const dayData = activityByDate.get(date);
        dayData.attempted++;
        if (activity.is_correct) dayData.correct++;
        dayData.totalTime += activity.time_spent;
      });

      // Convert to array and fill missing dates
      const graphData: PerformanceGraphData[] = [];
      const now = new Date();
      const daysBack = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;

      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().slice(0, 10);
        const dayData = activityByDate.get(dateStr);
        
        graphData.push({
          date: dateStr,
          attempted: dayData?.attempted || 0,
          globalAverage: Math.floor(Math.random() * 15) + 5, // Placeholder
          momentum: i > 0 ? (dayData?.attempted || 0) - (graphData[graphData.length - 1]?.attempted || 0) : 0,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          mostPracticedSkill: {
            name: 'Mixed Practice',
            percentile: dayData ? Math.round((dayData.correct / dayData.attempted) * 100) : 0,
            contribution: dayData?.attempted || 0
          }
        });
      }

      return graphData;
    } catch (error) {
      console.error('Error fetching performance graph data:', error);
      return [];
    }
  }

  /**
   * Refresh analytics data (trigger recalculation)
   */
  static async refreshAnalytics(userId?: string): Promise<void> {
    try {
      // Call the refresh functions directly via RPC
      const { error: userError } = await supabase.rpc('refresh_user_analytics', {
        target_user_id: userId
      });

      if (userError) {
        console.error('Error refreshing user analytics:', userError);
      }

      // Refresh materialized views
      const { error: viewError } = await supabase.rpc('refresh_materialized_views');
      
      if (viewError) {
        console.error('Error refreshing analytics views:', viewError);
      }
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      throw error;
    }
  }
}

// Additional types and helper functions

export interface SkillAnalytics {
  skillId: string;
  skillName: string;
  chapter: string;
  section: 'Math' | 'Reading' | 'Writing';
  correct: number;
  incorrect: number;
  unattempted: number;
  percentile: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  averageTime: number;
  lastPracticed: string;
  totalQuestions: number;
  masteryLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
  weakestConcepts: string[];
  recommendedAction: string;
  // Additional properties expected by Progress page
  practicePerDay: number;
  solvedProblems: number;
  globalPercentile: number;
  percentileGrowth: number;
}

export interface PerformanceGraphData {
  date: string;
  attempted: number;
  globalAverage: number;
  momentum: number;
  dayName: string;
  mostPracticedSkill: {
    name: string;
    percentile: number;
    contribution: number;
  };
}

// Helper functions
function getSkillMapping(topicName: string): { name: string; chapter: string; section: 'Math' | 'Reading' | 'Writing' } {
  const mappings: { [key: string]: { name: string; chapter: string; section: 'Math' | 'Reading' | 'Writing' } } = {
    'MATH-ALG': { name: 'Linear Equations & Algebra', chapter: 'Heart of Algebra', section: 'Math' },
    'MATH-GEOM': { name: 'Geometry & Trigonometry', chapter: 'Additional Topics', section: 'Math' },
    'MATH-PROB': { name: 'Problem Solving & Data', chapter: 'Problem Solving', section: 'Math' },
    'READ-COMP': { name: 'Reading Comprehension', chapter: 'Reading', section: 'Reading' },
    'WRITE-LANG': { name: 'Language & Grammar', chapter: 'Writing & Language', section: 'Writing' },
    // Add more mappings as needed
  };

  return mappings[topicName] || { 
    name: topicName.replace(/-/g, ' '), 
    chapter: 'General', 
    section: topicName.startsWith('MATH') ? 'Math' : topicName.startsWith('READ') ? 'Reading' : 'Writing'
  };
}

function mapDifficultyToLevel(difficulty: number): 'Easy' | 'Medium' | 'Hard' {
  if (difficulty <= 2.0) return 'Easy';
  if (difficulty <= 3.5) return 'Medium';
  return 'Hard';
}

function getMasteryLevel(successRate: number, totalAttempts: number): 'Beginner' | 'Developing' | 'Proficient' | 'Advanced' {
  if (totalAttempts < 5) return 'Beginner';
  if (successRate < 50) return 'Beginner';
  if (successRate < 70) return 'Developing';
  if (successRate < 85) return 'Proficient';
  return 'Advanced';
}

function getRecommendedAction(successRate: number, totalAttempts: number): string {
  if (totalAttempts < 5) return 'Practice more questions in this area';
  if (successRate < 50) return 'Review fundamentals and practice easier questions';
  if (successRate < 70) return 'Continue practicing with mixed difficulty';
  if (successRate < 85) return 'Focus on advanced concepts and timing';
  return 'Maintain skills with periodic review';
}

// Export default service
export default AnalyticsService;