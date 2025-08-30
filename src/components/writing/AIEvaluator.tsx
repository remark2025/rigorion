import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Lightbulb, TrendingUp, BookOpen, Target } from 'lucide-react';
import { AIEvaluation } from '@/types/WritingInterface';

interface AIEvaluatorProps {
  evaluation: AIEvaluation;
  className?: string;
}

const AIEvaluator: React.FC<AIEvaluatorProps> = ({ evaluation, className = "" }) => {
  const getScoreColor = (score: number) => {
    if (score >= 3.5) return 'text-green-600 bg-green-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 3.5) return 'Excellent';
    if (score >= 2.5) return 'Good';
    if (score >= 1.5) return 'Fair';
    return 'Needs Work';
  };

  const scoreCategories = [
    { label: 'Structure', score: evaluation.structureScore, icon: Target },
    { label: 'Coherence', score: evaluation.coherenceScore, icon: BookOpen },
    { label: 'Development', score: evaluation.developmentScore, icon: TrendingUp },
    { label: 'Language', score: evaluation.languageScore, icon: Lightbulb }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            AI Writing Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{evaluation.overallScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <Badge className={`px-3 py-1 ${getScoreColor(evaluation.overallScore)}`}>
              {getScoreLabel(evaluation.overallScore)}
            </Badge>
          </div>
          
          <Progress value={(evaluation.overallScore / 4) * 100} className="h-2 mb-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scoreCategories.map(({ label, score, icon: Icon }) => (
              <div key={label} className="text-center p-3 border rounded-lg">
                <Icon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold">{score.toFixed(1)}</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Template Usage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {evaluation.templateUsage.sectionsCompleted}/{evaluation.templateUsage.sectionsTotal}
              </div>
              <div className="text-sm text-blue-700">Sections Completed</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {evaluation.templateUsage.fixedSentencesUsed}/{evaluation.templateUsage.fixedSentencesAvailable}
              </div>
              <div className="text-sm text-green-700">Fixed Sentences Used</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {evaluation.templateUsage.transitionsUsed.length}
              </div>
              <div className="text-sm text-purple-700">Transitions Used</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {evaluation.templateUsage.missingElements.length}
              </div>
              <div className="text-sm text-orange-700">Missing Elements</div>
            </div>
          </div>

          {evaluation.templateUsage.transitionsUsed.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">Transitions Used Effectively:</h4>
              <div className="flex flex-wrap gap-2">
                {evaluation.templateUsage.transitionsUsed.map((transition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {transition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {evaluation.templateUsage.missingElements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm text-orange-700">Areas for Improvement:</h4>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.templateUsage.missingElements.map((element, index) => (
                  <li key={index} className="text-sm text-gray-600">{element}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Specific Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Detailed Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluation.feedback.specificSuggestions.map((suggestion, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-sm text-blue-700 mb-1">
                  {suggestion.section}: {suggestion.issue}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {suggestion.suggestion}
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                  Example: {suggestion.example}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evaluation.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIEvaluator;