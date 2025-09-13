import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ArrowRight, ArrowDown, Target, ChevronDown, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';
import { ReadingSolution, ParagraphIdea } from '@/types/ReadingInterface';

interface IdeaTracerViewProps {
  passageText: string;
  solution: ReadingSolution;
  className?: string;
}

export const IdeaTracerView: React.FC<IdeaTracerViewProps> = ({
  passageText,
  solution,
  className
}) => {
  const [expandedParagraphs, setExpandedParagraphs] = useState<Set<number>>(new Set([0]));
  const [showRewritten, setShowRewritten] = useState(false);
  const [activeView, setActiveView] = useState<'flow' | 'rewritten'>('flow');

  const toggleParagraph = (index: number) => {
    const newExpanded = new Set(expandedParagraphs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedParagraphs(newExpanded);
  };

  const expandAll = () => {
    setExpandedParagraphs(new Set(solution.ideaTracer.paragraphIdeas.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedParagraphs(new Set());
  };

  const getStructureIcon = (structure: string) => {
    switch (structure) {
      case 'compare-contrast': return '⚖️';
      case 'problem-solution': return '🔧';
      case 'chronological': return '⏰';
      case 'cause-effect': return '🔄';
      case 'argumentative': return '💭';
      default: return '📋';
    }
  };

  const getStructureColor = (structure: string) => {
    switch (structure) {
      case 'compare-contrast': return 'bg-blue-100 text-blue-800';
      case 'problem-solution': return 'bg-green-100 text-green-800';
      case 'chronological': return 'bg-blue-100 text-blue-800';
      case 'cause-effect': return 'bg-orange-100 text-orange-800';
      case 'argumentative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" style={{
                background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <span className="text-gray-800 font-semibold">Idea Tracer</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView(activeView === 'flow' ? 'rewritten' : 'flow')}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                {activeView === 'flow' ? 'Show Rewritten' : 'Show Flow'}
              </Button>
              {activeView === 'flow' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="flex items-center gap-1"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Collapse All
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overall Structure Info - Compact */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Structure:</span>
              <Badge className={`${getStructureColor(solution.ideaTracer.logicalStructure)}`}>
                {getStructureIcon(solution.ideaTracer.logicalStructure)} {solution.ideaTracer.logicalStructure}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Paragraphs:</span>
              <span className="font-semibold text-gray-800">{solution.ideaTracer.paragraphIdeas.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Transitions:</span>
              <span className="font-semibold text-gray-800">{solution.ideaTracer.keyTransitions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {activeView === 'flow' ? (
          <motion.div
            key="flow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overall Thesis */}
            <Card className="border-none bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" style={{
                    background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }} />
                  <span className="text-gray-800 font-semibold">Overall Thesis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-lg font-medium text-gray-800">
                  {solution.ideaTracer.overallThesis}
                </div>
              </CardContent>
            </Card>

            {/* Paragraph Flow */}
            <div className="space-y-6 mt-8">
              {solution.ideaTracer.paragraphIdeas.map((paragraph, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${
                    index === 0 ? 'border-l-green-400' : 
                    index === solution.ideaTracer.paragraphIdeas.length - 1 ? 'border-l-red-400' :
                    'border-l-blue-400'
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleParagraph(index)}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {expandedParagraphs.has(index) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                          <span className="text-sm text-gray-700">Paragraph {index + 1}</span>
                          {index === 0 && <Badge variant="outline" className="text-gray-600 border-gray-300">Introduction</Badge>}
                          {index === solution.ideaTracer.paragraphIdeas.length - 1 && <Badge variant="outline" className="text-gray-600 border-gray-300">Conclusion</Badge>}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {expandedParagraphs.has(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent>
                            {/* Main Idea */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Lightbulb className="h-4 w-4" />
                                Main Idea
                              </h4>
                              <p className="text-gray-800 font-medium">
                                {paragraph.mainIdea}
                              </p>
                            </div>

                            {/* Supporting Points */}
                            {paragraph.supportingPoints.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Supporting Points</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {paragraph.supportingPoints.map((point, pointIndex) => (
                                    <li key={pointIndex} className="text-gray-700">
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Logical Flow */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-700 mb-2">Logical Flow</h4>
                              <p className="text-gray-700">
                                {paragraph.logicalFlow}
                              </p>
                            </div>

                            {/* Connections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paragraph.connectionToPrevious && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                    ← Connection to Previous
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {paragraph.connectionToPrevious}
                                  </p>
                                </div>
                              )}
                              {paragraph.connectionToNext && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                                    Connection to Next →
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {paragraph.connectionToNext}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Connection Arrow */}
                  {index < solution.ideaTracer.paragraphIdeas.length - 1 && (
                    <div className="flex justify-center my-6">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Main Conclusion */}
            <Card className="border-none bg-gray-50 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" style={{
                    background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }} />
                  <span className="text-gray-800 font-semibold">Main Conclusion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-lg font-medium text-gray-800">
                  {solution.ideaTracer.mainConclusion}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="rewritten"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="w-full">
              <div className="text-base leading-7 p-6 bg-white rounded-lg text-justify w-full overflow-hidden">
                {solution.ideaTracer.rewrittenVersion ? (
                  <div className="whitespace-pre-wrap">
                    {solution.ideaTracer.rewrittenVersion}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Rewritten version not available for this passage.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaTracerView;