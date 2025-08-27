import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import InteractiveReadingSolution from '@/components/reading/InteractiveReadingSolution';
import { sampleReadingPassage, sampleReadingSolution } from '@/data/sampleReadingSolutions';

const ReadingSolutionDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

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
                <h1 className="text-2xl font-bold">📖 Interactive Reading Solutions</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Experience advanced reading comprehension analysis tools
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              SAT Reading Comprehension - Climate Change Passage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This demo shows our three-tier reading analysis system designed to help students understand complex SAT reading passages through multiple approaches:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">Pattern Recognition</h3>
                <p className="text-sm text-gray-600">
                  Highlights key phrases, evidence, tone shifters, and vocabulary
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold mb-1">Text Simplifier</h3>
                <p className="text-sm text-gray-600">
                  Provides synonyms and explanations for difficult words and sentences
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-semibold mb-1">Idea Tracer</h3>
                <p className="text-sm text-gray-600">
                  Maps logical flow, main ideas, and argument structure
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Original Passage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📄 Original Reading Passage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="text-base leading-7 p-4 bg-white border rounded-lg">
                <div className="whitespace-pre-wrap">
                  {sampleReadingPassage}
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800">Reading Level</div>
                <div className="text-blue-600">Grade 12</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800">Word Count</div>
                <div className="text-green-600">{sampleReadingPassage.split(' ').length}</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800">Paragraphs</div>
                <div className="text-purple-600">5</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-800">Topic</div>
                <div className="text-orange-600">Climate Change</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Reading Solution */}
        <InteractiveReadingSolution 
          passageText={sampleReadingPassage}
          readingSolution={sampleReadingSolution}
          className="max-w-7xl mx-auto"
        />

        {/* Features Showcase */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🌟 Reading Analysis Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2 text-blue-600">🎯</div>
                <h3 className="font-semibold mb-1">Smart Highlighting</h3>
                <p className="text-sm text-gray-600">
                  AI-powered identification of key elements with color coding and tooltips
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2 text-green-600">📊</div>
                <h3 className="font-semibold mb-1">Reading Level Reduction</h3>
                <p className="text-sm text-gray-600">
                  Automatically simplifies complex vocabulary and sentence structures
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2 text-purple-600">🔄</div>
                <h3 className="font-semibold mb-1">Logical Flow Mapping</h3>
                <p className="text-sm text-gray-600">
                  Visual representation of argument structure and idea connections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Built with React, TypeScript, Framer Motion, and advanced NLP analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingSolutionDemo;