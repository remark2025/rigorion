import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer, TrendingUp, Hand, Coffee, GraduationCap, Clock, ChevronLeft, ChevronRight, Calculator, Settings } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PracticeTimer } from "@/components/practice/PracticeTimer";

interface PracticeHeaderSimpleProps {
  onOpenMode: () => void;
  mode: string;
  onNext?: () => void;
  onPrev?: () => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  timerValue?: string;
  isTimerRunning?: boolean;
  onToggleTimer?: () => void;
  displaySettings?: {
    fontFamily: string;
    fontSize: number;
  };
  onSettingsChange?: (key: "fontFamily" | "fontSize", value: string | number) => void;
}

export const PracticeHeaderSimple = ({ 
  onOpenMode,
  mode,
  onNext,
  onPrev,
  currentQuestionIndex = 0,
  totalQuestions = 0,
  timerValue,
  isTimerRunning = false,
  onToggleTimer,
  displaySettings,
  onSettingsChange
}: PracticeHeaderSimpleProps) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showFontSettings, setShowFontSettings] = useState(false);

  const fontOptions = ["Inter", "Georgia", "Times New Roman", "Arial", "Helvetica", "Verdana", "Courier New"];
  const fontSizeOptions = [12, 14, 16, 18, 20, 22];

  const toggleFontSettings = () => setShowFontSettings((prev) => !prev);

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
            {timerValue && (
              <PracticeTimer 
                timerValue={timerValue}
                mode={mode as "timer" | "level" | "manual" | "pomodoro" | "exam"}
                isPaused={!isTimerRunning}
                onTogglePause={onToggleTimer}
              />
            )}

            <div className="relative">
              <Button
                onClick={toggleFontSettings}
                variant="outline"
                className={`flex items-center gap-2 border-gray-300 ${
                  isDarkMode ? "text-green-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Settings className="h-4 w-4" />
                Font
              </Button>

              {showFontSettings && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-lg z-50">
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500">Font Family</label>
                    <select
                      value={displaySettings?.fontFamily}
                      onChange={(event) => onSettingsChange?.("fontFamily", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500">Font Size</label>
                    <select
                      value={displaySettings?.fontSize}
                      onChange={(event) => onSettingsChange?.("fontSize", parseInt(event.target.value, 10))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm"
                    >
                      {fontSizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}px
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

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
