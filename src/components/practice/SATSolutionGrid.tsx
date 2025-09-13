import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types/QuestionInterface";
import SATTestManager from './SATTestManager';

interface SATSolutionGridProps {
  currentQuestion: Question | null;
  totalQuestions: number;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  selectedAnswers: Record<number, string>; // questionIndex -> selectedAnswer
  onAnswerSelect: (questionIndex: number, answer: string) => void;
  questions?: Question[]; // Full questions array for test manager
}

const SATSolutionGrid: React.FC<SATSolutionGridProps> = ({
  currentQuestion,
  totalQuestions,
  currentQuestionIndex,
  onQuestionSelect,
  selectedAnswers,
  onAnswerSelect,
  questions = []
}) => {
  // Determine sections based on question type and total questions
  const getQuestionSections = () => {
    const sections = [];
    
    // For SAT format: Reading & Writing (Module 1 & 2) + Math (Module 1 & 2)
    const readingWritingCount = Math.ceil(totalQuestions * 0.55); // ~54/98 questions
    const mathCount = totalQuestions - readingWritingCount;
    
    const rwModule1Count = Math.ceil(readingWritingCount / 2);
    const rwModule2Count = readingWritingCount - rwModule1Count;
    const mathModule1Count = Math.ceil(mathCount / 2);
    const mathModule2Count = mathCount - mathModule1Count;
    
    sections.push({
      title: "Reading and Writing",
      modules: [
        { title: "Module 1", startIndex: 0, endIndex: rwModule1Count - 1, timeLimit: "32 min" },
        { title: "Module 2", startIndex: rwModule1Count, endIndex: readingWritingCount - 1, timeLimit: "32 min" }
      ]
    });
    
    sections.push({
      title: "Math",
      modules: [
        { title: "Module 1", startIndex: readingWritingCount, endIndex: readingWritingCount + mathModule1Count - 1, timeLimit: "35 min" },
        { title: "Module 2", startIndex: readingWritingCount + mathModule1Count, endIndex: totalQuestions - 1, timeLimit: "35 min" }
      ]
    });
    
    return sections;
  };

  const sections = getQuestionSections();

  const renderAnswerButtons = (questionIndex: number) => {
    const choices = ['A', 'B', 'C', 'D'];
    const selectedAnswer = selectedAnswers[questionIndex];
    
    return (
      <div className="flex gap-1">
        {choices.map((choice) => (
          <Button
            key={choice}
            variant="outline"
            size="sm"
            className={`h-6 w-6 p-0 text-xs font-medium transition-all ${
              selectedAnswer === choice 
                ? 'bg-orange-100 border-orange-400 text-orange-800 shadow-sm' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onAnswerSelect(questionIndex, choice);
            }}
          >
            {choice}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full max-h-[600px] overflow-y-auto bg-white rounded-lg space-y-4">
      {/* SAT Test Manager */}
      {questions.length > 0 && (
        <div className="p-4">
          <SATTestManager
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={onQuestionSelect}
            selectedAnswers={selectedAnswers}
          />
        </div>
      )}
      
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">SAT Answer Sheet</h3>
        <p className="text-sm text-gray-600">Select your answers for each question</p>
      </div>
      
      <div className="p-4 space-y-6">
        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">{module.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {module.timeLimit}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: module.endIndex - module.startIndex + 1 }, (_, index) => {
                      const questionIndex = module.startIndex + index;
                      const questionNumber = questionIndex + 1;
                      const isCurrentQuestion = questionIndex === currentQuestionIndex;
                      const hasAnswer = selectedAnswers[questionIndex];
                      
                      return (
                        <div
                          key={questionIndex}
                          className={`p-2 rounded-md border transition-all cursor-pointer ${
                            isCurrentQuestion
                              ? 'bg-orange-100 border-orange-300 shadow-sm'
                              : hasAnswer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => onQuestionSelect(questionIndex)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${
                              isCurrentQuestion ? 'text-orange-800' : 'text-gray-700'
                            }`}>
                              {questionNumber}
                            </span>
                            {hasAnswer && (
                              <span className="text-xs text-green-600 font-medium">
                                {hasAnswer}
                              </span>
                            )}
                          </div>
                          {renderAnswerButtons(questionIndex)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Answered: {Object.keys(selectedAnswers).length} / {totalQuestions}
          </span>
          <span className="text-gray-600">
            Current: Question {currentQuestionIndex + 1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SATSolutionGrid;