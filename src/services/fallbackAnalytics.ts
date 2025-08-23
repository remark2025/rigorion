// Fallback Analytics Service for Demonstration Purposes
// Provides comprehensive skill analytics when the real analytics system isn't working

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
    return {
      courseName: "SAT Math",
      section: "Math",
      overallAccuracy: 78,
      totalQuestionsAttempted: 324,
      totalTimeSpent: 720, // minutes
      currentLevel: "Intermediate-Advanced",
      chaptersCompleted: 8,
      totalChapters: 10,
      weeklyProgress: 85,
      monthlyProgress: 76,
      strengths: ["Algebra", "Linear Equations", "Basic Geometry"],
      weaknesses: ["Advanced Functions", "Trigonometry", "Data Analysis"],
      recommendations: [
        "Focus on polynomial functions and their transformations",
        "Practice more trigonometric identity problems",
        "Strengthen statistical reasoning and interpretation"
      ],
      skills: [
        {
          skillId: "math_01",
          skillName: "Heart of Algebra",
          chapter: "Chapter 1",
          section: "Math",
          correct: 28,
          incorrect: 7,
          unattempted: 15,
          totalQuestions: 50,
          percentile: 82,
          difficulty: "Medium",
          averageTime: 1.8,
          lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Proficient",
          weakestConcepts: ["Systems of inequalities", "Complex word problems"],
          strongestConcepts: ["Linear equations", "Slope-intercept form", "Basic algebraic manipulation"],
          recommendedAction: "Practice advanced algebra word problems",
          practicePerDay: 4.2,
          solvedProblems: 35,
          globalPercentile: 78,
          percentileGrowth: 12,
          timeSpentMinutes: 63,
          accuracyTrend: "Improving",
          difficultyProgression: "Easy → Medium (Ready for Hard)",
          nextMilestone: "Master systems of inequalities (5 more correct answers)",
          studyStreak: 7,
          conceptMastery: [
            {
              concept: "Linear Equations",
              mastery: 95,
              questionsAnswered: 15,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Systems of Equations", 
              mastery: 87,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Inequalities",
              mastery: 65,
              questionsAnswered: 8,
              lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "math_02", 
          skillName: "Problem Solving & Data Analysis",
          chapter: "Chapter 2",
          section: "Math",
          correct: 22,
          incorrect: 12,
          unattempted: 16,
          totalQuestions: 50,
          percentile: 68,
          difficulty: "Hard",
          averageTime: 2.4,
          lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Developing",
          weakestConcepts: ["Statistical inference", "Probability distributions", "Data interpretation"],
          strongestConcepts: ["Basic statistics", "Mean/median calculations", "Simple ratios"],
          recommendedAction: "Focus on statistical reasoning and data interpretation",
          practicePerDay: 3.8,
          solvedProblems: 34,
          globalPercentile: 71,
          percentileGrowth: 8,
          timeSpentMinutes: 82,
          accuracyTrend: "Stable",
          difficultyProgression: "Medium → Hard (Developing)",
          nextMilestone: "Achieve 75% accuracy in data analysis (8 more correct)",
          studyStreak: 5,
          conceptMastery: [
            {
              concept: "Ratios and Proportions",
              mastery: 88,
              questionsAnswered: 10,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Percentages",
              mastery: 82,
              questionsAnswered: 14,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Statistical Analysis",
              mastery: 58,
              questionsAnswered: 10,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "math_03",
          skillName: "Advanced Math",
          chapter: "Chapter 3", 
          section: "Math",
          correct: 15,
          incorrect: 18,
          unattempted: 17,
          totalQuestions: 50,
          percentile: 45,
          difficulty: "Hard",
          averageTime: 3.2,
          lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Beginner",
          weakestConcepts: ["Polynomial functions", "Exponential growth", "Trigonometric functions"],
          strongestConcepts: ["Basic quadratics", "Function notation"],
          recommendedAction: "Review fundamentals before attempting advanced problems",
          practicePerDay: 2.1,
          solvedProblems: 33,
          globalPercentile: 42,
          percentileGrowth: -3,
          timeSpentMinutes: 106,
          accuracyTrend: "Declining", 
          difficultyProgression: "Medium → Hard (Struggling)",
          nextMilestone: "Master quadratic functions (10 more correct answers)",
          studyStreak: 2,
          conceptMastery: [
            {
              concept: "Quadratic Functions",
              mastery: 62,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Polynomial Operations",
              mastery: 38,
              questionsAnswered: 11,
              lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Exponential Functions",
              mastery: 28,
              questionsAnswered: 10,
              lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    };
  }

  /**
   * Get comprehensive Reading course analytics
   */
  static getReadingAnalytics(): CourseAnalytics {
    return {
      courseName: "SAT Reading & Comprehension",
      section: "Reading",
      overallAccuracy: 84,
      totalQuestionsAttempted: 267,
      totalTimeSpent: 890, // minutes
      currentLevel: "Advanced",
      chaptersCompleted: 6,
      totalChapters: 8,
      weeklyProgress: 92,
      monthlyProgress: 88,
      strengths: ["Main idea identification", "Vocabulary in context", "Literary analysis"],
      weaknesses: ["Data analysis in passages", "Scientific reasoning", "Historical context"],
      recommendations: [
        "Practice more science and history passage types",
        "Focus on data interpretation within reading passages",
        "Strengthen analytical reasoning skills"
      ],
      skills: [
        {
          skillId: "read_01",
          skillName: "Reading Comprehension",
          chapter: "Chapter 1",
          section: "Reading",
          correct: 38,
          incorrect: 6,
          unattempted: 6,
          totalQuestions: 50,
          percentile: 89,
          difficulty: "Medium",
          averageTime: 2.8,
          lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Advanced",
          weakestConcepts: ["Inferential reasoning", "Author's attitude"],
          strongestConcepts: ["Main idea", "Supporting details", "Text structure"],
          recommendedAction: "Maintain skills with challenging passages",
          practicePerDay: 5.2,
          solvedProblems: 44,
          globalPercentile: 91,
          percentileGrowth: 15,
          timeSpentMinutes: 123,
          accuracyTrend: "Improving",
          difficultyProgression: "Medium → Hard (Excelling)",
          nextMilestone: "Achieve 95% accuracy (3 more consecutive correct)",
          studyStreak: 12,
          conceptMastery: [
            {
              concept: "Main Idea Identification",
              mastery: 96,
              questionsAnswered: 18,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Supporting Details",
              mastery: 92,
              questionsAnswered: 15,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Inference Making",
              mastery: 78,
              questionsAnswered: 11,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "read_02",
          skillName: "Literary Analysis",
          chapter: "Chapter 2",
          section: "Reading",
          correct: 32,
          incorrect: 9,
          unattempted: 9,
          totalQuestions: 50,
          percentile: 81,
          difficulty: "Hard",
          averageTime: 3.1,
          lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Proficient",
          weakestConcepts: ["Symbolism interpretation", "Theme analysis", "Character motivation"],
          strongestConcepts: ["Tone identification", "Literary devices", "Plot analysis"],
          recommendedAction: "Deepen understanding of symbolic and thematic elements",
          practicePerDay: 4.7,
          solvedProblems: 41,
          globalPercentile: 84,
          percentileGrowth: 9,
          timeSpentMinutes: 127,
          accuracyTrend: "Stable",
          difficultyProgression: "Medium → Hard (Proficient)",
          nextMilestone: "Master symbolism analysis (6 more correct)",
          studyStreak: 8,
          conceptMastery: [
            {
              concept: "Tone and Mood",
              mastery: 88,
              questionsAnswered: 14,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Literary Devices",
              mastery: 85,
              questionsAnswered: 13,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Theme Analysis",
              mastery: 68,
              questionsAnswered: 14,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "read_03",
          skillName: "Scientific & Historical Analysis",
          chapter: "Chapter 3",
          section: "Reading",
          correct: 25,
          incorrect: 14,
          unattempted: 11,
          totalQuestions: 50,
          percentile: 65,
          difficulty: "Hard",
          averageTime: 4.2,
          lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Developing",
          weakestConcepts: ["Scientific methodology", "Data interpretation", "Historical context"],
          strongestConcepts: ["Factual comprehension", "Basic analysis"],
          recommendedAction: "Focus on scientific reasoning and historical analysis",
          practicePerDay: 3.4,
          solvedProblems: 39,
          globalPercentile: 67,
          percentileGrowth: 5,
          timeSpentMinutes: 164,
          accuracyTrend: "Improving",
          difficultyProgression: "Hard (Developing)",
          nextMilestone: "Achieve 70% accuracy in science passages (8 more correct)",
          studyStreak: 4,
          conceptMastery: [
            {
              concept: "Scientific Reasoning",
              mastery: 58,
              questionsAnswered: 16,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Data Analysis in Text",
              mastery: 52,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Historical Context",
              mastery: 74,
              questionsAnswered: 11,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    };
  }

  /**
   * Get comprehensive Writing course analytics
   */
  static getWritingAnalytics(): CourseAnalytics {
    return {
      courseName: "SAT Writing & Language",
      section: "Writing",
      overallAccuracy: 86,
      totalQuestionsAttempted: 298,
      totalTimeSpent: 445, // minutes
      currentLevel: "Advanced",
      chaptersCompleted: 7,
      totalChapters: 9,
      weeklyProgress: 94,
      monthlyProgress: 91,
      strengths: ["Grammar rules", "Punctuation", "Sentence structure"],
      weaknesses: ["Advanced rhetoric", "Style consistency", "Complex transitions"],
      recommendations: [
        "Practice advanced rhetorical strategies",
        "Focus on maintaining consistent writing style",
        "Master complex transitional phrases and their usage"
      ],
      skills: [
        {
          skillId: "write_01",
          skillName: "Grammar & Usage",
          chapter: "Chapter 1",
          section: "Writing",
          correct: 42,
          incorrect: 4,
          unattempted: 4,
          totalQuestions: 50,
          percentile: 94,
          difficulty: "Medium",
          averageTime: 1.2,
          lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Advanced",
          weakestConcepts: ["Subjunctive mood", "Complex verb tenses"],
          strongestConcepts: ["Subject-verb agreement", "Pronoun usage", "Basic tenses"],
          recommendedAction: "Maintain mastery with periodic review",
          practicePerDay: 6.1,
          solvedProblems: 46,
          globalPercentile: 96,
          percentileGrowth: 8,
          timeSpentMinutes: 55,
          accuracyTrend: "Stable",
          difficultyProgression: "Medium → Hard (Mastered)",
          nextMilestone: "Perfect score streak (2 more perfect sections)",
          studyStreak: 15,
          conceptMastery: [
            {
              concept: "Subject-Verb Agreement",
              mastery: 98,
              questionsAnswered: 16,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Pronoun Agreement", 
              mastery: 95,
              questionsAnswered: 14,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Verb Tenses",
              mastery: 88,
              questionsAnswered: 16,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "write_02",
          skillName: "Punctuation & Mechanics",
          chapter: "Chapter 2",
          section: "Writing",
          correct: 36,
          incorrect: 7,
          unattempted: 7,
          totalQuestions: 50,
          percentile: 87,
          difficulty: "Medium",
          averageTime: 1.4,
          lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Proficient",
          weakestConcepts: ["Semicolon usage", "Complex comma rules", "Apostrophes in complex cases"],
          strongestConcepts: ["Basic comma rules", "Period usage", "Question marks"],
          recommendedAction: "Practice advanced punctuation scenarios",
          practicePerDay: 5.3,
          solvedProblems: 43,
          globalPercentile: 89,
          percentileGrowth: 6,
          timeSpentMinutes: 60,
          accuracyTrend: "Improving",
          difficultyProgression: "Medium → Hard (Advancing)",
          nextMilestone: "Master semicolon usage (4 more correct)",
          studyStreak: 9,
          conceptMastery: [
            {
              concept: "Comma Usage",
              mastery: 92,
              questionsAnswered: 18,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Apostrophes",
              mastery: 86,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Semicolons & Colons",
              mastery: 72,
              questionsAnswered: 13,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          skillId: "write_03",
          skillName: "Rhetorical Skills",
          chapter: "Chapter 3",
          section: "Writing",
          correct: 28,
          incorrect: 11,
          unattempted: 11,
          totalQuestions: 50,
          percentile: 73,
          difficulty: "Hard",
          averageTime: 2.1,
          lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          masteryLevel: "Developing",
          weakestConcepts: ["Advanced transitions", "Style consistency", "Audience awareness"],
          strongestConcepts: ["Basic organization", "Simple transitions", "Clarity"],
          recommendedAction: "Focus on advanced rhetorical strategies and style",
          practicePerDay: 4.2,
          solvedProblems: 39,
          globalPercentile: 76,
          percentileGrowth: 11,
          timeSpentMinutes: 82,
          accuracyTrend: "Improving",
          difficultyProgression: "Hard (Developing)",
          nextMilestone: "Master advanced transitions (7 more correct)",
          studyStreak: 6,
          conceptMastery: [
            {
              concept: "Organization & Structure",
              mastery: 82,
              questionsAnswered: 15,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Transitions",
              mastery: 68,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              concept: "Style & Tone",
              mastery: 64,
              questionsAnswered: 12,
              lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
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