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
  maxVisible = 5 
}) => {
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!interactions.length) return null;

  // Get last 10 attempts (most recent first)
  const recentAttempts = interactions.slice(-10).reverse();
  
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
      return `w-3 h-3 rounded-full bg-green-500 shadow-lg transition-all duration-200 ${
        isDarkMode 
          ? 'shadow-green-500/50 ring-1 ring-green-400/30' 
          : 'shadow-green-500/40'
      }`;
    } else {
      return `w-3 h-3 rounded-full bg-red-500 shadow-lg transition-all duration-200 ${
        isDarkMode 
          ? 'shadow-red-500/50 ring-1 ring-red-400/30' 
          : 'shadow-red-500/40'
      }`;
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
            ? (isDarkMode 
                ? 'hover:bg-gray-700 text-green-400 hover:text-green-300' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800')
            : 'text-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        <ChevronLeft className="h-3 w-3" />
      </button>

      {/* Attempt dots */}
      <div className="flex items-center gap-1.5">
        {visibleAttempts.map((attempt, index) => (
          <div
            key={currentIndex + index}
            className={getDotStyle(attempt.isCorrect)}
            title={`${attempt.isCorrect ? 'Correct' : 'Incorrect'} - ${new Date(attempt.timestamp).toLocaleTimeString()}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={nextSlide}
        disabled={!canGoNext}
        className={`p-1 rounded-full transition-all duration-200 ${
          canGoNext 
            ? (isDarkMode 
                ? 'hover:bg-gray-700 text-green-400 hover:text-green-300' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800')
            : 'text-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        <ChevronRight className="h-3 w-3" />
      </button>

      {/* Separator */}
      <div className={`w-px h-4 ${
        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`} />
    </div>
  );
};

export default AttemptHistory;