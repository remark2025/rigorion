import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Check, X, Bot, Lightbulb, Flag, Calculator, FileText, Trash2, Bookmark } from "lucide-react";
import { Question } from "@/types/QuestionInterface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { analyzeWithAIML } from "@/services/aimlApi";
import HintDialog from "./HintDialog";
import TypingAnimation from "@/components/ui/TypingAnimation";
import AttemptHistory from "./AttemptHistory";
import QuestionHeader from "./QuestionHeader";
import { QuestionTracking } from "./QuestionTracking";
import { PracticeTimer } from "./PracticeTimer";

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
  onInteractionsChange?: (interactions: Array<{
    isCorrect: boolean;
    timestamp: string;
    questionId?: string;
  }>) => void;
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
  onInteractionsChange,
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
  
  // Question tracking state
  const [questionGuess, setQuestionGuess] = useState<number | null>(null);
  const [questionEmotion, setQuestionEmotion] = useState<string | null>(null);

  // Enhanced interaction tracking state
  const [hintsViewed, setHintsViewed] = useState<string[]>([]);
  const [solutionAccessed, setSolutionAccessed] = useState<boolean>(false);
  const [tipsAccessed, setTipsAccessed] = useState<string[]>([]);
  const [answerChangeCount, setAnswerChangeCount] = useState<number>(0);
  const [helpActions, setHelpActions] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [questionAttempts, setQuestionAttempts] = useState<Map<string, number>>(new Map());

  // Reset timer and tracking when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setQuestionGuess(null);
    setQuestionEmotion(null);
    
    // Reset enhanced tracking for new question
    setHintsViewed([]);
    setSolutionAccessed(false);
    setTipsAccessed([]);
    setAnswerChangeCount(0);
    setHelpActions([]);
    setIsBookmarked(false);
  }, [currentQuestionIndex]);

  const selectedAnswer = propSelectedAnswer !== undefined ? propSelectedAnswer : localSelectedAnswer;
  const isCorrect = propIsCorrect !== undefined ? propIsCorrect : localIsCorrect;

  // Track when solution tab is viewed
  useEffect(() => {
    if (activeTab === 'solution') {
      trackSolutionView();
    }
  }, [activeTab]);

  // Track answer changes
  useEffect(() => {
    if (selectedAnswer !== null && selectedAnswer !== propSelectedAnswer) {
      trackAnswerChange();
    }
  }, [selectedAnswer, propSelectedAnswer]);

  // Check if this is a SAT Writing module
  const isSATWriting =
    (currentQuestion?.chapter?.toLowerCase()?.includes('writing') ?? false) ||
    (currentQuestion?.module?.toLowerCase()?.includes('writing') ?? false);

  // Check if this is a reading question with passage
  const hasPassage = !!currentQuestion?.passage;
  const isReadingQuestion = 
    (currentQuestion?.module?.toLowerCase()?.includes('reading') ?? false) ||
    hasPassage;

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
      isOnTrack,
      displayedTargetProgress: targetProgressPercentage // This matches what's shown in UI
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

  // Enhanced tracking helper functions
  const trackHintUsage = (hintId: string) => {
    if (!hintsViewed.includes(hintId)) {
      setHintsViewed(prev => [...prev, hintId]);
      setHelpActions(prev => [...prev, 'hint']);
      console.log(`🔍 Hint accessed: ${hintId}`);
    }
  };

  const trackSolutionView = () => {
    if (!solutionAccessed) {
      setSolutionAccessed(true);
      setHelpActions(prev => [...prev, 'solution']);
      console.log(`📖 Solution viewed for question: ${currentQuestion?.id}`);
    }
  };

  const trackTipAccess = (tipId: string) => {
    if (!tipsAccessed.includes(tipId)) {
      setTipsAccessed(prev => [...prev, tipId]);
      setHelpActions(prev => [...prev, 'tip']);
      console.log(`💡 Tip accessed: ${tipId}`);
    }
  };

  const trackAnswerChange = () => {
    setAnswerChangeCount(prev => prev + 1);
    console.log(`✏️ Answer changed (count: ${answerChangeCount + 1})`);
  };

  const trackBookmark = () => {
    setIsBookmarked(prev => !prev);
    console.log(`🔖 Question ${isBookmarked ? 'unbookmarked' : 'bookmarked'}: ${currentQuestion?.id}`);
  };

  const getAttemptNumber = (questionId: string): number => {
    const currentCount = questionAttempts.get(questionId) || 0;
    const newCount = currentCount + 1;
    setQuestionAttempts(prev => new Map(prev).set(questionId, newCount));
    return newCount;
  };

  // Target progress calculation functions
  const calculateEstimatedScore = (): number => {
    if (!interactions || interactions.length === 0) return 1200; // Default starting score
    
    const correctCount = interactions.filter(int => int?.isCorrect).length;
    const accuracy = correctCount / interactions.length;
    const baseScore = 1200;
    const maxScore = 1600;
    const estimatedScore = baseScore + (accuracy * (maxScore - baseScore));
    
    return Math.round(estimatedScore);
  };

  const calculateQuestionsNeeded = (): number => {
    const targetScore = 1500; // Default target, should come from user settings
    const currentScore = calculateEstimatedScore();
    
    if (currentScore >= targetScore) return 0;
    
    const scoreGap = targetScore - currentScore;
    const questionsNeeded = Math.ceil(scoreGap / 10); // Rough estimate: 10 points per improved question
    
    return questionsNeeded;
  };

  const identifyWeakAreas = (): string[] => {
    const weakAreas: string[] = [];
    const topicPerformance = new Map<string, { correct: number; total: number }>();
    
    interactions.forEach(int => {
      const topic = int.topic || 'General';
      const stats = topicPerformance.get(topic) || { correct: 0, total: 0 };
      stats.total++;
      if (int.isCorrect) stats.correct++;
      topicPerformance.set(topic, stats);
    });
    
    topicPerformance.forEach((stats, topic) => {
      const accuracy = stats.correct / stats.total;
      if (accuracy < 0.7 && stats.total >= 3) { // Less than 70% accuracy with at least 3 attempts
        weakAreas.push(topic);
      }
    });
    
    return weakAreas;
  };

  const identifyStrengths = (): string[] => {
    const strengths: string[] = [];
    const topicPerformance = new Map<string, { correct: number; total: number }>();
    
    interactions.forEach(int => {
      const topic = int.topic || 'General';
      const stats = topicPerformance.get(topic) || { correct: 0, total: 0 };
      stats.total++;
      if (int.isCorrect) stats.correct++;
      topicPerformance.set(topic, stats);
    });
    
    topicPerformance.forEach((stats, topic) => {
      const accuracy = stats.correct / stats.total;
      if (accuracy >= 0.85 && stats.total >= 3) { // 85% or better accuracy with at least 3 attempts
        strengths.push(topic);
      }
    });
    
    return strengths;
  };

  const calculateDailyProgress = (): number => {
    if (!interactions || interactions.length === 0) return 0;
    
    const dailyGoal = 20; // Default daily goal: 20 questions
    const today = new Date().toDateString();
    const todayInteractions = interactions.filter(int => 
      int?.timestamp && new Date(int.timestamp).toDateString() === today
    );
    
    return Math.min(100, Math.round((todayInteractions.length / dailyGoal) * 100));
  };

  const calculateWeeklyProgress = (): number => {
    if (!interactions || interactions.length === 0) return 0;
    
    const weeklyGoal = 100; // Default weekly goal: 100 questions
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekInteractions = interactions.filter(int => 
      int?.timestamp && new Date(int.timestamp) >= oneWeekAgo
    );
    
    return Math.min(100, Math.round((weekInteractions.length / weeklyGoal) * 100));
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
    
    const userId = "user_123"; // This should come from auth context
    const questionId = currentQuestion?.id;
    const attemptNumber = getAttemptNumber(questionId || 'unknown');
    const idempotencyKey = `${userId}_${questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const interaction = {
      // ✅ Core tracking fields (exactly as agreed)
      question_id: questionId,
      user_id: userId,
      is_correct: isCorrectAnswer,
      time_spent_seconds: timeSpent,
      attempted_at: new Date().toISOString(),
      bookmarked: isBookmarked,
      hint_checked: hintsViewed.length > 0,
      solution_checked: solutionAccessed,
      confidence_level: questionGuess,
      objective_progress: objectiveProgress.targetProgress, // This is what shows in "Target Progress: X%" in UI
      idempotency_key: idempotencyKey,
      attempt_number: attemptNumber,
      
      // ✅ Legacy fields for compatibility (will be removed later)
      questionId: currentQuestion?.id,
      userId: "user_123",
      answer: answer,
      isCorrect: isCorrectAnswer,
      timeSpentSeconds: timeSpent,
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      displayedTargetProgressPercentile: objectiveProgress.targetProgress,
      
      // 🆕 Enhanced tracking fields
      confidenceLevel: questionGuess,
      hintsUsed: [...hintsViewed],
      solutionViewed: solutionAccessed,
      ideasChecked: [...tipsAccessed], 
      answerChanges: answerChangeCount,
      helpSequence: [...helpActions],
      attemptNumber: getAttemptNumber(currentQuestion?.id || 'unknown'),
      bookmarked: isBookmarked,
      
      // 📚 Question metadata
      topic: currentQuestion?.chapter || 'unknown',
      difficulty: currentQuestion?.difficulty || 'unknown',
      
      // 🎯 Target progress analytics
      targetProgress: {
        targetScore: 1500, // Default target, should come from user settings
        currentEstimatedScore: calculateEstimatedScore(),
        questionsToTarget: calculateQuestionsNeeded(),
        weakAreas: identifyWeakAreas(),
        strengthAreas: identifyStrengths(),
        dailyGoalProgress: calculateDailyProgress(),
        weeklyGoalProgress: calculateWeeklyProgress()
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
        
        // Notify parent component of interactions change
        if (onInteractionsChange) {
          onInteractionsChange(newInteractions);
        }
        
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
    // If there are solutionSteps, format them nicely as HTML string
    if (currentQuestion.solutionSteps && Array.isArray(currentQuestion.solutionSteps)) {
      let solutionHTML = '';
      
      if (currentQuestion.solution) {
        solutionHTML += `<div style="margin-bottom: 12px;">${currentQuestion.solution}</div>`;
      }
      
      solutionHTML += '<div>';
      currentQuestion.solutionSteps.forEach((step: string, index: number) => {
        solutionHTML += `
          <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
            <span style="font-weight: 500; color: #2563eb; margin-right: 8px; flex-shrink: 0;">
              Step ${index + 1}:
            </span>
            <span>${step}</span>
          </div>
        `;
      });
      solutionHTML += '</div>';
      
      return solutionHTML;
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

  // SAT Main content styling - clean, professional typography
  const contentTextStyle = {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: `16px`, // Standard SAT font size
    fontWeight: displaySettings.emphasis.bold ? '600' : '400',
    fontStyle: displaySettings.emphasis.italic ? 'italic' : 'normal',
    textDecoration: displaySettings.emphasis.underline ? 'underline' : 'none',
    backgroundColor: displaySettings.emphasis.highlight ? '#fff3cd' : 'transparent',
    color: '#212529', // SAT standard text color
    lineHeight: '1.5'
  };

  if (!currentQuestion) {
    return (
      <div className="w-full p-8 text-center text-gray-700 bg-white">No question selected</div>
    );
  }

  const graphUrl = getGraphUrl(currentQuestion);
  const hasGraph = !!graphUrl;

  return (
    <div className="min-h-screen w-full px-2 sm:px-8 bg-white">
      {/* SAT Practice Layout Container */}
      <div className="flex flex-col space-y-4">
        
        {/* Desktop: Clean SAT Layout */}
        <div className="hidden lg:flex gap-4">
          
          {/* Column 1: Question + Answer Choices */}
          <div className={`${
            activeTab === 'problem' ? 'w-full' : 'w-3/5'
          } bg-white p-8`}>
          
          {/* Timer - Positioned above question header */}
          <PracticeTimer 
            timerValue={timerValue}
            mode={mode}
          />
          
          {/* SAT Question Header - Authentic Style */}
          <QuestionHeader questionNumber={currentQuestion.number} chapter={currentQuestion.chapter} />
          
          {/* Question Tracking and Action Icons - Inline Row */}
          <div className="mb-3 flex items-center justify-between">
            {/* Left: Question Tracking */}
            <QuestionTracking
              questionId={currentQuestion.id || `q_${currentQuestionIndex}`}
              onGuessChange={setQuestionGuess}
              onEmotionChange={setQuestionEmotion}
              initialGuess={questionGuess}
              initialEmotion={questionEmotion}
            />
            
            {/* Right: Action Icons */}
            <div className="flex items-center gap-2">
              <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded hover:bg-gray-100">
                <Flag className="h-4 w-4 text-blue-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-8 w-8 rounded hover:bg-gray-100"
                onClick={trackBookmark}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-blue-600'}`} />
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
          
          
          {/* Graph Section - Above Question Content */}
          {graphUrl && (
            <div className="mb-6 bg-white p-4">
              <div className="flex justify-center">
                <img 
                  src={graphUrl} 
                  alt="Question Graph" 
                  className="max-w-full h-auto max-h-80"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </div>
          )}
          
          {/* Question Content */}
          <div className="space-y-4 mb-6">
            <div 
              style={contentTextStyle}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
            />
          </div>

          {/* Answer Section */}
          <div className="space-y-3 pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
            {/* SAT Writing Mode */}
            {isSATWriting && (
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
            )}

            {!isSATWriting && (
              <>
                {/* Regular Question Mode */}
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
                          buttonStyle = 'bg-green-700 border-green-800 text-black shadow-md';
                          animationClass = 'transition-all duration-300 scale-105';
                        } else {
                          buttonStyle = 'bg-red-500 border-red-600 text-white shadow-md';
                          animationClass = 'transition-all duration-300 scale-105';
                        }
                      } else if (selectedAnswer && isCorrectChoice) {
                        buttonStyle = 'bg-green-700 border-green-800 text-black shadow-md';
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
                            color: selectedAnswer && isSelected && !isCorrect ? '#ffffff' : 
                                   selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? '#ffffff' : 
                                   isDarkMode ? '#ffffff' : '#374151'
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-center text-center flex-1">
                              <span className={`text-xs mb-0.5 ${
                                selectedAnswer && isSelected && !isCorrect ? 'text-white' : 
                                selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? 'text-white' : 
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                              }`}>Option {choiceKey}</span>
                              <span 
                                className="text-xs leading-tight"
                                dangerouslySetInnerHTML={{ __html: choice }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedAnswer && isSelected && isCorrect && (
                                <span className="text-xs font-bold text-white">Correct</span>
                              )}
                              {selectedAnswer && isSelected && !isCorrect && (
                                <span className="text-xs font-bold text-red-900">Incorrect</span>
                              )}
                              {selectedAnswer && isSelected && (
                                isCorrect ? <Check className="h-4 w-4 flex-shrink-0 text-white" /> : <X className="h-4 w-4 flex-shrink-0" />
                              )}
                              {selectedAnswer && !isSelected && isCorrectChoice && (
                                <Check className="h-4 w-4 flex-shrink-0 text-white" />
                              )}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

              </div>
              </>
            )}
          </div>
          
          {/* Solution Below for Reading Questions when answer is selected */}
          {hasPassage && selectedAnswer && (
            <div className="bg-white p-8 mt-4">
              {/* Broken Line Spacer */}
              <div className="mb-4 flex justify-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              
              {/* Solution Header - Step by Step Explanation */}
              <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div 
                  className="w-full mr-3 flex items-center justify-center"
                  style={{
                    backgroundColor: '#CFCFCF',
                    height: '24px',
                    borderRadius: '2px'
                  }}
                >
                  <span className="text-sm font-semibold text-blue-700">
                    Step by Step Explanation
                  </span>
                </div>
              </div>
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
                <h3 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>
                  💡 Solution & Explanation
                </h3>
                <TypingAnimation
                  text={formatSolution(currentQuestion)}
                  speed={8}
                  isHTML={true}
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{
                    ...contentTextStyle,
                    fontSize: `${displaySettings.fontSize - 1}px`,
                    color: isDarkMode ? '#ffffff' : contentTextStyle.color
                  }}
                />
              </div>
            </div>
          )}
        </div>


        {/* Column 3: Passage for Reading Questions OR Solution/Key Idea */}
        {(hasPassage || activeTab !== 'problem') && (
          <div className={`${
            hasGraph ? 'w-2/5' : 'w-2/5'
          } bg-white p-8 relative`}>
            
            {/* Vertical Spacer for side-by-side layout */}
            <div className="absolute left-0 top-4 bottom-4 flex items-center">
              <div className="h-full border-l border-dashed border-gray-300"></div>
            </div>
            
            {/* Header - Step by Step Explanation */}
            <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <div 
                className="w-full mr-3 flex items-center justify-center"
                style={{
                  backgroundColor: '#CFCFCF',
                  height: '24px',
                  borderRadius: '2px'
                }}
              >
                <span className="text-sm font-semibold text-blue-700">
                  Step by Step Explanation
                </span>
              </div>
            </div>
            
            <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
              {/* Reading Passage Display */}
              {hasPassage && activeTab === 'problem' && (
                <>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    📖 Reading Passage
                  </h3>
                  {currentQuestion.passage?.title && (
                    <h4 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-green-300' : 'text-gray-700'
                    }`}>
                      {currentQuestion.passage.title}
                    </h4>
                  )}
                  <div 
                    style={{
                      ...contentTextStyle,
                      fontSize: `${displaySettings.fontSize - 1}px`,
                      color: isDarkMode ? '#ffffff' : contentTextStyle.color
                    }}
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                  >
                    {currentQuestion.passage?.content}
                  </div>
                  {currentQuestion.passage?.source && (
                    <div className={`text-xs mt-3 opacity-75 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-600'
                    }`}>
                      Source: {currentQuestion.passage.source}
                    </div>
                  )}
                </>
              )}

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
                    speed={8}
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
              
              {/* Timer - Positioned above question header */}
              <PracticeTimer 
                timerValue={timerValue}
                mode={mode}
              />
              
              {/* SAT Question Header - Authentic Style */}
              <QuestionHeader questionNumber={currentQuestion.number} chapter={currentQuestion.chapter} />
              
              {/* Question Tracking and Action Icons - Inline Row */}
              <div className="mb-3 flex items-center justify-between">
                {/* Left: Question Tracking */}
                <QuestionTracking
                  questionId={currentQuestion.id || `q_${currentQuestionIndex}`}
                  onGuessChange={setQuestionGuess}
                  onEmotionChange={setQuestionEmotion}
                  initialGuess={questionGuess}
                  initialEmotion={questionEmotion}
                />
                
                {/* Right: Action Icons */}
                <div className="flex items-center gap-1">
                  <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                    <Flag className="h-3 w-3 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                    <Bookmark className="h-3 w-3 text-blue-600" />
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

              <div className="space-y-3 pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
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
                  <>
                    {/* SAT Answer Choices - Clean Layout */}
                    <div className="space-y-4">
                    <div className="space-y-2 mt-6">
                        {currentQuestion.choices?.map((choice, index) => {
                          const choiceKey = String.fromCharCode(65 + index);
                          const isSelected = selectedAnswer === choiceKey;
                          const isCorrectChoice = currentQuestion.correctAnswer === choice;
                          
                          let buttonStyle = '';
                          
                          if (selectedAnswer && isSelected) {
                            if (isCorrect) {
                              buttonStyle = 'bg-green-700 border-green-800 text-black';
                            } else {
                              buttonStyle = 'bg-red-500 border-red-600 text-white';
                            }
                          } else if (selectedAnswer && isCorrectChoice) {
                            buttonStyle = 'bg-green-700 border-green-800 text-black';
                          } else {
                            buttonStyle = 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';
                          }

                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full h-auto min-h-[48px] rounded-md p-4 text-left justify-start transition-colors ${buttonStyle}`}
                              onClick={() => checkAnswer(choiceKey)}
                              disabled={!!selectedAnswer}
                              style={{
                                ...contentTextStyle,
                                color: selectedAnswer && isSelected && !isCorrect ? '#ffffff' : 
                                       selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? '#ffffff' : 
                                       contentTextStyle.color
                              }}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className={`font-semibold mt-0.5 ${
                                    selectedAnswer && isSelected && !isCorrect ? 'text-white' : 
                                    selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? 'text-white' : 
                                    'text-gray-700'
                                  }`}>{choiceKey}.</span>
                                  <span 
                                    className="flex-1 text-left"
                                    dangerouslySetInnerHTML={{ __html: choice }}
                                  />
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  {selectedAnswer && isSelected && isCorrect && (
                                    <span className="text-xs font-bold text-white mr-1">Correct</span>
                                  )}
                                  {selectedAnswer && isSelected && (
                                    isCorrect ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-red-600" />
                                  )}
                                  {selectedAnswer && !isSelected && isCorrectChoice && (
                                    <Check className="h-4 w-4 text-white" />
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>

                    {/* SAT-style separator - shows after answer is selected */}
                    {activeTab === 'solution' && (
                      <div className="mt-6 pt-4 border-t border-gray-300" style={{ borderWidth: '0.5px' }}>
                        <div className="text-center text-xs text-gray-500 font-medium tracking-wide">
                          • • •
                        </div>
                      </div>
                    )}

                  </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Passage or Solution Below */}
          {(hasPassage || activeTab !== 'problem') && (
            <div className="bg-white p-8">
              {/* Broken Line Spacer */}
              <div className="mb-4 flex justify-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              
              {/* Header - Step by Step Explanation */}
              <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div 
                  className="w-full mr-3 flex items-center justify-center"
                  style={{
                    backgroundColor: '#CFCFCF',
                    height: '24px',
                    borderRadius: '2px'
                  }}
                >
                  <span className="text-sm font-semibold text-blue-700">
                    Step by Step Explanation
                  </span>
                </div>
              </div>
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
                {/* Reading Passage Display */}
                {hasPassage && activeTab === 'problem' && (
                  <>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-800'
                    }`}>
                      📖 Reading Passage
                    </h3>
                    {currentQuestion.passage?.title && (
                      <h4 className={`text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-green-300' : 'text-gray-700'
                      }`}>
                        {currentQuestion.passage.title}
                      </h4>
                    )}
                    <div 
                      style={{
                        ...contentTextStyle,
                        fontSize: `${displaySettings.fontSize - 1}px`,
                        color: isDarkMode ? '#ffffff' : contentTextStyle.color
                      }}
                      className="whitespace-pre-wrap text-sm leading-relaxed"
                    >
                      {currentQuestion.passage?.content}
                    </div>
                    {currentQuestion.passage?.source && (
                      <div className={`text-xs mt-3 opacity-75 ${
                        isDarkMode ? 'text-green-400' : 'text-gray-600'
                      }`}>
                        Source: {currentQuestion.passage.source}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'solution' && (
                  <>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-800'
                    }`}>
                      💡 Solution & Explanation
                    </h3>
                    <TypingAnimation
                      text={formatSolution(currentQuestion)}
                      speed={8}
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
            </div>
          )}
        </div>

        {/* Small Screens: Vertical Stack with Graph Between Question and Choices */}
        <div className="block md:hidden space-y-3">
          {/* Question Section */}
          <div className={`rounded-lg p-4 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            {/* Timer - Positioned above question header */}
            <PracticeTimer 
              timerValue={timerValue}
              mode={mode}
            />
            
            {/* SAT Question Header - Authentic Style */}
            <QuestionHeader questionNumber={currentQuestion.number} chapter={currentQuestion.chapter} />
            
            {/* Question Tracking and Action Icons - Inline Row */}
            <div className="mb-3 flex items-center justify-between">
              {/* Left: Question Tracking */}
              <QuestionTracking
                questionId={currentQuestion.id || `q_${currentQuestionIndex}`}
                onGuessChange={setQuestionGuess}
                onEmotionChange={setQuestionEmotion}
                initialGuess={questionGuess}
                initialEmotion={questionEmotion}
              />
              
              {/* Right: Action Icons */}
              <div className="flex items-center gap-1">
                <HintDialog hint={currentQuestion.hint} currentQuestionIndex={currentQuestionIndex} />
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                  <Flag className="h-3 w-3 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                  <Bookmark className="h-3 w-3 text-blue-600" />
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
            
            
            {/* Graph Section - Above Question Content (Alternative Layout) */}
            {graphUrl && (
              <div className="mb-6 bg-white p-4">
                <div className="flex justify-center">
                  <img 
                    src={graphUrl} 
                    alt="Question Graph" 
                    className="max-w-full h-auto max-h-80"
                    style={{ backgroundColor: 'white' }}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div 
                style={contentTextStyle}
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
              />
            </div>
          </div>

          {/* Answer Choices Section */}
          <div className={`rounded-xl p-6 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            <div className="space-y-3 pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
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
                <>
                  {/* SAT Mobile Answer Choices */}
                  <div className="space-y-4">
                  <div className="space-y-2 mt-6">
                      {currentQuestion.choices?.map((choice, index) => {
                        const choiceKey = String.fromCharCode(65 + index);
                        const isSelected = selectedAnswer === choiceKey;
                        const isCorrectChoice = currentQuestion.correctAnswer === choice;
                        
                        let buttonStyle = '';
                        
                        if (selectedAnswer && isSelected) {
                          if (isCorrect) {
                            buttonStyle = 'bg-green-700 border-green-800 text-black';
                          } else {
                            buttonStyle = 'bg-red-500 border-red-600 text-white';
                          }
                        } else if (selectedAnswer && isCorrectChoice) {
                          buttonStyle = 'bg-green-700 border-green-800 text-black';
                        } else {
                          buttonStyle = 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';
                        }

                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={`w-full h-auto min-h-[48px] rounded-md p-4 text-left justify-start transition-colors ${buttonStyle}`}
                            onClick={() => checkAnswer(choiceKey)}
                            disabled={!!selectedAnswer}
                            style={{
                              ...contentTextStyle,
                              color: selectedAnswer && isSelected && !isCorrect ? '#ffffff' : 
                                     selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? '#ffffff' : 
                                     contentTextStyle.color
                            }}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex items-start gap-3 flex-1">
                                <span className={`font-semibold mt-0.5 ${
                                  selectedAnswer && isSelected && !isCorrect ? 'text-white' : 
                                  selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? 'text-white' : 
                                  'text-gray-700'
                                }`}>{choiceKey}.</span>
                                <span 
                                  className="flex-1 text-left"
                                  dangerouslySetInnerHTML={{ __html: choice }}
                                />
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {selectedAnswer && isSelected && isCorrect && (
                                  <span className="text-xs font-bold text-white mr-1">Correct</span>
                                )}
                                {selectedAnswer && isSelected && (
                                  isCorrect ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-red-600" />
                                )}
                                {selectedAnswer && !isSelected && isCorrectChoice && (
                                  <Check className="h-4 w-4 text-white" />
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                    {/* SAT-style separator - shows after answer is selected (Mobile) */}
                    {activeTab === 'solution' && (
                      <div className="mt-6 pt-4 border-t border-gray-300" style={{ borderWidth: '0.5px' }}>
                        <div className="text-center text-xs text-gray-500 font-medium tracking-wide">
                          • • •
                        </div>
                      </div>
                    )}

                </div>
                </>
              )}
            </div>
          </div>

          {/* Passage or Solution Below for Mobile */}
          {(hasPassage || activeTab !== 'problem') && (
            <div className="bg-white p-8">
              {/* Broken Line Spacer */}
              <div className="mb-4 flex justify-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              
              {/* Header - Step by Step Explanation */}
              <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div 
                  className="w-full mr-3 flex items-center justify-center"
                  style={{
                    backgroundColor: '#CFCFCF',
                    height: '24px',
                    borderRadius: '2px'
                  }}
                >
                  <span className="text-sm font-semibold text-blue-700">
                    Step by Step Explanation
                  </span>
                </div>
              </div>
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
                {/* Reading Passage Display */}
                {hasPassage && activeTab === 'problem' && (
                  <>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-800'
                    }`}>
                      📖 Reading Passage
                    </h3>
                    {currentQuestion.passage?.title && (
                      <h4 className={`text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-green-300' : 'text-gray-700'
                      }`}>
                        {currentQuestion.passage.title}
                      </h4>
                    )}
                    <div 
                      style={{
                        ...contentTextStyle,
                        fontSize: `${displaySettings.fontSize - 1}px`,
                        color: isDarkMode ? '#ffffff' : contentTextStyle.color
                      }}
                      className="whitespace-pre-wrap text-sm leading-relaxed"
                    >
                      {currentQuestion.passage?.content}
                    </div>
                    {currentQuestion.passage?.source && (
                      <div className={`text-xs mt-3 opacity-75 ${
                        isDarkMode ? 'text-green-400' : 'text-gray-600'
                      }`}>
                        Source: {currentQuestion.passage.source}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'solution' && (
                  <>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-800'
                    }`}>
                      💡 Solution & Explanation
                    </h3>
                    <TypingAnimation
                      text={formatSolution(currentQuestion)}
                      speed={8}
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
            {interactions.map((interaction, index) => {
              // Extract only the core tracking fields we agreed on
              const coreData = {
                question_id: interaction.question_id,
                user_id: interaction.user_id,
                is_correct: interaction.is_correct,
                time_spent_seconds: interaction.time_spent_seconds,
                attempted_at: interaction.attempted_at,
                bookmarked: interaction.bookmarked,
                hint_checked: interaction.hint_checked,
                solution_checked: interaction.solution_checked,
                confidence_level: interaction.confidence_level,
                objective_progress: interaction.objective_progress,
                idempotency_key: interaction.idempotency_key,
                attempt_number: interaction.attempt_number
              };

              return (
                <div key={index} className={`p-3 rounded text-xs border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{interaction.question_id || interaction.questionId}</span>
                      <span className={interaction.is_correct ? 'text-green-500' : 'text-red-500'}>
                        {interaction.is_correct ? '✓' : '✗'}
                      </span>
                      <span className="text-gray-500">
                        ⏱️ Time: {interaction.time_spent_seconds}s
                      </span>
                      {interaction.attempt_number && interaction.attempt_number > 1 && (
                        <span className="bg-orange-100 text-orange-600 px-1 rounded text-xs">
                          Attempt #{interaction.attempt_number}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-gray-500 font-medium mb-1">Raw JSON Data:</div>
                    <pre className={`text-xs p-2 rounded overflow-x-auto ${
                      isDarkMode ? 'bg-gray-800 text-green-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {JSON.stringify(coreData, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="text-gray-400 text-xs">
                    {new Date(interaction.attempted_at || interaction.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
            
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
            <strong>Simplified Interaction Structure:</strong>
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
              {`{
  "question_id": "q_123",
  "user_id": "user_123",
  "is_correct": false,
  "time_spent_seconds": 45,
  "attempted_at": "2024-01-15T10:30:00Z",
  "bookmarked": false,
  "hint_checked": false,
  "solution_checked": false,
  "confidence_level": 3,
  "objective_progress": 80,
  "idempotency_key": "user_123_q_123_1704449400000_abc123def",
  "attempt_number": 1
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeDisplay;