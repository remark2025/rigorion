import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InteractiveGraph from './InteractiveGraph';
import SolutionStepBuilder from './SolutionStepBuilder';

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

  const handleParameterChange = (params: Record<string, number>) => {
    setCurrentParameters(params);
  };

  const handleStepComplete = (stepId: string, isCorrect: boolean, userAnswer?: string) => {
    console.log(`Step ${stepId} completed:`, { isCorrect, userAnswer });
  };

  const handleAllStepsComplete = () => {
    console.log('All solution steps completed!');
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SAT Math Problem</span>
            <Badge variant="secondary">Interactive Solution</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-800 mb-4">
            {problem.question}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Quadratic Functions</Badge>
            <Badge variant="outline">Vertex Form</Badge>
            <Badge variant="outline">Interactive Graph</Badge>
            <Badge variant="outline">Step-by-Step Solution</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Tabs */}
      <Tabs defaultValue="graph" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="graph">📊 Interactive Graph</TabsTrigger>
          <TabsTrigger value="solution">🔧 Step-by-Step Solution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graph" className="mt-6">
          <InteractiveGraph
            equation="y = ax² + bx + c"
            parameters={problem.parameters}
            config={problem.graphConfig}
            onParameterChange={handleParameterChange}
          />
          
          {/* Additional Graph Insights */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Graph Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Vertex</h4>
                  <p className="text-red-600">
                    ({(-currentParameters.b / (2 * currentParameters.a)).toFixed(2)}, {' '}
                    {(currentParameters.a * Math.pow(-currentParameters.b / (2 * currentParameters.a), 2) + 
                      currentParameters.b * (-currentParameters.b / (2 * currentParameters.a)) + 
                      currentParameters.c).toFixed(2)})
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Y-intercept</h4>
                  <p className="text-green-600">(0, {currentParameters.c})</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Opens</h4>
                  <p className="text-blue-600">{currentParameters.a > 0 ? 'Upward' : 'Downward'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="solution" className="mt-6">
          <SolutionStepBuilder
            steps={problem.solutionSteps}
            title="Step-by-Step Solution"
            onStepComplete={handleStepComplete}
            onAllStepsComplete={handleAllStepsComplete}
            showHints={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveMathSolution;