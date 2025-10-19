import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Calculator, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InteractiveMathSolution from '@/components/math/InteractiveMathSolution';
import { useTheme } from '@/contexts/ThemeContext';
import type { MathModule } from '@/data/math';
import { linearEquationsModule, quadraticFunctionsModule } from '@/data/math';
import { mathPracticeService } from '@/services/mathPracticeService';

type ProblemKey = 'quadratic' | 'linear';

const INITIAL_MODULES: Record<ProblemKey, MathModule> = {
  quadratic: quadraticFunctionsModule,
  linear: linearEquationsModule,
};

const moduleOrder: Array<{ key: ProblemKey; label: string; subtitle: string }> = [
  { key: 'quadratic', label: 'Quadratic Functions', subtitle: 'y = ax² + bx + c' },
  { key: 'linear', label: 'Linear Equations', subtitle: 'y = mx + b' }
];

const InteractiveMathDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedProblem, setSelectedProblem] = useState<ProblemKey>('quadratic');
  const [modules, setModules] = useState<Record<ProblemKey, MathModule>>(INITIAL_MODULES);

  useEffect(() => {
    let isMounted = true;

    const loadModules = async () => {
      const [linear, quadratic] = await Promise.all([
        mathPracticeService.getModuleById(linearEquationsModule.id),
        mathPracticeService.getModuleById(quadraticFunctionsModule.id)
      ]);

      if (!isMounted) return;

      setModules({
        linear: linear ?? linearEquationsModule,
        quadratic: quadratic ?? quadraticFunctionsModule,
      });
    };

    loadModules();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeModule = modules[selectedProblem];
  const activeProblem = activeModule.interactiveProblem;

  const questionCountLabel = useMemo(() => {
    const count = activeModule.questionCount;
    if (count === 1) return '1 practice question';
    return `${count} practice questions`;
  }, [activeModule.questionCount]);

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
                  Explore dynamic graphing experiences paired with SAT-style practice questions
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {moduleOrder.map(({ key, label, subtitle }) => (
                <Button
                  key={key}
                  variant={selectedProblem === key ? 'default' : 'outline'}
                  onClick={() => setSelectedProblem(key)}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <LineChart className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs opacity-80">{subtitle}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Solution */}
        <InteractiveMathSolution 
          problem={activeProblem}
          className="max-w-7xl mx-auto"
        />

        {/* Question bank */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Practice Questions
            </CardTitle>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {questionCountLabel} curated for <strong>{activeModule.skill}</strong>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeModule.questionBank.map((question, index) => {
              const correctChoice = question.choices[question.correctChoiceIndex];

              return (
                <div
                  key={question.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold">
                        Question {index + 1}
                      </p>
                      <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {question.prompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {question.difficulty.toLowerCase()}
                      </Badge>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {question.skillFocus}
                      </Badge>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-2 text-sm">
                    {question.choices.map((choice, choiceIndex) => (
                      <li
                        key={`${question.id}-${choice}`}
                        className={`flex items-start gap-2 rounded-lg border p-2 ${
                          choiceIndex === question.correctChoiceIndex
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                            : isDarkMode
                            ? 'border-gray-700 bg-gray-900/60 text-gray-200'
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="font-semibold text-xs mt-1">{String.fromCharCode(65 + choiceIndex)}.</span>
                        <span>{choice}</span>
                      </li>
                    ))}
                  </ul>

                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-orange-600">
                      View explanation &amp; strategy
                    </summary>
                    <div className="mt-2 space-y-2 text-sm">
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Correct answer:</strong> {correctChoice}
                      </p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {question.explanation}
                      </p>
                      {question.strategyTip && (
                        <p className="text-xs text-orange-500">💡 {question.strategyTip}</p>
                      )}
                    </div>
                  </details>
                </div>
              );
            })}
          </CardContent>
        </Card>

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
                ✨ <strong>Trademark Visual Design</strong> - Signature colors and animations
                <br />
                🔊 <strong>Sound Effects</strong> - Audio feedback for interactions (click sound button to toggle)
                <br />
                ⚡ <strong>Smooth Animations</strong> - Fluid transitions and visual enhancements
                <br />
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
                <Calculator className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <h3 className="font-semibold mb-1">Step-by-Step Reasoning</h3>
                <p className="text-sm text-gray-600">
                  Guided algebraic moves with hints and explainers
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge className="mx-auto mb-2">SAT</Badge>
                <h3 className="font-semibold mb-1">SAT-Ready Practice</h3>
                <p className="text-sm text-gray-600">
                  Authentic question bank aligned with the latest blueprint
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMathDemo;

