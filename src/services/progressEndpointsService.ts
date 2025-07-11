import { supabase } from '@/lib/supabase';
import { Question } from '@/types/QuestionInterface';
import { toast } from "@/components/ui/use-toast";
import type { UserProgressData } from '@/types/progress';
import { callEdgeFunction } from './edgeFunctionService';

// Define all endpoints for reference
const endpoints = [
  'get-progress',
  'get-sat-math-questions',
  'get-user-progress',
  'get-apijson',
  'my-function',
  'mock',
];

// Invoke all endpoints and collect responses
export async function fetchProgressEndpoints() {
  try {
    const results = await Promise.all(
      endpoints.map(async (name) => {
        const { data, error } = await callEdgeFunction(name);

        if (error) {
          console.error(`❌ Error from ${name}:`, error);
        } else {
          console.log(`✅ Response from ${name}:`, data);
        }

        return {
          name,
          data,
          error,
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error("Error fetching progress endpoints:", error);
    toast({
      title: "Error",
      description: "Could not fetch progress data from the server",
      variant: "destructive",
    });
    return [];
  }
}

// Process the data for the UI components
export function processProgressData(endpointsData: any[]): UserProgressData {
  // This is a placeholder implementation - in a real app,
  // you would process the data from your API endpoints
  
  // Return dummy data for now
  return {
    userId: 'current-user',
    totalProgressPercent: 75,
    correctAnswers: 53,
    incorrectAnswers: 21,
    unattemptedQuestions: 56,
    questionsAnsweredToday: 12,
    streak: 7,
    averageScore: 92,
    rank: 120,
    projectedScore: 92,
    speed: 85,
    easyAccuracy: 90,
    easyAvgTime: 1.5,
    easyCompleted: 45,
    easyTotal: 50,
    mediumAccuracy: 70,
    mediumAvgTime: 2.5,
    mediumCompleted: 35,
    mediumTotal: 50,
    hardAccuracy: 83,
    hardAvgTime: 4.0,
    hardCompleted: 25,
    hardTotal: 30,
    goalAchievementPercent: 75,
    averageTime: 2.5,
    correctAnswerAvgTime: 2.0,
    incorrectAnswerAvgTime: 3.5,
    longestQuestionTime: 8.0,
    performanceGraph: Array.from({
      length: 15
    }, (_, i) => ({
      date: new Date(Date.now() - (14 - i) * 24 * 3600 * 1000).toISOString().slice(0, 10),
      attempted: Math.floor(Math.random() * 30) + 10
    })),
    chapterPerformance: [
      {
        chapterId: '1',
        chapterName: 'Chapter 1',
        correct: 12,
        incorrect: 3,
        unattempted: 5,
      },
      // ... more chapters would be here
    ],
    goals: [{
      id: '1',
      title: 'Complete 100 Questions',
      targetValue: 100,
      currentValue: 75,
      dueDate: '2024-05-01'
    }, {
      id: '2',
      title: 'Achieve 90% in Hard Questions',
      targetValue: 90,
      currentValue: 83,
      dueDate: '2024-05-15'
    }]
  };
}

// Updated function to fetch math questions from Edge Function
export async function fetchMathQuestionsFromEdge() {
  try {
    const { data, error } = await callEdgeFunction<Question[]>('get-sat-math-questions');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching math questions:', error);
    throw error;
  }
}

// Updated function to fetch user progress data from Edge Function
export async function fetchUserProgressFromEdge(period: string = 'weekly') {
  try {
    const { data, error } = await callEdgeFunction('get-user-progress', 
      { method: 'GET' },
      { period }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}
