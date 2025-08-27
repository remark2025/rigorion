import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PracticeDisplay from '@/components/practice/PracticeDisplay';
import { interactiveMathQuestions } from '@/data/interactiveMathQuestions';
import { useTheme } from '@/contexts/ThemeContext';

const InteractiveMathTest: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "quote">("problem");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const currentQuestion = interactiveMathQuestions[currentQuestionIndex];
  
  const displaySettings = {
    fontFamily: 'inter',
    fontSize: 16,
    colorStyle: 'default',
    emphasis: {
      bold: false,
      italic: false,
      underline: false,
      highlight: false
    }
  };

  const checkAnswer = (answer: string) => {
    const choiceIndex = answer.charCodeAt(0) - 65;
    const selectedChoiceText = currentQuestion.choices?.[choiceIndex];
    const correct = selectedChoiceText === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    // Auto-show solution after answering
    setTimeout(() => {
      setActiveTab("solution");
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < interactiveMathQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setActiveTab("problem");
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setActiveTab("problem");
    }
  };

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
                <h1 className="text-2xl font-bold">🧮 Interactive Math Questions Test</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Test the integrated interactive math solution system
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              Test Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestionIndex + 1} of {interactiveMathQuestions.length}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("problem")}
                  className={activeTab === "problem" ? "bg-blue-100" : ""}
                >
                  Problem
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("solution")}
                  className={activeTab === "solution" ? "bg-green-100" : ""}
                  disabled={!selectedAnswer}
                >
                  Interactive Solution
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{currentQuestion.chapter}</h3>
                <p className="text-sm text-gray-600">Difficulty: {currentQuestion.difficulty}</p>
              </div>
              
              <Button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === interactiveMathQuestions.length - 1}
                variant="outline"
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Display */}
        <PracticeDisplay
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={interactiveMathQuestions.length}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          checkAnswer={checkAnswer}
          displaySettings={displaySettings}
          boardColor="#ffffff"
          activeTab={activeTab}
          mode="manual"
        />

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔬 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>How to test:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Answer the multiple choice question first</li>
                <li>The solution tab will automatically activate after answering</li>
                <li>In the solution tab, you'll see the interactive math components:</li>
                <ul className="list-disc list-inside ml-6 space-y-1">
                  <li><strong>Interactive Graph:</strong> Adjust parameters with sliders to see real-time changes</li>
                  <li><strong>Step-by-Step Builder:</strong> Work through solution steps with interactive elements</li>
                  <li><strong>Math Expressions:</strong> See mathematical notation rendered properly</li>
                </ul>
                <li>Try different parameter values to understand how they affect the graph</li>
                <li>Complete interactive steps by entering values or selecting options</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800"><strong>Note:</strong> This demonstrates how interactive math solutions integrate seamlessly into the existing SAT practice system. Regular questions without interactiveSolution data will show normal solutions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMathTest;