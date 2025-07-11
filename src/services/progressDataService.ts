
import { UserProgressData } from "@/types/progress";
import { getSecureLatestFunctionData } from "./secureIndexedDbService";
import { callEdgeFunction } from "./edgeFunctionService";

interface SecureProgressResponse {
  user_id: string;
  speed: number;
  streak_days: number;
  avg_score: number;
  rank: number;
  projected_score: number;
  total_attempted: number;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  questions_answered_today?: number;
  easy: {
    total: number;
    accuracy: number;
    avg_time: number;
    completed: number;
  };
  medium: {
    total: number;
    accuracy: number;
    avg_time: number;
    completed: number;
  };
  hard: {
    total: number;
    accuracy: number;
    avg_time: number;
    completed: number;
  };
  avg_time_per_question: number;
  avg_time_correct: number;
  avg_time_incorrect: number;
  longest_time: number;
  chapter_stats: Record<string, {
    correct: number;
    accuracy: number;
    incorrect: number;
    unattempted: number;
  }>;
  goals: Array<{
    title: string;
    target: number;
    percent: number;
    due_date: string;
    completed: number;
  }>;
  performance_graph: Array<{
    date: string;
    attempted: number;
  }>;
}

export const fetchSecureUserProgressData = async (): Promise<UserProgressData | null> => {
  try {
    // First try to get from secure storage
    const secureRecord = await getSecureLatestFunctionData('get-user-progress');
    
    if (secureRecord && secureRecord.data) {
      console.log("Found secure progress data:", secureRecord.data);
      return transformProgressData(secureRecord.data as SecureProgressResponse);
    }
    
    // If not in secure storage, fetch from endpoint
    console.log("Fetching fresh progress data from endpoint");
    const { data, error } = await callEdgeFunction('get-user-progress', { method: 'GET' });
    
    if (!error && data && Array.isArray(data) && data.length > 0) {
      console.log("Successfully fetched progress data:", data[0]);
      return transformProgressData(data[0] as SecureProgressResponse);
    }
    
    console.error("No progress data available");
    return null;
  } catch (error) {
    console.error("Error fetching secure user progress data:", error);
    return null;
  }
};

const transformProgressData = (data: SecureProgressResponse): UserProgressData => {
  // Transform chapter stats to the expected format
  const chapterPerformance = Object.entries(data.chapter_stats || {}).map(([chapterId, stats]) => ({
    chapterId,
    chapterName: `Chapter ${chapterId.replace('chapter_', '')}`,
    correct: stats.correct,
    incorrect: stats.incorrect,
    unattempted: stats.unattempted
  }));

  return {
    userId: data.user_id,
    totalProgressPercent: Math.round((data.total_attempted / data.total_questions) * 100),
    correctAnswers: data.correct_count,
    incorrectAnswers: data.incorrect_count,
    unattemptedQuestions: data.unattempted_count,
    questionsAnsweredToday: data.questions_answered_today || 0,
    streak: data.streak_days,
    averageScore: data.avg_score,
    rank: data.rank,
    projectedScore: data.projected_score,
    speed: data.speed,
    easyAccuracy: data.easy.accuracy * 100,
    easyAvgTime: data.easy.avg_time / 60, // Convert to minutes
    easyCompleted: data.easy.completed,
    easyTotal: data.easy.total,
    mediumAccuracy: data.medium.accuracy * 100,
    mediumAvgTime: data.medium.avg_time / 60, // Convert to minutes
    mediumCompleted: data.medium.completed,
    mediumTotal: data.medium.total,
    hardAccuracy: data.hard.accuracy * 100,
    hardAvgTime: data.hard.avg_time / 60, // Convert to minutes
    hardCompleted: data.hard.completed,
    hardTotal: data.hard.total,
    goalAchievementPercent: data.goals.length > 0 ? data.goals[0].percent * 100 : 0,
    averageTime: data.avg_time_per_question / 60, // Convert to minutes
    correctAnswerAvgTime: data.avg_time_correct / 60, // Convert to minutes
    incorrectAnswerAvgTime: data.avg_time_incorrect / 60, // Convert to minutes
    longestQuestionTime: data.longest_time / 60, // Convert to minutes
    performanceGraph: data.performance_graph || [],
    chapterPerformance,
    goals: data.goals.map(goal => ({
      id: goal.title.toLowerCase().replace(/\s+/g, '_'),
      title: goal.title,
      targetValue: goal.target,
      currentValue: goal.completed,
      dueDate: goal.due_date
    }))
  };
};
