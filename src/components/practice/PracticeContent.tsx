import React, { useState, useCallback, useEffect } from "react";
import { Question } from "@/types/QuestionInterface";
import { useQuestions } from "@/contexts/QuestionsContext";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterQuestionsByChapter, getUniqueChapters, filterQuestionsByModule } from "@/utils/mapQuestion";
import { saveObjective, loadObjective } from "@/services/objectivePersistence";
import { useTheme } from "@/contexts/ThemeContext";

// Import refactored components
import PracticeHeader from "@/components/practice/PracticeHeader";
import PracticeProgress from "@/components/practice/PracticeProgress";
import PracticeDisplay from "@/components/practice/PracticeDisplay";
import PracticeFooter from "@/components/practice/PracticeFooter";
import ContentSection from "@/components/practice/ContentSection";
import ModeDialog from "@/components/practice/ModeDialog";
import ObjectiveDialog from "@/components/practice/ObjectiveDialogue";
import { Sidebar } from "@/components/practice/Sidebar";

interface TextSettings {
  fontFamily: string;
  fontSize: number;
  colorStyle: 'plain';
  textColor: string;
}

interface FilterState {
  chapter?: string;
  module?: string;
  exam?: number | null;
}

interface PracticeContentProps {
  questions?: Question[];
  currentQuestion?: Question | null;
  currentIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onJumpTo?: (index: number) => void;
  isLoading?: boolean;
  error?: Error | null;
  refreshQuestions?: () => Promise<void>;
  settings?: TextSettings;
  onSettingsChange?: (key: string, value: string | number) => void;
}

