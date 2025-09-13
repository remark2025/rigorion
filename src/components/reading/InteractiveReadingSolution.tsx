import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <TabsList 
          className="grid w-full grid-cols-3 mb-1 rounded-sm"
          style={{
            background: '#CFCFCF',
            height: '28px',
            padding: '3px',
            borderRadius: '2px',
            marginTop: '4px',
            marginBottom: '4px'
          }}
        >
          <TabsTrigger value="pattern">🎨 Pattern Recognition</TabsTrigger>
          <TabsTrigger value="simplifier">📝 Simplifier</TabsTrigger>
          <TabsTrigger value="idea-tracer">🧠 Idea Tracer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pattern" className="mt-6">
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
        
        <TabsContent value="simplifier" className="mt-6">
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
        
        <TabsContent value="idea-tracer" className="mt-6">
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