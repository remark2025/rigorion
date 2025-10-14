import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Check, X, Bot, Lightbulb, Flag, Calculator, FileText, Trash2, Bookmark } from "lucide-react";
import { Question } from "@/types/QuestionInterface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import HintDialog from "./HintDialog";
import TypingAnimation from "@/components/ui/TypingAnimation";
import AttemptHistory from "./AttemptHistory";
import QuestionHeader from "./QuestionHeader";
import { QuestionTracking } from "./QuestionTracking";
import { PracticeTimer } from "./PracticeTimer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionLogger } from "@/hooks/useInteractionLogger";
import InteractiveMathSolution from "@/components/math/InteractiveMathSolution";
import InteractiveGraph from "@/components/math/InteractiveGraph";
import SolutionStepBuilder from "@/components/math/SolutionStepBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InteractiveReadingSolution from "@/components/reading/InteractiveReadingSolution";
import { getReadingSolution } from "@/data/sampleReadingSolutions";
import SATSolutionGrid from "./SATSolutionGrid";
import EssayCorrection from "@/components/writing/EssayCorrection";
import { CorrectionMark } from "@/types/WritingInterface";
import { aiGrammarService } from "@/services/aiGrammarService";

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
  activeTab: "problem" | "solution" | "quote" | "grid";
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
  selectedAnswers?: Record<number, string>;
  onAnswerSelect?: (questionIndex: number, answer: string) => void;
  questions?: Question[]; // Full questions array for SAT test manager
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
  selectedAnswers = {},
  onAnswerSelect,
  questions = [],
}: PracticeDisplayProps) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { logInteraction } = useInteractionLogger();

  // Helper function to parse timer value
  const parseTimerValue = (timerValue: string): number => {
    const timeParts = timerValue.split(':').map(Number);
    if (timeParts.length === 2) {
      return timeParts[0] * 60 + timeParts[1]; // MM:SS
    } else if (timeParts.length === 3) {
      return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]; // HH:MM:SS
    }
    return 0; // fallback
  };
  
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(null);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(null);
  const [showGoToInput, setShowGoToInput] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [writingCorrections, setWritingCorrections] = useState<CorrectionMark[]>([]);
  const [writingAnalysisComplete, setWritingAnalysisComplete] = useState(false);
  
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
  const [solutionSubTab, setSolutionSubTab] = useState<"interactive" | "step-by-step" | "raw">("interactive");

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
    
    // Reset solution sub-tab when question changes - prefer interactive if available, otherwise step-by-step
    if (currentQuestion?.interactiveSolution) {
      setSolutionSubTab("interactive");
    } else {
      setSolutionSubTab("step-by-step");
    }
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
    // Debug logging for skill tracking fields
    console.log('🔍 Question skill tracking fields:', {
      id: currentQuestion?.id,
      module: currentQuestion?.module,
      chapter: currentQuestion?.chapter,
      exam: currentQuestion?.exam,
      level: currentQuestion?.level,
      difficulty: currentQuestion?.difficulty,
      topic: currentQuestion?.topic
    });
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
    
    const userId = user?.id || "anonymous";
    const questionId = currentQuestion?.id;
    const attemptNumber = getAttemptNumber(questionId || 'unknown');
    // Generate a proper UUID for idempotency_key
    const idempotencyKey = crypto.randomUUID();

    const interaction = {
      // ✅ Clean core tracking fields - no duplicates
      question_id: questionId,
      is_correct: isCorrectAnswer,
      time_spent_seconds: timeSpent,
      attempted_at: new Date().toISOString(),
      bookmarked: isBookmarked,
      hint_checked: hintsViewed.length > 0,
      solution_checked: solutionAccessed,
      confidence_level: questionGuess,
      objective_progress: objectiveProgress.targetProgress,
      idempotency_key: idempotencyKey,
      
      // ✅ Enhanced skill tracking fields - using properly mapped fields
      module: currentQuestion?.module || null, // 'math', 'reading', 'writing'
      chapter: typeof currentQuestion?.chapter === 'number' ? currentQuestion.chapter : null, // number from enhanced content pack
      exam: currentQuestion?.exam || null, // number from enhanced content pack
      level: currentQuestion?.level || null, // 'easy', 'medium', 'difficult'
      topic: currentQuestion?.topic || null,
      question_type: 'multiple_choice',

      // ✅ Additional tracking for internal use
      session_id: sessionId,
      answer_changes: answerChangeCount,
      hints_used: [...hintsViewed],
      solution_viewed: solutionAccessed
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
      
      // Log interaction using improved interaction logger
      if (user && currentQuestion) {
        const timeSpent = mode === "timer" && timerValue ? 
          parseTimerValue(timerValue) : 
          Math.round((Date.now() - questionStartTime) / 1000);

        logInteraction({
          question: currentQuestion,
          selectedAnswer: answer,
          isCorrect: correct,
          timeSpentSeconds: timeSpent,
          practiceMode: mode === "timer" ? "timed" : mode === "exam" ? "mock_test" : "untimed",
          practiceSessionId: sessionId,
          questionIndexInSession: currentQuestionIndex,
          totalQuestionsInSession: totalQuestions,
          confidenceLevel: questionGuess,
          hintChecked: hintsViewed.length > 0,
          solutionChecked: solutionAccessed,
          bookmarked: isBookmarked
        }).catch(error => {
          console.error('❌ Failed to log interaction:', error);
          // Continue with local tracking even if server logging fails
        });
      } else {
        console.warn('⚠️ User not authenticated or no question, skipping server logging');
      }
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
      // Get comprehensive AI analysis
      const result = await aiGrammarService.analyzeEssay(writingAnswer);
      setWritingCorrections(result.corrections);
      setWritingAnalysisComplete(true);
      
      // Log interaction with analysis results
      logInteraction({
        type: 'writing_submission',
        questionId: currentQuestion?.id || 'unknown',
        response: writingAnswer,
        timestamp: new Date().toISOString(),
        module: currentQuestion?.module || null,
        chapter: currentQuestion?.chapter || null,
        difficulty: currentQuestion?.difficulty || null,
        corrections_count: result.corrections.length,
        sat_score: result.satScore.total
      });
      
      setAiEvaluation(
        `AI Analysis Complete! Found ${result.corrections.length} areas for improvement. ` +
        `SAT Writing Score: ${result.satScore.total}/100. Review the detailed feedback below.`
      );
    } catch (error) {
      console.error('AI evaluation error:', error);
      setAiEvaluation('AI analysis temporarily unavailable. Your response has been recorded.');
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

  // Generate essay corrections for writing answers
  const generateEssayCorrections = (essayText: string): { corrections: CorrectionMark[], feedback: any } => {
    const corrections: CorrectionMark[] = [];
    
    // Simple pattern-based corrections (in production, this would use AI)
    let startIndex = 0;
    const patterns = [
      {
        search: /\beffect\b/gi,
        replace: 'affect',
        type: 'word_choice' as const,
        explanation: '"Affect" is a verb meaning to influence, while "effect" is a noun meaning a result.',
        rule: 'Effect vs. Affect'
      },
      {
        search: /\bthere\b(?=\s+(argument|point|idea))/gi,
        replace: 'their',
        type: 'grammar' as const,
        explanation: '"Their" shows possession, while "there" indicates location.',
        rule: 'Homophones: There/Their/They\'re'
      },
      {
        search: /\balot\b/gi,
        replace: 'a lot',
        type: 'spelling' as const,
        explanation: '"A lot" is always written as two separate words.',
        rule: 'Common Spelling Error'
      },
      {
        search: /\bits\b(?=\s+important)/gi,
        replace: "it's",
        type: 'grammar' as const,
        explanation: '"It\'s" is a contraction meaning "it is."',
        rule: 'Contractions: It\'s vs. Its'
      }
    ];

    patterns.forEach(pattern => {
      const matches = [...essayText.matchAll(pattern.search)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          corrections.push({
            type: pattern.type,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            originalText: match[0],
            correctedText: pattern.replace,
            explanation: pattern.explanation,
            grammarRule: pattern.rule
          });
        }
      });
    });

    const feedback = {
      strengths: [
        "Clear thesis statement and essay structure",
        "Good use of examples to support arguments",
        "Appropriate length for the assignment"
      ],
      weaknesses: [
        "Some grammar errors that could be avoided with proofreading",
        "Consider using more varied vocabulary",
        "Could benefit from stronger transitional phrases"
      ],
      suggestions: [
        "Proofread for common word confusions (effect/affect, there/their)",
        "Use spell-check before submitting",
        "Read your essay aloud to catch grammatical errors",
        "Practice writing complex sentences with proper punctuation"
      ],
      score: Math.max(65, Math.min(95, 75 + Math.floor(Math.random() * 15)))
    };

    return { corrections, feedback };
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
    <>
      <div className="min-h-screen w-full bg-white" style={{ scrollbarGutter: 'stable' }}>
      {/* SAT Math Practice Layout Container */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Question Section - Flexible Width */}
        <div className="flex-1 border-r border-gray-200 overflow-y-auto p-8">
          
          {/* Question Header */}
          
          {/* SAT Question Header with Timer and Navigation */}
          <QuestionHeader 
            questionNumber={currentQuestion.number} 
            chapter={currentQuestion.chapter}
            timerValue={timerValue}
            mode={mode}
            onNext={onNext}
            onPrev={onPrev}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
          />
          
          {/* Question Tracking and Action Icons Row */}
          <div className="mb-8 flex items-center justify-between">
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
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded hover:bg-gray-100 transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                <Flag className="h-4 w-4 text-blue-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-8 w-8 rounded hover:bg-gray-100 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                onClick={trackBookmark}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-blue-600'}`} />
              </Button>
              {/* Calculator Icon */}
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
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
                className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                onClick={() => setShowInteractionLog(!showInteractionLog)}
              >
                <FileText className="h-3 w-3 text-blue-500" />
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
            {/* SAT Writing Mode - Simple Input */}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing with AI...
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
                          buttonStyle = 'bg-green-500 border-green-600 text-white';
                          animationClass = 'transition-all duration-300 scale-105';
                        } else {
                          buttonStyle = 'bg-red-500 border-red-600 text-white';
                          animationClass = 'transition-all duration-300 scale-105';
                        }
                      } else if (selectedAnswer && isCorrectChoice) {
                        buttonStyle = 'bg-green-500 border-green-600 text-white';
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
                          className={`w-full h-auto min-h-[30px] rounded-full px-2 py-1.5 text-center justify-center transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${buttonStyle} ${animationClass}`}
                          style={{ 
                            fontFamily: getFontFamily(),
                            fontSize: '12px',
                            fontWeight: '500',
                            boxShadow: selectedAnswer && isSelected && isCorrect 
                              ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                              : selectedAnswer && (isSelected && !isCorrect)
                              ? '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
                              : selectedAnswer && isCorrectChoice
                              ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                              : undefined
                          }}
                          onClick={() => checkAnswer(choiceKey)}
                          disabled={!!selectedAnswer}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`text-sm font-bold flex-shrink-0 ${
                                selectedAnswer && isSelected && !isCorrect ? 'text-white' : 
                                selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? 'text-white' : 
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{choiceKey}</span>
                              <span 
                                className="text-xs leading-tight text-left flex-1"
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
            <div className="bg-white p-4 mt-2">
              {/* Broken Line Spacer */}
              <div className="mb-4 flex justify-center">
                <div 
                  className="w-full"
                  style={{
                    height: '2px',
                    background: 'transparent',
                    boxShadow: 'none'
                  }}
                ></div>
              </div>
              
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
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


        {/* Column 2: Passage for Reading Questions OR Solution/Key Idea - 25% wider */}
        {(hasPassage || activeTab !== 'problem') && (
          <div className={`${
            hasGraph ? 'w-1/2' : 'w-3/5'
          } p-8 relative overflow-y-auto max-h-[calc(100vh-120px)] bg-white`}>
            
            {/* Vertical Spacer for side-by-side layout */}
            <div className="absolute left-0 top-4 bottom-4 flex items-center">
              <div 
                className="h-full bg-gray-200"
                style={{
                  width: '1px'
                }}
              ></div>
            </div>
            
            
            <div className="pb-4 overflow-y-auto max-h-[calc(100vh-220px)]" style={{ borderBottom: '2px solid #CFCFCF' }}>
              {/* Reading Passage Display - Show passage only when not viewing solution */}
              {hasPassage && activeTab !== 'solution' && (
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

              {/* Solution Section with Sub-Tabs */}
              {activeTab === 'solution' && (
                <>
                  {hasPassage ? (
                    // Show Interactive Reading Solution for passage questions
                    <InteractiveReadingSolution
                      passageText={currentQuestion.passage?.content || ''}
                      readingSolution={getReadingSolution(currentQuestion.id) || getReadingSolution("READING-CLIMATE-001")!}
                    />
                  ) : (
                    // Show regular math solution for non-passage questions
                    <Tabs value={solutionSubTab} onValueChange={(value) => setSolutionSubTab(value as any)} className="w-full">
                      <TabsList 
                        className="grid w-full grid-cols-3 mb-1 rounded-sm"
                        style={{
                          background: '#CFCFCF',
                          height: '28px',
                          padding: '3px',
                          borderRadius: '2px',
                          marginTop: '4px',
                          marginBottom: '4px'
                        }}
                      >
                        <TabsTrigger 
                          value="interactive" 
                          disabled={!currentQuestion.interactiveSolution}
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-sm h-6"
                        >
                          Interactive
                        </TabsTrigger>
                        <TabsTrigger 
                          value="step-by-step" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-sm h-6"
                        >
                          Step-by-Step
                        </TabsTrigger>
                        <TabsTrigger 
                          value="raw" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-sm h-6"
                        >
                          Raw Solution
                        </TabsTrigger>
                      </TabsList>
                    
                    <TabsContent value="interactive" className="mt-0 pt-0">
                      {currentQuestion.interactiveSolution ? (
                        <div className="space-y-4">
                          {/* Interactive Graph */}
                          {currentQuestion.interactiveSolution.hasInteractiveGraph && (
                            <InteractiveGraph
                              equation="y = ax² + bx + c"
                              parameters={currentQuestion.interactiveSolution.parameters || []}
                              config={currentQuestion.interactiveSolution.graphConfig || {
                                type: 'linear',
                                xRange: [-5, 5],
                                yRange: [-5, 5],
                                showGrid: true,
                                showAxis: true,
                                title: 'Interactive Graph'
                              }}
                              onParameterChange={(params) => console.log('Parameters changed:', params)}
                            />
                          )}
                          
                        </div>
                      ) : (
                        <div className={`text-center p-6 rounded-lg ${
                          isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
                        }`}>
                          <p>🔧 Interactive solution not available for this question</p>
                          <p className="text-xs mt-2">Try the Step-by-Step or Raw Solution tabs</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="step-by-step" className="mt-0 pt-0">
                      {isSATWriting ? (
                        <div className="w-full space-y-6 bg-white">
                          {/* Student's Essay Correction */}
                          {writingAnswer.trim() ? (
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Your Essay - Teacher Corrections
                              </h3>
                              {writingAnalysisComplete && writingCorrections.length > 0 ? (
                                <EssayCorrection
                                  originalEssay={writingAnswer}
                                  corrections={writingCorrections}
                                  overallFeedback={{
                                    strengths: ["Response submitted for analysis"],
                                    weaknesses: ["Check detailed AI feedback above"],
                                    suggestions: ["Review each correction to improve your writing"]
                                  }}
                                />
                              ) : writingAnalysisComplete ? (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                  <p className="text-green-800 font-medium">Excellent work! No major issues found.</p>
                                  <p className="text-green-600 text-sm mt-1">Your writing demonstrates good SAT Writing conventions.</p>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>Click "Get AI Feedback" to analyze your essay</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Sample Essay Solutions */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Solution 1 - High Score Essay */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-gray-800">Sample Essay - High Score (4/4)</h3>
                                  <div className="prose prose-sm max-w-none">
                                    <div className="space-y-3 text-sm leading-relaxed">
                                      <p className="p-3 bg-white border-l-4 border-gray-300">
                                        <span className="font-semibold text-gray-700">[Introduction]</span> Social media has fundamentally transformed how teenagers communicate and learn, making it an integral part of modern education rather than a distraction to be eliminated during school hours.
                                      </p>
                                      <p className="p-3 bg-white border-l-4 border-gray-300">
                                        <span className="font-semibold text-gray-700">[Body 1 - Educational Benefits]</span> Schools that embrace social media platforms like Twitter and Instagram for educational purposes report increased student engagement and collaborative learning opportunities.
                                      </p>
                                      <p className="p-3 bg-white border-l-4 border-gray-300">
                                        <span className="font-semibold text-gray-700">[Body 2 - Real-world Skills]</span> Furthermore, digital literacy and online communication skills are essential for students' future careers, making social media restriction counterproductive to their professional development.
                                      </p>
                                      <p className="p-3 bg-white border-l-4 border-gray-300">
                                        <span className="font-semibold text-gray-700">[Counterargument]</span> While critics argue that social media causes distraction, proper guidance and structured use can transform these platforms into powerful educational tools.
                                      </p>
                                      <p className="p-3 bg-white border-l-4 border-gray-300">
                                        <span className="font-semibold text-gray-700">[Conclusion]</span> Rather than restricting social media, schools should integrate it meaningfully into their curriculum to prepare students for a digitally connected world.
                                      </p>
                                    </div>
                                  </div>
                              
                              {/* Structure Analysis */}
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Clear thesis statement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Evidence-based arguments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Smooth transitions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Addresses opposition</span>
                                </div>
                              </div>
                            </div>

                            {/* Solution 2 - Medium Score Essay */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800">Sample Essay - Good Score (3/4)</h3>
                              <div className="prose prose-sm max-w-none">
                                <div className="space-y-3 text-sm leading-relaxed">
                                  <p className="p-3 bg-white border-l-4 border-gray-300">
                                    <span className="font-semibold text-gray-700">[Introduction]</span> I think social media should not be limited in schools because students need to learn how to use it properly.
                                  </p>
                                  <p className="p-3 bg-white border-l-4 border-gray-300">
                                    <span className="font-semibold text-gray-700">[Body 1 - Basic Point]</span> Social media helps students communicate with each other about homework and projects.
                                  </p>
                                  <p className="p-3 bg-white border-l-4 border-gray-300">
                                    <span className="font-semibold text-gray-700">[Body 2 - Weak Development]</span> Many students use social media every day so they are already good at it.
                                  </p>
                                  <p className="p-3 bg-white border-l-4 border-gray-300">
                                    <span className="font-semibold text-gray-700">[Conclusion]</span> In conclusion, social media should be allowed in schools because it can be helpful for learning.
                                  </p>
                                </div>
                              </div>
                              
                              {/* Issues Analysis */}
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Weak thesis statement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Lacks specific evidence</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>Basic organization</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                  <span>No counterarguments</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Structure Visualization */}
                          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
                            <h4 className="text-lg font-semibold mb-4">Essay Structure Comparison</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-2">Strong Essay Structure</h5>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">I</div>
                                    <span className="text-sm">Hook + Clear Thesis</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">B1</div>
                                    <span className="text-sm">Evidence + Analysis</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">B2</div>
                                    <span className="text-sm">Different Evidence + Analysis</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">CA</div>
                                    <span className="text-sm">Counterargument + Refutation</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">C</div>
                                    <span className="text-sm">Restate + Broader Impact</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-2">Weak Essay Issues</h5>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">X</div>
                                    <span className="text-sm">Vague thesis statement</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">X</div>
                                    <span className="text-sm">No specific evidence</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">X</div>
                                    <span className="text-sm">Weak transitions</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">X</div>
                                    <span className="text-sm">Missing counterarguments</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">X</div>
                                    <span className="text-sm">Repetitive conclusion</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          {currentQuestion.solutionSteps && currentQuestion.solutionSteps.length > 0 ? (
                            <SolutionStepBuilder
                              steps={currentQuestion.solutionSteps.map((step, index) => ({
                                id: `step-${index + 1}`,
                                title: `Step ${index + 1}`,
                                description: '',
                                fromExpression: { latex: '', display: step },
                                toExpression: { latex: '', display: '' },
                                explanation: step,
                                hint: `This is step ${index + 1} of the solution`
                              }))}
                              title="Step-by-Step Solution"
                              onStepComplete={(stepId, isCorrect) => console.log('Step completed:', stepId, isCorrect)}
                              onAllStepsComplete={() => console.log('All steps completed!')}
                              showHints={true}
                            />
                          ) : (
                            <div className="space-y-4">
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
                          )}
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="raw" className="mt-0 pt-0">
                      <div className="p-4 rounded-lg border border-gray-200" style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), white'
                      }}>
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
                    </TabsContent>
                    </Tabs>
                  )}
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

              {/* SAT Solution Grid Section */}
              {activeTab === 'grid' && onAnswerSelect && (
                <SATSolutionGrid
                  currentQuestion={currentQuestion}
                  totalQuestions={totalQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  onQuestionSelect={(index) => onJumpTo && onJumpTo(index)}
                  selectedAnswers={selectedAnswers}
                  onAnswerSelect={onAnswerSelect}
                />
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
            } rounded-xl p-8 transition-colors ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
              
              {/* SAT Question Header with Timer and Navigation */}
              <QuestionHeader 
                questionNumber={currentQuestion.number} 
                chapter={currentQuestion.chapter}
                timerValue={timerValue}
                mode={mode}
                onNext={onNext}
                onPrev={onPrev}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
              />
              
              {/* Question Tracking and Action Icons Row */}
              <div className="mb-8 flex items-center justify-between">
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
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                    <Flag className="h-3 w-3 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                    <Bookmark className="h-3 w-3 text-blue-600" />
                  </Button>
                  {/* Calculator Icon */}
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
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
                    className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                    onClick={() => setShowInteractionLog(!showInteractionLog)}
                  >
                    <FileText className="h-3 w-3 text-blue-500" />
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
                  <div className="w-full bg-white rounded-lg">
                    <div className="text-center py-6 text-gray-600">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Writing interface is available in the main question area above.</p>
                      <p className="text-sm mt-1">Use the comprehensive template system to build your essay.</p>
                    </div>
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
                              buttonStyle = 'bg-green-500 border-green-600 text-white';
                            } else {
                              buttonStyle = 'bg-red-500 border-red-600 text-white';
                            }
                          } else if (selectedAnswer && isCorrectChoice) {
                            buttonStyle = 'bg-green-500 border-green-600 text-white';
                          } else {
                            buttonStyle = 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';
                          }

                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full h-auto min-h-[48px] rounded-md p-4 text-left justify-start transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${buttonStyle}`}
                              onClick={() => checkAnswer(choiceKey)}
                              disabled={!!selectedAnswer}
                              style={{
                                ...contentTextStyle,
                                color: selectedAnswer && isSelected && !isCorrect ? '#ffffff' : 
                                       selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? '#ffffff' : 
                                       contentTextStyle.color,
                                boxShadow: selectedAnswer && isSelected && isCorrect 
                                  ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                                  : selectedAnswer && (isSelected && !isCorrect)
                                  ? '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
                                  : selectedAnswer && isCorrectChoice
                                  ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                                  : undefined
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
                      <div className="mt-6 pt-4 border-t border-gray-200" style={{ borderWidth: '1px' }}>
                        <div className="text-center text-xs text-gray-400 font-medium tracking-wide">
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
                <div 
                  className="w-full"
                  style={{
                    height: '2px',
                    background: 'transparent',
                    boxShadow: 'none'
                  }}
                ></div>
              </div>
              
              {/* Header - Step by Step Explanation */}
              <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div 
                  className="w-full mr-3 flex items-center justify-center"
                  style={{
                    background: 'white',
                    height: '24px',
                    borderRadius: '2px',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <span className="text-sm font-semibold text-white">
                    Step by Step Explanation
                  </span>
                </div>
              </div>
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
                {/* Reading Passage Display - Show passage only when not viewing solution */}
                {hasPassage && activeTab !== 'solution' && (
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
                    {hasPassage ? (
                      // Show Interactive Reading Solution for passage questions
                      <InteractiveReadingSolution
                        passageText={currentQuestion.passage?.content || ''}
                        readingSolution={getReadingSolution(currentQuestion.id) || getReadingSolution("READING-CLIMATE-001")!}
                      />
                    ) : (
                      // Show regular math solution for non-passage questions
                      <Tabs value={solutionSubTab} onValueChange={(value) => setSolutionSubTab(value as any)} className="w-full">
                      <TabsList 
                      className="grid w-full grid-cols-3 mb-1 rounded-sm"
                      style={{
                        background: 'white',
                        height: '28px',
                        padding: '2px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                        <TabsTrigger 
                          value="interactive" 
                          disabled={!currentQuestion.interactiveSolution}
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Interactive
                        </TabsTrigger>
                        <TabsTrigger 
                          value="step-by-step" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Step-by-Step
                        </TabsTrigger>
                        <TabsTrigger 
                          value="raw" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Raw Solution
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="interactive" className="mt-0 pt-0">
                        {currentQuestion.interactiveSolution ? (
                          <div className="space-y-4">
                            {/* Interactive Graph */}
                            {currentQuestion.interactiveSolution.hasInteractiveGraph && (
                              <InteractiveGraph
                                equation="y = ax² + bx + c"
                                parameters={currentQuestion.interactiveSolution.parameters || []}
                                config={currentQuestion.interactiveSolution.graphConfig || {
                                  type: 'linear',
                                  xRange: [-5, 5],
                                  yRange: [-5, 5],
                                  showGrid: true,
                                  showAxis: true,
                                  title: 'Interactive Graph'
                                }}
                                onParameterChange={(params) => console.log('Parameters changed:', params)}
                              />
                            )}
                            
                          </div>
                        ) : (
                          <div className={`text-center p-6 rounded-lg ${
                            isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
                          }`}>
                            <p>🔧 Interactive solution not available for this question</p>
                            <p className="text-xs mt-2">Try the Step-by-Step or Raw Solution tabs</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="step-by-step" className="mt-0 pt-0">
                        {currentQuestion.solutionSteps && currentQuestion.solutionSteps.length > 0 ? (
                          <SolutionStepBuilder
                            steps={currentQuestion.solutionSteps.map((step, index) => ({
                              id: `step-${index + 1}`,
                              title: `Step ${index + 1}`,
                              description: '',
                              fromExpression: { latex: '', display: step },
                              toExpression: { latex: '', display: '' },
                              explanation: step,
                              hint: `This is step ${index + 1} of the solution`
                            }))}
                            title="Step-by-Step Solution"
                            onStepComplete={(stepId, isCorrect) => console.log('Step completed:', stepId, isCorrect)}
                            onAllStepsComplete={() => console.log('All steps completed!')}
                            showHints={true}
                          />
                        ) : (
                          <div className="space-y-4">
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
                        )}
                      </TabsContent>
                      
                      <TabsContent value="raw" className="mt-0 pt-0">
                        <div className="p-4 rounded-lg border border-gray-200" style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), white'
                        }}>
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
                      </TabsContent>
                      </Tabs>
                    )}
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

                {/* SAT Solution Grid Section */}
                {activeTab === 'grid' && onAnswerSelect && (
                  <SATSolutionGrid
                    currentQuestion={currentQuestion}
                    totalQuestions={totalQuestions}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={(index) => onJumpTo && onJumpTo(index)}
                    selectedAnswers={selectedAnswers}
                    onAnswerSelect={onAnswerSelect}
                    questions={questions}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Small Screens: Vertical Stack with Graph Between Question and Choices */}
        <div className="block md:hidden space-y-3">
          {/* Question Section */}
          <div className={`rounded-lg p-8 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`} style={{ backgroundColor: isDarkMode ? undefined : boardColor }}>
            {/* SAT Question Header with Timer and Navigation */}
            <QuestionHeader 
              questionNumber={currentQuestion.number} 
              chapter={currentQuestion.chapter}
              timerValue={timerValue}
              mode={mode}
              onNext={onNext}
              onPrev={onPrev}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
            />
            
            {/* Question Tracking and Action Icons Row */}
            <div className="mb-8 flex items-center justify-between">
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
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                  <Flag className="h-3 w-3 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
                  <Bookmark className="h-3 w-3 text-blue-600" />
                </Button>
                {/* Calculator Icon */}
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95">
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
                  className="p-1 h-6 w-6 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                  onClick={() => setShowInteractionLog(!showInteractionLog)}
                >
                  <FileText className="h-3 w-3 text-blue-500" />
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
                <div className="w-full bg-white rounded-lg">
                  <div className="text-center py-6 text-gray-600">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>Writing interface is available in the main question area above.</p>
                    <p className="text-sm mt-1">Use the comprehensive template system to build your essay.</p>
                  </div>
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
                            buttonStyle = 'bg-green-500 border-green-600 text-white';
                          } else {
                            buttonStyle = 'bg-red-500 border-red-600 text-white';
                          }
                        } else if (selectedAnswer && isCorrectChoice) {
                          buttonStyle = 'bg-green-500 border-green-600 text-white';
                        } else {
                          buttonStyle = 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';
                        }

                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={`w-full h-auto min-h-[48px] rounded-md p-4 text-left justify-start transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${buttonStyle}`}
                            onClick={() => checkAnswer(choiceKey)}
                            disabled={!!selectedAnswer}
                            style={{
                              ...contentTextStyle,
                              color: selectedAnswer && isSelected && !isCorrect ? '#ffffff' : 
                                     selectedAnswer && (isSelected && isCorrect || isCorrectChoice) ? '#ffffff' : 
                                     contentTextStyle.color,
                              boxShadow: selectedAnswer && isSelected && isCorrect 
                                ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                                : selectedAnswer && (isSelected && !isCorrect)
                                ? '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
                                : selectedAnswer && isCorrectChoice
                                ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                                : undefined
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
                      <div className="mt-6 pt-4 border-t border-gray-200" style={{ borderWidth: '1px' }}>
                        <div className="text-center text-xs text-gray-400 font-medium tracking-wide">
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
                <div 
                  className="w-full"
                  style={{
                    height: '2px',
                    background: 'transparent',
                    boxShadow: 'none'
                  }}
                ></div>
              </div>
              
              {/* Header - Step by Step Explanation */}
              <div className="mb-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div 
                  className="w-full mr-3 flex items-center justify-center"
                  style={{
                    background: 'white',
                    height: '24px',
                    borderRadius: '2px',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <span className="text-sm font-semibold text-white">
                    Step by Step Explanation
                  </span>
                </div>
              </div>
              
              <div className="pb-4" style={{ borderBottom: '2px solid #CFCFCF' }}>
                {/* Reading Passage Display - Show passage only when not viewing solution */}
                {hasPassage && activeTab !== 'solution' && (
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
                    {hasPassage ? (
                      // Show Interactive Reading Solution for passage questions
                      <InteractiveReadingSolution
                        passageText={currentQuestion.passage?.content || ''}
                        readingSolution={getReadingSolution(currentQuestion.id) || getReadingSolution("READING-CLIMATE-001")!}
                      />
                    ) : (
                      // Show regular math solution for non-passage questions
                      <Tabs value={solutionSubTab} onValueChange={(value) => setSolutionSubTab(value as any)} className="w-full">
                      <TabsList 
                      className="grid w-full grid-cols-3 mb-1 rounded-sm"
                      style={{
                        background: 'white',
                        height: '28px',
                        padding: '2px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                        <TabsTrigger 
                          value="interactive" 
                          disabled={!currentQuestion.interactiveSolution}
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Interactive
                        </TabsTrigger>
                        <TabsTrigger 
                          value="step-by-step" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Step-by-Step
                        </TabsTrigger>
                        <TabsTrigger 
                          value="raw" 
                          className="text-xs font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-700 rounded-sm h-6"
                        >
                          Raw Solution
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="interactive" className="mt-0 pt-0">
                        {currentQuestion.interactiveSolution ? (
                          <div className="space-y-4">
                            {/* Interactive Graph */}
                            {currentQuestion.interactiveSolution.hasInteractiveGraph && (
                              <InteractiveGraph
                                equation="y = ax² + bx + c"
                                parameters={currentQuestion.interactiveSolution.parameters || []}
                                config={currentQuestion.interactiveSolution.graphConfig || {
                                  type: 'linear',
                                  xRange: [-5, 5],
                                  yRange: [-5, 5],
                                  showGrid: true,
                                  showAxis: true,
                                  title: 'Interactive Graph'
                                }}
                                onParameterChange={(params) => console.log('Parameters changed:', params)}
                              />
                            )}
                            
                          </div>
                        ) : (
                          <div className={`text-center p-6 rounded-lg ${
                            isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
                          }`}>
                            <p>🔧 Interactive solution not available for this question</p>
                            <p className="text-xs mt-2">Try the Step-by-Step or Raw Solution tabs</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="step-by-step" className="mt-0 pt-0">
                        {currentQuestion.solutionSteps && currentQuestion.solutionSteps.length > 0 ? (
                          <SolutionStepBuilder
                            steps={currentQuestion.solutionSteps.map((step, index) => ({
                              id: `step-${index + 1}`,
                              title: `Step ${index + 1}`,
                              description: '',
                              fromExpression: { latex: '', display: step },
                              toExpression: { latex: '', display: '' },
                              explanation: step,
                              hint: `This is step ${index + 1} of the solution`
                            }))}
                            title="Step-by-Step Solution"
                            onStepComplete={(stepId, isCorrect) => console.log('Step completed:', stepId, isCorrect)}
                            onAllStepsComplete={() => console.log('All steps completed!')}
                            showHints={true}
                          />
                        ) : (
                          <div className="space-y-4">
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
                        )}
                      </TabsContent>
                      
                      <TabsContent value="raw" className="mt-0 pt-0">
                        <div className="p-4 rounded-lg border border-gray-200" style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), white'
                        }}>
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
                      </TabsContent>
                      </Tabs>
                    )}
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

                {/* SAT Solution Grid Section */}
                {activeTab === 'grid' && onAnswerSelect && (
                  <SATSolutionGrid
                    currentQuestion={currentQuestion}
                    totalQuestions={totalQuestions}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={(index) => onJumpTo && onJumpTo(index)}
                    selectedAnswers={selectedAnswers}
                    onAnswerSelect={onAnswerSelect}
                    questions={questions}
                  />
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
    </>
  );
};

export default PracticeDisplay;
