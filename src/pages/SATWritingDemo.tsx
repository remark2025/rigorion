import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CheckCircle, ChevronDown, Clock, FileText, Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SATWritingEditor from '@/components/writing/SATWritingEditor';
import { useTheme } from '@/contexts/ThemeContext';
import {
  SAT_WRITING_CATEGORIES,
  getPromptsByCategory,
  getPromptById,
  SATWritingPrompt
} from '@/data/writing/prompts';

const SATWritingDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [currentStep, setCurrentStep] = useState<'question' | 'writing'>('question');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<SATWritingPrompt | null>(null);
  const [availablePrompts, setAvailablePrompts] = useState<SATWritingPrompt[]>([]);

  useEffect(() => {
    if (!selectedCategory) {
      setAvailablePrompts([]);
      setSelectedPromptId('');
      setSelectedPrompt(null);
      return;
    }

    const prompts = getPromptsByCategory(selectedCategory);
    setAvailablePrompts(prompts);
    setSelectedPromptId('');
    setSelectedPrompt(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedPromptId) {
      setSelectedPrompt(null);
      return;
    }

    const prompt = getPromptById(selectedPromptId);
    setSelectedPrompt(prompt ?? null);
  }, [selectedPromptId]);

  const handleStartWriting = () => {
    if (selectedPrompt) {
      setCurrentStep('writing');
    }
  };

  const handleSubmitEssay = (essay: string, timeSpent: number) => {
    console.log('Essay submitted:', { essay, timeSpent });
    // TODO: add navigation or feedback flow once available
  };

  const renderPromptPreview = () => {
    if (!selectedPrompt) {
      return (
        <Card className={`shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-8 text-center space-y-3">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Select a category and prompt to preview the question
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Choose a prompt to view the passage, question details, and start practicing.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`shadow-xl transition-all duration-300 hover:card-shimmer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-t-lg`}>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                SAT Writing Practice - {selectedPrompt.title}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedPrompt.passage
                  ? 'Read the passage carefully, then answer the question that follows'
                  : 'Read the prompt carefully and plan your response'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {selectedPrompt.passage && (
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                📖 Reading Passage
              </h3>
              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                <p className={`leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedPrompt.passage}
                </p>
              </div>
            </div>
          )}

          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-orange-900/20 border-orange-600' : 'bg-orange-50 border-orange-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>
              ✍️ Writing Prompt
            </h3>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-orange-200' : 'text-orange-900'}`}>
              {selectedPrompt.question}
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📋 Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Time Limit: {selectedPrompt.timeLimit} minutes
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Target Length: {selectedPrompt.expectedLength}
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

          <div className="text-center">
            <Button
              onClick={handleStartWriting}
              size="lg"
              disabled={!selectedPrompt}
              className={`${!selectedPrompt
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
              } transition-all duration-200 shadow-lg px-8 py-4`}
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
    );
  };

  if (currentStep === 'writing' && selectedPrompt) {
    return (
      <SATWritingEditor
        prompt={{
          title: `SAT Writing Practice - ${selectedPrompt.title}`,
          passage: selectedPrompt.passage,
          question: selectedPrompt.question,
          timeLimit: selectedPrompt.timeLimit,
          expectedLength: selectedPrompt.expectedLength
        }}
        onSubmit={handleSubmitEssay}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <style>{`
        .card-shimmer {
          position: relative;
          overflow: hidden;
        }

        .card-shimmer::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg,
            transparent 0%,
            transparent 40%,
            rgba(234, 88, 12, 0.15) 45%,
            rgba(192, 192, 192, 0.3) 50%,
            rgba(234, 88, 12, 0.15) 55%,
            transparent 60%,
            transparent 100%);
          animation: diagonalShimmer 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes diagonalShimmer {
          0% { transform: translate(-100%, 100%); }
          100% { transform: translate(100%, -100%); }
        }
      `}</style>

      <div className={`sticky top-0 z-10 border-b shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'} w-full`}>
        <div className="w-full px-8 py-4">
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
              {selectedPrompt && (
                <>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedPrompt.timeLimit} min limit
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {selectedPrompt.expectedLength}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${
                      selectedPrompt.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      selectedPrompt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {selectedPrompt.difficulty}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📚 Select Essay Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className={`w-full p-3 pr-10 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-orange-400 focus:border-orange-400'
                } appearance-none cursor-pointer`}
              >
                <option value="">Choose a category...</option>
                {SAT_WRITING_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 Select Writing Prompt
            </label>
            <div className="relative">
              <select
                value={selectedPromptId}
                onChange={(event) => setSelectedPromptId(event.target.value)}
                disabled={!selectedCategory || availablePrompts.length === 0}
                className={`w-full p-3 pr-10 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-900 disabled:text-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100 disabled:text-gray-400'
                } appearance-none cursor-pointer disabled:cursor-not-allowed`}
              >
                <option value="">
                  {!selectedCategory ? 'Select a category first...' : 'Choose a prompt...'}
                </option>
                {availablePrompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-none">
          {renderPromptPreview()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`transition-all duration-300 hover:card-shimmer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
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

          <Card className={`transition-all duration-300 hover:card-shimmer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
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

          <Card className={`transition-all duration-300 hover:card-shimmer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
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
  );
};

export default SATWritingDemo;