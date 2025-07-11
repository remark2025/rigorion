
import React, { createContext, useContext } from "react";
import { UserProgressData } from "@/types/progress";

// Context for the progress data from secure storage
export const ProgressContext = createContext<{
  progressData: UserProgressData | null;
  isLoading: boolean;
  error: Error | null;
  refreshProgress: () => Promise<void>;
}>({
  progressData: null,
  isLoading: true,
  error: null,
  refreshProgress: async () => {},
});

// Hook for consuming the progress context
export const useProgress = () => useContext(ProgressContext);
