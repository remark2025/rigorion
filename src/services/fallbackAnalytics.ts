// Fallback Analytics Service for Demonstration Purposes
// Provides comprehensive skill analytics when the real analytics system isn't working

import { SAT_SKILLS_STRUCTURE, getAllSkills } from '@/data/satSkills';

export interface DetailedSkillAnalytics {
  skillId: string;
  skillName: string;
  chapter: string;
  section: 'Math' | 'Reading' | 'Writing';
  correct: number;
  incorrect: number;
  unattempted: number;
  totalQuestions: number;
  percentile: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  averageTime: number;
  lastPracticed: string;
  masteryLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
  weakestConcepts: string[];
  strongestConcepts: string[];
  recommendedAction: string;
  practicePerDay: number;
  solvedProblems: number;
  globalPercentile: number;
  percentileGrowth: number;
  timeSpentMinutes: number;
  accuracyTrend: 'Improving' | 'Stable' | 'Declining';
  difficultyProgression: string;
  nextMilestone: string;
  studyStreak: number;
  conceptMastery: {
    concept: string;
    mastery: number;
    questionsAnswered: number;
    lastPracticed: string;
  }[];
}

export interface CourseAnalytics {
  courseName: string;
  section: 'Math' | 'Reading' | 'Writing';
  overallAccuracy: number;
  totalQuestionsAttempted: number;
  totalTimeSpent: number;
  currentLevel: string;
  chaptersCompleted: number;
  totalChapters: number;
  weeklyProgress: number;
  monthlyProgress: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skills: DetailedSkillAnalytics[];
}

export class FallbackAnalyticsService {
  
