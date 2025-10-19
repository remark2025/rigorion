import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractiveGraph from './InteractiveGraph';
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
  const [currentParameters, setCurrentParameters] = useState<Record<string, number>>(() =>
    problem.parameters.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const handleParameterChange = (params: Record<string, number>) => {
    setCurrentParameters(params);
  };

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
    setCurrentParameters(
      problem.parameters.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})
    );
    setExpandedSteps(new Set());
  }, [problem]);

  const equationLabel = problem.defaultEquation ?? problem.graphConfig.title;

  const graphInsights = useMemo(() => {
    const type = problem.graphConfig.type;

    if (type === 'quadratic') {
      const a = currentParameters.a ?? 0;
      const b = currentParameters.b ?? 0;
      const c = currentParameters.c ?? 0;
      const vertexX = a !== 0 ? -b / (2 * a) : 0;
      const vertexY = a * vertexX * vertexX + b * vertexX + c;
      const yIntercept = c;
      const opens = a > 0 ? 'Upward' : a < 0 ? 'Downward' : 'Undefined';

      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 text-sm">Vertex</h4>
            <p className="text-orange-600 text-sm">
              ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 text-sm">Y-intercept</h4>
            <p className="text-green-600 text-sm">(0, {yIntercept.toFixed(2)})</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 text-sm">Opens</h4>
            <p className="text-blue-600 text-sm">{opens}</p>
          </div>
        </div>
      );
    }

    if (type === 'linear') {
      const m = currentParameters.m ?? 0;
      const bVal = currentParameters.b ?? 0;
      const xIntercept = m !== 0 ? -(bVal / m) : null;

      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <h4 className="font-semibold text-indigo-800 text-sm">Slope</h4>
            <p className="text-indigo-600 text-sm">m = {m.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <h4 className="font-semibold text-emerald-800 text-sm">Y-intercept</h4>
            <p className="text-emerald-600 text-sm">(0, {bVal.toFixed(2)})</p>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-center">
            <h4 className="font-semibold text-sky-800 text-sm">X-intercept</h4>
            <p className="text-sky-600 text-sm">
              {xIntercept === null ? 'Undefined (horizontal line)' : `(${xIntercept.toFixed(2)}, 0)`}
            </p>
          </div>
        </div>
      );
    }

    return null;
  }, [problem.graphConfig.type, currentParameters]);

  return (
    <div className={`w-full h-full bg-gray-100 p-4 ${className}`}>
      {/* Tab System */}
      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="interactive" className="text-sm">📊 Interactive</TabsTrigger>
          <TabsTrigger value="solution" className="text-sm">📝 Step by Step Solution</TabsTrigger>
        </TabsList>
        
        {/* Interactive Tab */}
        <TabsContent value="interactive" className="mt-0">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-800 flex items-center gap-2">
                <span>Problem Focus</span>
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

          {/* Interactive Graph */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <InteractiveGraph
                key={problem.id}
                equation={equationLabel}
                parameters={problem.parameters}
                config={problem.graphConfig}
                onParameterChange={handleParameterChange}
              />
            </CardContent>
          </Card>

          {/* Graph Analysis */}
          {graphInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-orange-800">Graph Analysis</CardTitle>
              </CardHeader>
              <CardContent>{graphInsights}</CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Step by Step Solution Tab */}
        <TabsContent value="solution" className="mt-0">
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
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveMathSolution;
