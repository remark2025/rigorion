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
  workout: string; // The mathematical work/calculation
  fromExpression: MathExpression;
  toExpression: MathExpression;
  explanation: string;
  hint?: string;
  userInput?: string;
  isCorrect?: boolean;
  hasGraph?: boolean; // Whether this step includes a graph
  graphData?: any; // Graph configuration if hasGraph is true
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
  keyExplanation?: string; // Overall explanation before steps
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
  keyExplanation,
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
            className="w-20 h-8 text-center font-mono text-sm font-bold bg-gray-100 border-gray-300 text-black focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:bg-gray-50"
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
                className={`w-full justify-start h-8 ${
                  stepInputs[step.id] === option 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-50'
                }`}
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
              className="w-28 h-8 text-center text-sm bg-gray-100 border-gray-300 text-black focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-500"
            />
            {isCurrentStep && (
              <Button
                onClick={() => completeStep(step.id, stepIndex)}
                disabled={!stepInputs[step.id]?.trim()}
                size="sm"
                className="bg-gray-800 text-white hover:bg-gray-700 text-xs px-3 h-8"
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
        className="w-full overflow-hidden"
        style={{
          background: 'white'
        }}
      >

      <CardContent className="p-4">
        {/* Key Explanation Section */}
        {keyExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Key Strategy</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
              {keyExplanation}
            </p>
          </motion.div>
        )}

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
                  {/* Down Arrow Connector */}
                  {index > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: isCompleted || isCurrent ? 1 : 0.7, 
                        opacity: isCompleted || isCurrent ? 1 : 0.4 
                      }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="flex justify-center my-4 relative z-10"
                      style={{ backgroundColor: 'white' }}
                    >
                      <ArrowDown 
                        className="h-8 w-8 transition-all duration-500"
                        style={{
                          color: isCompleted 
                            ? '#22C55E'
                            : isCurrent
                            ? '#22C55E'
                            : '#9CA3AF',
                          filter: isCompleted ? 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))' : 'none'
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {/* Step Card - New Collaborative Format */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-3 p-4 rounded-lg transition-all duration-500"
                    style={{
                      backgroundColor: 'white',
                      border: `2px solid ${
                        isCompleted
                          ? '#22C55E' // Green for correct
                          : stepInputs[step.id] && !validateStep(step, stepInputs[step.id])
                          ? '#FB923C' // Orange for wrong
                          : '#D1D5DB' // Grey for default
                      }`,
                      boxShadow: isCurrent 
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                        : isCompleted
                        ? '0 4px 15px rgba(34, 197, 94, 0.2)'
                        : '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                {/* New Collaborative Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ 
                        backgroundColor: isCompleted 
                          ? '#22C55E'
                          : stepInputs[step.id] && !validateStep(step, stepInputs[step.id])
                          ? '#FB923C'
                          : '#6B7280'
                      }}
                    >
                      {isCompleted ? '✓' : `${index + 1}/${steps.length}`}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Step {index + 1}/{steps.length}
                    </h3>
                  </div>
                  
                  {/* Success Message - Top Right Corner */}
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-green-600 font-semibold text-sm"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.05, delay: 0.4 }}
                        className="inline-block"
                      >
                        {['Perfect! Well done! 🌟', 'Excellent work! 💫', 'Outstanding! ⭐', 'Brilliant! ✨'][Math.floor(Math.random() * 4)]}
                      </motion.span>
                    </motion.div>
                  )}
                </div>
                
                {/* Enhanced Step Layout */}
                <div className="mb-4">
                  {/* Step Title and Description */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Step {index + 1}: {step.title}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {step.description}
                    </p>
                  </div>

                  {/* Mathematical Workout */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Workout:</h5>
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <p className="text-sm font-mono text-gray-800 leading-relaxed">{step.workout || step.explanation}</p>
                    </div>
                  </div>

                  {/* Optional Graph */}
                  {step.hasGraph && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 mb-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <h5 className="text-sm font-semibold text-gray-800">Visual Representation</h5>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        <span className="text-sm">Graph for Step {index + 1}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Interactive Question for Student */}
                {!isCompleted && isCurrent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white border border-gray-200 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lightbulb 
                          className="h-5 w-5" 
                          style={{
                            color: '#F97316',
                            filter: 'drop-shadow(0 0 2px rgba(249, 115, 22, 0.3))'
                          }}
                        />
                      </motion.div>
                      <span 
                        className="text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        Now it's your turn:
                      </span>
                    </div>
                    
                    {/* Question for Student */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-800 font-semibold mb-2">
                        {step.interactive?.type === 'input' 
                          ? `What value did we find for the variable in this step?`
                          : `What's the result of this calculation?`}
                      </p>
                      
                      {/* Input Field for Student Answer */}
                      <div className="flex items-center gap-3">
                        <Input
                          value={stepInputs[step.id] || ''}
                          onChange={(e) => handleStepInput(step.id, e.target.value)}
                          placeholder="Enter your answer..."
                          className={`h-10 text-center font-mono text-sm border-2 transition-all duration-300 ${
                            stepInputs[step.id] && !validateStep(step, stepInputs[step.id])
                              ? 'border-orange-400 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-orange-200'
                              : 'border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && completeStep(step.id, index)}
                        />
                        <Button
                          onClick={() => completeStep(step.id, index)}
                          disabled={!stepInputs[step.id]?.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                        >
                          Check Answer
                        </Button>
                      </div>
                      
                      {/* Feedback for Wrong Answer */}
                      {stepInputs[step.id] && !validateStep(step, stepInputs[step.id]) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg"
                        >
                          <p className="text-sm text-orange-800">
                            Not quite right. Review the explanation above and try again! 💪
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Completed Result - Clean Success State */}
                {isCompleted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </motion.div>
                      <span className="text-sm font-semibold text-green-700">
                        Perfect! You got it right:
                      </span>
                    </div>
                    <div className="flex items-center">
                      {renderMathExpression(step.toExpression)}
                    </div>
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