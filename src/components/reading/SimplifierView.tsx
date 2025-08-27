import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { ReadingSolution, WordSimplification, SentenceExplanation } from '@/types/ReadingInterface';

interface SimplifierViewProps {
  passageText: string;
  solution: ReadingSolution;
  className?: string;
}

export const SimplifierView: React.FC<SimplifierViewProps> = ({
  passageText,
  solution,
  className
}) => {
  const [showSimplifications, setShowSimplifications] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const renderSimplifiedText = () => {
    let result = passageText;
    
    // Apply word simplifications
    if (showSimplifications) {
      const words = [...solution.simplifier.wordSimplifications].sort((a, b) => b.start - a.start);
      words.forEach((word) => {
        const before = result.slice(0, word.start);
        const after = result.slice(word.end);
        const simplification = (
          <span
            key={word.original}
            className="relative group"
            onMouseEnter={() => setHoveredWord(word.original)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded-sm cursor-help">
              {word.original}
            </span>
            <span className="text-green-600 font-medium ml-1">
              [{word.synonym}]
            </span>
            {word.explanation && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                <div className="font-semibold">{word.original} → {word.synonym}</div>
                <div>{word.explanation}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </span>
        );
        // For now, we'll keep the original word and show the simplification inline
        result = before + word.original + ` [${word.synonym}]` + after;
      });
    }

    return result;
  };

  const renderTextWithExplanations = () => {
    const sentences = passageText.split(/([.!?]+)/);
    
    return sentences.map((sentence, index) => {
      const explanation = solution.simplifier.sentenceExplanations.find(exp => 
        exp.sentence.trim() === sentence.trim()
      );

      if (explanation && showExplanations) {
        return (
          <span key={index} className="relative group">
            <span className={`${
              explanation.complexity === 'difficult' 
                ? 'bg-red-100 text-red-800 border-b-2 border-red-300' 
                : 'bg-blue-100 text-blue-800 border-b-2 border-blue-300'
            } cursor-help`}>
              {sentence}
            </span>
            <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-md">
              <div className="font-semibold">
                {explanation.complexity === 'difficult' ? '🤔 Complex Sentence' : '🔑 Key Sentence'}
              </div>
              <div>{explanation.explanation}</div>
              <div className="absolute bottom-full left-4 border-4 border-transparent border-b-gray-900"></div>
            </div>
          </span>
        );
      }

      return <span key={index}>{sentence}</span>;
    });
  };

  const combineSimplifications = () => {
    let segments: Array<{ text: string; isSimplified?: boolean; word?: WordSimplification }> = [];
    let currentPos = 0;

    const sortedWords = [...solution.simplifier.wordSimplifications].sort((a, b) => a.start - b.start);

    sortedWords.forEach(word => {
      // Add text before the word
      if (word.start > currentPos) {
        segments.push({ text: passageText.slice(currentPos, word.start) });
      }

      // Add the simplified word
      segments.push({
        text: passageText.slice(word.start, word.end),
        isSimplified: true,
        word: word
      });

      currentPos = word.end;
    });

    // Add remaining text
    if (currentPos < passageText.length) {
      segments.push({ text: passageText.slice(currentPos) });
    }

    return segments;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Text Simplifier
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimplifications(!showSimplifications)}
                className="flex items-center gap-1"
              >
                {showSimplifications ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Synonyms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="flex items-center gap-1"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Explanations
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Reading Level Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                Grade {solution.simplifier.readingLevel.original}
              </div>
              <div className="text-sm text-red-700">Original Level</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-2xl">→</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                Grade {solution.simplifier.readingLevel.simplified}
              </div>
              <div className="text-sm text-green-700">Simplified Level</div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Simplified words with [synonyms]</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-b-2 border-blue-300 rounded"></div>
              <span>Key sentences explained</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-b-2 border-red-300 rounded"></div>
              <span>Difficult sentences explained</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Passage */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Simplified Reading Passage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <motion.div
              key={`${showSimplifications}-${showExplanations}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-base leading-7 p-4 bg-white border rounded-lg"
            >
              <div className="whitespace-pre-wrap">
                {combineSimplifications().map((segment, index) => (
                  <span key={index}>
                    {segment.isSimplified && segment.word && showSimplifications ? (
                      <span
                        className="relative group bg-green-100 text-green-800 px-1 py-0.5 rounded-sm cursor-help"
                        title={segment.word.explanation}
                      >
                        {segment.text}
                        <span className="text-green-600 font-medium ml-1">
                          [{segment.word.synonym}]
                        </span>
                        {segment.word.explanation && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                            <div className="font-semibold">{segment.word.original} → {segment.word.synonym}</div>
                            <div>{segment.word.explanation}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </span>
                    ) : (
                      segment.text
                    )}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Simplification Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-green-50 rounded-lg"
          >
            <h4 className="font-semibold text-green-800 mb-2">📊 Simplification Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border border-green-200 rounded-lg bg-white">
                <div className="text-lg font-bold text-green-600">
                  {solution.simplifier.wordSimplifications.length}
                </div>
                <div className="text-sm text-green-700">Words Simplified</div>
              </div>
              <div className="text-center p-3 border border-green-200 rounded-lg bg-white">
                <div className="text-lg font-bold text-green-600">
                  {solution.simplifier.sentenceExplanations.length}
                </div>
                <div className="text-sm text-green-700">Sentences Explained</div>
              </div>
              <div className="text-center p-3 border border-green-200 rounded-lg bg-white">
                <div className="text-lg font-bold text-green-600">
                  {solution.simplifier.readingLevel.original - solution.simplifier.readingLevel.simplified}
                </div>
                <div className="text-sm text-green-700">Grade Levels Reduced</div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifierView;