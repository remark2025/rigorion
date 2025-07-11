// import { supabase } from '@/lib/supabase';
// import { UserProgress } from './types/progressTypes';

// const userProgressCache = new Map<string, UserProgress>();

// const generateDummyData = (userId: string): UserProgress => {
//   // Generate performance graph data for last 10 days
//   const today = new Date();
//   const performanceGraphData = [];
  
//   for (let i = 9; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(date.getDate() - i);
//     const formattedDate = date.toISOString().split('T')[0];
    
//     performanceGraphData.push({
//       date: formattedDate,
//       attempted: Math.floor(Math.random() * 30) + 10,
//     });
//   }

//   // Generate chapter performance data
//   const chapterData = [
//     { chapterId: '1', chapterName: 'Chapter 1', correct: 12, incorrect: 3, unattempted: 5 },
//     { chapterId: '2', chapterName: 'Chapter 2', correct: 8, incorrect: 2, unattempted: 5 },
//     { chapterId: '3', chapterName: 'Chapter 3', correct: 10, incorrect: 5, unattempted: 10 },
//     { chapterId: '4', chapterName: 'Chapter 4', correct: 20, incorrect: 4, unattempted: 6 },
//     { chapterId: '5', chapterName: 'Chapter 5', correct: 5, incorrect: 3, unattempted: 10 },
//     { chapterId: '6', chapterName: 'Chapter 6', correct: 8, incorrect: 4, unattempted: 10 },
//     { chapterId: '7', chapterName: 'Chapter 7', correct: 15, incorrect: 5, unattempted: 5 },
//     { chapterId: '8', chapterName: 'Chapter 8', correct: 10, incorrect: 5, unattempted: 5 },
//     { chapterId: '9', chapterName: 'Chapter 9', correct: 18, incorrect: 6, unattempted: 4 },
//     { chapterId: '10', chapterName: 'Chapter 10', correct: 14, incorrect: 4, unattempted: 6 },
//   ];

//   // Generate goals data
//   const goalsData = [
//     { 
//       id: '1', 
//       title: 'Complete 100 Questions', 
//       targetValue: 100, 
//       currentValue: 75, 
//       dueDate: '2024-05-01' 
//     },
//     { 
//       id: '2', 
//       title: 'Achieve 90% in Hard Questions', 
//       targetValue: 90, 
//       currentValue: 83, 
//       dueDate: '2024-05-15' 
//     },
//   ];

//   // Calculate totals
//   const correctAnswers = 53;
//   const incorrectAnswers = 21;
//   const unattemptedQuestions = 56;
//   const totalQuestions = correctAnswers + incorrectAnswers + unattemptedQuestions;

//   return {
//     userId,
//     totalProgressPercent: ((correctAnswers + incorrectAnswers) / totalQuestions) * 100,
//     correctAnswers,
//     incorrectAnswers,
//     unattemptedQuestions,
//     questionsAnsweredToday: performanceGraphData.length > 0 ? performanceGraphData[performanceGraphData.length - 1].attempted : 0,
//     streak: 7,
//     averageScore: 92,
//     rank: 120,
//     projectedScore: 92,
//     speed: 85,
//     easyAccuracy: 90,
//     easyAvgTime: 1.5,
//     easyCompleted: 45,
//     easyTotal: 50,
//     mediumAccuracy: 70,
//     mediumAvgTime: 2.5,
//     mediumCompleted: 35,
//     mediumTotal: 50,
//     hardAccuracy: 83,
//     hardAvgTime: 4.0,
//     hardCompleted: 25,
//     hardTotal: 30,
//     goalAchievementPercent: goalsData.reduce((acc, goal) => acc + (goal.currentValue / goal.targetValue), 0) / goalsData.length * 100,
//     averageTime: 2.5,
//     correctAnswerAvgTime: 2.0,
//     incorrectAnswerAvgTime: 3.5,
//     longestQuestionTime: 8.0,
//     performanceGraph: performanceGraphData,
//     chapterPerformance: chapterData,
//     goals: goalsData
//   };
// };

// export async function getUserProgressData(userId: string): Promise<UserProgress> {
//   try {
//     // Check cache first
//     if (userProgressCache.has(userId)) {
//       return userProgressCache.get(userId)!;
//     }
    
//     console.log('Getting user progress data for:', userId);
    
//     try {
//       // Call the Edge Function
//       const { data: userProgressData, error } = await supabase.functions.invoke('get-progress', {
//         body: { userId }
//       });

//       if (error) {
//         console.error('Edge function error:', error);
//         throw error;
//       }

//       if (userProgressData) {
//         const formattedData: UserProgress = {
//           userId,
//           totalProgressPercent: userProgressData.total_progress_percent || 0,
//           correctAnswers: userProgressData.correct_answers || 0,
//           incorrectAnswers: userProgressData.incorrect_answers || 0,
//           unattemptedQuestions: userProgressData.unattempted_questions || 0,
//           questionsAnsweredToday: userProgressData.questions_answered_today || 0,
//           streak: userProgressData.streak_days || 0,
//           averageScore: userProgressData.avg_score || 0,
//           rank: userProgressData.rank || 0,
//           projectedScore: userProgressData.projected_score || 0,
//           speed: userProgressData.speed || 0,
//           easyAccuracy: userProgressData.easy_accuracy || 0,
//           easyAvgTime: userProgressData.easy_avg_time_min || 0,
//           easyCompleted: userProgressData.easy_completed || 0,
//           easyTotal: userProgressData.easy_total || 0,
//           mediumAccuracy: userProgressData.medium_accuracy || 0,
//           mediumAvgTime: userProgressData.medium_avg_time_min || 0,
//           mediumCompleted: userProgressData.medium_completed || 0,
//           mediumTotal: userProgressData.medium_total || 0,
//           hardAccuracy: userProgressData.hard_accuracy || 0,
//           hardAvgTime: userProgressData.hard_avg_time_min || 0,
//           hardCompleted: userProgressData.hard_completed || 0,
//           hardTotal: userProgressData.hard_total || 0,
//           goalAchievementPercent: userProgressData.goal_achievement_percent || 0,
//           averageTime: userProgressData.avg_time_per_question || 0,
//           correctAnswerAvgTime: userProgressData.avg_time_correct || 0,
//           incorrectAnswerAvgTime: userProgressData.avg_time_incorrect || 0,
//           longestQuestionTime: userProgressData.longest_time || 0,
//           performanceGraph: userProgressData.performance_graph || [],
//           chapterPerformance: userProgressData.chapter_performance || [],
//           goals: userProgressData.goals || []
//         };

//         // Store in cache
//         userProgressCache.set(userId, formattedData);
//         return formattedData;
//       }
//     } catch (error) {
//       console.error('Error fetching from edge function:', error);
//     }

//     // Fallback to dummy data if edge function fails
//     console.log('Using dummy data as fallback');
//     const dummyData = generateDummyData(userId);
//     userProgressCache.set(userId, dummyData);
//     return dummyData;
//   } catch (error) {
//     console.error('Error fetching user progress:', error);
//     throw error;
//   }
// }
