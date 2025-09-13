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
      {/* Compact Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        {/* Header with Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" style={{
              background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} />
            <span className="font-semibold text-sm text-gray-800">Pattern Recognition</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
              className="h-7 px-2 text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              Legend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHighlightingEnabled(!highlightingEnabled)}
              className="h-7 px-2 text-xs"
            >
              {highlightingEnabled ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {highlightingEnabled ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        {/* Compact Legend & Statistics Combined */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-3"
            >
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                {solution.patternRecognition.legend.map((item) => {
                  const count = solution.patternRecognition.keyPhrases.filter(p => p.type === item.type).length;
                  return (
                    <Button
                      key={item.type}
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHighlightType(item.type)}
                      className="h-auto py-1.5 px-2 text-xs flex-1 sm:flex-none border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium">{item.label}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">{count}</Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reading Passage - No Card Wrapper */}
      <div className="w-full">
        <motion.div
          key={highlightingEnabled ? 'highlighted' : 'plain'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-base leading-7 p-6 bg-white rounded-lg text-justify w-full overflow-hidden"
        >
          {renderHighlightedText()}
        </motion.div>
      </div>
    </div>
  );
};

export default PatternRecognitionView;