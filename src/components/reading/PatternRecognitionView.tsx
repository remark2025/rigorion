import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Palette, Info } from 'lucide-react';
import { ReadingSolution, KeyPhrase, READING_COLORS } from '@/types/ReadingInterface';

interface PatternRecognitionViewProps {
  passageText: string;
  solution: ReadingSolution;
  className?: string;
}

export const PatternRecognitionView: React.FC<PatternRecognitionViewProps> = ({
  passageText,
  solution,
  className
}) => {
  const [highlightingEnabled, setHighlightingEnabled] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['key_phrase', 'evidence', 'tone_shifter', 'key_vocabulary'])
  );
  const [showLegend, setShowLegend] = useState(true);

  const toggleHighlightType = (type: string) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  const renderHighlightedText = () => {
    if (!highlightingEnabled) {
      return <div className="whitespace-pre-wrap leading-relaxed">{passageText}</div>;
    }

    let highlightedText = passageText;
    const highlights: Array<{ start: number; end: number; phrase: KeyPhrase }> = [];

    // Collect all highlights that are currently selected
    solution.patternRecognition.keyPhrases
      .filter(phrase => selectedTypes.has(phrase.type))
      .forEach(phrase => {
        highlights.push({ start: phrase.start, end: phrase.end, phrase });
      });

    // Sort by position to avoid conflicts
    highlights.sort((a, b) => a.start - b.start);

    // Apply highlights from end to start to preserve positions
    const segments: Array<{ text: string; highlight?: KeyPhrase }> = [];
    let lastIndex = 0;

    highlights.forEach(({ start, end, phrase }) => {
      // Add text before highlight
      if (start > lastIndex) {
        segments.push({ text: passageText.slice(lastIndex, start) });
      }

      // Add highlighted text
      segments.push({ 
        text: passageText.slice(start, end),
        highlight: phrase
      });

      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < passageText.length) {
      segments.push({ text: passageText.slice(lastIndex) });
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.highlight) {
            const colorClass = READING_COLORS[segment.highlight.type];
            return (
              <motion.span
                key={index}
                initial={{ backgroundColor: 'transparent' }}
                animate={{ backgroundColor: colorClass.hex + '40' }} // 40 = 25% opacity
                transition={{ duration: 0.3 }}
                className={`${colorClass.bg} ${colorClass.text} px-1 py-0.5 rounded-sm cursor-help relative group`}
                title={segment.highlight.explanation}
              >
                {segment.text}
                {segment.highlight.explanation && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                    <div className="font-semibold capitalize">{segment.highlight.type.replace('_', ' ')}</div>
                    <div>{segment.highlight.explanation}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </motion.span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              Pattern Recognition
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className="flex items-center gap-1"
              >
                <Info className="h-4 w-4" />
                Legend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlightingEnabled(!highlightingEnabled)}
                className="flex items-center gap-1"
              >
                {highlightingEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {highlightingEnabled ? 'Hide' : 'Show'} Highlights
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <AnimatePresence>
            {showLegend && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="font-semibold mb-3 text-sm">Click to toggle highlighting:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {solution.patternRecognition.legend.map((item) => (
                    <motion.div
                      key={item.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={selectedTypes.has(item.type) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleHighlightType(item.type)}
                        className="w-full justify-start text-xs h-auto py-2"
                        style={{
                          backgroundColor: selectedTypes.has(item.type) ? item.color : 'transparent',
                          borderColor: item.color
                        }}
                      >
                        <div>
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-xs opacity-80">{item.description}</div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics */}
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {solution.patternRecognition.legend.map((item) => {
              const count = solution.patternRecognition.keyPhrases.filter(p => p.type === item.type).length;
              return (
                <div key={item.type} className="text-center p-2 border rounded-lg">
                  <div className="text-lg font-bold" style={{ color: item.color }}>{count}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Highlighted Passage */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Reading Passage with Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <motion.div
              key={highlightingEnabled ? 'highlighted' : 'plain'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-base leading-7 p-4 bg-white border rounded-lg"
            >
              {renderHighlightedText()}
            </motion.div>
          </div>

          {/* Analysis Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-blue-50 rounded-lg"
          >
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Pattern Analysis Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Key Phrases:</strong> Help identify main arguments and central themes
              </div>
              <div>
                <strong>Evidence:</strong> Facts, statistics, and examples that support claims
              </div>
              <div>
                <strong>Tone Shifters:</strong> Words that change the direction or mood of the argument
              </div>
              <div>
                <strong>Key Vocabulary:</strong> Important terms crucial for understanding the passage
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternRecognitionView;