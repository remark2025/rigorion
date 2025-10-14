import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Calculator, Lightbulb, Flag, Bookmark, GripVertical, Settings, Eye, EyeOff } from "lucide-react";
import { Question } from "@/types/QuestionInterface";
import { useTheme } from "@/contexts/ThemeContext";
import HintDialog from "./HintDialog";
import InteractiveMathSolution from "@/components/math/InteractiveMathSolution";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SATMathDisplayProps {
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
  checkAnswer?: (answer: string) => void;
  mode?: string;
  displaySettings?: {
    fontFamily: string;
    fontSize: number;
  };
  onSettingsChange?: (key: string, value: string | number) => void;
}

const SATMathDisplay = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  isCorrect,
  checkAnswer,
  mode = "manual",
  displaySettings = { fontFamily: 'Arial', fontSize: 16 },
  onSettingsChange
}: SATMathDisplayProps) => {
  const { isDarkMode } = useTheme();
  const [questionWidth, setQuestionWidth] = useState(65); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [highlights, setHighlights] = useState({
    keySteps: true,
    formulas: true,
    calculations: true
  });

  const fontOptions = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'];
  const fontSizeOptions = [{ label: '14px', value: 14 }, { label: '16px', value: 16 }, { label: '18px', value: 18 }, { label: '20px', value: 20 }];

  if (!currentQuestion) {
    return (
      <div className="w-full p-8 text-center text-gray-700 bg-white">
        No question selected
      </div>
    );
  }

  const renderAnswerChoices = () => {
    if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
      // No multiple choice - probably a grid-in question
      return (
        <div className="mt-6">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
            placeholder="Enter your answer"
            disabled={!!selectedAnswer}
          />
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-6">
        {currentQuestion.choices.map((choice, index) => {
          const choiceKey = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === choiceKey;
          const isCorrectChoice = currentQuestion.correctAnswer === choice;
          
          let buttonStyle = "border-gray-300 hover:border-orange-400 hover:bg-orange-50";
          
          if (selectedAnswer) {
            if (isSelected && isCorrect) {
              buttonStyle = "border-green-500 bg-green-500 text-white";
            } else if (isSelected && !isCorrect) {
              buttonStyle = "border-red-500 bg-red-500 text-white";
            } else if (isCorrectChoice) {
              buttonStyle = "border-green-500 bg-green-100 text-green-800";
            }
          }

          return (
            <Button
              key={index}
              variant="outline"
              className={`w-full h-auto min-h-[48px] rounded-lg p-4 text-left justify-start transition-all duration-200 ${buttonStyle}`}
              onClick={() => checkAnswer && checkAnswer(choiceKey)}
              disabled={!!selectedAnswer}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3 flex-1">
                  <span className="font-semibold text-lg">{choiceKey}.</span>
                  <span 
                    className="flex-1 text-left"
                    dangerouslySetInnerHTML={{ __html: choice }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {selectedAnswer && isSelected && isCorrect && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                  {selectedAnswer && isSelected && !isCorrect && (
                    <X className="h-5 w-5 text-white" />
                  )}
                  {selectedAnswer && !isSelected && isCorrectChoice && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full flex h-[calc(100vh-4rem)] relative">
        
        {/* Question Panel */}
        <div 
          className="p-6 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 overflow-y-auto" 
          style={{ width: `${questionWidth}%` }}
        >
          {/* Question Header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-orange-900">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h2>
              <div className="flex items-center gap-2">
                {/* Font Settings */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2"
                  >
                    <Settings className="h-4 w-4 text-orange-600" />
                  </Button>
                  
                  {showSettings && (
                    <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                      <h4 className="font-semibold text-gray-900 mb-3">Font Settings</h4>
                      
                      {/* Font Family */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                        <select
                          value={displaySettings.fontFamily}
                          onChange={(e) => onSettingsChange?.('fontFamily', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Font Size */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                        <select
                          value={displaySettings.fontSize}
                          onChange={(e) => onSettingsChange?.('fontSize', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          {fontSizeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Highlighting Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Highlighting</label>
                        <div className="space-y-2">
                          {Object.entries(highlights).map(([key, value]) => (
                            <label key={key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setHighlights(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
                <Button variant="ghost" size="sm" className="p-2">
                  <Flag className="h-4 w-4 text-orange-600" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Bookmark className="h-4 w-4 text-orange-600" />
                </Button>
                <div className="flex items-center">
                  {currentQuestion.calculatorAllowed ? (
                    <Calculator className="h-4 w-4 text-orange-500" />
                  ) : (
                    <div className="relative">
                      <Calculator className="h-4 w-4 text-gray-400" />
                      <X className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="mb-6">
            <div 
              className="text-gray-900 leading-relaxed"
              style={{
                fontFamily: displaySettings.fontFamily,
                fontSize: `${displaySettings.fontSize}px`,
                lineHeight: 1.8
              }}
              dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
            />
          </div>

          {/* Answer Choices */}
          {renderAnswerChoices()}
        </div>

        {/* Resizer */}
        <div 
          className="w-1 bg-gradient-to-b from-gray-200 to-gray-400 hover:from-orange-300 hover:to-orange-500 cursor-col-resize transition-all duration-300 flex items-center justify-center group shadow-sm"
          onMouseDown={(e) => {
            setIsResizing(true);
            const startX = e.clientX;
            const startWidth = questionWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const containerWidth = window.innerWidth;
              const newWidth = startWidth + (deltaX / containerWidth) * 100;
              setQuestionWidth(Math.max(30, Math.min(80, newWidth)));
            };
            
            const handleMouseUp = () => {
              setIsResizing(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-orange-500 transition-colors" />
        </div>
        
        {/* Solution Panel */}
        <div 
          className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col border-l border-gray-100" 
          style={{ width: `${100 - questionWidth}%` }}
        >
          {selectedAnswer ? (
            <div className="h-full">
              <InteractiveMathSolution className="h-full" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                <p className="text-lg">Select an answer to see the solution</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SATMathDisplay;