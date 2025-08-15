import { Clock, Settings, Lightbulb } from "lucide-react";
import CountdownTimer from "./CountDownTimer";
import { Button } from "@/components/ui/button";
import PracticeTabSelector from "./PracticeTabSelector";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import AttemptHistory from "./AttemptHistory";

interface PracticeProgressProps {
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  timerDuration: number;
  isTimerActive: boolean;
  handleTimerComplete: () => void;
  mode: "timer" | "level" | "manual" | "pomodoro" | "exam";
  timeRemaining: string;
  setTimeRemaining: (time: string) => void;
  activeTab: "problem" | "solution" | "quote";
  setActiveTab: (tab: "problem" | "solution" | "quote") => void;
  currentQuestionIndex: number;
  objective?: {
    type: "questions" | "time";
    value: number;
  } | null;
  progress?: number;
  onAutoNext?: () => void;
  onPomodoroBreak?: () => void;
  settings?: {
    fontFamily: string;
    fontSize: number;
    colorStyle: string;
    textColor: string;
  };
  onSettingsChange?: (key: string, value: string | number) => void;
  interactions?: Array<{
    isCorrect: boolean;
    timestamp: string;
    questionId?: string;
  }>;
}

const PracticeProgress = ({
  correctAnswers,
  incorrectAnswers,
  totalQuestions,
  timerDuration,
  isTimerActive,
  handleTimerComplete,
  mode,
  timeRemaining,
  setTimeRemaining,
  activeTab,
  setActiveTab,
  currentQuestionIndex,
  objective = null,
  progress = 0,
  onAutoNext,
  onPomodoroBreak,
  settings = {
    fontFamily: 'inter',
    fontSize: 14,
    colorStyle: 'plain',
    textColor: '#374151'
  },
  onSettingsChange,
  interactions = []
}: PracticeProgressProps) => {
  const { isDarkMode } = useTheme();

  // Updated: Progress calculation is now relative to the objective (if set), or totalQuestions.
  const calculateProgress = () => {
    const targetTotal = (objective?.type === "questions" && objective?.value)
      ? objective.value
      : totalQuestions;

    const totalAnswered = Math.min(correctAnswers + incorrectAnswers, targetTotal);

    return {
      correct: Math.min((correctAnswers / targetTotal) * 100, 100),
      incorrect: Math.min((incorrectAnswers / targetTotal) * 100, 100),
      unattempted: Math.max(((targetTotal - totalAnswered) / targetTotal) * 100, 0),
      totalPercentage: Math.round((totalAnswered / targetTotal) * 100)
    };
  };

  const {
    correct,
    incorrect,
    unattempted,
    totalPercentage
  } = calculateProgress();

  const targetProgressPercentage =
    (objective?.type === "questions" && typeof progress === "number")
      ? Math.round(progress)
      : totalPercentage;

  const correctWidth = `${correct}%`;
  const incorrectWidth = `${incorrect}%`;
  const unattemptedWidth = `${unattempted}%`;
  const incorrectLeft = `${correct}%`;

  const handleSettingsChange = (key: string, value: string | number) => {
    if (onSettingsChange) {
      onSettingsChange(key, value);
    }
  };

  return (
    <div className="fixed top-[56px] left-0 right-0 z-40 px-2 sm:px-4 py-2 sm:py-4 border-b bg-white border-gray-200">
      {/* Main layout with balanced widths for true centering */}
      <div className="flex items-center w-full">
        {/* Left corner: Silver icons - fixed width */}
        <div className="flex items-center gap-1">
        </div>

        {/* Center: Tab menu truly centered - always visible */}
        <div className="flex-1 flex items-center justify-center">
          <PracticeTabSelector activeTab={activeTab} setActiveTab={setActiveTab} className="h-8 min-h-0" />
        </div>

        {/* Right side: Attempt History Dots - responsive width */}
        <div className="flex items-center justify-end w-full sm:w-[520px] lg:w-[720px]">
          <div className="flex items-center gap-2">
            {/* Attempt History Dots */}
            <AttemptHistory interactions={interactions} maxVisible={24} />
            
            {/* Target Progress - SAT styling */}
            <div className="hidden sm:flex items-center gap-1 ml-3">
              <span className="font-medium text-xs text-gray-700">
                Target: {targetProgressPercentage}%
              </span>
            </div>
            
            {/* Separator and Accuracy */}
            {interactions.length > 0 && (
              <>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-xs text-gray-700">
                    Accuracy: {Math.round((interactions.filter(i => i.isCorrect).length / interactions.length) * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Shining animation for progress bar */}
      <style>
        {`
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .shine-animation {
          background-image: linear-gradient(
            90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.3) 50%, 
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shine 10s infinite linear;
        }
        `}
      </style>
    </div>
  );
};

export default PracticeProgress;
