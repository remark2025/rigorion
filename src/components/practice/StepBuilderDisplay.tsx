import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, CheckCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionStep {
  id: string;
  title: string;
  explanation: string;
  formula?: string;
  result?: string;
  stepType: 'setup' | 'manipulation' | 'solution' | 'verification' | 'analysis' | 'factoring' | 'application' | 'formula' | 'identification' | 'substitution' | 'calculation';
  details?: string;
}

interface InteractiveElement {
  type: 'input_field' | 'circle_diagram';
  step?: number;
  placeholder?: string;
  correctAnswer?: string;
  radius?: number;
  showRadius?: boolean;
  highlightArea?: boolean;
}

interface StepBuilderData {
  solutionSteps: SolutionStep[];
  algebraSteps?: boolean;
  geometrySteps?: boolean;
  showWork?: boolean;
  allowInputValidation?: boolean;
  interactiveElements?: InteractiveElement[];
  mathConcepts?: string[];
  hasCircleDiagram?: boolean;
}

interface StepBuilderDisplayProps {
  stepBuilderData: StepBuilderData;
  className?: string;
}

export const StepBuilderDisplay: React.FC<StepBuilderDisplayProps> = ({
  stepBuilderData,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [showAllSteps, setShowAllSteps] = useState(false);

  const { solutionSteps, interactiveElements = [], mathConcepts = [] } = stepBuilderData;

  const toggleStepExpansion = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (expandedSteps.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const handleInputChange = (elementId: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [elementId]: value }));
  };

  const validateInput = (element: InteractiveElement, userInput: string): boolean => {
    if (!element.correctAnswer) return false;
    return userInput.trim().toLowerCase() === element.correctAnswer.toLowerCase();
  };

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case 'setup': return '🎯';
      case 'manipulation': return '🔧';
      case 'solution': return '✅';
      case 'verification': return '✔️';
      case 'analysis': return '🔍';
      case 'factoring': return '📐';
      case 'application': return '⚡';
      case 'formula': return '📝';
      case 'identification': return '👁️';
      case 'substitution': return '🔄';
      case 'calculation': return '🧮';
      default: return '📋';
    }
  };

  const getStepTypeColor = (stepType: string) => {
    switch (stepType) {
      case 'setup': return 'border-blue-200 bg-blue-50';
      case 'manipulation': return 'border-orange-200 bg-orange-50';
      case 'solution': return 'border-green-200 bg-green-50';
      case 'verification': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const renderInteractiveElement = (element: InteractiveElement, stepIndex: number) => {
    if (element.type === 'input_field') {
      const elementId = `input_${stepIndex}_${element.step}`;
      const userInput = userInputs[elementId] || '';
      const isCorrect = element.correctAnswer ? validateInput(element, userInput) : false;

      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Try it yourself:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={element.placeholder}
              value={userInput}
              onChange={(e) => handleInputChange(elementId, e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {userInput && (
              <div className={cn(
                'p-2 rounded-full',
                isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              )}>
                {isCorrect ? <CheckCircle size={20} /> : '❌'}
              </div>
            )}
          </div>
          {userInput && !isCorrect && (
            <p className="text-sm text-red-600 mt-1">
              Try again! Hint: {element.placeholder}
            </p>
          )}
        </div>
      );
    }

    if (element.type === 'circle_diagram') {
      const radius = element.radius || 5;
      const size = 200;
      const center = size / 2;
      const circleRadius = (size - 40) / 2;

      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <svg width={size} height={size} className="mx-auto">
              {/* Circle */}
              <circle
                cx={center}
                cy={center}
                r={circleRadius}
                fill={element.highlightArea ? 'rgba(59, 130, 246, 0.1)' : 'none'}
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
              
              {/* Radius line */}
              {element.showRadius && (
                <>
                  <line
                    x1={center}
                    y1={center}
                    x2={center + circleRadius}
                    y2={center}
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                  />
                  <text
                    x={center + circleRadius / 2}
                    y={center - 10}
                    textAnchor="middle"
                    className="text-sm font-medium fill-red-600"
                  >
                    r = {radius}
                  </text>
                </>
              )}
              
              {/* Center point */}
              <circle cx={center} cy={center} r="3" fill="rgb(239, 68, 68)" />
            </svg>
            <p className="text-sm text-gray-600 mt-2">
              Circle with radius {radius} units
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Step-by-Step Solution
          </h3>
          {mathConcepts.length > 0 && (
            <div className="flex gap-2 mt-2">
              {mathConcepts.map(concept => (
                <span
                  key={concept}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                >
                  {concept.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllSteps(!showAllSteps)}
          className="text-sm"
        >
          {showAllSteps ? 'Hide Steps' : 'Show All Steps'}
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {solutionSteps.map((step, index) => {
          const isVisible = showAllSteps || index <= currentStep;
          const isExpanded = expandedSteps.has(index) || showAllSteps;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          if (!isVisible) return null;

          return (
            <div
              key={step.id}
              className={cn(
                'border rounded-lg transition-all duration-200',
                getStepTypeColor(step.stepType),
                isCurrent && 'ring-2 ring-blue-400 ring-opacity-50',
                isCompleted && 'opacity-80'
              )}
            >
              <button
                onClick={() => toggleStepExpansion(index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300">
                    <span className="text-sm font-medium">
                      {isCompleted ? '✓' : index + 1}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStepTypeIcon(step.stepType)}</span>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                    </div>
                    
                    {!isExpanded && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {step.explanation}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isCurrent && !showAllSteps && (
                    <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                      Current
                    </span>
                  )}
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200/50">
                  <div className="pt-4">
                    <p className="text-gray-700 mb-3">{step.explanation}</p>
                    
                    {step.details && (
                      <p className="text-sm text-gray-600 mb-3 italic">{step.details}</p>
                    )}
                    
                    {step.formula && (
                      <div className="bg-gray-100 rounded-md p-3 mb-3">
                        <code className="text-sm font-mono text-gray-800">{step.formula}</code>
                      </div>
                    )}
                    
                    {step.result && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                        <span className="text-sm font-medium text-green-800">Result: </span>
                        <span className="text-sm text-green-700">{step.result}</span>
                      </div>
                    )}

                    {/* Interactive Elements */}
                    {interactiveElements
                      .filter(el => el.step === index + 1)
                      .map((element, elIndex) => 
                        renderInteractiveElement(element, index)
                      )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      {!showAllSteps && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            size="sm"
          >
            Previous Step
          </Button>
          
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {solutionSteps.length}
          </span>
          
          <Button
            onClick={() => setCurrentStep(Math.min(solutionSteps.length - 1, currentStep + 1))}
            disabled={currentStep === solutionSteps.length - 1}
            size="sm"
          >
            Next Step
          </Button>
        </div>
      )}
    </div>
  );
};