
import React, { useState, useEffect, useCallback } from "react";
import { UserProgressData } from "@/types/progress";
import { ProgressContext } from "@/contexts/ProgressContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "./ErrorDisplay";
import { useToast } from "@/components/ui/use-toast";
import { fetchSecureUserProgressData } from "@/services/progressDataService";
import { useQueryClient } from "@tanstack/react-query";

interface SecureProgressDataProviderProps {
  children: React.ReactNode;
  fallbackData?: UserProgressData;
  showLoadingState?: boolean;
}

export const SecureProgressDataProvider: React.FC<SecureProgressDataProviderProps> = ({
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
    setError(null);
    
    try {
      console.log("Fetching progress data from secure service...");
      const userData = await fetchSecureUserProgressData();
      
      if (userData) {
        console.log("Successfully loaded progress data:", userData);
        setProgressData(userData);
      } else {
        console.log("No progress data available, using fallback");
        if (fallbackData) {
          setProgressData(fallbackData);
          toast({
            title: "Using cached data",
            description: "Could not load fresh progress data. Using fallback data.",
            variant: "default",
          });
        } else {
          throw new Error("No progress data available");
        }
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
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
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

export default SecureProgressDataProvider;
