
import React, { useState, useEffect, useCallback } from "react";
import { UserProgressData } from "@/types/progress";
import { ProgressContext } from "@/contexts/ProgressContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "./ErrorDisplay";
import { useToast } from "@/components/ui/use-toast";
import { getSecureLatestFunctionData, storeSecureFunctionData } from "@/services/secureIndexedDbService";
import { useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/services/edgeFunctionService";

// Define types for the data structure we expect from the my-function endpoint
interface SecureDataResponse {
  user?: {
    id: string;
    progress?: number;
    lastActive?: string;
  };
  stats?: {
    totalQuestions: number;
    answeredCorrect: number;
    accuracy: number;
    averageTime: number;
  };
  questions?: Array<any>;
  id?: string;
  name?: string;
  timestamp?: string;
}

interface SecureProgressProviderProps {
  children: React.ReactNode;
  fallbackData?: UserProgressData;
  showLoadingState?: boolean;
}

export const SecureProgressProvider: React.FC<SecureProgressProviderProps> = ({
  children,
  fallbackData,
  showLoadingState = true,
}) => {
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<UserProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const fetchProgressData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to load progress data from secure storage...");
      
      // First try to get my-function data which contains progress info
      const secureRecord = await getSecureLatestFunctionData('my-function');
      
      if (secureRecord && secureRecord.data) {
        console.log("Found raw secure data:", secureRecord.data);
        
        // Type assertion for the secure data
        const secureData = secureRecord.data as SecureDataResponse;
        
        // If the secure data has user and stats properties, process it
        if (secureData.user && secureData.stats) {
          console.log("Processing secure data from my-function endpoint");
          
          const userData: UserProgressData = {
            userId: secureData.user.id || "secure-user",
            totalProgressPercent: secureData.stats.accuracy * 100 || 75,
            correctAnswers: secureData.stats.answeredCorrect || 53,
            incorrectAnswers: secureData.stats.totalQuestions - secureData.stats.answeredCorrect || 21,
            unattemptedQuestions: 56, // Placeholder
            questionsAnsweredToday: 12, // Placeholder
            streak: 7, // Placeholder
            averageScore: secureData.stats.accuracy * 100 || 92,
            rank: 120, // Placeholder
            projectedScore: 92, // Placeholder
            speed: secureData.stats.averageTime ? 100 - (secureData.stats.averageTime / 60) : 85,
            easyAccuracy: 90, // Placeholder
            easyAvgTime: 1.5, // Placeholder
            easyCompleted: 45, // Placeholder
            easyTotal: 50, // Placeholder
            mediumAccuracy: 70, // Placeholder
            mediumAvgTime: 2.5, // Placeholder
            mediumCompleted: 35, // Placeholder
            mediumTotal: 50, // Placeholder
            hardAccuracy: 83, // Placeholder
            hardAvgTime: 4.0, // Placeholder
            hardCompleted: 25, // Placeholder
            hardTotal: 30, // Placeholder
            goalAchievementPercent: 75, // Placeholder
            averageTime: secureData.stats.averageTime / 60 || 2.5, // Convert to minutes
            correctAnswerAvgTime: 2.0, // Placeholder
            incorrectAnswerAvgTime: 3.5, // Placeholder
            longestQuestionTime: 8.0, // Placeholder
            performanceGraph: Array.from({ length: 15 }, (_, i) => ({
              date: new Date(Date.now() - (14 - i) * 24 * 3600 * 1000).toISOString().slice(0, 10),
              attempted: Math.floor(Math.random() * 30) + 10
            })),
            chapterPerformance: [
              {
                chapterId: 'secure-1',
                chapterName: 'Secure Chapter',
                correct: secureData.stats.answeredCorrect || 12,
                incorrect: secureData.stats.totalQuestions - secureData.stats.answeredCorrect || 3,
                unattempted: 5
              }
            ],
            goals: [{
              id: '1',
              title: 'Complete 100 Questions',
              targetValue: 100,
              currentValue: 75,
              dueDate: '2024-05-01'
            }]
          };
          
          console.log("Processed secure user data:", userData);
          setProgressData(userData);
          setIsLoading(false);
          return;
        }
      }
      
      // If we couldn't get data from secure storage, fetch from edge function
      console.log("No secure data found, fetching from edge function");
      const { data: edgeData, error: edgeError } = await callEdgeFunction(
        'my-function',
        { method: 'GET' }
      );
      
      if (!edgeError && edgeData) {
        console.log("Successfully fetched data from edge function:", edgeData);
        
        // Store the new data securely
        await storeSecureFunctionData('my-function', edgeData);
        
        // Process the data - using type assertion
        const secureData = edgeData as SecureDataResponse;
        
        if (secureData.user && secureData.stats) {
          const userData: UserProgressData = {
            userId: secureData.user.id || "edge-user",
            totalProgressPercent: secureData.stats.accuracy * 100 || 75,
            correctAnswers: secureData.stats.answeredCorrect || 53,
            incorrectAnswers: secureData.stats.totalQuestions - secureData.stats.answeredCorrect || 21,
            unattemptedQuestions: 56,
            questionsAnsweredToday: 12,
            streak: 7,
            averageScore: secureData.stats.accuracy * 100 || 92,
            rank: 120,
            projectedScore: 92,
            speed: secureData.stats.averageTime ? 100 - (secureData.stats.averageTime / 60) : 85,
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
            averageTime: secureData.stats.averageTime / 60 || 2.5,
            correctAnswerAvgTime: 2.0,
            incorrectAnswerAvgTime: 3.5,
            longestQuestionTime: 8.0,
            performanceGraph: Array.from({ length: 15 }, (_, i) => ({
              date: new Date(Date.now() - (14 - i) * 24 * 3600 * 1000).toISOString().slice(0, 10),
              attempted: Math.floor(Math.random() * 30) + 10
            })),
            chapterPerformance: [
              {
                chapterId: 'edge-1',
                chapterName: 'Edge Function Chapter',
                correct: secureData.stats.answeredCorrect || 12,
                incorrect: secureData.stats.totalQuestions - secureData.stats.answeredCorrect || 3,
                unattempted: 5
              }
            ],
            goals: [{
              id: '1',
              title: 'Complete 100 Questions',
              targetValue: 100,
              currentValue: 75,
              dueDate: '2024-05-01'
            }]
          };
          
          console.log("Processed edge function data:", userData);
          setProgressData(userData);
          setIsLoading(false);
          return;
        }
      }
      
      // If we still don't have data, use fallback
      if (fallbackData) {
        console.log("Using fallback data:", fallbackData);
        setProgressData(fallbackData);
      } else {
        throw new Error("No progress data available");
      }
    } catch (err) {
      console.error("Error fetching secure progress data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      
      if (fallbackData) {
        console.log("Using fallback data after error:", fallbackData);
        setProgressData(fallbackData);
        toast({
          title: "Using cached data",
          description: "Could not load fresh progress data. Using fallback data.",
          variant: "default",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [fallbackData, toast]);

  // Initial data fetch
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Reset cache and reload data
  const refreshProgress = useCallback(async () => {
    try {
      // Invalidate React Query caches
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['secureQuestions'] });
      
      // Fetch fresh data
      await fetchProgressData();
      
      toast({
        title: "Progress Updated",
        description: "Your progress data has been refreshed",
        duration: 3000,
      });
    } catch (refreshError) {
      console.error("Error refreshing progress:", refreshError);
      toast({
        title: "Refresh Failed",
        description: refreshError instanceof Error ? refreshError.message : "Could not refresh progress data",
        variant: "destructive",
      });
    }
  }, [fetchProgressData, queryClient, toast]);

  if (isLoading && showLoadingState) {
    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !progressData) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <ProgressContext.Provider 
      value={{ 
        progressData, 
        isLoading, 
        error, 
        refreshProgress 
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export default SecureProgressProvider;