  /**
   * Get comprehensive Math course analytics
   */
  static getMathAnalytics(): CourseAnalytics {
    const mathSkills = SAT_SKILLS_STRUCTURE.math.domains.flatMap(domain => 
      domain.skills.map(skill => ({
        skillId: skill.id,
        skillName: skill.title,
        chapter: domain.title,
        section: "Math" as const,
        correct: Math.floor(Math.random() * 25) + 15,
        incorrect: Math.floor(Math.random() * 15) + 5,
        unattempted: Math.floor(Math.random() * 20) + 10,
        totalQuestions: 50,
        percentile: Math.floor(Math.random() * 40) + 60,
        difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
        averageTime: Math.random() * 2 + 1.5,
        lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        masteryLevel: ["Beginner", "Developing", "Proficient", "Advanced"][Math.floor(Math.random() * 4)] as "Beginner" | "Developing" | "Proficient" | "Advanced",
        weakestConcepts: ["Complex applications", "Word problems", "Multi-step solutions"],
        strongestConcepts: ["Basic concepts", "Formula application", "Simple calculations"],
        recommendedAction: "Continue practicing with mixed difficulty",
        practicePerDay: Math.random() * 3 + 2,
        solvedProblems: Math.floor(Math.random() * 30) + 20,
        globalPercentile: Math.floor(Math.random() * 30) + 70,
        percentileGrowth: Math.floor(Math.random() * 20) - 5,
        timeSpentMinutes: Math.floor(Math.random() * 60) + 40,
        accuracyTrend: ["Improving", "Stable", "Declining"][Math.floor(Math.random() * 3)] as "Improving" | "Stable" | "Declining",
        difficultyProgression: "Medium → Hard (Developing)",
        nextMilestone: "Achieve mastery in this domain",
        studyStreak: Math.floor(Math.random() * 10) + 3,
        conceptMastery: [
          {
            concept: "Core Concepts",
            mastery: Math.floor(Math.random() * 30) + 70,
            questionsAnswered: Math.floor(Math.random() * 10) + 8,
            lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }))
    );

    return {
      courseName: "SAT Math",
      section: "Math",
      overallAccuracy: 78,
      totalQuestionsAttempted: 324,
      totalTimeSpent: 720,
      currentLevel: "Intermediate-Advanced",
      chaptersCompleted: 3,
      totalChapters: 4,
      weeklyProgress: 85,
      monthlyProgress: 76,
      strengths: ["Algebra", "Linear Equations", "Basic Geometry"],
      weaknesses: ["Advanced Functions", "Trigonometry", "Data Analysis"],
      recommendations: [
        "Focus on polynomial functions and their transformations",
        "Practice more trigonometric identity problems",
        "Strengthen statistical reasoning and interpretation"
      ],
      skills: mathSkills
    };
  }

  /**
   * Get comprehensive Reading course analytics
   */
  static getReadingAnalytics(): CourseAnalytics {
    const readingSkills = SAT_SKILLS_STRUCTURE.reading.domains.flatMap(domain => 
      domain.skills.map(skill => ({
        skillId: skill.id,
        skillName: skill.title,
        chapter: domain.title,
        section: "Reading" as const,
        correct: Math.floor(Math.random() * 25) + 20,
        incorrect: Math.floor(Math.random() * 10) + 3,
        unattempted: Math.floor(Math.random() * 15) + 8,
        totalQuestions: 50,
        percentile: Math.floor(Math.random() * 30) + 70,
        difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
        averageTime: Math.random() * 2 + 2.5,
        lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        masteryLevel: ["Beginner", "Developing", "Proficient", "Advanced"][Math.floor(Math.random() * 4)] as "Beginner" | "Developing" | "Proficient" | "Advanced",
        weakestConcepts: ["Complex analysis", "Advanced reasoning", "Nuanced interpretation"],
        strongestConcepts: ["Basic comprehension", "Factual details", "Direct evidence"],
        recommendedAction: "Focus on analytical reasoning skills",
        practicePerDay: Math.random() * 3 + 3,
        solvedProblems: Math.floor(Math.random() * 35) + 25,
        globalPercentile: Math.floor(Math.random() * 25) + 75,
        percentileGrowth: Math.floor(Math.random() * 15) + 5,
        timeSpentMinutes: Math.floor(Math.random() * 80) + 60,
        accuracyTrend: ["Improving", "Stable", "Declining"][Math.floor(Math.random() * 3)] as "Improving" | "Stable" | "Declining",
        difficultyProgression: "Medium → Hard (Advancing)",
        nextMilestone: "Master advanced comprehension",
        studyStreak: Math.floor(Math.random() * 8) + 5,
        conceptMastery: [
          {
            concept: "Core Understanding",
            mastery: Math.floor(Math.random() * 30) + 70,
            questionsAnswered: Math.floor(Math.random() * 10) + 10,
            lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }))
    );

    return {
      courseName: "SAT Reading",
      section: "Reading",
      overallAccuracy: 84,
      totalQuestionsAttempted: 267,
      totalTimeSpent: 890,
      currentLevel: "Advanced",
      chaptersCompleted: 2,
      totalChapters: 2,
      weeklyProgress: 92,
      monthlyProgress: 88,
      strengths: ["Main idea identification", "Vocabulary in context", "Literary analysis"],
      weaknesses: ["Data analysis in passages", "Scientific reasoning", "Historical context"],
      recommendations: [
        "Practice more science and history passage types",
        "Focus on data interpretation within reading passages",
        "Strengthen analytical reasoning skills"
      ],
      skills: readingSkills
    };
  }

  /**
   * Get comprehensive Writing course analytics
   */
  static getWritingAnalytics(): CourseAnalytics {
    const writingSkills = SAT_SKILLS_STRUCTURE.writing.domains.flatMap(domain => 
      domain.skills.map(skill => ({
        skillId: skill.id,
        skillName: skill.title,
        chapter: domain.title,
        section: "Writing" as const,
        correct: Math.floor(Math.random() * 25) + 20,
        incorrect: Math.floor(Math.random() * 8) + 2,
        unattempted: Math.floor(Math.random() * 12) + 5,
        totalQuestions: 50,
        percentile: Math.floor(Math.random() * 25) + 75,
        difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
        averageTime: Math.random() + 1.2,
        lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        masteryLevel: ["Beginner", "Developing", "Proficient", "Advanced"][Math.floor(Math.random() * 4)] as "Beginner" | "Developing" | "Proficient" | "Advanced",
        weakestConcepts: ["Complex applications", "Advanced rules", "Nuanced cases"],
        strongestConcepts: ["Basic rules", "Common patterns", "Standard usage"],
        recommendedAction: "Practice advanced writing techniques",
        practicePerDay: Math.random() * 3 + 4,
        solvedProblems: Math.floor(Math.random() * 25) + 30,
        globalPercentile: Math.floor(Math.random() * 20) + 80,
        percentileGrowth: Math.floor(Math.random() * 12) + 3,
        timeSpentMinutes: Math.floor(Math.random() * 40) + 50,
        accuracyTrend: ["Improving", "Stable"][Math.floor(Math.random() * 2)] as "Improving" | "Stable",
        difficultyProgression: "Medium → Hard (Advancing)",
        nextMilestone: "Master advanced writing skills",
        studyStreak: Math.floor(Math.random() * 10) + 8,
        conceptMastery: [
          {
            concept: "Core Skills",
            mastery: Math.floor(Math.random() * 25) + 75,
            questionsAnswered: Math.floor(Math.random() * 8) + 12,
            lastPracticed: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }))
    );

    return {
      courseName: "SAT Writing & Language",
      section: "Writing",
      overallAccuracy: 86,
      totalQuestionsAttempted: 298,
      totalTimeSpent: 445,
      currentLevel: "Advanced",
      chaptersCompleted: 2,
      totalChapters: 2,
      weeklyProgress: 94,
      monthlyProgress: 91,
      strengths: ["Grammar rules", "Punctuation", "Sentence structure"],
      weaknesses: ["Advanced rhetoric", "Style consistency", "Complex transitions"],
      recommendations: [
        "Practice advanced rhetorical strategies",
        "Focus on maintaining consistent writing style",
        "Master complex transitional phrases and their usage"
      ],
      skills: writingSkills
    };
  }

  /**
   * Get all course analytics for comprehensive dashboard
   */
  static getAllCourseAnalytics(): CourseAnalytics[] {
    return [
      this.getMathAnalytics(),
      this.getReadingAnalytics(), 
      this.getWritingAnalytics()
    ];
  }

  /**
   * Get overall student progress summary
   */
  static getOverallProgress() {
    const courses = this.getAllCourseAnalytics();
    
    return {
      totalQuestionsAttempted: courses.reduce((sum, course) => sum + course.totalQuestionsAttempted, 0),
      overallAccuracy: Math.round(courses.reduce((sum, course) => sum + course.overallAccuracy, 0) / courses.length),
      totalTimeSpentHours: Math.round(courses.reduce((sum, course) => sum + course.totalTimeSpent, 0) / 60 * 10) / 10,
      chaptersCompleted: courses.reduce((sum, course) => sum + course.chaptersCompleted, 0),
      totalChapters: courses.reduce((sum, course) => sum + course.totalChapters, 0),
      currentLevel: "Advanced Intermediate",
      weeklyGoalProgress: 89,
      monthlyGoalProgress: 85,
      studyStreakDays: 12,
      strongestSection: "Writing & Language",
      weakestSection: "Advanced Math",
      nextMilestone: "Complete Chapter 4 in Advanced Math",
      recommendedStudyTime: "45 minutes/day",
      estimatedScoreRange: "1420-1480",
      improvementPotential: "+60-80 points"
    };
  }

  /**
   * Get performance trend data for charts
   */
  static getPerformanceTrendData() {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayProgress = Math.floor(Math.random() * 25) + 5 + (i < 15 ? 5 : 0); // Recent improvement trend
      
      last30Days.push({
        date: date.toISOString().slice(0, 10),
        questionsAttempted: dayProgress,
        accuracy: Math.min(100, Math.max(40, 75 + Math.floor(Math.random() * 20) - 10 + (i < 15 ? 5 : 0))),
        timeSpent: Math.floor(dayProgress * (1.5 + Math.random())),
        mathScore: Math.min(100, Math.max(30, 65 + Math.floor(Math.random() * 25) + (i < 10 ? 5 : 0))),
        readingScore: Math.min(100, Math.max(50, 80 + Math.floor(Math.random() * 15) + (i < 10 ? 3 : 0))),
        writingScore: Math.min(100, Math.max(60, 85 + Math.floor(Math.random() * 10) + (i < 10 ? 2 : 0)))
      });
    }
    
    return last30Days;
  }
}

export default FallbackAnalyticsService;