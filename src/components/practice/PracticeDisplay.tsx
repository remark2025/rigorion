import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Check, X, Bot, Lightbulb, Flag, Calculator, FileText, Trash2 } from "lucide-react";
import { Question } from "@/types/QuestionInterface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { analyzeWithAIML } from "@/services/aimlApi";
import HintDialog from "./HintDialog";
import TypingAnimation from "@/components/ui/TypingAnimation";

interface PracticeDisplayProps {
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
  checkAnswer?: (answer: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onJumpTo?: (index: number) => void;
  displaySettings: {
    fontFamily: string;
    fontSize: number;
    colorStyle: string;
    emphasis: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      highlight: boolean;
    };
  };
  boardColor: string;
  activeTab: "problem" | "solution" | "quote";
  mode?: "timer" | "level" | "manual" | "pomodoro" | "exam";
  timerValue?: string; // Current timer display value
  objective?: {
    type: "questions" | "time";
    value: number;
  } | null;
  progress?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
}

const PracticeDisplay = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer: propSelectedAnswer,
  isCorrect: propIsCorrect,
  checkAnswer: propCheckAnswer,
  onNext,
  onPrev,
  onJumpTo,
  displaySettings,
  boardColor,
  activeTab,
  mode = "manual",
  timerValue,
  objective = null,
  progress = 0,
  correctAnswers = 0,
  incorrectAnswers = 0,
}: PracticeDisplayProps) => {
  const { isDarkMode } = useTheme();
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(null);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(null);
  const [showGoToInput, setShowGoToInput] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Interaction tracking
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [interactions, setInteractions] = useState<any[]>([]);
  const [showInteractionLog, setShowInteractionLog] = useState(false);
  const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Reset timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const selectedAnswer = propSelectedAnswer !== undefined ? propSelectedAnswer : localSelectedAnswer;
  const isCorrect = propIsCorrect !== undefined ? propIsCorrect : localIsCorrect;

  // Check if this is a SAT Writing module
  const isSATWriting = currentQuestion?.chapter?.toLowerCase().includes('writing') || 
                      currentQuestion?.module?.toLowerCase().includes('writing');

  // Calculate comprehensive target progress metrics
  const calculateObjectiveProgress = () => {
    const targetTotal = (objective?.type === "questions" && objective?.value)
      ? objective.value
      : totalQuestions;

    const totalAnswered = Math.min(correctAnswers + incorrectAnswers, targetTotal);
    const currentProgress = Math.round((totalAnswered / targetTotal) * 100);
    const targetProgressPercentage = (objective?.type === "questions" && typeof progress === "number")
      ? Math.round(progress)
      : currentProgress;

    // Enhanced target metrics
    const questionsRemaining = targetTotal - totalAnswered;
    const accuracyRate = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    const progressToTarget = targetProgressPercentage - currentProgress;
    const isOnTrack = progressToTarget <= 5; // Within 5% of target
    
    console.log('🎯 Enhanced Progress Tracking:', {
      objective,
      correctAnswers,
      incorrectAnswers,
      totalQuestions,
      progress,
      targetTotal,
      totalAnswered,
      currentProgress,
      targetProgressPercentage,
      questionsRemaining,
      accuracyRate,
      progressToTarget,
      isOnTrack
    });

    return {
      currentProgress,
      targetProgress: targetProgressPercentage,
      objectiveType: objective?.type || null,
      objectiveValue: objective?.value || null,
      questionsRemaining,
      accuracyRate,
      progressToTarget,
      isOnTrack,
      totalCorrect: correctAnswers,
      totalIncorrect: incorrectAnswers,
      totalAnswered
    };
  };

  // Create interaction record (only for answered questions)
  const createInteraction = (answer: string, isCorrectAnswer: boolean) => {
    let timeSpent: number;
    
    // Use timer value in timer mode, per-question timing in other modes
    if (mode === "timer" && timerValue) {
      // Parse timer value (format: "MM:SS" or "HH:MM:SS")
      const timeParts = timerValue.split(':').map(Number);
      if (timeParts.length === 2) {
        timeSpent = timeParts[0] * 60 + timeParts[1]; // MM:SS
      } else if (timeParts.length === 3) {
        timeSpent = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]; // HH:MM:SS
      } else {
        timeSpent = Math.round((Date.now() - questionStartTime) / 1000); // fallback
      }
    } else {
      timeSpent = Math.round((Date.now() - questionStartTime) / 1000); // per-question timing
    }
    
    const objectiveProgress = calculateObjectiveProgress();
    
    const interaction = {
      questionId: currentQuestion?.id,
      questionNumber: currentQuestion?.number,
      userAnswer: answer,
      correctAnswer: currentQuestion?.correctAnswer,
      isCorrect: isCorrectAnswer,
      timeSpentSeconds: timeSpent,
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      userId: "user_123", // This should come from auth context
      practiceMode: mode,
      questionMetadata: {
        difficulty: currentQuestion?.difficulty,
        chapter: currentQuestion?.chapter,
        module: currentQuestion?.module,
        examNumber: currentQuestion?.examNumber
      },
      targetProgress: {
        currentProgressPercentile: objectiveProgress.currentProgress,
        targetProgressPercentile: objectiveProgress.targetProgress,
        objectiveType: objectiveProgress.objectiveType,
        objectiveValue: objectiveProgress.objectiveValue,
        questionsRemaining: objectiveProgress.questionsRemaining,
        accuracyRate: objectiveProgress.accuracyRate,
        progressGapToTarget: objectiveProgress.progressToTarget,
        isOnTrackToTarget: objectiveProgress.isOnTrack,
        sessionStats: {
          totalCorrect: objectiveProgress.totalCorrect,
          totalIncorrect: objectiveProgress.totalIncorrect,
          totalAnswered: objectiveProgress.totalAnswered,
          sessionStartTime: sessionId // Using sessionId as session start reference
        }
      }
    };

    return interaction;
  };

  const localCheckAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    // Get the index of the selected choice key (A=0, B=1, C=2, D=3)
    const choiceIndex = answer.charCodeAt(0) - 65;
    const selectedChoiceText = currentQuestion.choices?.[choiceIndex];
    
    console.log('Answer comparison:', {
      userChoiceKey: answer,
      userChoiceText: selectedChoiceText,
      correctAnswer: currentQuestion.correctAnswer,
      match: selectedChoiceText === currentQuestion.correctAnswer
    });
    
    const correct = selectedChoiceText === currentQuestion.correctAnswer;
    setLocalSelectedAnswer(answer);
    setLocalIsCorrect(correct);
  };

  // Function to send interactions to edge function (placeholder for now)
  const sendInteractionsToEdgeFunction = async () => {
    if (interactions.length === 0) return;
    
    const payload = {
      interactions: interactions,
      sessionSummary: {
        totalAnsweredQuestions: interactions.length,
        sessionStartTime: interactions[0]?.timestamp,
        sessionEndTime: new Date().toISOString(),
        totalTimeSpent: interactions.reduce((sum, int) => sum + int.timeSpentSeconds, 0),
        correctAnswers: interactions.filter(int => int.isCorrect).length,
        incorrectAnswers: interactions.filter(int => !int.isCorrect).length,
        accuracy: Math.round((interactions.filter(int => int.isCorrect).length / interactions.length) * 100),
        averageTimePerQuestion: Math.round(interactions.reduce((sum, int) => sum + int.timeSpentSeconds, 0) / interactions.length),
        sessionId: interactions[0]?.sessionId,
        userId: interactions[0]?.userId
      }
    };
    
    console.log('📤 Payload to send to edge function:', JSON.stringify(payload, null, 2));
    
    // TODO: Implement actual edge function call
    // try {
    //   const response = await fetch('/api/edge-function-endpoint', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload)
    //   });
    //   console.log('✅ Successfully sent interactions to edge function');
    // } catch (error) {
    //   console.error('❌ Failed to send interactions:', error);
    // }
  };

  // Wrapped checkAnswer to ensure interaction tracking
  const checkAnswer = (answer: string) => {
    // Always track the interaction locally
    if (currentQuestion) {
      const choiceIndex = answer.charCodeAt(0) - 65;
      const selectedChoiceText = currentQuestion.choices?.[choiceIndex];
      const correct = selectedChoiceText === currentQuestion.correctAnswer;
      
      // Create and store interaction
      const interaction = createInteraction(answer, correct);
      setInteractions(prev => {
        const newInteractions = [...prev, interaction];
        console.log('📊 Total interactions now:', newInteractions.length);
        return newInteractions;
      });
      
      console.log('✅ New Interaction Recorded:', JSON.stringify(interaction, null, 2));
    }
    
    // Call the appropriate checkAnswer function
    if (propCheckAnswer) {
      propCheckAnswer(answer);
    } else {
      localCheckAnswer(answer);
    }
  };

  const nextQuestion = () => {
    if (onNext) onNext();
    else setLocalSelectedAnswer(null), setLocalIsCorrect(null);
  };
  const prevQuestion = () => {
    if (onPrev) onPrev();
    else setLocalSelectedAnswer(null), setLocalIsCorrect(null);
  };
  const handleGoToQuestion = () => {
    const questionNumber = parseInt(targetQuestion);
    if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > totalQuestions) {
      setInputError(`Please enter a number between 1 and ${totalQuestions}`);
      return;
    }
    setTargetQuestion('');
    setShowGoToInput(false);
    setInputError('');
    if (onJumpTo) onJumpTo(questionNumber - 1);
  };


  const handleAIEvaluation = async () => {
    if (!writingAnswer.trim()) return;
    
    setIsEvaluating(true);
    try {
      const prompt = `Please evaluate this SAT Writing response:

Question: ${currentQuestion?.content}

Student's Response: ${writingAnswer}

Please provide a detailed evaluation including:
1. Grammar and mechanics
2. Organization and structure
3. Use of evidence and examples
4. Clarity and style
5. Overall score out of 6 points
6. Specific suggestions for improvement

Keep the evaluation constructive and educational.`;

      const evaluation = await analyzeWithAIML({ query: prompt });
      setAiEvaluation(evaluation);
    } catch (error) {
      console.error('AI Evaluation error:', error);
      setAiEvaluation('Unable to evaluate at this time. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };


  // Helper function to get graph URL from the graph field
  const getGraphUrl = (question: Question) => {
    if (!question.graph) return null;
    
    // If graph is an object with url property
    if (typeof question.graph === 'object' && question.graph.url) {
      return question.graph.url;
    }
    
    // If graph is a string URL
    if (typeof question.graph === 'string' && question.graph.trim() !== '') {
      return question.graph.trim();
    }
    
    return null;
  };

  // Helper function to format quote content
  const formatQuote = (quote: string | {text: string, source?: string} | undefined) => {
    if (!quote) return 'No key idea available for this question.';
    
    if (typeof quote === 'string') {
      return quote;
    }
    
    if (typeof quote === 'object' && quote.text) {
      return (
        <div>
          <div className="mb-2 text-lg italic">{quote.text}</div>
          {quote.source && (
            <div className="text-sm opacity-75">— {quote.source}</div>
          )}
        </div>
      );
    }
    
    return 'No key idea available for this question.';
  };

  // Helper function to format solution content
  const formatSolution = (currentQuestion: any) => {
    // If there are solutionSteps, format them nicely
    if (currentQuestion.solutionSteps && Array.isArray(currentQuestion.solutionSteps)) {
      return (
        <div>
          {currentQuestion.solution && (
            <div className="mb-3">{currentQuestion.solution}</div>
          )}
          <div className="space-y-2">
            {currentQuestion.solutionSteps.map((step: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="font-medium text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">
                  Step {index + 1}:
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Otherwise just show the solution string
    return currentQuestion.solution || 'No solution available for this question.';
  };

  // Font mapping for consistent styling
  const getFontFamily = () => {
    switch (displaySettings.fontFamily) {
      case 'inter': return 'Inter, sans-serif';
      case 'roboto': return 'Roboto, sans-serif';
      case 'open-sans': return 'Open Sans, sans-serif';
      case 'comic-sans': return 'Comic Sans MS, cursive';
      case 'courier-new': return 'Courier New, monospace';
      case 'poppins': return 'Poppins, sans-serif';
      case 'merriweather': return 'Merriweather, serif';
      case 'dancing-script': return 'Dancing Script, cursive';
      case 'ubuntu': return 'Ubuntu, sans-serif';
      default: return 'Inter, sans-serif';
    }
  };

  // Main content styling - applies to question content, choices, and solutions
  const contentTextStyle = {
    fontFamily: getFontFamily(),
    fontSize: `${displaySettings.fontSize}px`,
    fontWeight: displaySettings.emphasis.bold ? 'bold' : 'normal',
    fontStyle: displaySettings.emphasis.italic ? 'italic' : 'normal',
    textDecoration: displaySettings.emphasis.underline ? 'underline' : 'none',
    backgroundColor: displaySettings.emphasis.highlight ? '#fef3c7' : 'transparent',
    color: isDarkMode ? '#ffffff' : '#374151',
    lineHeight: '1.6'
  };

  if (!currentQuestion) {
    return (
      <div className={`w-full p-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>No question selected</div>
    );
  }


  const graphUrl = getGraphUrl(currentQuestion);
  const hasGraph = !!graphUrl;

  return (
    <div className="min-h-[calc(100vh-300px)] w-full px-2 sm:px-[28px]">
      {/* Responsive Layout Container */}
      <div className="flex flex-col space-y-4">
        
        {/* Desktop: Three Column Layout */}
        <div className="hidden lg:flex gap-2">
          
          {/* Column 1: Question + Answer Choices */}
          <div className={`${
            hasGraph 
              ? 'w-2/5' 
              : activeTab === 'problem' ? 'w-full' : 'w-3/5'
          } rounded-xl p-6 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
          
          {/* Question Number Header */}
          <div className="mb-4 flex items-center" style={{ gap: '160px' }}>
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-green-400' : 'text-blue-600'
            }`}>
              Question {currentQuestion.number}
            </h2>
            <div className="flex items-center gap-1">
              <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                <Flag className="h-3 w-3 text-green-500" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                <Flag className="h-3 w-3 text-blue-500" />
              </Button>
              {/* Calculator Icon */}
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                {currentQuestion.calculatorAllowed ? (
                  <Calculator className="h-3 w-3 text-blue-500" />
                ) : (
                  <div className="relative">
                    <Calculator className="h-3 w-3 text-gray-400" />
                    <X className="h-2 w-2 text-red-500 absolute -top-0.5 -right-0.5" />
                  </div>
                )}
              </Button>
              {/* Interactions Log Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-6 w-6 rounded-full"
                onClick={() => setShowInteractionLog(!showInteractionLog)}
              >
                <FileText className="h-3 w-3 text-purple-500" />
              </Button>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="space-y-4 mb-6">
            <div 
              style={contentTextStyle}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
            />
          </div>

          {/* Answer Section */}
          <div className="space-y-3">
            {/* SAT Writing Mode */}
            {isSATWriting ? (
              <div className="space-y-4">
                <Textarea
                  value={writingAnswer}
                  onChange={(e) => setWritingAnswer(e.target.value)}
                  placeholder="Write your response here..."
                  className={`w-full min-h-[200px] p-4 border rounded-lg resize-none transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  style={contentTextStyle}
                />
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {writingAnswer.length} characters
                  </span>
                  
                  <Button
                    onClick={handleAIEvaluation}
                    disabled={!writingAnswer.trim() || isEvaluating}
                    className={`transition-colors ${
                      isDarkMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isEvaluating ? (
                      <>
                        <Bot className="h-4 w-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Get AI Feedback
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Evaluation Display */}
                {aiEvaluation && (
                  <div className={`mt-4 p-4 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-green-500/30 text-green-400' 
                      : 'bg-blue-50 border-blue-200 text-gray-800'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-green-400' : 'text-blue-800'
                    }`}>
                      AI Evaluation:
                    </h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {aiEvaluation}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Question Mode */
              <div className="space-y-4">
                {/* Multiple Choice - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 max-w-2xl">
                    {currentQuestion.choices?.map((choice, index) => {
                      const choiceKey = String.fromCharCode(65 + index);
                      const isSelected = selectedAnswer === choiceKey;
                      const isCorrectChoice = currentQuestion.correctAnswer === choice;
                      
                      let buttonStyle = '';
                      let animationClass = '';
                      
                      if (selectedAnswer && isSelected) {
                        if (isCorrect) {
                          buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                          animationClass = 'transition-all duration-300 scale-105';
                        } else {
                          buttonStyle = 'bg-red-100 border-red-400 text-red-800 shadow-md';
                          animationClass = 'transition-all duration-300 scale-105';
                        }
                      } else if (selectedAnswer && isCorrectChoice) {
                        buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                        animationClass = 'transition-all duration-300 scale-105';
                      } else {
                        buttonStyle = isDarkMode 
                          ? 'bg-gray-800 border-green-500 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md';
                      }

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full h-auto min-h-[30px] rounded-full px-2 py-1.5 text-center justify-center transition-all duration-200 ${buttonStyle} ${animationClass}`}
                          onClick={() => checkAnswer(choiceKey)}
                          disabled={!!selectedAnswer}
                          style={{ 
                            fontFamily: getFontFamily(),
                            fontSize: '12px',
                            fontWeight: '500',
                            color: isDarkMode ? '#ffffff' : '#374151'
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-center text-center flex-1">
                              <span className={`text-xs mb-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Option {choiceKey}</span>
                              <span 
                                className="text-xs leading-tight"
                                dangerouslySetInnerHTML={{ __html: choice }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedAnswer && isSelected && !isCorrect && (
                                <span className="text-xs font-bold text-red-900">Incorrect</span>
                              )}
                              {selectedAnswer && isSelected && (
                                isCorrect ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0" />
                              )}
                              {selectedAnswer && !isSelected && isCorrectChoice && (
                                <Check className="h-4 w-4 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

              </div>
            )}
          </div>
        </div>

        {/* Column 2: Graph (when available) */}
        {hasGraph && (
          <div className={`w-1/5 rounded-xl p-2 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            <div className="h-full flex flex-col justify-center">
              <h3 className={`text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-green-400' : 'text-blue-600'
              }`}>
                📊 Graph
              </h3>
              <div className="flex justify-center items-center">
                <img 
                  src={graphUrl} 
                  alt="Question Graph" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '375px', maxWidth: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Column 3: Solution/Key Idea (hidden when activeTab is 'problem') */}
        {activeTab !== 'problem' && (
          <div className={`${
            hasGraph ? 'w-2/5' : 'w-2/5'
          } rounded-xl p-4 transition-colors ${
            isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-gray-50 border border-gray-200'
          }`}>
            
            {/* Solution Section */}
            {activeTab === 'solution' && (
              <>
                <h3 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>
                  💡 Solution & Explanation
                </h3>
                <TypingAnimation
                  text={formatSolution(currentQuestion)}
                  speed={15}
                  isHTML={true}
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{
                    ...contentTextStyle,
                    fontSize: `${displaySettings.fontSize - 1}px`,
                    color: isDarkMode ? '#ffffff' : contentTextStyle.color
                  }}
                />
              </>
            )}

            {/* Key Idea Section */}
            {activeTab === 'quote' && (
              <>
                <h3 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>
                  🎯 Key Idea
                </h3>
                <div 
                  style={{
                    ...contentTextStyle,
                    fontSize: `${displaySettings.fontSize - 1}px`,
                    color: isDarkMode ? '#ffffff' : contentTextStyle.color
                  }}
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                >
                  {formatQuote(currentQuestion.quote)}
                </div>
              </>
            )}
          </div>
        )}

        </div>

        {/* Medium Screens (lg hidden): Two Column with Solution Below */}
        <div className="hidden md:block lg:hidden">
          {/* Question and Graph Row */}
          <div className="flex gap-2 mb-4">
            {/* Question + Answer Choices */}
            <div className={`${
              hasGraph ? 'w-3/5' : 'w-full'
            } rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
              
              <div className="mb-4 flex items-center" style={{ gap: '160px' }}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-green-400' : 'text-blue-600'
                }`}>
                  Question {currentQuestion.number}
                </h2>
                <div className="flex items-center gap-1">
                  <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                    <Flag className="h-3 w-3 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                    <Flag className="h-3 w-3 text-blue-500" />
                  </Button>
                  {/* Calculator Icon */}
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                    {currentQuestion.calculatorAllowed ? (
                      <Calculator className="h-3 w-3 text-blue-500" />
                    ) : (
                      <div className="relative">
                        <Calculator className="h-3 w-3 text-gray-400" />
                        <X className="h-2 w-2 text-red-500 absolute -top-0.5 -right-0.5" />
                      </div>
                    )}
                  </Button>
                  {/* Interactions Log Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-6 w-6 rounded-full"
                    onClick={() => setShowInteractionLog(!showInteractionLog)}
                  >
                    <FileText className="h-3 w-3 text-purple-500" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div 
                  style={contentTextStyle}
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
                />
              </div>

              <div className="space-y-3">
                {isSATWriting ? (
                  <div className="space-y-4">
                    <Textarea
                      value={writingAnswer}
                      onChange={(e) => setWritingAnswer(e.target.value)}
                      placeholder="Write your response here..."
                      className={`w-full min-h-[200px] p-4 border rounded-lg resize-none transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      style={contentTextStyle}
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
                        {writingAnswer.length} characters
                      </span>
                      <Button
                        onClick={handleAIEvaluation}
                        disabled={!writingAnswer.trim() || isEvaluating}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isEvaluating ? (
                          <>
                            <Bot className="h-4 w-4 mr-2 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            Get AI Feedback
                          </>
                        )}
                      </Button>
                    </div>
                    {aiEvaluation && (
                      <div className={`mt-4 p-4 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-green-500/30 text-green-400' 
                          : 'bg-blue-50 border-blue-200 text-gray-800'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${
                          isDarkMode ? 'text-green-400' : 'text-blue-800'
                        }`}>
                          AI Evaluation:
                        </h4>
                        <div className="whitespace-pre-wrap text-sm">
                          {aiEvaluation}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {currentQuestion.choices?.map((choice, index) => {
                          const choiceKey = String.fromCharCode(65 + index);
                          const isSelected = selectedAnswer === choiceKey;
                          const isCorrectChoice = currentQuestion.correctAnswer === choice;
                          
                          let buttonStyle = '';
                          let animationClass = '';
                          
                          if (selectedAnswer && isSelected) {
                            if (isCorrect) {
                              buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                              animationClass = 'transition-all duration-300 scale-105';
                            } else {
                              buttonStyle = 'bg-red-100 border-red-400 text-red-800 shadow-md';
                              animationClass = 'transition-all duration-300 scale-105';
                            }
                          } else if (selectedAnswer && isCorrectChoice) {
                            buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                            animationClass = 'transition-all duration-300 scale-105';
                          } else {
                            buttonStyle = isDarkMode 
                              ? 'bg-gray-800 border-green-500 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md';
                          }

                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full h-auto min-h-[30px] rounded-full px-2 py-1.5 text-center justify-center transition-all duration-200 ${buttonStyle} ${animationClass}`}
                              onClick={() => checkAnswer(choiceKey)}
                              disabled={!!selectedAnswer}
                              style={{ 
                                fontFamily: getFontFamily(),
                                fontSize: '12px',
                                fontWeight: '500',
                                color: isDarkMode ? '#ffffff' : '#374151'
                              }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-center text-center flex-1">
                                  <span className={`text-xs mb-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Option {choiceKey}</span>
                                  <span 
                                    className="text-xs leading-tight"
                                    dangerouslySetInnerHTML={{ __html: choice }}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedAnswer && isSelected && !isCorrect && (
                                    <span className="text-xs font-bold text-red-900">Incorrect</span>
                                  )}
                                  {selectedAnswer && isSelected && (
                                    isCorrect ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0" />
                                  )}
                                  {selectedAnswer && !isSelected && isCorrectChoice && (
                                    <Check className="h-4 w-4 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>

                  </div>
                )}
              </div>
            </div>

            {/* Graph Column */}
            {hasGraph && (
              <div className={`w-2/5 rounded-xl p-4 transition-colors ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
                <div className="h-full flex flex-col justify-center">
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-blue-600'
                  }`}>
                    📊 Graph
                  </h3>
                  <div className="flex justify-center items-center">
                    <img 
                      src={graphUrl} 
                      alt="Question Graph" 
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solution Below */}
          {activeTab !== 'problem' && (
            <div className={`rounded-xl p-4 transition-colors ${
              isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-gray-50 border border-gray-200'
            }`}>
              {activeTab === 'solution' && (
                <>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    💡 Solution & Explanation
                  </h3>
                  <TypingAnimation
                    text={formatSolution(currentQuestion)}
                    speed={15}
                    isHTML={true}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                  />
                </>
              )}
              {activeTab === 'quote' && (
                <>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    🎯 Key Idea
                  </h3>
                  <div 
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                >
                  {formatQuote(currentQuestion.quote)}
                </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Small Screens: Vertical Stack with Graph Between Question and Choices */}
        <div className="block md:hidden space-y-3">
          {/* Question Section */}
          <div className={`rounded-lg p-4 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            <div className="mb-4 flex items-center" style={{ gap: '160px' }}>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-blue-600'
              }`}>
                Question {currentQuestion.number}
              </h2>
              <div className="flex items-center gap-1">
                <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                  <Flag className="h-3 w-3 text-green-500" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                  <Flag className="h-3 w-3 text-blue-500" />
                </Button>
                {/* Calculator Icon */}
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                  {currentQuestion.calculatorAllowed ? (
                    <Calculator className="h-3 w-3 text-blue-500" />
                  ) : (
                    <div className="relative">
                      <Calculator className="h-3 w-3 text-gray-400" />
                      <X className="h-2 w-2 text-red-500 absolute -top-0.5 -right-0.5" />
                    </div>
                  )}
                </Button>
                {/* Interactions Log Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-6 w-6 rounded-full"
                  onClick={() => setShowInteractionLog(!showInteractionLog)}
                >
                  <FileText className="h-3 w-3 text-purple-500" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div 
                style={contentTextStyle}
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
              />
            </div>
          </div>

          {/* Graph Section (between question and choices) */}
          {hasGraph && (
            <div className={`rounded-xl p-4 transition-colors ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
              <h3 className={`text-sm font-semibold mb-3 ${
                isDarkMode ? 'text-green-400' : 'text-blue-600'
              }`}>
                📊 Graph
              </h3>
              <div className="flex justify-center items-center">
                <img 
                  src={graphUrl} 
                  alt="Question Graph" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '250px' }}
                />
              </div>
            </div>
          )}

          {/* Answer Choices Section */}
          <div className={`rounded-xl p-6 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            <div className="space-y-3">
              {isSATWriting ? (
                <div className="space-y-4">
                  <Textarea
                    value={writingAnswer}
                    onChange={(e) => setWritingAnswer(e.target.value)}
                    placeholder="Write your response here..."
                    className={`w-full min-h-[200px] p-4 border rounded-lg resize-none transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    style={contentTextStyle}
                  />
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
                      {writingAnswer.length} characters
                    </span>
                    <Button
                      onClick={handleAIEvaluation}
                      disabled={!writingAnswer.trim() || isEvaluating}
                      className={`transition-colors ${
                        isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isEvaluating ? (
                        <>
                          <Bot className="h-4 w-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Get AI Feedback
                        </>
                      )}
                    </Button>
                  </div>
                  {aiEvaluation && (
                    <div className={`mt-4 p-4 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-green-500/30 text-green-400' 
                        : 'bg-blue-50 border-blue-200 text-gray-800'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${
                        isDarkMode ? 'text-green-400' : 'text-blue-800'
                      }`}>
                        AI Evaluation:
                      </h4>
                      <div className="whitespace-pre-wrap text-sm">
                        {aiEvaluation}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Single Column Multiple Choice for Mobile */}
                  <div className="grid grid-cols-1 gap-3 mt-6">
                      {currentQuestion.choices?.map((choice, index) => {
                        const choiceKey = String.fromCharCode(65 + index);
                        const isSelected = selectedAnswer === choiceKey;
                        const isCorrectChoice = currentQuestion.correctAnswer === choice;
                        
                        let buttonStyle = '';
                        let animationClass = '';
                        
                        if (selectedAnswer && isSelected) {
                          if (isCorrect) {
                            buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                            animationClass = 'transition-all duration-300 scale-105';
                          } else {
                            buttonStyle = 'bg-red-100 border-red-400 text-red-800 shadow-md';
                            animationClass = 'transition-all duration-300 scale-105';
                          }
                        } else if (selectedAnswer && isCorrectChoice) {
                          buttonStyle = 'bg-green-100 border-green-400 text-green-800 shadow-md';
                          animationClass = 'transition-all duration-300 scale-105';
                        } else {
                          buttonStyle = isDarkMode 
                            ? 'bg-gray-800 border-green-500 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md';
                        }

                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={`w-full h-auto min-h-[40px] rounded-full px-3 py-2 text-center justify-center transition-all duration-200 ${buttonStyle} ${animationClass}`}
                            onClick={() => checkAnswer(choiceKey)}
                            disabled={!!selectedAnswer}
                            style={{ 
                              fontFamily: getFontFamily(),
                              fontSize: '13px',
                              fontWeight: '500',
                              color: isDarkMode ? '#ffffff' : '#374151'
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col items-center text-center flex-1">
                                <span className={`text-xs mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Option {choiceKey}</span>
                                <span 
                                  className="text-sm leading-tight"
                                  dangerouslySetInnerHTML={{ __html: choice }}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedAnswer && isSelected && !isCorrect && (
                                  <span className="text-xs font-bold text-red-900">Incorrect</span>
                                )}
                                {selectedAnswer && isSelected && (
                                  isCorrect ? <Check className="h-5 w-5 flex-shrink-0" /> : <X className="h-5 w-5 flex-shrink-0" />
                                )}
                                {selectedAnswer && !isSelected && isCorrectChoice && (
                                  <Check className="h-5 w-5 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                </div>
              )}
            </div>
          </div>

          {/* Solution Below for Mobile */}
          {activeTab !== 'problem' && (
            <div className={`rounded-xl p-4 transition-colors ${
              isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-gray-50 border border-gray-200'
            }`}>
              {activeTab === 'solution' && (
                <>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    💡 Solution & Explanation
                  </h3>
                  <TypingAnimation
                    text={formatSolution(currentQuestion)}
                    speed={15}
                    isHTML={true}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                  />
                </>
              )}
              {activeTab === 'quote' && (
                <>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    🎯 Key Idea
                  </h3>
                  <div 
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                >
                  {formatQuote(currentQuestion.quote)}
                </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Interactions Log Display */}
      {showInteractionLog && (
        <div className={`fixed top-20 right-4 w-96 max-h-96 overflow-y-auto z-50 p-4 rounded-lg shadow-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-gray-800'}`}>
              Interaction Log ({interactions.length})
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInteractionLog(false)}
              className="p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendInteractionsToEdgeFunction}
              className="flex-1"
            >
              Send to Edge Function
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInteractions([])}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>

          <div className="space-y-2">
            {interactions.map((interaction, index) => (
              <div key={index} className={`p-2 rounded text-xs ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between">
                  <span className="font-medium">Q{interaction.questionNumber}</span>
                  <span className={interaction.isCorrect ? 'text-green-500' : 'text-red-500'}>
                    {interaction.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                <div className="text-gray-500">
                  Answer: {interaction.userAnswer} | Time: {interaction.timeSpentSeconds}s
                </div>
                <div className="text-gray-400">
                  Progress: {interaction.objectiveProgress?.currentProgressPercentile}% | {new Date(interaction.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {interactions.length === 0 && (
              <div className={`text-center py-4 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No interactions recorded yet
              </div>
            )}
          </div>

          <div className={`mt-3 pt-3 border-t text-xs ${
            isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            <strong>Enhanced JSON Structure with Objective Progress:</strong>
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`{
  "questionId": "q_123",
  "questionNumber": 1,
  "userAnswer": "B",
  "correctAnswer": "A", 
  "isCorrect": false,
  "timeSpentSeconds": 45,
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "session_1234567890",
  "userId": "user_123",
  "practiceMode": "timer",
  "objectiveProgress": {
    "currentProgressPercentile": 75,
    "targetProgressPercentile": 80,
    "objectiveType": "questions",
    "objectiveValue": 20
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeDisplay;