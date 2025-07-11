
export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type ProgressTab = "performance" | "leaderboard";

export interface UserProgressData {
  userId: string;
  totalProgressPercent: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  questionsAnsweredToday: number;
  streak: number;
  averageScore: number;
  rank: number;
  projectedScore: number;
  speed: number;
  easyAccuracy: number;
  easyAvgTime: number;
  easyCompleted: number;
  easyTotal: number;
  mediumAccuracy: number;
  mediumAvgTime: number;
  mediumCompleted: number;
  mediumTotal: number;
  hardAccuracy: number;
  hardAvgTime: number;
  hardCompleted: number;
  hardTotal: number;
  goalAchievementPercent: number;
  averageTime: number;
  correctAnswerAvgTime: number;
  incorrectAnswerAvgTime: number;
  longestQuestionTime: number;
  performanceGraph: Array<{
    date: string;
    attempted: number;
  }>;
  chapterPerformance: Array<{
    chapterId: string;
    chapterName: string;
    correct: number;
    incorrect: number;
    unattempted: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    dueDate: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  problems: number;
  accuracy: string;
  score: number;
  trend: number;
  isCurrentUser: boolean;
}
