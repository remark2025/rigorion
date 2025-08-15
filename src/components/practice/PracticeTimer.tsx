import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, EyeOff, Eye } from "lucide-react";

interface PracticeTimerProps {
  timeRemaining?: number | null;
  timerValue?: string;
  mode?: "timer" | "level" | "manual" | "pomodoro" | "exam";
  isPaused?: boolean;
  onTogglePause?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const PracticeTimer = ({ 
  timeRemaining = null, 
  timerValue,
  mode = "manual",
  isPaused = false, 
  onTogglePause,
  onPause,
  onResume
}: PracticeTimerProps) => {
  const { isDarkMode } = useTheme();
  const [isHidden, setIsHidden] = useState(false);

  // Legacy support for timeRemaining prop
  let displayValue = timerValue;
  if (timeRemaining !== null && !timerValue) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    displayValue = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Don't show timer in manual mode unless there's a specific timer value
  if (mode === "manual" && !displayValue && timeRemaining === null) {
    return null;
  }

  const handlePauseToggle = () => {
    if (onTogglePause) {
      onTogglePause();
    } else if (isPaused) {
      onResume?.();
    } else {
      onPause?.();
    }
  };

  const handleToggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className="flex justify-center items-center" style={{ marginTop: '0px', marginBottom: '0px' }}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
        isDarkMode 
          ? 'bg-gray-800/50' 
          : 'bg-white shadow-sm'
      }`}>
        {/* Timer Display */}
        <div className={`flex items-center gap-2 ${
          isHidden ? 'opacity-30' : 'opacity-100'
        } transition-opacity`}>
          <div className={`text-lg font-mono font-semibold ${
            isDarkMode ? 'text-green-400' : 'text-blue-600'
          }`}>
            {isHidden ? "••:••" : (displayValue || "00:00")}
          </div>
          
          {mode !== "manual" && (
            <div className={`text-xs px-2 py-1 rounded-full ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1 ml-2 border-l border-gray-300 pl-2">
          {/* Pause/Resume Button */}
          {(mode === "timer" || mode === "pomodoro" || mode === "exam" || onTogglePause) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePauseToggle}
              className={`h-7 w-7 p-0 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isPaused ? (
                <Play className="h-3 w-3" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
            </Button>
          )}

          {/* Hide/Show Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            className={`h-7 w-7 p-0 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {isHidden ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};