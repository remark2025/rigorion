import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Timer, Clock } from "lucide-react";

interface QuestionHeaderProps {
  questionNumber: number;
  className?: string;
  chapter?: string;
  timerValue?: string;
  mode?: string;
  onNext?: () => void;
  onPrev?: () => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ 
  questionNumber, 
  className = "",
  chapter,
  timerValue,
  mode,
  onNext,
  onPrev,
  currentQuestionIndex = 0,
  totalQuestions = 0
}) => {
  return (
    <div className={`mb-1 ${className}`} style={{ marginTop: '4px', marginBottom: '4px' }}>
      
      {/* Navigation and Question Header Row */}
      <div className="flex items-center justify-between mb-1">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentQuestionIndex <= 0}
          className="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 text-xs disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        
        {/* Question Header Center */}
        <h3 
          id={`q-${questionNumber}`}
          className="flex items-center flex-1 mx-4"
          style={{ height: '28px' }}
        >
          {/* Number Badge */}
          <div 
            className="flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{
              backgroundColor: '#111',
              fontSize: '12px',
              lineHeight: '1.1',
              padding: '0 8px',
              height: '28px',
              borderRadius: '2px',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              minWidth: 'fit-content'
            }}
          >
            {questionNumber}
          </div>

          {/* Rule Bar with Chapter Title */}
          <div 
            className="flex-1 ml-2 mr-3 flex items-center justify-start pl-4"
            style={{
              backgroundColor: '#CFCFCF',
              height: '28px',
              borderRadius: '2px'
            }}
          >
            {chapter && (
              <span className="text-sm font-semibold text-blue-700">
                {chapter}
              </span>
            )}
          </div>
        </h3>
        
        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentQuestionIndex >= totalQuestions - 1}
          className="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 text-xs disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionHeader;