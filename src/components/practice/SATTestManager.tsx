import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, SkipForward, AlertCircle } from "lucide-react";
import { Question } from "@/types/QuestionInterface";

interface SATSection {
  title: string;
  modules: SATModule[];
}

interface SATModule {
  title: string;
  startIndex: number;
  endIndex: number;
  timeLimit: number; // in minutes
  type: 'reading-writing' | 'math';
}

interface SATTestManagerProps {
  questions: Question[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  selectedAnswers: Record<number, string>;
}

const SATTestManager: React.FC<SATTestManagerProps> = ({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  selectedAnswers
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentModule, setCurrentModule] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  // Generate SAT sections based on questions
  const getSATSections = (): SATSection[] => {
    const totalQuestions = questions.length;
    const readingWritingCount = Math.ceil(totalQuestions * 0.55); // ~55% for Reading & Writing
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setModuleCompleted(true);
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
    setTimeRemaining(currentModuleData.timeLimit * 60); // Convert to seconds
    setIsActive(true);
    setTestStarted(true);
    setModuleCompleted(false);
    // Navigate to first question of current module
    onQuestionSelect(currentModuleData.startIndex);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resumeTimer = () => {
    if (timeRemaining > 0) {
      setIsActive(true);
    }
  };

  const nextModule = () => {
    if (currentModule < currentSectionData.modules.length - 1) {
      setCurrentModule(currentModule + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentModule(0);
    }
    setModuleCompleted(false);
    setIsActive(false);
  };

  const isQuestionInCurrentModule = (questionIndex: number): boolean => {
    return questionIndex >= currentModuleData.startIndex && questionIndex <= currentModuleData.endIndex;
  };

  const getModuleProgress = (): { answered: number; total: number } => {
    const total = currentModuleData.endIndex - currentModuleData.startIndex + 1;
    const answered = Object.keys(selectedAnswers)
      .map(Number)
      .filter(index => index >= currentModuleData.startIndex && index <= currentModuleData.endIndex)
      .length;
    return { answered, total };
  };

  const progress = getModuleProgress();
  const isCurrentModuleComplete = progress.answered === progress.total;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-blue-900">
              SAT Digital Test
            </CardTitle>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Section {currentSection + 1} of {sections.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                {currentSectionData.title}
              </h3>
              <p className="text-sm text-blue-600">
                {currentModuleData.title} • {currentModuleData.timeLimit} minutes
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining <= 300 ? "text-red-600" : "text-blue-800"}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <p className="text-sm text-blue-600">
                {progress.answered}/{progress.total} answered
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 justify-center">
            {!testStarted || (!isActive && timeRemaining === currentModuleData.timeLimit * 60) ? (
              <Button onClick={startModule} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4" />
                Start Module
              </Button>
            ) : (
              <>
                {isActive ? (
                  <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTimer} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                {(moduleCompleted || isCurrentModuleComplete) && (
                  <Button onClick={nextModule} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                    <SkipForward className="h-4 w-4" />
                    Next Module
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning for time */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Warning: Less than 5 minutes remaining!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module Navigation Restrictions */}
      {!isQuestionInCurrentModule(currentQuestionIndex) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                You can only access questions in the current module ({currentModuleData.title}). 
                Complete the current module to proceed.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SATTestManager;