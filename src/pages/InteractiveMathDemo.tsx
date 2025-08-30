import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Calculator, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InteractiveMathSolution from '@/components/math/InteractiveMathSolution';
import { useTheme } from '@/contexts/ThemeContext';

// Sample problems for different math types
const mathProblems = {
  quadratic: {
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
      { name: 'a', label: 'Coefficient a', value: 2, min: -5, max: 5, step: 0.1, description: 'Controls the width and direction' },
      { name: 'b', label: 'Coefficient b', value: -8, min: -10, max: 10, step: 0.1, description: 'Affects horizontal position' },
      { name: 'c', label: 'Constant c', value: 6, min: -10, max: 10, step: 0.1, description: 'The y-intercept' }
    ],
    solutionSteps: [
      {
        id: 'step-1',
        title: 'Identify Standard Form',
        description: 'Recognize the quadratic function',
        fromExpression: { latex: 'y = 2x^2 - 8x + 6', display: 'y = 2x² - 8x + 6' },
        toExpression: { latex: 'y = ax^2 + bx + c', display: 'a = 2, b = -8, c = 6' },
        explanation: 'Identify coefficients from standard form',
        hint: 'Compare with y = ax² + bx + c'
      },
      {
        id: 'step-2',
        title: 'Find Vertex x-coordinate',
        description: 'Use x = -b/(2a)',
        fromExpression: { latex: 'x = -b/(2a)', display: 'x = -(-8)/(2×2)' },
        toExpression: { latex: 'x = 2', display: 'x = 8/4 = 2' },
        explanation: 'Substitute values into vertex formula',
        hint: 'Remember b = -8, so -b = 8',
        interactive: { type: 'input', correctAnswer: '2' }
      }
    ]
  },
  
  linear: {
    question: "Find the slope and y-intercept of the line 3x + 2y = 12",
    graphConfig: {
      type: 'linear' as const,
      xRange: [-2, 6] as [number, number],
      yRange: [-2, 8] as [number, number],
      showGrid: true,
      showAxis: true,
      title: 'Linear Function: y = mx + b'
    },
    parameters: [
      { name: 'm', label: 'Slope (m)', value: -1.5, min: -5, max: 5, step: 0.1, description: 'Rate of change' },
      { name: 'b', label: 'Y-intercept (b)', value: 6, min: -10, max: 10, step: 0.1, description: 'Y-axis intersection' }
    ],
    solutionSteps: [
      {
        id: 'linear-1',
        title: 'Convert to Slope-Intercept Form',
        description: 'Solve for y to get y = mx + b',
        fromExpression: { latex: '3x + 2y = 12', display: '3x + 2y = 12' },
        toExpression: { latex: '2y = -3x + 12', display: '2y = -3x + 12' },
        explanation: 'Subtract 3x from both sides',
        hint: 'Move 3x to the right side'
      },
      {
        id: 'linear-2',
        title: 'Solve for y',
        description: 'Divide by 2 to isolate y',
        fromExpression: { latex: '2y = -3x + 12', display: '2y = -3x + 12' },
        toExpression: { latex: 'y = -1.5x + 6', display: 'y = -1.5x + 6' },
        explanation: 'Divide everything by 2: slope = -1.5, y-intercept = 6',
        hint: 'Divide each term by 2',
        interactive: { type: 'input', correctAnswer: '-1.5' }
      }
    ]
  }
};

const InteractiveMathDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedProblem, setSelectedProblem] = useState<'quadratic' | 'linear'>('quadratic');

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/practice')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Practice
              </Button>
              <div>
                <h1 className="text-2xl font-bold">🧮 Interactive Math Solutions</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Experience dynamic graphing and step-by-step problem solving
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Problem Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Choose a Problem Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={selectedProblem === 'quadratic' ? 'default' : 'outline'}
                onClick={() => setSelectedProblem('quadratic')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <LineChart className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Quadratic Functions</div>
                  <div className="text-xs opacity-80">y = ax² + bx + c</div>
                </div>
              </Button>
              
              <Button
                variant={selectedProblem === 'linear' ? 'default' : 'outline'}
                onClick={() => setSelectedProblem('linear')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <LineChart className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Linear Equations</div>
                  <div className="text-xs opacity-80">y = mx + b</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Solution */}
        <InteractiveMathSolution 
          problem={mathProblems[selectedProblem]}
          className="max-w-7xl mx-auto"
        />

        {/* Features Showcase */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🌟 Interactive Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  <h3 className="font-bold text-indigo-800">NEW: Enhanced Experience!</h3>
                </div>
                <Button
                  onClick={() => navigate('/advanced-animations')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  size="sm"
                >
                  🚀 See All Animations
                </Button>
              </div>
              <p className="text-indigo-700 text-sm">
                ✨ <strong>Trademark Visual Design</strong> - Signature colors and animations<br/>
                🔊 <strong>Sound Effects</strong> - Audio feedback for interactions (click sound button to toggle)<br/>
                ⚡ <strong>Smooth Animations</strong> - Fluid transitions and visual enhancements<br/>
                🔷 <strong>NEW: 3D Geometry</strong> - Interactive Three.js visualizations and particle systems
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <LineChart className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <h3 className="font-semibold mb-1">Dynamic Graphs</h3>
                <p className="text-sm text-gray-600">
                  Real-time parameter changes with trademark visual styling
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                <h3 className="font-semibold mb-1">Step Builder</h3>
                <p className="text-sm text-gray-600">
                  Interactive solutions with sound effects and animations
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Guided Learning</h3>
                <p className="text-sm text-gray-600">
                  Hints, explanations, and instant feedback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Built with React, Plotly.js, Framer Motion, and advanced mathematical libraries
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMathDemo;