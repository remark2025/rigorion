import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuestions } from "@/contexts/QuestionsContext";
import { Question } from "@/types/QuestionInterface";

/**
 * Props for SecureQuestionProvider.
 * children is a render prop function that receives state and handlers.
 */
interface SecureQuestionProviderProps {
  children: (params: {
    questions: Question[];
    currentQuestion: Question | null;
    currentIndex: number;
    isLoading: boolean;
    error: Error | null;
    handleNext: () => void;
    handlePrevious: () => void;
    handleJumpToQuestion: (index: number) => void;
    refreshQuestions: () => Promise<void>;
  }) => React.ReactNode;
}

/**
 * SecureQuestionProvider:
 * - Consumes the QuestionsContext to get secure data, loading, and error state.
 * - Manages question navigation (next/previous/jump).
 * - Exposes all necessary state/handlers to children via a render prop.
 */
export const SecureQuestionProvider: React.FC<SecureQuestionProviderProps> = ({
  children,
}) => {
  const { questions, isLoading, error, refreshQuestions } = useQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure currentQuestion is valid and not out of range
  const currentQuestion =
    questions.length > 0 && currentIndex >= 0 && currentIndex < questions.length
      ? questions[currentIndex]
      : null;

  // Navigation handlers
  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < questions.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Reset currentIndex if questions array changes (e.g. after refresh)
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [questions.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading secure questions...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 flex flex-col items-start">
        <h3 className="text-red-800 font-medium mb-2">Error loading questions</h3>
        <p className="text-red-600 mb-3">{error.message}</p>
        <button
          className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded"
          onClick={() => refreshQuestions()}
        >
          Retry
        </button>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-yellow-800 font-medium mb-2">No secure questions available</h3>
        <p className="text-yellow-600">
          Try clicking the "Secure Data" button to fetch secure questions.
        </p>
      </div>
    );
  }

  // Render children (main content)
  return (
    <>
      {children({
        questions,
        currentQuestion,
        currentIndex,
        isLoading: false,
        error: null,
        handleNext,
        handlePrevious,
        handleJumpToQuestion,
        refreshQuestions,
      })}
    </>
  );
};

export default SecureQuestionProvider;
