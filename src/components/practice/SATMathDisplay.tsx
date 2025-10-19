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

  const fontOptions = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'];
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
      <div className="mt-6 space-y-4">
        {currentQuestion.choices.map((choice, index) => {
          const choiceKey = String.fromCharCode(65 + index);
          const hasAnswered = Boolean(selectedAnswer);
          const isSelected = selectedAnswer === choiceKey;
          const isCorrectChoice = currentQuestion.correctAnswer === choice;
          const baseClasses = "answer-option group relative w-full min-h-[68px] rounded-2xl border px-5 py-4 text-left transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-100";
          const defaultClasses = isDarkMode
            ? "bg-gray-900/90 border-gray-700 text-gray-100 hover:border-orange-400 hover:bg-gray-900"
            : "bg-white border-gray-200 text-gray-800 hover:border-orange-300 hover:bg-white hover:shadow-lg";

          let stateClasses = defaultClasses;
          let letterClasses = isDarkMode
            ? "bg-gray-800/70 text-gray-200 border border-gray-600"
            : "bg-gray-100 text-gray-700 border border-gray-200";
          let statusBadge: JSX.Element | null = null;
          let statusIcon: JSX.Element | null = null;

          if (hasAnswered) {
            if (isSelected && isCorrect) {
              stateClasses = "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_12px_35px_rgba(16,185,129,0.35)]";
              letterClasses = "bg-white/15 text-white border-white/30";
              statusBadge = (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  <Check className="h-3.5 w-3.5" /> Correct
                </span>
              );
              statusIcon = null;
            } else if (isSelected && !isCorrect) {
              stateClasses = "bg-gradient-to-br from-red-500 via-red-600 to-orange-500 text-white border-red-400 shadow-[0_16px_38px_rgba(248,113,113,0.35)] flame-active";
              letterClasses = "bg-white/15 text-white border-white/30";
              statusBadge = (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  <X className="h-3.5 w-3.5" /> Try Again
                </span>
              );
              statusIcon = null;
            } else if (isCorrectChoice) {
              stateClasses = "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-300 text-emerald-700 shadow-[0_10px_24px_rgba(16,185,129,0.15)]";
              letterClasses = "bg-emerald-500/10 text-emerald-700 border border-emerald-300";
              statusBadge = (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                  Revealed Answer
                </span>
              );
              statusIcon = <Check className="h-5 w-5 text-emerald-500" />;
            } else {
              stateClasses = `${stateClasses} opacity-80`;
              letterClasses = isDarkMode
                ? "bg-gray-800/40 text-gray-400 border border-gray-700"
                : "bg-gray-50 text-gray-400 border border-gray-200";
            }
          }

          if (hasAnswered && isSelected) {
            const statusClass = isCorrect ? 'quiz-status-button--correct' : 'quiz-status-button--wrong';

            return (
              <button
                key={index}
                type="button"
                className={`quiz-status-button ${statusClass}`}
                disabled
              >
                <span className="quiz-status-button__shine quiz-status-button__shine--large" aria-hidden="true"></span>
                <span className="quiz-status-button__shine quiz-status-button__shine--small" aria-hidden="true"></span>
                <span className="quiz-status-button__shimmer" aria-hidden="true"></span>
                <span className="quiz-status-button__icon">
                  {isCorrect ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
                </span>
                <span className="quiz-status-button__text" dangerouslySetInnerHTML={{ __html: choice }} />
              </button>
            );
          }

          return (
            <Button
              key={index}
              variant="outline"
              className={`${baseClasses} ${stateClasses}`}
              onClick={() => checkAnswer && checkAnswer(choiceKey)}
              disabled={hasAnswered}
            >
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${letterClasses}`}>
                    {choiceKey}
                  </span>
                  <span
                    className="flex-1 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: choice }}
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge}
                  {statusIcon}
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
      <style>
        {`
          .answer-option {
            position: relative;
            overflow: hidden;
          }

          .answer-option::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.25s ease;
            z-index: 0;
            background: radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.35), transparent 55%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.18), transparent 50%);
          }

          .answer-option.flame-active::before {
            opacity: 1;
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.65), rgba(239, 68, 68, 0.85));
            mix-blend-mode: screen;
            animation: flame-flicker 1s infinite ease-in-out;
            filter: blur(4px);
          }

          .answer-option > * {
            position: relative;
            z-index: 1;
          }

          @keyframes flame-flicker {
            0%, 100% {
              opacity: 0.78;
              transform: scale(1);
            }
            50% {
              opacity: 0.52;
              transform: scale(1.03);
            }
          }

          .quiz-status-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: min(100%, 16rem);
            height: 4rem;
            border-radius: 2rem;
            padding: 0 1.75rem;
            border: none;
            cursor: default;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
            isolation: isolate;
            text-align: left;
          }

          .quiz-status-button--correct {
            background: linear-gradient(90deg, #22C55E 0%, #16A34A 100%);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }

          .quiz-status-button--wrong {
            background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }

          .quiz-status-button::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, transparent 100%);
            z-index: 1;
          }

          .quiz-status-button::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.1) 100%);
            z-index: 1;
          }

          .quiz-status-button__shine {
            position: absolute;
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
          }

          .quiz-status-button__shine--large {
            top: -32px;
            left: -32px;
            width: 128px;
            height: 128px;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 55%, transparent 100%);
            filter: blur(48px);
            transform: rotate(45deg);
          }

          .quiz-status-button__shine--small {
            top: 8px;
            left: 16px;
            width: 96px;
            height: 96px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            filter: blur(4px);
            transform: rotate(-12deg);
          }

          .quiz-status-button__shimmer {
            position: absolute;
            inset: -30%;
            background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.22) 55%, transparent 100%);
            transform: rotate(12deg);
            animation: quiz-status-shimmer 3s ease-in-out infinite;
            z-index: 2;
            pointer-events: none;
          }

          .quiz-status-button__icon {
            position: relative;
            z-index: 3;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.3);
            color: #ffffff;
          }

          .quiz-status-button__text {
            position: relative;
            z-index: 3;
            flex: 1 1 auto;
            font-weight: 700;
            font-size: 1.125rem;
            letter-spacing: 0.1em;
            color: #ffffff;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            line-height: 1.35;
            white-space: normal;
          }

          .quiz-status-button__text * {
            color: inherit;
            font-weight: inherit;
            letter-spacing: inherit;
          }

          .quiz-status-button__text strong,
          .quiz-status-button__text b {
            font-weight: 800;
          }

          @keyframes quiz-status-shimmer {
            0% {
              transform: translateX(-100%) rotate(12deg);
              opacity: 0.2;
            }
            45% {
              opacity: 0.6;
            }
            50% {
              transform: translateX(0%) rotate(12deg);
              opacity: 0.85;
            }
            55% {
              opacity: 0.6;
            }
            100% {
              transform: translateX(100%) rotate(12deg);
              opacity: 0.2;
            }
          }
        `}
      </style>
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
