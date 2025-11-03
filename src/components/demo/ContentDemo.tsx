import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllMathModuleQuestions } from "@/utils/mathModuleConverter";
import { getAllReadingPassageQuestions } from "@/utils/readingPassageConverter";
import { SAT_WRITING_PROMPTS } from "@/data/writing/prompts";
import { BookOpen, Calculator, PenTool } from 'lucide-react';

const ContentDemo: React.FC = () => {
  const [mathQuestions, setMathQuestions] = useState<any[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const math = await getAllMathModuleQuestions();
        const reading = await getAllReadingPassageQuestions();
        
        setMathQuestions(math);
        setReadingQuestions(reading);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading content...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 New Website Content Demo
        </h1>
        <p className="text-lg text-gray-600">
          All content now loads from the website data structure (no database required!)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Math Questions */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calculator className="h-5 w-5" />
              Math Questions ({mathQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mathQuestions.slice(0, 3).map((q, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-sm text-blue-900 mb-1">
                  {q.module}
                </div>
                <div className="text-sm text-gray-700 line-clamp-2">
                  {q.content}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {q.difficulty}
                </Badge>
              </div>
            ))}
            {mathQuestions.length > 3 && (
              <div className="text-sm text-blue-600 text-center pt-2">
                +{mathQuestions.length - 3} more questions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading Questions */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BookOpen className="h-5 w-5" />
              Reading Questions ({readingQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readingQuestions.slice(0, 3).map((q, idx) => (
              <div key={idx} className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-sm text-green-900 mb-1">
                  {q.module}
                </div>
                <div className="text-sm text-gray-700 line-clamp-2">
                  {q.content}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {q.difficulty}
                </Badge>
              </div>
            ))}
            {readingQuestions.length > 3 && (
              <div className="text-sm text-green-600 text-center pt-2">
                +{readingQuestions.length - 3} more questions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Writing Prompts */}
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <PenTool className="h-5 w-5" />
              Writing Prompts ({SAT_WRITING_PROMPTS.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SAT_WRITING_PROMPTS.slice(-3).map((prompt, idx) => (
              <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-sm text-purple-900 mb-1">
                  {prompt.title}
                </div>
                <div className="text-sm text-gray-700 line-clamp-2">
                  {prompt.question.substring(0, 100)}...
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {prompt.category}
                </Badge>
              </div>
            ))}
            <div className="text-sm text-purple-600 text-center pt-2">
              All prompts available in writing section
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ✅ Content Successfully Loaded from Website
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mathQuestions.length}</div>
                <div className="text-sm text-gray-600">New Math Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{readingQuestions.length}</div>
                <div className="text-sm text-gray-600">New Reading Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{SAT_WRITING_PROMPTS.length}</div>
                <div className="text-sm text-gray-600">Total Writing Prompts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentDemo;