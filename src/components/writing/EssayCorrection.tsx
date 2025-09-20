import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Edit3, BookOpen, Zap, Target, TrendingUp, Award } from 'lucide-react';
import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';

export interface EssayCorrectionProps {
  originalEssay: string;
  corrections: CorrectionMark[];
  satScore?: SATWritingScore;
  overallFeedback?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score?: number;
  };
  onCorrectionApply?: (correctionId: string) => void;
  onCorrectionReject?: (correctionId: string) => void;
  className?: string;
}

const EssayCorrection: React.FC<EssayCorrectionProps> = ({
  originalEssay,
  corrections,
  satScore,
  overallFeedback,
  onCorrectionApply,
  onCorrectionReject,
  className = ""
}) => {
  const [appliedCorrections, setAppliedCorrections] = useState<Set<string>>(new Set());
  const [rejectedCorrections, setRejectedCorrections] = useState<Set<string>>(new Set());
  const renderCorrectedText = () => {
    const sortedCorrections = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    sortedCorrections.forEach((correction, index) => {
      // Add text before correction
      if (correction.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {originalEssay.substring(lastIndex, correction.startIndex)}
          </span>
        );
      }

      // Add correction with styling based on type
      const correctionClass = getCorrectionClass(correction.type);
      const correctionId = `correction-${index}`;

      elements.push(
        <span key={correctionId} className={`relative group ${correctionClass}`}>
          {/* Original text with strikethrough */}
          <span className="line-through opacity-60 bg-red-100 px-1 rounded">
            {correction.originalText}
          </span>
          
          {/* Corrected text */}
          <span className="bg-green-100 px-1 rounded ml-1 font-medium">
            {correction.correctedText}
          </span>
          
          {/* Grammar rule explanation with icon */}
          <span className="text-xs text-blue-600 ml-1 font-semibold flex items-center gap-1">
            <span>{correction.icon || getCorrectionIcon(correction.type)}</span>
            [{correction.grammarRule || getDefaultRule(correction.type)}]
            {correction.severity === 'major' && <span className="text-red-500 font-bold">!</span>}
          </span>
          
          {/* Action buttons for autofix-safe corrections */}
          {correction.autofixSafe && !appliedCorrections.has(correction.id) && !rejectedCorrections.has(correction.id) && (
            <div className="inline-flex ml-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs text-green-600 hover:bg-green-50 border-green-300"
                onClick={() => {
                  setAppliedCorrections(prev => new Set([...prev, correction.id]));
                  onCorrectionApply?.(correction.id);
                }}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 border-red-300"
                onClick={() => {
                  setRejectedCorrections(prev => new Set([...prev, correction.id]));
                  onCorrectionReject?.(correction.id);
                }}
              >
                ✗
              </Button>
            </div>
          )}
          
          {/* Detailed tooltip on hover */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <span>{correction.icon || getCorrectionIcon(correction.type)}</span>
              {correction.type.replace('_', ' ').toUpperCase()}
              <Badge variant="outline" className="text-xs">
                {correction.severity}
              </Badge>
            </div>
            <div className="mb-2">{correction.explanation}</div>
            {correction.grammarRule && (
              <div className="text-blue-300">
                <strong>Rule:</strong> {correction.grammarRule}
              </div>
            )}
            {correction.suggestions && correction.suggestions.length > 0 && (
              <div className="text-yellow-300 mt-2">
                <strong>Alternatives:</strong> {correction.suggestions.join(', ')}
              </div>
            )}
            <div className="text-gray-400 text-xs mt-2">
              Confidence: {Math.round((correction.confidence || 0.8) * 100)}%
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </span>
      );

      lastIndex = correction.endIndex;
    });

    // Add remaining text
    if (lastIndex < originalEssay.length) {
      elements.push(
        <span key="text-final">
          {originalEssay.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const getCorrectionClass = (type: CorrectionMark['type']): string => {
    const baseClass = "inline-block border-b-2 cursor-help transition-all duration-200";
    switch (type) {
      case 'grammar':
        return `${baseClass} border-red-500 hover:bg-red-50`;
      case 'word_choice':
        return `${baseClass} border-blue-500 hover:bg-blue-50`;
      case 'sentence_structure':
        return `${baseClass} border-yellow-500 hover:bg-yellow-50`;
      case 'punctuation':
        return `${baseClass} border-purple-500 hover:bg-purple-50`;
      case 'spelling':
        return `${baseClass} border-orange-500 hover:bg-orange-50`;
      default:
        return `${baseClass} border-gray-500 hover:bg-gray-50`;
    }
  };

  const getDefaultRule = (type: CorrectionMark['type']): string => {
    switch (type) {
      case 'grammar':
        return 'Grammar Error';
      case 'word_choice':
        return 'Word Choice';
      case 'sentence_structure':
        return 'Sentence Structure';
      case 'punctuation':
        return 'Punctuation';
      case 'spelling':
        return 'Spelling';
      default:
        return 'Correction';
    }
  };

  const getCorrectionIcon = (type: CorrectionMark['type']) => {
    switch (type) {
      case 'grammar':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'word_choice':
        return <Edit3 className="h-4 w-4 text-blue-500" />;
      case 'sentence_structure':
        return <BookOpen className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCorrectionStats = () => {
    const stats = corrections.reduce((acc, correction) => {
      acc[correction.type] = (acc[correction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([type, count]) => ({
      type: type as CorrectionMark['type'],
      count,
      label: type.replace('_', ' ').toUpperCase()
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Corrected Essay Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Teacher Corrections
          </CardTitle>
          <div className="text-sm text-gray-600">
            Hover over highlighted text to see detailed explanations
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="bg-white p-6 border rounded-lg shadow-sm leading-relaxed text-base">
              {renderCorrectedText()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Correction Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {getCorrectionStats().map(({ type, count, label }) => (
              <div key={type} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getCorrectionIcon(type)}
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Correction Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded"></div>
                <span>Grammar Errors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span>Word Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-500 rounded"></div>
                <span>Sentence Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-purple-500 rounded"></div>
                <span>Punctuation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500 rounded"></div>
                <span>Spelling</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Feedback */}
      {overallFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Overall Feedback
              {overallFeedback.score && (
                <Badge variant="outline" className="ml-auto">
                  Score: {overallFeedback.score}/100
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overallFeedback.strengths && overallFeedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {overallFeedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {overallFeedback.weaknesses && overallFeedback.weaknesses.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Areas for Improvement
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {overallFeedback.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {overallFeedback.suggestions && overallFeedback.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Suggestions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {overallFeedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EssayCorrection;