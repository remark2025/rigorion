import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText, Bot, CheckCircle, Award, BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SATWritingEditor from '@/components/writing/SATWritingEditor';
import { useTheme } from '@/contexts/ThemeContext';

const SATWritingDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState<'question' | 'writing'>('question');

  // Real SAT Writing question from practice tests
  const satQuestion = {
    title: "SAT Writing Practice - Argumentative Essay",
    passage: `Social media has fundamentally changed how people communicate and share information. While these platforms offer unprecedented connectivity, they also present significant challenges to mental health, particularly among teenagers.

Research conducted by various universities has shown that excessive social media use correlates with increased rates of anxiety and depression in young people. The constant comparison with others' carefully curated posts can lead to feelings of inadequacy and low self-worth.

However, social media also provides valuable benefits. It allows people to maintain relationships across long distances, access educational content, and find communities of support for various interests and challenges.`,
    
    question: "Write a well-organized essay in which you develop a position on whether the benefits of social media outweigh its potential harm to mental health. Use appropriate evidence and examples to support your argument.",
    
    timeLimit: 50,
    expectedLength: "400-600 words"
  };

  const handleStartWriting = () => {
    setCurrentStep('writing');
  };

  const handleSubmitEssay = (essay: string, timeSpent: number) => {
    console.log('Essay submitted:', { essay, timeSpent });
    // Here you could navigate to a results page or show feedback
  };

  if (currentStep === 'writing') {
    return (
      <SATWritingEditor
        prompt={satQuestion}
        onSubmit={handleSubmitEssay}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    SAT Writing Practice
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Official Practice Question
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {satQuestion.timeLimit} min limit
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {satQuestion.expectedLength}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Question Display */}
        <div className="max-w-4xl mx-auto">
          <Card className={`shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-t-lg`}>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {satQuestion.title}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Read the passage carefully, then answer the question that follows
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Passage */}
              <div className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  📖 Reading Passage
                </h3>
                <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {satQuestion.passage}
                  </p>
                </div>
              </div>

              {/* Question */}
              <div className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-orange-900/20 border-orange-600' : 'bg-orange-50 border-orange-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>
                  ✍️ Writing Prompt
                </h3>
                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                  {satQuestion.question}
                </p>
              </div>

              {/* Instructions */}
              <div className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📋 Instructions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Time Limit: {satQuestion.timeLimit} minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Target Length: {satQuestion.expectedLength}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      AI-powered feedback
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      SAT scoring rubric
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  onClick={handleStartWriting}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg px-8 py-4"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Writing Essay
                </Button>
                <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your timer will start when you begin writing
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Plan First
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Spend 5-10 minutes outlining your argument and key points
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Use Evidence
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Support your position with specific examples and reasoning
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manage Time
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Leave 5-10 minutes at the end for proofreading and revision
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATWritingDemo;