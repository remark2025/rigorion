import { supabase } from "@/integrations/supabase/client";
import FallbackAnalyticsService from "./fallbackAnalytics";

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
      console.error('Analytics service error, using fallback:', error);
      // Return fallback user analytics for demonstration
      const overallProgress = FallbackAnalyticsService.getOverallProgress();
      const trendData = FallbackAnalyticsService.getPerformanceTrendData();
      
      const recentActivity = trendData.slice(-10).map((day, index) => ({
        question_id: `demo_q_${index + 1}`,
        is_correct: Math.random() > 0.25, // 75% accuracy
        time_spent: Math.floor(Math.random() * 120) + 30,
        confidence: Math.floor(Math.random() * 5) + 1,
        used_hint: Math.random() > 0.7,
        checked_solution: Math.random() > 0.8,
        attempted_at: day.date + 'T' + String(Math.floor(Math.random() * 12) + 8).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':00Z',
        attempt_number: 1
      }));
      
      return {
        summary: {
          total_questions_attempted: overallProgress.totalQuestionsAttempted,
          total_questions_correct: Math.floor(overallProgress.totalQuestionsAttempted * overallProgress.overallAccuracy / 100),
          accuracy_percentage: overallProgress.overallAccuracy,
          average_confidence: 3.8,
          streak_current: overallProgress.studyStreakDays,
          streak_longest: overallProgress.studyStreakDays + 5,
          skill_level: 'intermediate' as const,
          performance_trend: 'improving' as const,
          avg_time_per_question: 95,
          recent_attempts: 45,
          recent_correct: 38
        },
        performance: {
          timeframe: timeframe,
          recent_accuracy: overallProgress.overallAccuracy + 3,
          average_time: 95,
          confidence_trend: 0.2,
          hint_usage_rate: 0.15,
          solution_usage_rate: 0.08
        },
        recentActivity: recentActivity,
        patterns: {
          most_active_time: '14:30',
          average_session_length: 45,
          questions_per_session: 12,
          preferred_difficulty: 'medium',
          learning_velocity: 8.5
        },
        recommendations: [
          'Focus on Advanced Math concepts to improve overall score',
          'Increase daily practice time to 60 minutes for optimal progress',
          'Review missed Reading comprehension questions for pattern analysis'
        ],
        generated_at: new Date().toISOString(),
        data_points: overallProgress.totalQuestionsAttempted
      };
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
      console.error('Question analytics service error, using fallback:', error);
      // Return fallback question analytics with realistic topic stats
      return {
        questions: [],
        overall_stats: {
          total_questions: 150,
          total_attempts: 890,
          average_success_rate: 78.5,
          average_difficulty: 2.8
        },
        topic_stats: [
          {
            topic_name: 'Heart of Algebra',
            question_count: 45,
            total_attempts: 285,
            total_correct: 234,
            success_rate: '82.1',
            average_difficulty: '2.4',
            average_time: '108.5'
          },
          {
            topic_name: 'Problem Solving & Data Analysis',
            question_count: 40,
            total_attempts: 245,
            total_correct: 167,
            success_rate: '68.2',
            average_difficulty: '3.1',
            average_time: '142.3'
          },
          {
            topic_name: 'Advanced Math',
            question_count: 35,
            total_attempts: 198,
            total_correct: 89,
            success_rate: '44.9',
            average_difficulty: '3.8',
            average_time: '185.7'
          },
          {
            topic_name: 'Reading Comprehension',
            question_count: 50,
            total_attempts: 312,
            total_correct: 264,
            success_rate: '84.6',
            average_difficulty: '2.6',
            average_time: '165.4'
          },
          {
            topic_name: 'Grammar & Usage',
            question_count: 40,
            total_attempts: 298,
            total_correct: 280,
            success_rate: '93.9',
            average_difficulty: '2.1',
            average_time: '72.8'
          },
          {
            topic_name: 'Rhetorical Skills',
            question_count: 30,
            total_attempts: 187,
            total_correct: 136,
            success_rate: '72.7',
            average_difficulty: '3.2',
            average_time: '125.6'
          }
        ],
        difficulty_distribution: {
          easy: 45,
          medium: 78,
          hard: 27,
          expert: 0,
          total: 150,
          percentages: {
            easy: '30.0',
            medium: '52.0',
            hard: '18.0',
            expert: '0.0'
          }
        },
        user_performance: [],
        generated_at: new Date().toISOString()
      };
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
      console.log('⚠️ Analytics service error, using comprehensive fallback data:', error.message);
      // Return comprehensive fallback analytics for demonstration
      const allCourses = FallbackAnalyticsService.getAllCourseAnalytics();
      const fallbackSkills: SkillAnalytics[] = [];
      
      console.log('📊 Loading fallback courses:', allCourses.length);
      
      allCourses.forEach(course => {
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
      
      console.log('✅ Fallback analytics ready:', fallbackSkills.length, 'skills loaded');
      return fallbackSkills;
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
      console.error('Error fetching performance graph data, using fallback:', error);
      // Return fallback performance trend data
      const fallbackTrend = FallbackAnalyticsService.getPerformanceTrendData();
      const daysBack = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
      const recentData = fallbackTrend.slice(-daysBack);
      
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

import { SAT_SKILLS_STRUCTURE, getAllSkills } from '@/data/satSkills';

// Helper functions
function getSkillMapping(topicName: string): { name: string; chapter: string; section: 'Math' | 'Reading' | 'Writing' } {
  // Try to find matching skill in the official SAT structure
  const allSkills = getAllSkills();
  const matchingSkill = allSkills.find(skill => 
    skill.title.toLowerCase().includes(topicName.toLowerCase()) ||
    skill.domain.toLowerCase().includes(topicName.toLowerCase()) ||
    topicName.toLowerCase().includes(skill.title.toLowerCase())
  );

  if (matchingSkill) {
    return {
      name: matchingSkill.title,
      chapter: matchingSkill.domain,
      section: matchingSkill.section === 'math' ? 'Math' : matchingSkill.section === 'reading' ? 'Reading' : 'Writing'
    };
  }

  // Fallback mappings for backward compatibility
  const mappings: { [key: string]: { name: string; chapter: string; section: 'Math' | 'Reading' | 'Writing' } } = {
    'Heart of Algebra': { name: 'Algebra Skills', chapter: 'Algebra', section: 'Math' },
    'Problem Solving & Data Analysis': { name: 'Data Analysis Skills', chapter: 'Problem-Solving and Data Analysis', section: 'Math' },
    'Advanced Math': { name: 'Advanced Math Skills', chapter: 'Advanced Math', section: 'Math' },
    'Reading Comprehension': { name: 'Reading Skills', chapter: 'Information and Ideas', section: 'Reading' },
    'Grammar & Usage': { name: 'Grammar Skills', chapter: 'Standard English Conventions', section: 'Writing' },
    'Rhetorical Skills': { name: 'Rhetorical Skills', chapter: 'Expression of Ideas', section: 'Writing' }
  };

  return mappings[topicName] || { 
    name: topicName.replace(/-/g, ' '), 
    chapter: 'General', 
    section: topicName.toLowerCase().includes('math') ? 'Math' : topicName.toLowerCase().includes('read') ? 'Reading' : 'Writing'
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