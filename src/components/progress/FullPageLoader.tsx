
import { Loader2 } from "lucide-react";

export const FullPageLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mono-bg">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-mono-accent mx-auto mb-4" />
        <p className="text-xl font-medium text-mono-text">Loading your progress data...</p>
        <p className="text-mono-muted mt-2">This will just take a moment</p>
      </div>
    </div>
  );
};