export default function PracticeContent({ 
  questions: propQuestions,
  currentQuestion: propCurrentQuestion,
  currentIndex: propCurrentIndex,
  onNext: propOnNext,
  onPrev: propOnPrev,
  onJumpTo: propOnJumpTo,
  isLoading: propIsLoading,
  error: propError,
  refreshQuestions: propRefreshQuestions,
  settings: propSettings,
  onSettingsChange
}: PracticeContentProps) {
  const { isDarkMode } = useTheme();
  
  const questionsContext = useQuestions();
  const isUsingContext = !propQuestions;
  
  const allQuestions = propQuestions !== undefined ? propQuestions : questionsContext.questions;
  console.log("PracticeContent: questions in use", allQuestions);
  
  // Enhanced filtering state
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(allQuestions);
  
  const isLoading = propIsLoading !== undefined ? propIsLoading : (isUsingContext ? questionsContext.isLoading : false);
  const error = propError !== undefined ? propError : (isUsingContext ? questionsContext.error : null);
  const refreshQuestions = propRefreshQuestions || (isUsingContext ? questionsContext.refreshQuestions : () => {});
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(propCurrentIndex || 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"timer" | "level" | "manual" | "pomodoro" | "exam">("manual");
  const [selectedLevel, setSelectedLevel] = useState<"easy" | "medium" | "hard" | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [objective, setObjective] = useState<{
    type: "questions" | "time";
    value: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "quote">("problem");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [showGoToInput, setShowGoToInput] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState('');
  const [inputError, setInputError] = useState('');

  const [displaySettings, setDisplaySettings] = useState<TextSettings>(
    propSettings || {
      fontFamily: 'inter',
      fontSize: 14,
      colorStyle: 'plain' as const,
      textColor: '#374151'
    }
  );

  useEffect(() => {
    if (propSettings) {
      setDisplaySettings(propSettings);
    }
  }, [propSettings]);

  const [fontFamily, setFontFamily] = useState<string>('inter');
  const [fontSize, setFontSize] = useState<number>(14);
  const [contentColor, setContentColor] = useState<string>('#374151');
  const [keyPhraseColor, setKeyPhraseColor] = useState<string>('#2563eb');
  const [formulaColor, setFormulaColor] = useState<string>('#dc2626');
  const [styleCollapsed, setStyleCollapsed] = useState(true);
  
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showCommunityStats, setShowCommunityStats] = useState(false);
  
  const [boardColor, setBoardColor] = useState('white');
  const [colorSettings, setColorSettings] = useState({
    content: '#374151',
    keyPhrase: '#2563eb',
    formula: '#dc2626'
  });


  useEffect(() => {
    const savedObjective = loadObjective();
    if (savedObjective) {
      setObjective(savedObjective);
    }
  }, []);

  // Add comprehensive debug logging for exam filtering
  useEffect(() => {
    console.log("=== EXAM FILTERING DEBUG ===");
    console.log("Total questions loaded:", allQuestions.length);
    
    if (allQuestions.length > 0) {
      // Check the structure of your questions
      console.log("Sample question:", allQuestions[0]);
      console.log("Question keys:", Object.keys(allQuestions[0]));
      
      // Check examNumber field specifically
      const examNumbers = allQuestions.map(q => ({
        id: q.id,
        examNumber: q.examNumber,
        type: typeof q.examNumber
      }));
      
      console.log("ExamNumber field analysis:", examNumbers.slice(0, 5));
      
      // Get unique exam numbers
      const uniqueExams = [...new Set(allQuestions.map(q => q.examNumber).filter(Boolean))];
      console.log("Unique exam numbers found:", uniqueExams);
      
      // Distribution by exam
      const distribution = allQuestions.reduce((acc, q) => {
        const exam = q.examNumber || 'null/undefined';
        acc[exam] = (acc[exam] || 0) + 1;
        return acc;
      }, {} as Record<string | number, number>);
      console.log("Questions per exam:", distribution);
    }
  }, [allQuestions]);

  // Enhanced filter function with detailed logging and type conversion
  const applyFilters = useCallback((filters: FilterState, questionsList: Question[]) => {
    let filtered = [...questionsList];
    
    console.log("🔍 APPLYING FILTERS:");
    console.log("Active filters:", filters);
    console.log("Starting with questions:", filtered.length);
    
    // Apply exam filter FIRST - filter by examNumber field (integer from database)
    if (filters.exam !== undefined && filters.exam !== null) {
      console.log(`🎯 Filtering by exam: ${filters.exam} (type: ${typeof filters.exam})`);
      
      const beforeFilter = filtered.length;
      
      filtered = filtered.filter(q => {
        let questionExam = q.examNumber;
        
        // Convert string examNumber to number if needed
        if (typeof questionExam === 'string') {
          const parsed = parseInt(questionExam, 10);
          questionExam = isNaN(parsed) ? null : parsed;
        }
        
        const matches = questionExam === filters.exam;
        
        // Log each comparison for debugging
        if (matches) {
          console.log(`✅ MATCH: Question ${q.id} has examNumber ${questionExam}`);
        }
        
        return matches;
      });
      
      console.log(`📊 Exam filter results: ${beforeFilter} → ${filtered.length}`);
      
      if (filtered.length === 0) {
        const availableExams = [...new Set(questionsList.map(q => {
          let examNum = q.examNumber;
          if (typeof examNum === 'string') {
            const parsed = parseInt(examNum, 10);
            examNum = isNaN(parsed) ? null : parsed;
          }
          return examNum;
        }).filter(Boolean))];
        console.log("❌ NO MATCHES! Available exam numbers:", availableExams);
        console.log("❌ Looking for exam:", filters.exam, typeof filters.exam);
      }
    }
    
    // Apply chapter filter (only if no exam filter is active)
    if (filters.chapter && !filters.exam) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(q => {
        // Exclude questions that have an examNumber - they belong to exams, not chapters
        let questionExam = q.examNumber;
        if (typeof questionExam === 'string') {
          const parsed = parseInt(questionExam, 10);
          questionExam = isNaN(parsed) ? null : parsed;
        }
        
        // If question has an examNumber, it doesn't belong to any chapter
        if (questionExam !== null && questionExam !== undefined) {
          return false;
        }
        
        const chapterMatch = q.chapter?.match(/Chapter (\d+)/i);
        const matchedChapterNumber = chapterMatch ? chapterMatch[1] : null;
        return matchedChapterNumber === filters.chapter;
      });
      console.log(`📚 Chapter filter: ${beforeFilter} → ${filtered.length}`);
    }
    
    // Apply module filter
    if (filters.module) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(q => {
        return q.module === filters.module;
      });
      console.log(`📝 Module filter: ${beforeFilter} → ${filtered.length}`);
    }
    
    // Apply level filter for level mode
    if (mode === "level" && selectedLevel) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(q => q.difficulty === selectedLevel);
      console.log(`⭐ Difficulty filter: ${beforeFilter} → ${filtered.length}`);
    }
    
    console.log(`🏁 FINAL RESULT: ${filtered.length} questions after all filters`);
    return filtered;
  }, [mode, selectedLevel]);

  // Enhanced filter change handler
  const handleFilterChange = useCallback((filters: FilterState) => {
    console.log("Filter change requested:", filters);
    
    // Update active filters
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters, ...filters };
      
      // Handle clearing of null/undefined filters
      Object.keys(newFilters).forEach(key => {
        if (newFilters[key as keyof FilterState] === null || newFilters[key as keyof FilterState] === undefined) {
          delete newFilters[key as keyof FilterState];
        }
      });
      
      console.log("New active filters:", newFilters);
      
      // Apply filters with the new filter state and update filtered questions
      const newFilteredQuestions = applyFilters(newFilters, allQuestions);
      setFilteredQuestions(newFilteredQuestions);
      
      // Reset to first question
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      
      
      return newFilters;
    });
  }, [allQuestions, applyFilters]);

  // Update filtered questions when base questions change
  useEffect(() => {
    console.log("Base questions changed, reapplying filters");
    const newFiltered = applyFilters(activeFilters, allQuestions);
    setFilteredQuestions(newFiltered);
    
    // Reset to first question if current index is out of bounds
    if (currentQuestionIndex >= newFiltered.length) {
      setCurrentQuestionIndex(0);
    }
  }, [allQuestions, activeFilters, applyFilters, currentQuestionIndex]);

  // Update filtered questions when mode or level changes
  useEffect(() => {
    console.log("Mode or level changed, reapplying filters");
    const newFiltered = applyFilters(activeFilters, allQuestions);
    setFilteredQuestions(newFiltered);
  }, [mode, selectedLevel, activeFilters, allQuestions, applyFilters]);

  const currentQuestion = propCurrentQuestion !== undefined 
    ? propCurrentQuestion 
    : (filteredQuestions.length > 0 && currentQuestionIndex < filteredQuestions.length 
      ? filteredQuestions[currentQuestionIndex]
      : null);

  useEffect(() => {
    if (objective?.type === "questions" && objective.value > 0) {
      const totalAnswered = correctAnswers + incorrectAnswers;
      setProgress(Math.round(totalAnswered / objective.value * 100));
    }
  }, [correctAnswers, incorrectAnswers, objective]);

  useEffect(() => {
    if (propCurrentIndex !== undefined) {
      setCurrentQuestionIndex(propCurrentIndex);
    }
  }, [propCurrentIndex]);

  const handleSetMode = (selectedMode: "timer" | "level" | "manual" | "pomodoro" | "exam", duration?: number, level?: "easy" | "medium" | "hard") => {
    setMode(selectedMode);
    setSelectedLevel(level || null);
    
    if (selectedMode === "timer") {
      const questionDuration = duration || 90;
      setTimerDuration(questionDuration);
      setIsTimerActive(true);
    } else if (duration) {
      setTimerDuration(duration);
      setIsTimerActive(true);
    } else {
      setTimerDuration(0);
      setIsTimerActive(false);
    }
  };
  
  const handleSetObjective = (type: "questions" | "time", value: number) => {
    const newObjective = { type, value };
    setObjective(newObjective);
    saveObjective(newObjective);
    
    if (type === "time" && value > 0) {
      setTimerDuration(value);
      setIsTimerActive(true);
    }
  };
  
  const handleTimerComplete = () => {
    if (mode === "timer") {
      console.log("Timer completed - auto-advancing to next question");
      nextQuestion();
    } else {
      setIsTimerActive(false);
      console.log("Time's up!");
    }
  };

  useEffect(() => {
    if (propSettings) {
      setDisplaySettings(propSettings);
    }
  }, [propSettings]);

  useEffect(() => {
    if (displaySettings.textColor) {
      setContentColor(displaySettings.textColor);
      setColorSettings(prev => ({
        ...prev,
        content: displaySettings.textColor
      }));
    }
  }, [displaySettings.textColor]);

  const handlePomodoroBreak = () => {
    setIsTimerActive(false);
    setTimeout(() => {
      setTimerDuration(1500);
    }, 5 * 60 * 1000);
  };

  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    // Get the index of the selected choice key (A=0, B=1, C=2, D=3)
    const choiceIndex = answer.charCodeAt(0) - 65;
    const selectedChoiceText = currentQuestion.choices?.[choiceIndex];
    
    
    const correct = selectedChoiceText === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }
    if (correct && currentQuestionIndex < filteredQuestions.length - 1) {
      setTimeout(nextQuestion, 1500);
    }
  };
  
  const nextQuestion = () => {
    if (propOnNext) {
      propOnNext();
    } else {
      const maxIndex = filteredQuestions.length > 0 ? filteredQuestions.length - 1 : 0;
      if (currentQuestionIndex < maxIndex) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        
        if (mode === "timer" && timerDuration > 0) {
          // Force timer reset by setting a new duration value
          const currentDuration = timerDuration;
          setTimerDuration(0);
          setTimeout(() => {
            setTimerDuration(currentDuration);
            setIsTimerActive(true);
          }, 10);
        }
      }
    }
  };
  
  const prevQuestion = () => {
    if (propOnPrev) {
      propOnPrev();
    } else {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        
        if (mode === "timer" && timerDuration > 0) {
          // Force timer reset by setting a new duration value
          const currentDuration = timerDuration;
          setTimerDuration(0);
          setTimeout(() => {
            setTimerDuration(currentDuration);
            setIsTimerActive(true);
          }, 10);
        }
      }
    }
  };

  const handleGoToQuestion = () => {
    const questionNumber = parseInt(targetQuestion);

    if (isNaN(questionNumber)) {
      setInputError('Please enter a valid number');
      return;
    }
    if (questionNumber < 1 || questionNumber > filteredQuestions.length) {
      setInputError(`Please enter a number between 1 and ${filteredQuestions.length}`);
      return;
    }

    if (propOnJumpTo) {
      propOnJumpTo(questionNumber - 1);
    } else {
      setCurrentQuestionIndex(questionNumber - 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      
      if (mode === "timer" && timerDuration > 0) {
        // Force timer reset by setting a new duration value
        const currentDuration = timerDuration;
        setTimerDuration(0);
        setTimeout(() => {
          setTimerDuration(currentDuration);
          setIsTimerActive(true);
        }, 10);
      }
    }

    setTargetQuestion('');
    setShowGoToInput(false);
    setInputError('');
  };


  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading secure questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`border px-4 py-3 rounded relative ${isDarkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'}`} role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error.message}</span>
        </div>
        <Button className="mt-4" onClick={() => refreshQuestions()}>
          Retry
        </Button>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`border px-4 py-3 rounded relative ${isDarkMode ? 'bg-yellow-900 border-yellow-600 text-yellow-200' : 'bg-yellow-100 border-yellow-400 text-yellow-700'}`} role="alert">
          <strong className="font-bold">No Questions!</strong>
          <span className="block sm:inline"> No questions available for the selected filters.</span>
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFilterChange({ chapter: undefined, module: undefined, exam: null })}
                className="text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <PracticeHeader 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        onOpenObjective={() => setObjectiveDialogOpen(true)} 
        onOpenMode={() => setModeDialogOpen(true)} 
        mode={mode} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onFilterChange={handleFilterChange}
      />

      <PracticeProgress 
          correctAnswers={correctAnswers} 
          incorrectAnswers={incorrectAnswers} 
          totalQuestions={filteredQuestions.length} 
          timerDuration={timerDuration} 
          isTimerActive={isTimerActive} 
          handleTimerComplete={handleTimerComplete} 
          mode={mode} 
          timeRemaining={timeRemaining} 
          setTimeRemaining={setTimeRemaining} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentQuestionIndex={currentQuestionIndex} 
          objective={objective} 
          progress={progress} 
          onAutoNext={nextQuestion}
          onPomodoroBreak={handlePomodoroBreak}
          settings={displaySettings}
          onSettingsChange={onSettingsChange}
        />

      {/* Sidebar - Mobile and Desktop */}
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      <div className="flex max-w-full mx-auto w-full flex-grow py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4 lg:px-0 pb-20 sm:pb-24 pt-28 sm:pt-32 md:pt-36">
        {currentQuestion ? (
          <PracticeDisplay 
            currentQuestion={currentQuestion} 
            selectedAnswer={selectedAnswer} 
            isCorrect={isCorrect} 
            checkAnswer={checkAnswer} 
            onNext={propOnNext || nextQuestion}
            onPrev={propOnPrev || prevQuestion}
            onJumpTo={propOnJumpTo || ((index: number) => {
              setCurrentQuestionIndex(index);
              setSelectedAnswer(null);
              setIsCorrect(null);
            })}
            currentQuestionIndex={currentQuestionIndex} 
            totalQuestions={filteredQuestions.length} 
            displaySettings={displaySettings}
            boardColor={boardColor} 
            colorSettings={colorSettings}
            activeTab={activeTab} 
          />
        ) : (
          <div className={`w-full p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No question selected</div>
        )}
      </div>

      <PracticeFooter 
        onToggleCommunityStats={() => setShowCommunityStats(!showCommunityStats)} 
        onPrevious={prevQuestion} 
        onNext={nextQuestion} 
        currentQuestionIndex={currentQuestionIndex} 
        totalQuestions={filteredQuestions.length} 
        showGoToInput={showGoToInput} 
        setShowGoToInput={setShowGoToInput} 
        targetQuestion={targetQuestion} 
        setTargetQuestion={setTargetQuestion} 
        handleGoToQuestion={handleGoToQuestion} 
        inputError={inputError}
        currentQuestionId={currentQuestion?.id}
        showCommunityStats={showCommunityStats}
        currentQuestionTopic={currentQuestion?.chapter || currentQuestion?.module || "General"}
        userProgress={{ correctAnswers, incorrectAnswers, objective }}
      />

      <ModeDialog 
        open={modeDialogOpen} 
        onOpenChange={setModeDialogOpen} 
        onSetMode={handleSetMode} 
      />

      <ObjectiveDialog 
        open={objectiveDialogOpen} 
        onOpenChange={setObjectiveDialogOpen} 
        onSetObjective={handleSetObjective}
        maxQuestions={filteredQuestions.length || 300}
      />


      <style>
        {`
          @keyframes style-pulse {
            0% {
              box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.2);
            }
            50% {
              box-shadow: 0 0 8px 4px rgba(59, 130, 246, 0.4);
            }
            100% {
              box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.2);
            }
          }
          
          .style-glow {
            animation: style-pulse 10s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
