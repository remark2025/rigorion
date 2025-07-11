import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, ToggleLeft, ToggleRight, Check, X, Bot } from "lucide-react";
import { Question } from "@/types/QuestionInterface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { analyzeWithAIML } from "@/services/aimlApi";

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
    textColor: string;
  };
  boardColor: string;
  colorSettings: {
    content: string;
    keyPhrase: string;
    formula: string;
  };
  activeTab: "problem" | "solution" | "quote";
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
  colorSettings,
  activeTab,
}: PracticeDisplayProps) => {
  const { isDarkMode } = useTheme();
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(null);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(null);
  const [showGoToInput, setShowGoToInput] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const [fillInAnswer, setFillInAnswer] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedAnswer = propSelectedAnswer !== undefined ? propSelectedAnswer : localSelectedAnswer;
  const isCorrect = propIsCorrect !== undefined ? propIsCorrect : localIsCorrect;

  // Check if this is a SAT Writing module
  const isSATWriting = currentQuestion?.chapter?.toLowerCase().includes('writing') || 
                      currentQuestion?.module?.toLowerCase().includes('writing');

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

  const checkAnswer = propCheckAnswer || localCheckAnswer;

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

  const handleSubmitFillIn = () => {
    checkAnswer(fillInAnswer);
    setFillInAnswer('');
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

  const toggleQuestionType = () => {
    if (!isSATWriting) {
      setIsMultipleChoice(!isMultipleChoice);
      setFillInAnswer('');
      setLocalSelectedAnswer(null);
      setLocalIsCorrect(null);
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
    console.log('formatQuote called with:', quote, 'type:', typeof quote);
    
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
    color: isDarkMode ? '#ffffff' : displaySettings.textColor,
    lineHeight: '1.6'
  };

  if (!currentQuestion) {
    return (
      <div className={`w-full p-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>No question selected</div>
    );
  }

  // Debug current question
  console.log('Current question in PracticeDisplay:', currentQuestion);
  console.log('Current question quote:', currentQuestion.quote);

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
          <div className="mb-4">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-green-400' : 'text-blue-600'
            }`}>
              Question {currentQuestion.number}
            </h2>
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
                {/* Question Type Toggle */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleQuestionType}
                    className={`flex items-center gap-2 transition-colors ${
                      isDarkMode 
                        ? 'border-green-500/30 text-green-400 hover:bg-gray-800' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isMultipleChoice ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    {isMultipleChoice ? 'Multiple Choice' : 'Fill in the Blank'}
                  </Button>
                </div>

                {/* Multiple Choice - Responsive Grid */}
                {isMultipleChoice ? (
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
                            color: isDarkMode ? '#ffffff' : undefined
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
                ) : (
                  /* Fill in the Blank */
                  <div className="flex gap-3">
                    <Input
                      value={fillInAnswer}
                      onChange={(e) => setFillInAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      className={`flex-1 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      style={contentTextStyle}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitFillIn()}
                    />
                    <Button 
                      onClick={handleSubmitFillIn}
                      disabled={!fillInAnswer.trim()}
                      className={`transition-colors ${
                        isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Submit
                    </Button>
                  </div>
                )}

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
                <div 
                  style={{
                    ...contentTextStyle,
                    fontSize: `${displaySettings.fontSize - 1}px`,
                    color: isDarkMode ? '#ffffff' : contentTextStyle.color
                  }}
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                >
                  {formatSolution(currentQuestion)}
                </div>
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
              
              <div className="mb-4">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-green-400' : 'text-blue-600'
                }`}>
                  Question {currentQuestion.number}
                </h2>
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
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleQuestionType}
                        className={`flex items-center gap-2 transition-colors ${
                          isDarkMode 
                            ? 'border-green-500/30 text-green-400 hover:bg-gray-800' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isMultipleChoice ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                        {isMultipleChoice ? 'Multiple Choice' : 'Fill in the Blank'}
                      </Button>
                    </div>

                    {isMultipleChoice ? (
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
                                color: isDarkMode ? '#ffffff' : undefined
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
                    ) : (
                      <div className="flex gap-3">
                        <Input
                          value={fillInAnswer}
                          onChange={(e) => setFillInAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          className={`flex-1 transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          style={contentTextStyle}
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitFillIn()}
                        />
                        <Button 
                          onClick={handleSubmitFillIn}
                          disabled={!fillInAnswer.trim()}
                          className={`transition-colors ${
                            isDarkMode 
                              ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          Submit
                        </Button>
                      </div>
                    )}

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
                  <div 
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                  >
                    {formatSolution(currentQuestion)}
                  </div>
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
        <div className="block md:hidden space-y-4">
          {/* Question Section */}
          <div className={`rounded-xl p-6 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            <div className="mb-4">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-blue-600'
              }`}>
                Question {currentQuestion.number}
              </h2>
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
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleQuestionType}
                      className={`flex items-center gap-2 transition-colors ${
                        isDarkMode 
                          ? 'border-green-500/30 text-green-400 hover:bg-gray-800' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isMultipleChoice ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                      {isMultipleChoice ? 'Multiple Choice' : 'Fill in the Blank'}
                    </Button>
                  </div>

                  {/* Single Column Multiple Choice for Mobile */}
                  {isMultipleChoice ? (
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
                              color: isDarkMode ? '#ffffff' : undefined
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
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        value={fillInAnswer}
                        onChange={(e) => setFillInAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className={`flex-1 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        style={contentTextStyle}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitFillIn()}
                      />
                      <Button 
                        onClick={handleSubmitFillIn}
                        disabled={!fillInAnswer.trim()}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Submit
                      </Button>
                    </div>
                  )}

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
                  <div 
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                  >
                    {formatSolution(currentQuestion)}
                  </div>
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
    </div>
  );
};

export default PracticeDisplay;