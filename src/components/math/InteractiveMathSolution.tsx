import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractiveGraph from './InteractiveGraph';

// Sample data for a quadratic equation problem
const sampleQuadraticProblem = {
  question: "Find the vertex and x-intercepts of y = 2x² - 8x + 6",
  
  graphConfig: {
    type: 'quadratic' as const,
    xRange: [-2, 6] as [number, number],
    yRange: [-4, 10] as [number, number],
    showGrid: true,
    showAxis: true,
    title: 'Quadratic Function: y = ax² + bx + c'
  },
  
  parameters: [
    {
      name: 'a',
      label: 'Coefficient a',
      value: 2,
      min: -5,
      max: 5,
      step: 0.1,
      description: 'Controls the width and direction of the parabola'
    },
    {
      name: 'b',
      label: 'Coefficient b',
      value: -8,
      min: -10,
      max: 10,
      step: 0.1,
      description: 'Affects the horizontal position of the vertex'
    },
    {
      name: 'c',
      label: 'Constant c',
      value: 6,
      min: -10,
      max: 10,
      step: 0.1,
      description: 'The y-intercept of the parabola'
    }
  ],

  solutionSteps: [
    {
      id: 'step-1',
      title: 'Identify the Standard Form',
      description: 'Recognize the quadratic function in standard form',
      fromExpression: {
        latex: 'y = 2x^2 - 8x + 6',
        display: 'y = 2x² - 8x + 6'
      },
      toExpression: {
        latex: 'y = ax^2 + bx + c',
        display: 'y = ax² + bx + c where a = 2, b = -8, c = 6'
      },
      explanation: 'We can identify a = 2, b = -8, and c = 6 from the standard form.',
      hint: 'Compare with y = ax² + bx + c to find the coefficients'
    },
    {
      id: 'step-2',
      title: 'Find the Vertex x-coordinate',
      description: 'Use the vertex formula x = -b/(2a)',
      fromExpression: {
        latex: 'x = -\\frac{b}{2a}',
        display: 'x = -b/(2a)'
      },
      toExpression: {
        latex: 'x = -\\frac{(-8)}{2(2)} = \\frac{8}{4} = 2',
        display: 'x = -(-8)/(2×2) = 8/4 = 2'
      },
      explanation: 'Substituting our values: x = -(-8)/(2×2) = 8/4 = 2',
      hint: 'Remember that b = -8, so -b = 8',
      interactive: {
        type: 'input',
        correctAnswer: '2'
      }
    },
    {
      id: 'step-3',
      title: 'Find the Vertex y-coordinate',
      description: 'Substitute x = 2 back into the original equation',
      fromExpression: {
        latex: 'y = 2x^2 - 8x + 6',
        display: 'y = 2(2)² - 8(2) + 6',
        editable: true,
        placeholder: 'Calculate...'
      },
      toExpression: {
        latex: 'y = 2(4) - 16 + 6 = 8 - 16 + 6 = -2',
        display: 'y = 8 - 16 + 6 = -2'
      },
      explanation: 'The vertex is at point (2, -2)',
      hint: 'Calculate step by step: 2(4) = 8, then 8 - 16 + 6',
      interactive: {
        type: 'input',
        correctAnswer: '-2'
      }
    },
    {
      id: 'step-4',
      title: 'Find x-intercepts',
      description: 'Set y = 0 and solve the quadratic equation',
      fromExpression: {
        latex: '0 = 2x^2 - 8x + 6',
        display: '0 = 2x² - 8x + 6'
      },
      toExpression: {
        latex: '0 = 2(x^2 - 4x + 3)',
        display: '0 = 2(x² - 4x + 3)'
      },
      explanation: 'Factor out the common factor of 2',
      hint: 'Divide everything by 2 first to simplify'
    },
    {
      id: 'step-5',
      title: 'Solve the Simplified Equation',
      description: 'Factor or use the quadratic formula',
      fromExpression: {
        latex: 'x^2 - 4x + 3 = 0',
        display: 'x² - 4x + 3 = 0'
      },
      toExpression: {
        latex: '(x - 1)(x - 3) = 0',
        display: '(x - 1)(x - 3) = 0'
      },
      explanation: 'This factors as (x - 1)(x - 3) = 0, giving us x = 1 and x = 3',
      hint: 'Look for two numbers that multiply to 3 and add to -4',
      interactive: {
        type: 'multiple-choice',
        options: ['x = 1, x = 3', 'x = -1, x = -3', 'x = 2, x = 6', 'x = 0, x = 4'],
        correctAnswer: 'x = 1, x = 3'
      }
    }
  ]
};

interface InteractiveMathSolutionProps {
  problem?: typeof sampleQuadraticProblem;
  className?: string;
}

export const InteractiveMathSolution: React.FC<InteractiveMathSolutionProps> = ({
  problem = sampleQuadraticProblem,
  className
}) => {
  const [currentParameters, setCurrentParameters] = useState(
    problem.parameters.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const handleParameterChange = (params: Record<string, number>) => {
    setCurrentParameters(params);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className={`w-full h-full bg-gray-100 p-4 ${className}`}>
      {/* Tab System */}
      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="interactive" className="text-sm">📊 Interactive</TabsTrigger>
          <TabsTrigger value="solution" className="text-sm">📝 Step by Step Solution</TabsTrigger>
        </TabsList>
        
        {/* Interactive Tab */}
        <TabsContent value="interactive" className="mt-0">
          {/* Interactive Graph */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <InteractiveGraph
                equation="y = ax² + bx + c"
                parameters={problem.parameters}
                config={problem.graphConfig}
                onParameterChange={handleParameterChange}
              />
            </CardContent>
          </Card>
          
          {/* Graph Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-orange-800">Graph Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 text-sm">Vertex</h4>
                  <p className="text-orange-600 text-sm">
                    ({(-currentParameters.b / (2 * currentParameters.a)).toFixed(2)}, {' '}
                    {(currentParameters.a * Math.pow(-currentParameters.b / (2 * currentParameters.a), 2) + 
                      currentParameters.b * (-currentParameters.b / (2 * currentParameters.a)) + 
                      currentParameters.c).toFixed(2)})
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 text-sm">Y-intercept</h4>
                  <p className="text-green-600 text-sm">(0, {currentParameters.c})</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 text-sm">Opens</h4>
                  <p className="text-blue-600 text-sm">{currentParameters.a > 0 ? 'Upward' : 'Downward'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step by Step Solution Tab */}
        <TabsContent value="solution" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-800">Solution Steps</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96">
              <div className="space-y-3">
                {problem.solutionSteps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-sm text-gray-900">
                          Step {index + 1}: {step.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {step.description}
                        </div>
                      </div>
                      {expandedSteps.has(step.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSteps.has(step.id) && (
                      <div className="px-3 pb-3 border-t border-gray-100">
                        <div className="mt-2 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">From: </span>
                            <span className="font-mono text-gray-900">{step.fromExpression.display}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">To: </span>
                            <span className="font-mono text-gray-900">{step.toExpression.display}</span>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {step.explanation}
                          </div>
                          {step.hint && (
                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                              💡 Hint: {step.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveMathSolution;
