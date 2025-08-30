import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowDown, 
  Lightbulb, 
  RotateCcw,
  Eye,
  EyeOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  VolumeOff,
  Square
} from 'lucide-react';
import { mathSounds } from '@/utils/mathSounds';
import { COMPONENT_THEMES, PROFESSIONAL_COLORS } from '@/utils/professionalColors';

// Professional Clean Color Scheme
const PROFESSIONAL_MATH_COLORS = {
  primary: PROFESSIONAL_COLORS.keyStaff.blue,
  secondary: PROFESSIONAL_COLORS.accents.steel,
  accent: PROFESSIONAL_COLORS.keyStaff.orange,
  success: PROFESSIONAL_COLORS.accents.forestGreen,
  warning: PROFESSIONAL_COLORS.keyStaff.deepOrange,
  error: '#EF4444',
  connecting: '#10B981', // Green for connecting lines
  background: {
    light: 'rgba(248, 250, 252, 0.95)',
    medium: 'rgba(241, 245, 249, 0.8)',
    step: '#FFFFFF'
  }
};

interface MathExpression {
  latex: string;
  display: string;
  editable?: boolean;
  placeholder?: string;
}

interface SolutionStep {
  id: string;
  title: string;
  description: string;
  fromExpression: MathExpression;
  toExpression: MathExpression;
  explanation: string;
  hint?: string;
  userInput?: string;
  isCorrect?: boolean;
  interactive?: {
    type: 'fill-blank' | 'drag-drop' | 'multiple-choice' | 'input';
    options?: string[];
    blanks?: string[];
    correctAnswer?: string;
  };
}

interface SolutionStepBuilderProps {
  steps: SolutionStep[];
  title: string;
  onStepComplete?: (stepId: string, isCorrect: boolean, userAnswer?: string) => void;
  onAllStepsComplete?: () => void;
  showHints?: boolean;
  className?: string;
}

// Add keyframes for moving gradient animation
const gradientKeyframes = `
  @keyframes gradient-move {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('gradient-animation-styles')) {
  const style = document.createElement('style');
  style.id = 'gradient-animation-styles';
  style.textContent = gradientKeyframes;
  document.head.appendChild(style);
}

export const SolutionStepBuilder: React.FC<SolutionStepBuilderProps> = ({
  steps,
  title,
  onStepComplete,
  onAllStepsComplete,
  showHints = true,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepInputs, setStepInputs] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set([0]));
  const [autoPlay, setAutoPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [timerVisible, setTimerVisible] = useState(true);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (!timerPaused && timerVisible) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerPaused, timerVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice narration functions
  const speakText = async (text: string, stepId?: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    setIsReading(true);
    setCurrentlySpeaking(stepId || null);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsReading(false);
      setCurrentlySpeaking(null);
    };
    
    utterance.onerror = () => {
      setIsReading(false);
      setCurrentlySpeaking(null);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setCurrentlySpeaking(null);
  };

  const speakStep = (step: SolutionStep) => {
    const textToSpeak = `Step ${steps.indexOf(step) + 1}: ${step.title}. ${step.description}. ${step.explanation}`;
    speakText(textToSpeak, step.id);
  };

  const handleStepInput = (stepId: string, value: string) => {
    setStepInputs(prev => ({ ...prev, [stepId]: value }));
  };

  const validateStep = useCallback((step: SolutionStep, userInput: string): boolean => {
    if (!step.interactive) return true;

    const correctAnswer = step.interactive.correctAnswer?.toLowerCase().trim();
    const userAnswer = userInput.toLowerCase().trim();

    // Handle different validation types
    switch (step.interactive.type) {
      case 'fill-blank':
      case 'input':
        return correctAnswer === userAnswer;
      case 'multiple-choice':
        return step.interactive.options?.some(option => 
          option.toLowerCase().trim() === userAnswer
        ) && correctAnswer === userAnswer;
      default:
        return true;
    }
  }, []);

  const completeStep = async (stepId: string, stepIndex: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const userInput = stepInputs[stepId] || '';
    const isCorrect = validateStep(step, userInput);

    // Play sound based on correctness
    if (soundEnabled) {
      if (isCorrect) {
        await mathSounds.playStepComplete();
      } else {
        await mathSounds.playError();
      }
    }

    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Reveal next step with enhanced animation
    if (stepIndex < steps.length - 1) {
      setTimeout(() => {
        setRevealedSteps(prev => new Set([...prev, stepIndex + 1]));
        setCurrentStep(stepIndex + 1);
      }, isCorrect ? 500 : 1000); // Longer delay if incorrect
    }

    onStepComplete?.(stepId, isCorrect, userInput);

    // Check if all steps are complete
    if (completedSteps.size + 1 >= steps.length) {
      setTimeout(async () => {
        if (soundEnabled) {
          await mathSounds.playVictory();
        }
        onAllStepsComplete?.();
      }, 800);
    }
  };

  const toggleHint = async (stepId: string) => {
    if (soundEnabled && !showHint[stepId]) {
      await mathSounds.playHint();
    }
    setShowHint(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const resetSolution = async () => {
    if (soundEnabled) {
      await mathSounds.playReset();
    }
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepInputs({});
    setShowHint({});
    setRevealedSteps(new Set([0]));
    setAutoPlay(false);
  };

  const startAutoPlay = async () => {
    if (soundEnabled) {
      await mathSounds.playAnimationStart();
    }
    setAutoPlay(true);
    let stepIndex = 0;
    
    const revealNext = async () => {
      if (stepIndex < steps.length) {
        setRevealedSteps(prev => new Set([...prev, stepIndex]));
        setCurrentStep(stepIndex);
        
        if (stepIndex < steps.length - 1) {
          stepIndex++;
          setTimeout(revealNext, 2500); // Slightly longer delay for better experience
        } else {
          setAutoPlay(false);
          if (soundEnabled) {
            setTimeout(() => mathSounds.playSuccess(), 500);
          }
        }
      }
    };
    
    setTimeout(revealNext, 1000);
  };

  const renderMathExpression = (expression: MathExpression, stepId?: string) => {
    if (expression.editable && stepId) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm font-semibold" style={{ color: PROFESSIONAL_MATH_COLORS.primary }}>
            {expression.display.split('___')[0]}
          </span>
          <Input
            value={stepInputs[stepId] || ''}
            onChange={(e) => handleStepInput(stepId, e.target.value)}
            placeholder={expression.placeholder || '?'}
            className="w-16 text-center font-mono text-sm font-bold border"
            style={{
              borderColor: PROFESSIONAL_MATH_COLORS.accent,
              backgroundColor: 'white',
              color: PROFESSIONAL_MATH_COLORS.primary
            }}
          />
          <span className="font-mono text-sm font-semibold" style={{ color: PROFESSIONAL_MATH_COLORS.primary }}>
            {expression.display.split('___')[1] || ''}
          </span>
        </div>
      );
    }

    return (
      <span 
        className="font-mono text-sm font-semibold"
        style={{ color: PROFESSIONAL_MATH_COLORS.primary }}
      >
        {expression.display}
      </span>
    );
  };

  const renderInteractiveElement = (step: SolutionStep, stepIndex: number) => {
    if (!step.interactive) return null;

    const isCompleted = completedSteps.has(step.id);
    const isCurrentStep = currentStep === stepIndex && !isCompleted;

    switch (step.interactive.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {step.interactive.options?.map((option, index) => (
              <Button
                key={index}
                variant={stepInputs[step.id] === option ? 'default' : 'outline'}
                onClick={() => handleStepInput(step.id, option)}
                disabled={isCompleted}
                className="w-full justify-start"
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'fill-blank':
      case 'input':
        return (
          <div className="flex items-center space-x-2">
            <Input
              value={stepInputs[step.id] || ''}
              onChange={(e) => handleStepInput(step.id, e.target.value)}
              placeholder="Enter answer..."
              disabled={isCompleted}
              className="w-24 text-center text-sm"
            />
            {isCurrentStep && (
              <Button
                onClick={() => completeStep(step.id, stepIndex)}
                disabled={!stepInputs[step.id]?.trim()}
                size="sm"
                style={{ backgroundColor: PROFESSIONAL_MATH_COLORS.primary }}
                className="text-white hover:opacity-90 text-xs px-3"
              >
                Check
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card 
        className="w-full shadow-lg overflow-hidden"
        style={{
          border: `1px solid ${PROFESSIONAL_MATH_COLORS.secondary}`,
          background: 'white'
        }}
      >
        <CardHeader 
          className="border-b p-2"
          style={{
            borderColor: PROFESSIONAL_MATH_COLORS.secondary,
            background: 'white'
          }}
        >
          <CardTitle className="flex items-center justify-between" style={{ color: PROFESSIONAL_MATH_COLORS.primary }}>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap className="h-6 w-6" />
              <span className="text-xl font-bold">
                ⚡ {title}
              </span>
            </motion.div>
            <motion.div 
              className="flex gap-2 items-center"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Timer */}
              {timerVisible && (
                <div className="flex items-center gap-2 text-gray-400 text-sm bg-white/10 px-3 py-1 rounded border border-white/20">
                  <span>{formatTime(elapsedTime)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimerPaused(!timerPaused)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {timerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimerVisible(!timerVisible)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                {timerVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                {voiceEnabled ? <VolumeOff className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              {isReading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeech}
                  className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={resetSolution}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </motion.div>
          </CardTitle>
        
          {/* Enhanced Progress Bar */}
          <motion.div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Progress: {completedSteps.size} of {steps.length} steps
              </span>
              <span className="text-sm text-white/80">
                {Math.round((completedSteps.size / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="h-3 rounded-full transition-all duration-1000"
                style={{
                  background: `linear-gradient(90deg, ${PROFESSIONAL_MATH_COLORS.success} 0%, ${PROFESSIONAL_MATH_COLORS.accent} 100%)`,
                  width: `${(completedSteps.size / steps.length) * 100}%`
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
              />
            </div>
          </motion.div>
      </CardHeader>

      <CardContent className="p-3">
        <div className="relative">
          <AnimatePresence>
            {steps.map((step, index) => {
              const isRevealed = revealedSteps.has(index) || autoPlay;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = currentStep === index && !isCompleted;
              const isNextStep = index === steps.length - 1;

              if (!isRevealed) return null;

              return (
                <React.Fragment key={step.id}>
                  {/* Enhanced Connecting Line */}
                  {index > 0 && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ 
                        scaleY: isCompleted || isCurrent ? 1 : 0.3, 
                        opacity: isCompleted || isCurrent ? 1 : 0.3 
                      }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="w-2 h-6 mx-auto -mb-1 -mt-1 relative z-10 rounded-full"
                      style={{
                        background: isCompleted 
                          ? `linear-gradient(180deg, ${PROFESSIONAL_MATH_COLORS.connecting} 0%, #22C55E 50%, ${PROFESSIONAL_MATH_COLORS.connecting} 100%)`
                          : 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)',
                        boxShadow: isCompleted ? `0 0 12px ${PROFESSIONAL_MATH_COLORS.connecting}40, inset 0 0 8px rgba(255,255,255,0.3)` : 'none'
                      }}
                    />
                  )}
                  
                  {/* Step Rectangle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-3 p-3 rounded-lg transition-all duration-500"
                    style={{
                      backgroundColor: 'white',
                      border: `2px solid ${
                        isCurrent 
                          ? '#D1D5DB'
                          : isCompleted 
                          ? 'transparent'
                          : '#F3F4F6'
                      }`,
                      background: isCompleted 
                        ? `linear-gradient(135deg, #10B981 0%, #22C55E 50%, #16A34A 100%)`
                        : isCurrent
                        ? `linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)`
                        : 'white',
                      boxShadow: isCurrent 
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                        : isCompleted
                        ? '0 4px 15px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(255,255,255,0.2)'
                        : '0 1px 3px rgba(0, 0, 0, 0.05)',
                      backgroundSize: isCompleted ? '200% 200%' : 'auto',
                      animation: isCompleted ? 'gradient-move 3s ease infinite' : 'none'
                    }}
                  >
                {/* Simple Step Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-6 w-6 rounded flex items-center justify-center text-white text-sm font-bold"
                      style={{ 
                        backgroundColor: isCompleted 
                          ? PROFESSIONAL_MATH_COLORS.success 
                          : isCurrent 
                          ? PROFESSIONAL_MATH_COLORS.primary 
                          : PROFESSIONAL_MATH_COLORS.secondary 
                      }}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <h3 
                      className="font-semibold text-lg flex-1"
                      style={{ color: isCompleted ? 'white' : PROFESSIONAL_MATH_COLORS.primary }}
                    >
                      {step.title}
                    </h3>
                    {/* Voice Control for Step */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => currentlySpeaking === step.id ? stopSpeech() : speakStep(step)}
                      disabled={!voiceEnabled}
                      className={`h-8 w-8 p-0 disabled:opacity-50 transition-all duration-200 ${
                        currentlySpeaking === step.id 
                          ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                          : isCompleted 
                          ? 'text-white hover:text-green-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={currentlySpeaking === step.id ? 'Stop Reading' : 'Read Step Aloud'}
                    >
                      {currentlySpeaking === step.id ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm mb-4" style={{ color: isCompleted ? 'rgba(255,255,255,0.9)' : PROFESSIONAL_COLORS.text.secondary }}>
                  {step.description}
                </p>

                {/* Interactive Collaboration Area */}
                <div className="space-y-3">
                  {/* Step Expression with Fill-in */}
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Work through this step:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderMathExpression(step.fromExpression, step.id)}
                    </div>
                  </div>

                  {/* User Collaboration Required */}
                  {!isCompleted && isCurrent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                        </motion.div>
                        <span className="text-sm font-semibold text-blue-800">Your collaboration needed:</span>
                      </div>
                      {step.interactive ? (
                        <div className="space-y-3">
                          <div className="text-sm text-blue-700 mb-2 font-medium">
                            Complete this step to proceed:
                          </div>
                          {renderInteractiveElement(step, index)}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <span className="text-sm text-blue-700 font-medium">
                            Work through this step and click when you're ready to continue
                          </span>
                          <Button
                            onClick={() => completeStep(step.id, index)}
                            size="sm"
                            className="self-start flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{ backgroundColor: PROFESSIONAL_MATH_COLORS.primary }}
                          >
                            <Sparkles className="h-4 w-4" />
                            I understand this step
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Completed Result */}
                  {isCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
                      className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-300 p-4 rounded-lg shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                        >
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </motion.div>
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                          className="text-sm font-bold text-green-800"
                        >
                          ✨ Excellent work! Step completed:
                        </motion.span>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="bg-white/80 p-3 rounded border border-green-200 flex items-center gap-2"
                      >
                        {renderMathExpression(step.toExpression)}
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* Simple Explanation */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                    className="mt-3 p-3 bg-gray-50 rounded border-l-4"
                    style={{ borderLeftColor: PROFESSIONAL_MATH_COLORS.success }}
                  >
                    <p className="text-sm" style={{ color: PROFESSIONAL_COLORS.text.secondary }}>
                      {step.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Simple Hint */}
                {showHints && step.hint && isCurrent && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHint(step.id)}
                      className="text-xs text-gray-600 hover:text-gray-800 p-0 h-auto"
                    >
                      {showHint[step.id] ? 'Hide Hint' : 'Need a hint?'}
                    </Button>
                    
                    {showHint[step.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200"
                      >
                        <p className="text-sm" style={{ color: PROFESSIONAL_COLORS.text.secondary }}>
                          {step.hint}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

              </motion.div>
            </React.Fragment>
            );
          })}
        </AnimatePresence>
        </div>

        {/* Simple Completion Message */}
        {completedSteps.size >= steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-6 bg-green-50 rounded border border-green-200 mt-6"
          >
            <div 
              className="h-12 w-12 rounded flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: PROFESSIONAL_MATH_COLORS.success }}
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: PROFESSIONAL_MATH_COLORS.success }}>
              Solution Complete!
            </h3>
            <p className="text-sm" style={{ color: PROFESSIONAL_COLORS.text.secondary }}>
              You've successfully worked through all steps.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default SolutionStepBuilder;