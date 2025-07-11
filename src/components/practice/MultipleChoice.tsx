
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface MultipleChoiceProps {
  choices: string[];
  onSelect: (value: string) => void;
  selectedValue: string | null;
  isCorrect: boolean | null;
  correctAnswer: string;
  isDarkMode?: boolean;
  disabled?: boolean;
}

export const MultipleChoice = ({ 
  choices, 
  onSelect, 
  selectedValue, 
  isCorrect, 
  correctAnswer, 
  isDarkMode = false,
  disabled = false 
}: MultipleChoiceProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 max-w-2xl">
      {choices.map((choice, index) => {
        const choiceKey = String.fromCharCode(65 + index); // A, B, C, D
        const isSelected = selectedValue === choiceKey;
        const isCorrectChoice = correctAnswer === choiceKey;
        
        let buttonStyle = '';
        let animationClass = '';
        
        if (selectedValue && isSelected) {
          if (isCorrect) {
            buttonStyle = isDarkMode 
              ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white border-green-400 shadow-green-500/30' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-green-200/50';
            animationClass = 'shadow-lg scale-105';
          } else {
            buttonStyle = isDarkMode 
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 shadow-red-500/30' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400 shadow-red-200/50';
            animationClass = 'shadow-lg scale-105';
          }
        } else if (selectedValue && isCorrectChoice) {
          buttonStyle = isDarkMode 
            ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white border-green-400 shadow-green-500/30' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-green-200/50';
          animationClass = 'shadow-lg scale-105';
        } else {
          buttonStyle = isDarkMode 
            ? 'bg-gray-800 border-green-500 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md';
        }

        return (
          <motion.div
            key={choiceKey}
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className="w-full"
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              className={`w-full h-auto min-h-[60px] rounded-xl px-4 py-3 text-center justify-center transition-all duration-300 border-2 font-medium ${buttonStyle} ${animationClass}`}
              onClick={() => !disabled && onSelect(choiceKey)}
              disabled={disabled}
            >
              <div className="flex items-center justify-center w-full gap-3">
                <div className="flex flex-col items-center text-center">
                  <span className={`text-xs mb-1 font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Option {choiceKey}
                  </span>
                  <span 
                    className="text-sm leading-tight"
                    dangerouslySetInnerHTML={{ __html: choice }}
                  />
                </div>
                {selectedValue && isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute right-4 p-1 rounded-full bg-white/20"
                  >
                    {isCorrect ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <X className="h-5 w-5 text-white" />
                    )}
                  </motion.div>
                )}
                {selectedValue && !isSelected && isCorrectChoice && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute right-4 p-1 rounded-full bg-white/20"
                  >
                    <Check className="h-5 w-5 text-white" />
                  </motion.div>
                )}
              </div>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};
