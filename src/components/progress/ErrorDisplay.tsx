
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  error: Error | null;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mono-bg">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="rounded-lg border border-red-200 bg-red-50 p-8 text-center max-w-md"
      >
        <h2 className="mb-3 text-2xl font-semibold text-red-700">Error Loading Progress</h2>
        <p className="text-red-600 mb-4">Something went wrong while fetching your progress data.</p>
        <p className="text-gray-700">Please try refreshing the page or contact support if the problem persists.</p>
        {error && (
          <pre className="mt-4 text-xs text-left bg-red-100 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        )}
      </motion.div>
    </div>
  );
};
