import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Timer, TrendingUp, Hand, Coffee, GraduationCap, Clock, ChevronLeft, ChevronRight, Calculator } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface PracticeHeaderSimpleProps {
  onOpenMode: () => void;
  mode: string;
  onNext?: () => void;
  onPrev?: () => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

export const PracticeHeaderSimple = ({ 
  onOpenMode,
  mode,
  onNext,
  onPrev,
  currentQuestionIndex = 0,
  totalQuestions = 0
}: PracticeHeaderSimpleProps) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const getModeIcon = (currentMode: string) => {
    switch (currentMode) {
      case "timer":
        return <Timer className="h-4 w-4 mr-2" />;
      case "level":
        return <TrendingUp className="h-4 w-4 mr-2" />;
      case "manual":
        return <Hand className="h-4 w-4 mr-2" />;
      case "pomodoro":
        return <Coffee className="h-4 w-4 mr-2" />;
      case "exam":
        return <GraduationCap className="h-4 w-4 mr-2" />;
      default:
        return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  const getModeLabel = (currentMode: string) => {
    switch (currentMode) {
      case "timer":
        return "Timer Mode";
      case "level":
        return "Level Mode";
      case "manual":
        return "Manual Mode";
      case "pomodoro":
        return "Pomodoro Mode";
      case "exam":
        return "Exam Mode";
      default:
        return "Practice Mode";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left Side - Back, Previous, Next Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/sat-math')} 
              variant="outline"
              className="flex items-center gap-2 text-orange-600 border-gray-300 hover:bg-orange-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to SAT Math
            </Button>
            
            <Button
              onClick={onPrev}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-2 text-orange-600 border-gray-300 hover:bg-orange-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Question Counter */}
            <div className="px-4 py-2 text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            
            <Button
              onClick={onNext}
              disabled={currentQuestionIndex >= totalQuestions - 1}
              variant="outline"
              className="flex items-center gap-2 text-orange-600 border-gray-300 hover:bg-orange-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Center - SAT Math Title */}
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            <div className="text-center">
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                  SAT
                </span>
                <span className="text-black ml-1">Math</span>
              </h1>
              <p className="text-xs text-gray-600 leading-none">
                Interactive Solution
              </p>
            </div>
          </div>

          {/* Right Side - Practice Mode Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onOpenMode}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              {getModeIcon(mode)}
              {getModeLabel(mode)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHeaderSimple;