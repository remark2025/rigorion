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
  Volume2,
  VolumeX,
  Sparkles,
  Zap
} from 'lucide-react';
import { mathSounds } from '@/utils/mathSounds';

// Trademark Color Scheme matching InteractiveGraph
const MATH_COLORS = {
  primary: '#6366F1',      // Vibrant indigo
  secondary: '#8B5CF6',    // Purple
  accent: '#F59E0B',       // Amber
  success: '#10B981',      // Emerald
  warning: '#F97316',      // Orange
  error: '#EF4444',        // Red
  gradient: {
    start: '#6366F1',
    middle: '#8B5CF6', 
    end: '#EC4899'
  },
  background: {
    light: 'rgba(99, 102, 241, 0.05)',
    medium: 'rgba(99, 102, 241, 0.1)',
    dark: 'rgba(99, 102, 241, 0.15)'
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
        <motion.div 
          className="flex items-center space-x-3 p-4 rounded-lg"
          style={{ backgroundColor: MATH_COLORS.background.light }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="font-mono text-xl font-semibold" style={{ color: MATH_COLORS.primary }}>
            {expression.display.split('___')[0]}
          </span>
          <Input
            value={stepInputs[stepId] || ''}
            onChange={(e) => handleStepInput(stepId, e.target.value)}
            placeholder={expression.placeholder || '?'}
            className="w-24 text-center font-mono text-lg font-bold border-2"
            style={{
              borderColor: MATH_COLORS.accent,
              backgroundColor: 'white',
              color: MATH_COLORS.primary
            }}
          />
          <span className="font-mono text-xl font-semibold" style={{ color: MATH_COLORS.primary }}>
            {expression.display.split('___')[1] || ''}
          </span>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="font-mono text-xl font-semibold p-4 rounded-lg border-2 shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: MATH_COLORS.secondary,
          color: MATH_COLORS.primary
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {expression.display}
      </motion.div>
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
              placeholder="Enter your answer..."
              disabled={isCompleted}
              className="flex-1"
            />
            {isCurrentStep && (
              <Button
                onClick={() => completeStep(step.id, stepIndex)}
                disabled={!stepInputs[step.id]?.trim()}
                size="sm"
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
        className="w-full border-2 shadow-xl overflow-hidden"
        style={{
          borderColor: MATH_COLORS.primary,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(99, 102, 241, 0.02) 100%)`
        }}
      >
        <CardHeader 
          className="border-b-2 p-6"
          style={{
            borderColor: MATH_COLORS.primary,
            background: `linear-gradient(90deg, ${MATH_COLORS.gradient.start} 0%, ${MATH_COLORS.gradient.middle} 50%, ${MATH_COLORS.gradient.end} 100%)`
          }}
        >
          <CardTitle className="flex items-center justify-between text-white">
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
              className="flex gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startAutoPlay}
                disabled={autoPlay}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {autoPlay ? 'Playing...' : 'Auto Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSolution}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
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
                  background: `linear-gradient(90deg, ${MATH_COLORS.success} 0%, ${MATH_COLORS.accent} 100%)`,
                  width: `${(completedSteps.size / steps.length) * 100}%`
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
              />
            </div>
          </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence>
          {steps.map((step, index) => {
            const isRevealed = revealedSteps.has(index) || autoPlay;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === index && !isCompleted;

            if (!isRevealed) return null;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="border-2 rounded-xl p-6 shadow-lg transition-all duration-500"
                style={{
                  borderColor: isCurrent 
                    ? MATH_COLORS.primary
                    : isCompleted 
                    ? MATH_COLORS.success 
                    : '#E5E7EB',
                  backgroundColor: isCurrent 
                    ? MATH_COLORS.background.light
                    : isCompleted 
                    ? 'rgba(16, 185, 129, 0.05)'
                    : 'rgba(255, 255, 255, 0.9)',
                  boxShadow: isCurrent 
                    ? `0 0 20px ${MATH_COLORS.primary}20`
                    : isCompleted
                    ? `0 0 15px ${MATH_COLORS.success}15`
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {isCompleted ? (
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: MATH_COLORS.success }}
                        >
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center animate-pulse"
                          style={{ backgroundColor: MATH_COLORS.primary }}
                        >
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-400">{index + 1}</span>
                        </div>
                      )}
                    </motion.div>
                    <div>
                      <h3 
                        className="font-bold text-xl flex items-center gap-2"
                        style={{ color: isCurrent ? MATH_COLORS.primary : isCompleted ? MATH_COLORS.success : '#374151' }}
                      >
                        Step {index + 1}: {step.title}
                        {isCurrent && <Sparkles className="h-4 w-4" style={{ color: MATH_COLORS.accent }} />}
                      </h3>
                      <p className="text-sm" style={{ color: '#6B7280' }}>{step.description}</p>
                    </div>
                  </div>

                  {/* Enhanced Status Badge */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Badge 
                      className="px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: isCompleted ? MATH_COLORS.success : isCurrent ? MATH_COLORS.primary : 'transparent',
                        color: isCompleted || isCurrent ? 'white' : MATH_COLORS.primary,
                        border: `2px solid ${isCompleted ? MATH_COLORS.success : isCurrent ? MATH_COLORS.primary : MATH_COLORS.primary}`
                      }}
                    >
                      {isCompleted ? '✓ Complete' : isCurrent ? '⚡ Active' : '⏳ Pending'}
                    </Badge>
                  </motion.div>
                </div>

                {/* Math Expressions */}
                <div className="space-y-4">
                  {/* From Expression */}
                  {renderMathExpression(step.fromExpression, step.id)}
                  
                  {/* Enhanced Arrow */}
                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: isCurrent ? MATH_COLORS.primary : MATH_COLORS.secondary }}
                    >
                      <ArrowDown className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>

                  {/* Interactive Element */}
                  {renderInteractiveElement(step, index)}

                  {/* To Expression (shown after completion or if not interactive) */}
                  {(isCompleted || !step.interactive) && (
                    <>
                      <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: MATH_COLORS.success }}
                        >
                          <ArrowDown className="h-5 w-5 text-white" />
                        </div>
                      </motion.div>
                      {renderMathExpression(step.toExpression)}
                    </>
                  )}
                </div>

                {/* Enhanced Explanation */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-6 p-4 rounded-xl border-l-4 shadow-sm"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      borderLeftColor: MATH_COLORS.success
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5" style={{ color: MATH_COLORS.success }} />
                      <p className="font-bold text-lg" style={{ color: MATH_COLORS.success }}>Perfect! Here's why:</p>
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: '#059669' }}>{step.explanation}</p>
                  </motion.div>
                )}

                {/* Hint */}
                {showHints && step.hint && isCurrent && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHint(step.id)}
                      className="flex items-center gap-1 text-blue-600"
                    >
                      {showHint[step.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showHint[step.id] ? 'Hide Hint' : 'Show Hint'}
                    </Button>
                    
                    {showHint[step.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mt-3 p-4 rounded-xl border-l-4 shadow-sm"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          borderLeftColor: MATH_COLORS.accent
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="p-1 rounded-full mt-0.5"
                            style={{ backgroundColor: MATH_COLORS.accent }}
                          >
                            <Lightbulb className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1" style={{ color: MATH_COLORS.accent }}>💡 Helpful Hint:</p>
                            <p className="text-base leading-relaxed" style={{ color: '#D97706' }}>{step.hint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Complete Step Button */}
                {!step.interactive && isCurrent && (
                  <div className="mt-4">
                    <Button
                      onClick={() => completeStep(step.id, index)}
                      className="w-full"
                    >
                      Continue to Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Enhanced Completion Message */}
        {completedSteps.size >= steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="text-center p-8 rounded-2xl border-3 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)`,
              borderColor: MATH_COLORS.success
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: 'spring', bounce: 0.6 }}
            >
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: MATH_COLORS.success }}
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold mb-3" style={{ color: MATH_COLORS.success }}>
                🎉 Outstanding Work! 🌟
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: MATH_COLORS.primary }}>
                You've mastered this solution step-by-step! Your mathematical thinking is on point.
              </p>
              <div className="flex justify-center mt-4 gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default SolutionStepBuilder;