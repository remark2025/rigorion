import React, { useState, useCallback } from 'react';
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
  Play
} from 'lucide-react';

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

  const completeStep = (stepId: string, stepIndex: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const userInput = stepInputs[stepId] || '';
    const isCorrect = validateStep(step, userInput);

    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Reveal next step
    if (stepIndex < steps.length - 1) {
      setRevealedSteps(prev => new Set([...prev, stepIndex + 1]));
      setCurrentStep(stepIndex + 1);
    }

    onStepComplete?.(stepId, isCorrect, userInput);

    // Check if all steps are complete
    if (completedSteps.size + 1 >= steps.length) {
      setTimeout(() => onAllStepsComplete?.(), 500);
    }
  };

  const toggleHint = (stepId: string) => {
    setShowHint(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const resetSolution = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepInputs({});
    setShowHint({});
    setRevealedSteps(new Set([0]));
    setAutoPlay(false);
  };

  const startAutoPlay = () => {
    setAutoPlay(true);
    let stepIndex = 0;
    
    const revealNext = () => {
      if (stepIndex < steps.length) {
        setRevealedSteps(prev => new Set([...prev, stepIndex]));
        setCurrentStep(stepIndex);
        
        if (stepIndex < steps.length - 1) {
          stepIndex++;
          setTimeout(revealNext, 2000); // 2 second delay between steps
        } else {
          setAutoPlay(false);
        }
      }
    };
    
    setTimeout(revealNext, 1000);
  };

  const renderMathExpression = (expression: MathExpression, stepId?: string) => {
    if (expression.editable && stepId) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-lg">{expression.display.split('___')[0]}</span>
          <Input
            value={stepInputs[stepId] || ''}
            onChange={(e) => handleStepInput(stepId, e.target.value)}
            placeholder={expression.placeholder || '?'}
            className="w-20 text-center font-mono"
          />
          <span className="font-mono text-lg">{expression.display.split('___')[1] || ''}</span>
        </div>
      );
    }

    return (
      <div className="font-mono text-lg bg-gray-50 p-3 rounded-lg border">
        {expression.display}
      </div>
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
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startAutoPlay}
              disabled={autoPlay}
              className="flex items-center gap-1"
            >
              <Play className="h-4 w-4" />
              {autoPlay ? 'Playing...' : 'Auto Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSolution}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          Progress: {completedSteps.size} of {steps.length} steps complete
        </p>
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
                className={`border rounded-lg p-4 ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">Step {index + 1}: {step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}>
                    {isCompleted ? 'Complete' : isCurrent ? 'Current' : 'Pending'}
                  </Badge>
                </div>

                {/* Math Expressions */}
                <div className="space-y-4">
                  {/* From Expression */}
                  {renderMathExpression(step.fromExpression, step.id)}
                  
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowDown className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Interactive Element */}
                  {renderInteractiveElement(step, index)}

                  {/* To Expression (shown after completion or if not interactive) */}
                  {(isCompleted || !step.interactive) && (
                    <>
                      <div className="flex justify-center">
                        <ArrowDown className="h-6 w-6 text-green-500" />
                      </div>
                      {renderMathExpression(step.toExpression)}
                    </>
                  )}
                </div>

                {/* Explanation */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-500"
                  >
                    <p className="text-sm font-medium text-green-800">Explanation:</p>
                    <p className="text-sm text-green-700">{step.explanation}</p>
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-700">{step.hint}</p>
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

        {/* Completion Message */}
        {completedSteps.size >= steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-green-100 rounded-lg border-2 border-green-500"
          >
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Solution Complete!</h3>
            <p className="text-green-700">
              Great job! You've successfully worked through all the solution steps.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolutionStepBuilder;