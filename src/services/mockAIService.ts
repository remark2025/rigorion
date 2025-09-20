import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';

// Mock AI service that provides realistic responses for testing
export class MockAIService {
  async analyzeEssay(essayText: string): Promise<{
    corrections: CorrectionMark[];
    satScore: SATWritingScore;
    aiAnalysis: any;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const corrections = this.generateRealisticCorrections(essayText);
    const satScore = this.generateSATScore(corrections, essayText);
    const aiAnalysis = this.generateAnalysis(essayText, corrections);

    return { corrections, satScore, aiAnalysis };
  }

  private generateRealisticCorrections(essayText: string): CorrectionMark[] {
    const corrections: CorrectionMark[] = [];
    let correctionId = 0;

    // Common patterns that would be caught by real AI
    const patterns = [
      {
        search: /\ba\s+(integral|important|essential)/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'grammar' as const,
          correctedText: `an ${match[1]}`,
          explanation: 'Use "an" before words beginning with vowel sounds.',
          grammarRule: 'Articles - A vs. An',
          severity: 'minor' as const
        })
      },
      {
        search: /\bsocial\s+medium\s+use\b/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'word_choice' as const,
          correctedText: 'social media use',
          explanation: '"Social media" is the correct plural form. "Medium" is singular.',
          grammarRule: 'Singular vs. Plural - Media/Medium',
          severity: 'minor' as const
        })
      },
      {
        search: /\bvery\s+(good|bad|important|interesting)/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'word_choice' as const,
          correctedText: this.getStrongerWord(match[1]),
          explanation: 'Use more specific adjectives instead of "very + basic adjective" for stronger writing.',
          grammarRule: 'Word Choice - Specificity',
          severity: 'minor' as const
        })
      },
      {
        search: /\bin\s+order\s+to\b/gi,
        getCorrection: () => ({
          type: 'concision' as const,
          correctedText: 'to',
          explanation: 'Remove unnecessary words. "To" is more concise than "in order to."',
          grammarRule: 'Concision - Wordiness',
          severity: 'minor' as const
        })
      },
      {
        search: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
        getCorrection: () => ({
          type: 'concision' as const,
          correctedText: 'because',
          explanation: 'Replace wordy phrases with concise alternatives.',
          grammarRule: 'Concision - Phrase Reduction',
          severity: 'minor' as const
        })
      },
      {
        search: /\bthere\s+is\s+\w+\s+that\b/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'sentence_structure' as const,
          correctedText: match[0].replace(/there\s+is\s+(\w+)\s+that/, '$1'),
          explanation: 'Eliminate "there is/are" constructions for more direct, active writing.',
          grammarRule: 'Sentence Structure - Active Voice',
          severity: 'minor' as const
        })
      },
      {
        search: /\bwhich\s+is\s+(\w+)/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'sentence_structure' as const,
          correctedText: match[1],
          explanation: 'Consider combining sentences or eliminating unnecessary relative clauses.',
          grammarRule: 'Sentence Structure - Concision',
          severity: 'minor' as const
        })
      },
      {
        search: /\b(alot|a\s+lot\s+of)\b/gi,
        getCorrection: (match: RegExpMatchArray) => ({
          type: 'spelling' as const,
          correctedText: match[0].includes('alot') ? 'a lot' : 'many',
          explanation: match[0].includes('alot') ? '"A lot" is always two words.' : 'Use "many" for countable nouns instead of "a lot of."',
          grammarRule: match[0].includes('alot') ? 'Spelling - Common Errors' : 'Word Choice - Precision',
          severity: match[0].includes('alot') ? 'major' as const : 'minor' as const
        })
      }
    ];

    // Apply pattern-based corrections
    patterns.forEach(pattern => {
      const matches = [...essayText.matchAll(pattern.search)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          const correction = pattern.getCorrection(match);
          corrections.push({
            id: `mock_${correctionId++}`,
            type: correction.type,
            severity: correction.severity,
            confidence: 0.9,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            originalText: match[0],
            correctedText: correction.correctedText,
            explanation: correction.explanation,
            grammarRule: correction.grammarRule,
            ruleId: `mock_${correction.type}_${correctionId}`,
            autofixSafe: correction.severity === 'minor',
            icon: this.getCorrectionIcon(correction.type)
          });
        }
      });
    });

    // Add some contextual corrections that real AI would catch
    if (essayText.toLowerCase().includes('people')) {
      const peopleIndex = essayText.toLowerCase().indexOf('people');
      const beforePeople = essayText.substring(Math.max(0, peopleIndex - 20), peopleIndex);
      
      if (beforePeople.includes('less ') || beforePeople.includes('amount of ')) {
        corrections.push({
          id: `mock_${correctionId++}`,
          type: 'word_choice',
          severity: 'minor',
          confidence: 0.85,
          startIndex: peopleIndex - 5,
          endIndex: peopleIndex + 6,
          originalText: essayText.substring(peopleIndex - 5, peopleIndex + 6),
          correctedText: essayText.substring(peopleIndex - 5, peopleIndex + 6).replace(/less|amount of/, 'fewer'),
          explanation: 'Use "fewer" with countable nouns like "people." Use "less" with uncountable quantities.',
          grammarRule: 'Quantifiers - Fewer vs. Less',
          ruleId: 'mock_quantifiers',
          autofixSafe: true,
          icon: '🔵'
        });
      }
    }

    // Add sophisticated feedback even for high-quality essays
    if (corrections.length === 0 && essayText.length > 300) {
      // Look for advanced style improvements
      const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const longSentences = sentences.filter(s => s.split(' ').length > 30);
      
      if (longSentences.length > 0) {
        const sentence = longSentences[0];
        const sentenceStart = essayText.indexOf(sentence.trim());
        if (sentenceStart !== -1) {
          corrections.push({
            id: `mock_${correctionId++}`,
            type: 'sentence_structure',
            severity: 'minor',
            confidence: 0.75,
            startIndex: sentenceStart,
            endIndex: sentenceStart + sentence.length,
            originalText: sentence.trim(),
            correctedText: sentence.trim() + ' [Consider breaking into shorter sentences]',
            explanation: 'While grammatically correct, consider breaking very long sentences for improved readability.',
            grammarRule: 'Sentence Length - Readability',
            ruleId: 'mock_readability',
            autofixSafe: false,
            icon: '🟡'
          });
        }
      }

      // Add style enhancement suggestions
      if (essayText.includes('However,') && essayText.includes('Furthermore,')) {
        const furthermoreIndex = essayText.indexOf('Furthermore,');
        corrections.push({
          id: `mock_${correctionId++}`,
          type: 'rhetoric',
          severity: 'minor',
          confidence: 0.70,
          startIndex: furthermoreIndex,
          endIndex: furthermoreIndex + 12,
          originalText: 'Furthermore,',
          correctedText: 'Additionally,',
          explanation: 'Vary transitional phrases to avoid repetition and enhance flow.',
          grammarRule: 'Transitions - Variety',
          ruleId: 'mock_transitions',
          autofixSafe: true,
          icon: '🔷'
        });
      }
    }

    return corrections.sort((a, b) => a.startIndex - b.startIndex);
  }

  private getStrongerWord(word: string): string {
    const alternatives: { [key: string]: string } = {
      'good': 'excellent',
      'bad': 'terrible',
      'important': 'crucial',
      'interesting': 'fascinating'
    };
    return alternatives[word.toLowerCase()] || word;
  }

  private generateSATScore(corrections: CorrectionMark[], essayText: string): SATWritingScore {
    const weights = { grammar: 40, structure: 25, concision: 20, rhetoric: 15 };
    const penalties = { major: 3, minor: 1 };
    
    let traits = { ...weights };
    let majorCount = 0;
    let minorCount = 0;
    const breakdown: string[] = [];

    // Apply penalties
    corrections.forEach(correction => {
      const penalty = penalties[correction.severity];
      
      if (correction.severity === 'major') majorCount++;
      else minorCount++;

      if (correction.type === 'grammar' || correction.type === 'spelling') {
        traits.grammar = Math.max(0, traits.grammar - penalty);
        breakdown.push(`-${penalty} pts: ${correction.grammarRule} (${correction.severity})`);
      } else if (correction.type === 'sentence_structure' || correction.type === 'punctuation') {
        traits.structure = Math.max(0, traits.structure - penalty);
        breakdown.push(`-${penalty} pts: ${correction.grammarRule} (${correction.severity})`);
      } else if (correction.type === 'concision') {
        traits.concision = Math.max(0, traits.concision - penalty);
        breakdown.push(`-${penalty} pts: ${correction.grammarRule} (${correction.severity})`);
      } else if (correction.type === 'rhetoric' || correction.type === 'word_choice') {
        traits.rhetoric = Math.max(0, traits.rhetoric - penalty);
        breakdown.push(`-${penalty} pts: ${correction.grammarRule} (${correction.severity})`);
      }
    });

    // Add bonuses for good writing (but cap at original weights)
    const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = essayText.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25) {
      const bonus = Math.min(2, weights.structure - traits.structure);
      if (bonus > 0) {
        traits.structure += bonus;
        breakdown.push(`+${bonus} pts: Good sentence length variety`);
      }
    }

    if (words.length >= 400 && words.length <= 600) {
      const bonus = Math.min(1, weights.concision - traits.concision);
      if (bonus > 0) {
        traits.concision += bonus;
        breakdown.push(`+${bonus} pt: Appropriate essay length`);
      }
    }

    const total = Math.round(traits.grammar + traits.structure + traits.concision + traits.rhetoric);

    return {
      total,
      traits,
      penalties: { major: majorCount, minor: minorCount },
      breakdown
    };
  }

  private generateAnalysis(essayText: string, corrections: CorrectionMark[]): any {
    const wordCount = essayText.split(/\s+/).length;
    const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = Math.round(wordCount / sentences.length);
    
    const hasThesis = essayText.toLowerCase().includes('i believe') || 
                     essayText.toLowerCase().includes('i argue') ||
                     essayText.toLowerCase().includes('my position') ||
                     essayText.includes('outweigh');
    
    const hasConclusion = essayText.toLowerCase().includes('in conclusion') || 
                         essayText.toLowerCase().includes('to conclude') ||
                         essayText.toLowerCase().includes('in summary');
    
    const hasEvidence = essayText.toLowerCase().includes('research') ||
                       essayText.toLowerCase().includes('study') ||
                       essayText.toLowerCase().includes('university') ||
                       essayText.toLowerCase().includes('for example');
    
    const paragraphs = essayText.split(/\n\s*\n/).length;
    
    const grammarErrors = corrections.filter(c => c.type === 'grammar').length;
    const styleIssues = corrections.filter(c => c.type === 'word_choice' || c.type === 'rhetoric').length;
    
    return {
      wordCount,
      sentenceCount: sentences.length,
      avgWordsPerSentence,
      readabilityScore: Math.max(70, Math.min(95, 85 - (grammarErrors * 3) - (styleIssues * 2))),
      structureAnalysis: {
        hasIntroduction: paragraphs >= 3,
        hasConclusion,
        hasThesis,
        hasEvidence,
        paragraphCount: paragraphs
      },
      strengthsIdentified: [
        ...(hasThesis ? ["Strong, clear thesis statement"] : []),
        ...(hasEvidence ? ["Uses specific evidence and examples"] : []),
        ...(hasConclusion ? ["Well-structured conclusion"] : []),
        ...(wordCount >= 400 && wordCount <= 600 ? ["Appropriate essay length"] : []),
        ...(avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25 ? ["Good sentence variety"] : []),
        ...(corrections.length < 2 ? ["Excellent grammar and mechanics"] : corrections.length < 5 ? ["Generally strong writing mechanics"] : ["Clear communication of ideas"])
      ],
      improvementAreas: [
        ...(corrections.length > 0 ? [`${corrections.length} areas for refinement identified`] : []),
        ...(avgWordsPerSentence > 30 ? ["Some sentences could be shortened for clarity"] : []),
        ...(grammarErrors > 0 ? ["Minor grammar issues to address"] : []),
        ...(styleIssues > 2 ? ["Word choice could be more precise"] : []),
        ...(!hasEvidence ? ["Could benefit from more specific examples"] : [])
      ].slice(0, 3) // Limit to 3 items
    };
  }

  private getCorrectionIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      grammar: '🟥',
      word_choice: '🔵',
      sentence_structure: '🟡',
      punctuation: '🟣',
      spelling: '🟠',
      concision: '🟢',
      rhetoric: '🔷'
    };
    return iconMap[type] || '⚪';
  }
}