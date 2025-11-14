import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { MathInteractiveProblem } from '@/data/math';
import { linearEquationsModule } from '@/data/math';

interface InteractiveMathSolutionProps {
  problem?: MathInteractiveProblem;
  className?: string;
}

export const InteractiveMathSolution: React.FC<InteractiveMathSolutionProps> = ({
  problem = linearEquationsModule.interactiveProblem,
  className
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    setExpandedSteps(new Set());
  }, [problem]);


  return (
    <div className={`w-full h-full bg-gray-100 p-4 ${className}`}>
      {/* Problem Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-orange-800 flex items-center gap-2">
            <span>📝 Step by Step Solution</span>
            {problem.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs uppercase tracking-wide">
                {tag}
              </Badge>
            ))}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {problem.objective && (
            <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold">Objective</p>
          )}
          {problem.objective && (
            <p className="text-sm text-gray-700">{problem.objective}</p>
          )}
          <p className="text-sm font-semibold text-gray-900">{problem.question}</p>
          {problem.defaultEquation && (
            <p className="text-xs text-gray-500">Starting equation: {problem.defaultEquation}</p>
          )}
        </CardContent>
      </Card>

      {/* Step by Step Solution */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-orange-800">Solution Steps</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-96">
          <div className="space-y-3">
            {problem.solutionSteps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      Step {index + 1}: {step.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {step.description}
                    </div>
                  </div>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {expandedSteps.has(step.id) && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">From: </span>
                        <span className="font-mono text-gray-900">{step.fromExpression.display}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">To: </span>
                        <span className="font-mono text-gray-900">{step.toExpression.display}</span>
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {step.explanation}
                      </div>
                      {step.hint && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                          💡 Hint: {step.hint}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMathSolution;
