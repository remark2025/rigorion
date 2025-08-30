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

    </div>
  );
};

export default InteractiveReadingSolution;