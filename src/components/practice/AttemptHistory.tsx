import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from "@/contexts/ThemeContext";

interface AttemptHistoryProps {
  interactions: Array<{
    isCorrect: boolean;
    timestamp: string;
    questionId?: string;
  }>;
  maxVisible?: number;
}

const AttemptHistory: React.FC<AttemptHistoryProps> = ({ 
  interactions, 
  maxVisible = 24 
}) => {
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!interactions.length) return null;

  // Get last 24 attempts (most recent first)
  const recentAttempts = interactions.slice(-24).reverse();
  
  // Calculate visible window
  const totalAttempts = recentAttempts.length;
  const visibleAttempts = recentAttempts.slice(currentIndex, currentIndex + maxVisible);
  
  const canGoNext = currentIndex + maxVisible < totalAttempts;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getDotStyle = (isCorrect: boolean) => {
    if (isCorrect) {
      return 'text-green-600 font-bold text-lg transition-all duration-300 hover:text-green-700';
    } else {
      return 'text-red-600 font-bold text-lg transition-all duration-300 hover:text-red-700';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        disabled={!canGoPrev}
        className={`p-1 rounded-full transition-all duration-200 ${
          canGoPrev 
            ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            : 'text-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        <ChevronLeft className="h-3 w-3" />
      </button>

      {/* Attempt symbols */}
      <div className="flex items-center gap-1.5">
        {visibleAttempts.map((attempt, index) => (
          <div
            key={currentIndex + index}
            className={getDotStyle(attempt.isCorrect)}
            title={`${attempt.isCorrect ? 'Correct' : 'Incorrect'} - ${new Date(attempt.timestamp).toLocaleTimeString()}`}
          >
            {attempt.isCorrect ? '✓' : '−'}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={nextSlide}
        disabled={!canGoNext}
        className={`p-1 rounded-full transition-all duration-200 ${
          canGoNext 
            ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            : 'text-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        <ChevronRight className="h-3 w-3" />
      </button>

      {/* Separator */}
      <div className="w-px h-4 bg-gray-300" />
    </div>
  );
};

export default AttemptHistory;