import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface QuestionTrackingProps {
  questionId: string;
  onGuessChange: (guess: number | null) => void;
  onEmotionChange: (emotion: string | null) => void;
  initialGuess?: number | null;
  initialEmotion?: string | null;
}

export const QuestionTracking = ({
  questionId,
  onGuessChange,
  onEmotionChange,
  initialGuess = null,
  initialEmotion = null
}: QuestionTrackingProps) => {
  const { isDarkMode } = useTheme();
  const [selectedGuess, setSelectedGuess] = useState<number | null>(initialGuess);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(initialEmotion);

  const guessOptions = [1, 2, 3, 4, 5];
  const emotionOptions = [
    { emoji: "😊", label: "Confident" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😰", label: "Stressed" }
  ];

  const handleGuessSelect = (guess: number) => {
    const newGuess = selectedGuess === guess ? null : guess;
    setSelectedGuess(newGuess);
    onGuessChange(newGuess);
  };

  const handleEmotionSelect = (emotion: string) => {
    const newEmotion = selectedEmotion === emotion ? null : emotion;
    setSelectedEmotion(newEmotion);
    onEmotionChange(newEmotion);
  };

  return (
    <div className="flex items-center justify-start gap-2">
      <span className="text-xs text-gray-500 mr-1">Guess</span>
      {guessOptions.map((guess) => (
        <Button
          key={guess}
          variant="outline"
          size="sm"
          onClick={() => handleGuessSelect(guess)}
          className={`h-6 w-6 p-0 rounded-full transition-all duration-200 text-xs ${
            selectedGuess === guess
              ? 'bg-white border-2 border-blue-500 text-blue-600 shadow-md shadow-blue-200'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {guess}
        </Button>
      ))}
      <span className="text-xs text-gray-500 ml-1">Certain</span>
    </div>
  );
};