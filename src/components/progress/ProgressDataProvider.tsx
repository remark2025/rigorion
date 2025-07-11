
import { useQuery } from "@tanstack/react-query";
import { fetchProgressEndpoints, processProgressData } from "@/services/progressEndpointsService";
import { UserProgressData } from "@/types/progress";
import { useToast } from "@/components/ui/use-toast";
import { ErrorDisplay } from "./ErrorDisplay";
import { Skeleton } from "../ui/skeleton";
import { callEdgeFunction } from "@/services/edgeFunctionService";
import { fetchSecureUserProgressData } from "@/services/progressDataService";
import { isSecureStorageActive, getSecureLatestFunctionData } from "@/services/secureIndexedDbService";

interface ProgressDataProviderProps {
  children: (data: UserProgressData) => React.ReactNode;
  fallbackData: UserProgressData;
  showLoadingState?: boolean;
  timePeriod?: string;
}

export const ProgressDataProvider = ({
  children,
  fallbackData,
  showLoadingState = true,
  timePeriod = 'weekly'
}: ProgressDataProviderProps) => {
  const { toast } = useToast();

  // Use React Query to fetch and cache progress data
  const { data, isLoading, error } = useQuery({
    queryKey: ['userProgress', timePeriod],
    queryFn: async () => {
      try {
        // Check if secure storage is active - if so, use it as our primary data source
        if (isSecureStorageActive()) {
          console.log("Attempting to load progress data from secure storage...");
          
          // First try to get my-function data which contains progress info
          const secureRecord = await getSecureLatestFunctionData('my-function');
          
          if (secureRecord && secureRecord.data) {
            console.log("Found raw secure data:", secureRecord.data);
            
            // If the secure data has user and stats properties, process it
            if (secureRecord.data.user && secureRecord.data.stats) {
              console.log("Processing secure data from my-function endpoint");
              
              const userData: UserProgressData = {
                userId: secureRecord.data.user.id || "secure-user",
                totalProgressPercent: secureRecord.data.stats.accuracy * 100 || 75,
                correctAnswers: secureRecord.data.stats.answeredCorrect || 53,
                incorrectAnswers: secureRecord.data.stats.totalQuestions - secureRecord.data.stats.answeredCorrect || 21,
                unattemptedQuestions: 56, // Placeholder
                questionsAnsweredToday: 12, // Placeholder
                streak: 7, // Placeholder
                averageScore: secureRecord.data.stats.accuracy * 100 || 92,
                rank: 120, // Placeholder
                projectedScore: 92, // Placeholder
                speed: secureRecord.data.stats.averageTime ? 100 - (secureRecord.data.stats.averageTime / 60) : 85,
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
                averageTime: secureRecord.data.stats.averageTime / 60 || 2.5, // Convert to minutes
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
                    correct: secureRecord.data.stats.answeredCorrect || 12,
                    incorrect: secureRecord.data.stats.totalQuestions - secureRecord.data.stats.answeredCorrect || 3,
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
              return userData;
            }
            
            // Try the standard progress data service as fallback
            const secureData = await fetchSecureUserProgressData();
            if (secureData) {
              console.log("Successfully loaded progress data from secure storage");
              return secureData;
            }
          }
          
          console.log("No secure data found, falling back to other methods");
        }
        
        // If secure storage is not active or doesn't have data, try the edge function
        console.log("Calling Edge Function: get-user-progress", {
          url: `https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/get-user-progress?period=${timePeriod}`,
          method: 'GET'
        });

        try {
          const { data: progressData, error: progressError } = await callEdgeFunction(
            'get-user-progress',
            { method: 'GET' },
            { period: timePeriod }
          );
          
          if (!progressError && progressData && Array.isArray(progressData) && progressData.length > 0) {
            console.log("Loaded progress data from edge function:", progressData);
            
            // Process the data through the secure service to ensure proper transformation
            const transformedData = await fetchSecureUserProgressData();
            if (transformedData) {
              console.log("Using transformed secure user data");
              return transformedData;
            }
            
            // If transformation failed, process directly
            console.log("Processing data directly from edge function");
            return processProgressData(progressData);
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
        }
        
        // Fall back to the generic endpoint approach if edge function fails
        console.log("Falling back to fetchProgressEndpoints");
        const endpointsData = await fetchProgressEndpoints();
        console.log("Loaded progress data from multiple endpoints:", endpointsData);
        return processProgressData(endpointsData);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        toast({
          title: "Error",
          description: "Could not load all progress data. Some information may be incomplete.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // If there's a critical error, show the error display
  if (error && !data) {
    return <ErrorDisplay error={error as Error} />;
  }
  
  // Merge fallback data with any available data from API
  const displayData = data || fallbackData;
  
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
  
  // Make sure we're correctly passing the data to children
  console.log("Rendering progress data:", displayData);
  return <>{children(displayData)}</>;
};

export default ProgressDataProvider;
