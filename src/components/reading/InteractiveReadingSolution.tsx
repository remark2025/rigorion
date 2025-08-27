import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, Palette, Eye, GitBranch } from 'lucide-react';
import { ReadingSolution } from '@/types/ReadingInterface';
import PatternRecognitionView from './PatternRecognitionView';
import SimplifierView from './SimplifierView';
import IdeaTracerView from './IdeaTracerView';

interface InteractiveReadingSolutionProps {
  passageText: string;
  readingSolution: ReadingSolution;
  className?: string;
}

export const InteractiveReadingSolution: React.FC<InteractiveReadingSolutionProps> = ({
  passageText,
  readingSolution,
  className
}) => {
  const [activeReadingTab, setActiveReadingTab] = useState<"pattern" | "simplifier" | "idea-tracer">("pattern");

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Reading Solution Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>SAT Reading Analysis</span>
            </div>
            <Badge variant="secondary">Interactive Solution</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Choose your preferred analysis method to understand this reading passage more deeply.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Pattern Recognition
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Text Simplification
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              Idea Flow Analysis
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Reading Tabs */}
      <Tabs value={activeReadingTab} onValueChange={(value) => setActiveReadingTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pattern" className="text-xs flex items-center gap-1">
            <Palette className="h-3 w-3" />
            🎨 Pattern Recognition
          </TabsTrigger>
          <TabsTrigger value="simplifier" className="text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            📝 Simplifier
          </TabsTrigger>
          <TabsTrigger value="idea-tracer" className="text-xs flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            🧠 Idea Tracer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pattern" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PatternRecognitionView 
              passageText={passageText}
              solution={readingSolution}
            />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="simplifier" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SimplifierView 
              passageText={passageText}
              solution={readingSolution}
            />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="idea-tracer" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IdeaTracerView 
              passageText={passageText}
              solution={readingSolution}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Analysis Summary */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">📊 Reading Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {readingSolution.patternRecognition.keyPhrases.length}
              </div>
              <div className="text-sm text-purple-700">Key Elements Identified</div>
            </div>
            <div className="text-center p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {readingSolution.simplifier.wordSimplifications.length + readingSolution.simplifier.sentenceExplanations.length}
              </div>
              <div className="text-sm text-green-700">Items Simplified</div>
            </div>
            <div className="text-center p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {readingSolution.ideaTracer.paragraphIdeas.length}
              </div>
              <div className="text-sm text-blue-700">Ideas Traced</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>💡 Study Tip:</strong> Use Pattern Recognition to identify key elements, 
              Simplifier to understand difficult concepts, and Idea Tracer to follow the logical flow of arguments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveReadingSolution;