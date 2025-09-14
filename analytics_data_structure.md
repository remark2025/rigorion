# Analytics Data Structure Required by Progress Page

## Core Progress Stats
```typescript
{
  userId: string,
  totalProgressPercent: number,     // Overall completion %
  correctAnswers: number,           // Total correct answers
  incorrectAnswers: number,         // Total incorrect answers  
  unattemptedQuestions: number,     // Questions not attempted
  questionsAnsweredToday: number,   // Today's question count
  streak: number,                   // Current streak days
  averageScore: number,             // Average accuracy %
  rank: number,                     // User ranking
  projectedScore: number,           // Estimated SAT score
  speed: number,                    // Speed percentile
}
```

## Difficulty-Based Performance
```typescript
{
  easyAccuracy: number,     // Easy questions accuracy %
  easyAvgTime: number,      // Easy questions avg time
  easyCompleted: number,    // Easy questions completed
  easyTotal: number,        // Total easy questions available
  
  mediumAccuracy: number,   // Same for medium
  mediumAvgTime: number,
  mediumCompleted: number, 
  mediumTotal: number,
  
  hardAccuracy: number,     // Same for hard
  hardAvgTime: number,
  hardCompleted: number,
  hardTotal: number,
}
```

## Performance Graph (15-day trend)
```typescript
{
  performanceGraph: [
    {
      date: string,           // "2025-09-01"
      attempted: number,      // Questions attempted that day  
      globalAverage: number,  // Global average for comparison
      momentum: number,       // Change from previous day
      dayName: string,        // "Mon", "Tue", etc.
      mostPracticedSkill: {
        name: string,         // "Linear Equations"
        percentile: number,   // User percentile for this skill
        contribution: number  // Questions in this skill
      }
    }
    // ... 14 more days
  ]
}
```

## Skill Analytics Array  
```typescript
{
  skillAnalytics: [
    {
      skillId: string,        // "math_1"
      skillName: string,      // "Linear Equations in One Variable"  
      chapter: string,        // "Heart of Algebra"
      section: string,        // "Math" | "Reading" | "Writing"
      correct: number,        // Correct answers for this skill
      incorrect: number,      // Incorrect answers
      accuracy: number,       // Accuracy percentage
      averageTime: number,    // Avg time per question
      percentile: number,     // User vs global percentile  
      improvement: number     // Improvement trend
    }
    // ... more skills
  ]
}
```