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
      {/* Compact Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        {/* Header with Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{
              background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} />
            <span className="font-semibold text-sm text-gray-800">Text Simplifier</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSimplifications(!showSimplifications)}
              className="h-7 px-2 text-xs"
            >
              {showSimplifications ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              Synonyms
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
              className="h-7 px-2 text-xs"
            >
              {showExplanations ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              Explanations
            </Button>
          </div>
        </div>

        {/* Compact Legend */}
        <div className="border-t pt-3">
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Simplified words with [synonyms]</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Key sentences explained</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Difficult sentences explained</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Passage - No Card Wrapper */}
      <div className="w-full">
        <motion.div
          key={`${showSimplifications}-${showExplanations}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-base leading-7 p-6 bg-white rounded-lg text-justify w-full overflow-hidden"
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
    </div>
  );
};

export default SimplifierView;