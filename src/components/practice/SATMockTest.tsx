import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, SkipForward, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Question } from "@/types/QuestionInterface";

interface SATMockTestProps {
  questions: Question[];
  onExit?: () => void;
}

interface SATModule {
  title: string;
  startIndex: number;
  endIndex: number;
  timeLimit: number;
  type: 'reading-writing' | 'math';
}

interface SATSection {
  title: string;
  modules: SATModule[];
}

const SATMockTest: React.FC<SATMockTestProps> = ({ questions, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [currentModule, setCurrentModule] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const getSATSections = (): SATSection[] => {
    const totalQuestions = questions.length;
    const readingWritingCount = Math.ceil(totalQuestions * 0.55);
    const mathCount = totalQuestions - readingWritingCount;

    const rwModule1Count = Math.ceil(readingWritingCount / 2);
    const rwModule2Count = readingWritingCount - rwModule1Count;
    const mathModule1Count = Math.ceil(mathCount / 2);
    const mathModule2Count = mathCount - mathModule1Count;

    return [
      {
        title: "Reading and Writing",
        modules: [
          {
            title: "Module 1",
            startIndex: 0,
            endIndex: rwModule1Count - 1,
            timeLimit: 32,
            type: 'reading-writing'
          },
          {
            title: "Module 2", 
            startIndex: rwModule1Count,
            endIndex: readingWritingCount - 1,
            timeLimit: 32,
            type: 'reading-writing'
          }
        ]
      },
      {
        title: "Math",
        modules: [
          {
            title: "Module 1",
            startIndex: readingWritingCount,
            endIndex: readingWritingCount + mathModule1Count - 1,
            timeLimit: 35,
            type: 'math'
          },
          {
            title: "Module 2",
            startIndex: readingWritingCount + mathModule1Count,
            endIndex: totalQuestions - 1,
            timeLimit: 35,
            type: 'math'
          }
        ]
      }
    ];
  };

  const sections = getSATSections();
  const currentSectionData = sections[currentSection];
  const currentModuleData = currentSectionData.modules[currentModule];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startModule = () => {
    setTimeRemaining(currentModuleData.timeLimit * 60);
    setIsActive(true);
    setTestStarted(true);
    setCurrentQuestionIndex(currentModuleData.startIndex);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const canNavigateToQuestion = (questionIndex: number): boolean => {
    return questionIndex >= currentModuleData.startIndex && questionIndex <= currentModuleData.endIndex;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentModuleData.endIndex) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > currentModuleData.startIndex) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderAnswerGrid = () => {
    const moduleQuestions = [];
    for (let i = currentModuleData.startIndex; i <= currentModuleData.endIndex; i++) {
      moduleQuestions.push(i);
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Answer Grid</h3>
          <div className="grid grid-cols-5 gap-2">
            {moduleQuestions.map((questionIndex) => {
              const questionNumber = questionIndex + 1;
              const isCurrentQuestion = questionIndex === currentQuestionIndex;
              const hasAnswer = selectedAnswers[questionIndex];
              
              return (
                <div
                  key={questionIndex}
                  className={`p-2 rounded-md border transition-all cursor-pointer ${
                    isCurrentQuestion
                      ? 'bg-blue-100 border-blue-300 shadow-sm'
                      : hasAnswer
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => canNavigateToQuestion(questionIndex) && setCurrentQuestionIndex(questionIndex)}
                >
                  <div className="text-center">
                    <span className={`text-sm font-medium ${
                      isCurrentQuestion ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {questionNumber}
                    </span>
                    {hasAnswer && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {hasAnswer}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 justify-center mt-2">
                    {['A', 'B', 'C', 'D'].map((choice) => (
                      <Button
                        key={choice}
                        variant="outline"
                        size="sm"
                        className={`h-5 w-5 p-0 text-xs ${
                          selectedAnswers[questionIndex] === choice 
                            ? 'bg-blue-100 border-blue-400 text-blue-800' 
                            : 'bg-white border-gray-300 text-gray-600'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnswers(prev => ({
                            ...prev,
                            [questionIndex]: choice
                          }));
                        }}
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 text-center">
          Answered: {Object.keys(selectedAnswers).filter(key => 
            Number(key) >= currentModuleData.startIndex && 
            Number(key) <= currentModuleData.endIndex
          ).length} / {currentModuleData.endIndex - currentModuleData.startIndex + 1}
        </div>
      </div>
    );
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed">
              {currentQuestion.question}
            </div>
            
            {currentQuestion.passage && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Passage:</div>
                <div className="whitespace-pre-wrap">{currentQuestion.passage}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {currentQuestion.choices.map((choice, index) => {
            const choiceLabel = String.fromCharCode(65 + index);
            const isSelected = selectedAnswers[currentQuestionIndex] === choiceLabel;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`w-full text-left justify-start p-4 h-auto ${
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswerSelect(choiceLabel)}
              >
                <span className="font-medium mr-3">{choiceLabel}.</span>
                <span>{choice}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button 
            onClick={prevQuestion} 
            disabled={currentQuestionIndex <= currentModuleData.startIndex}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button 
            onClick={nextQuestion} 
            disabled={currentQuestionIndex >= currentModuleData.endIndex}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-blue-900">
                SAT Digital Mock Test
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {currentSectionData.title} - {currentModuleData.title}
                </Badge>
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="h-5 w-5" />
                  <span className={timeRemaining <= 300 ? "text-red-600" : "text-blue-800"}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-blue-600">
                Time limit: {currentModuleData.timeLimit} minutes
              </div>
              <div className="flex gap-2">
                {!testStarted ? (
                  <Button onClick={startModule} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Module
                  </Button>
                ) : (
                  <>
                    {isActive ? (
                      <Button onClick={() => setIsActive(false)} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={() => setIsActive(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    {onExit && (
                      <Button onClick={onExit} variant="outline">
                        Exit Test
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {timeRemaining <= 300 && timeRemaining > 0 && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Warning: Less than 5 minutes remaining!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {testStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <CardContent className="p-6">
                  {renderQuestionContent()}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardContent className="p-6">
                  {renderAnswerGrid()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SATMockTest;