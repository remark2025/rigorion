import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';

// SAT Writing Rule Catalog
export const SAT_GRAMMAR_RULES = {
  // Subject-Verb Agreement
  'subject_verb_basic': {
    id: 'subject_verb_basic',
    name: 'Subject-Verb Agreement',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(each|every|neither|either|one|someone|everyone|anyone|nobody|somebody)\s+.*?\s+(are|were|have|don't|doesn't)/gi,
        explanation: 'Singular subjects like "each," "every," "neither" take singular verbs.',
        correction: (match: string) => match.replace(/(are|were|have|don't)/gi, (verb) => {
          const singular = { 'are': 'is', 'were': 'was', 'have': 'has', "don't": "doesn't" };
          return singular[verb.toLowerCase() as keyof typeof singular] || verb;
        })
      }
    ]
  },

  // Pronoun Case & Agreement  
  'pronoun_case_who_whom': {
    id: 'pronoun_case_who_whom',
    name: 'Who vs. Whom',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\bwhom\s+(is|are|was|were|will|can|should|would)/gi,
        explanation: '"Who" is the subject; "whom" is the object. Use "who" before verbs.',
        correction: (match: string) => match.replace(/whom/gi, 'who')
      },
      {
        regex: /\bwho\s+(I|he|she|we|they)\s+(saw|met|called|contacted|interviewed)/gi,
        explanation: '"Whom" is the object of the verb. Use "whom" when it receives the action.',
        correction: (match: string) => match.replace(/who/gi, 'whom')
      }
    ]
  },

  'pronoun_case_comparison': {
    id: 'pronoun_case_comparison',
    name: 'Pronoun Case in Comparisons',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(than|as)\s+(me|him|her|us|them)(?=\s|$|\.)/gi,
        explanation: 'After "than" or "as," use subject pronouns when they would be the subject of an implied clause.',
        correction: (match: string) => {
          const obj2subj = { 'me': 'I', 'him': 'he', 'her': 'she', 'us': 'we', 'them': 'they' };
          return match.replace(/(me|him|her|us|them)/gi, (pron) => obj2subj[pron.toLowerCase() as keyof typeof obj2subj] || pron);
        }
      }
    ]
  },

  // Verb Forms & Tenses
  'subjunctive_mood': {
    id: 'subjunctive_mood',
    name: 'Subjunctive Mood',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(suggest|recommend|demand|require|insist|propose)\s+that\s+(\w+)\s+(is|are|was|were)/gi,
        explanation: 'After verbs of suggestion/demand, use the subjunctive: "that he BE," not "that he IS."',
        correction: (match: string) => match.replace(/(is|are|was|were)/gi, 'be')
      }
    ]
  },

  'lie_lay_confusion': {
    id: 'lie_lay_confusion',
    name: 'Lie vs. Lay',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\blay\s+down\s+(to\s+sleep|and\s+rest|for\s+a\s+nap)/gi,
        explanation: '"Lie down" (intransitive) means to recline. "Lay" requires a direct object.',
        correction: (match: string) => match.replace(/lay/gi, 'lie')
      }
    ]
  },

  'could_of_correction': {
    id: 'could_of_correction',
    name: 'Could/Should/Would + Have',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(could|should|would|might|must)\s+of\b/gi,
        explanation: 'Use "could HAVE," not "could OF." This error comes from mishearing the contraction "could\'ve."',
        correction: (match: string) => match.replace(/of/gi, 'have')
      }
    ]
  },

  // Modifiers
  'dangling_modifier': {
    id: 'dangling_modifier',
    name: 'Dangling Modifiers',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /^(While|After|When|Before|Having|To\s+\w+)\s+.*?,\s+(the|it|this|that)/gi,
        explanation: 'Introductory modifiers must clearly modify the subject that immediately follows the comma.',
        correction: (match: string) => match + ' [revise to match modifier with subject]'
      }
    ]
  },

  'misplaced_only_just': {
    id: 'misplaced_only_just',
    name: 'Misplaced "Only" and "Just"',
    category: 'grammar' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bonly\s+(\w+)\s+(can|could|will|would|should)\s+(\w+)/gi,
        explanation: 'Place "only" next to the word it modifies for clarity.',
        correction: (match: string) => {
          // This would need more sophisticated parsing in practice
          return match + ' [check "only" placement]';
        }
      }
    ]
  },

  // Parallelism
  'correlative_conjunction_parallelism': {
    id: 'correlative_conjunction_parallelism',
    name: 'Correlative Conjunction Parallelism',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(either|neither)\s+.*?\s+(or|nor)\s+/gi,
        explanation: 'Elements after correlative conjunctions (either...or, neither...nor) must be parallel in structure.',
        correction: (match: string) => match + ' [make parallel]'
      },
      {
        regex: /\bnot\s+only\s+.*?\s+but\s+also\s+/gi,
        explanation: 'Elements after "not only...but also" must be grammatically parallel.',
        correction: (match: string) => match + ' [make parallel]'
      }
    ]
  },

  // Comparisons
  'comparison_logic': {
    id: 'comparison_logic',
    name: 'Logical Comparisons',
    category: 'grammar' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(\w+)\s+is\s+(better|worse|more|less)\s+than\s+(any|all)\s+/gi,
        explanation: 'Illogical comparison: something cannot be better than "any" in its own group. Use "any other."',
        correction: (match: string) => match.replace(/(any|all)/gi, 'any other')
      }
    ]
  },

  'than_then_confusion': {
    id: 'than_then_confusion',
    name: 'Than vs. Then',
    category: 'word_choice' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\b(better|worse|more|less|rather)\s+then\b/gi,
        explanation: '"Than" is for comparisons; "then" is for time/sequence.',
        correction: (match: string) => match.replace(/then/gi, 'than')
      },
      {
        regex: /\bfirst\s+.*?,\s+than\b/gi,
        explanation: '"Then" shows sequence; "than" shows comparison.',
        correction: (match: string) => match.replace(/than/gi, 'then')
      }
    ]
  },

  // Idioms & Prepositions
  'preposition_idioms': {
    id: 'preposition_idioms',
    name: 'Preposition Idioms',
    category: 'word_choice' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bregard\s+to\b/gi,
        explanation: 'Correct idiom: "regard AS" or "with regard TO."',
        correction: (match: string) => match.replace(/regard\s+to/gi, 'regard as')
      },
      {
        regex: /\bprohibit\s+to\b/gi,
        explanation: 'Correct idiom: "prohibit FROM," not "prohibit TO."',
        correction: (match: string) => match.replace(/prohibit\s+to/gi, 'prohibit from')
      },
      {
        regex: /\bdifferent\s+than\b/gi,
        explanation: 'Standard usage: "different FROM," though "different than" is accepted in some contexts.',
        correction: (match: string) => match.replace(/different\s+than/gi, 'different from')
      }
    ]
  },

  'between_among': {
    id: 'between_among',
    name: 'Between vs. Among',
    category: 'word_choice' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bamong\s+(two|2)\b/gi,
        explanation: '"Between" for two items; "among" for three or more.',
        correction: (match: string) => match.replace(/among/gi, 'between')
      },
      {
        regex: /\bbetween\s+(\w+,\s*\w+,\s*and\s*\w+|\w+,\s*\w+,\s*\w+)/gi,
        explanation: '"Among" for three or more items; "between" for two.',
        correction: (match: string) => match.replace(/between/gi, 'among')
      }
    ]
  },

  // Quantifiers
  'fewer_less': {
    id: 'fewer_less',
    name: 'Fewer vs. Less',
    category: 'word_choice' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bless\s+(people|students|books|cars|items|things|problems|questions|dollars)\b/gi,
        explanation: '"Fewer" for countable nouns; "less" for uncountable quantities.',
        correction: (match: string) => match.replace(/less/gi, 'fewer')
      }
    ]
  },

  'number_amount': {
    id: 'number_amount',
    name: 'Number vs. Amount',
    category: 'word_choice' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bamount\s+of\s+(people|students|books|cars|items|things|problems|questions)\b/gi,
        explanation: '"Number of" for countable nouns; "amount of" for uncountable quantities.',
        correction: (match: string) => match.replace(/amount/gi, 'number')
      }
    ]
  },

  // Concision & Wordiness
  'redundancy_wordiness': {
    id: 'redundancy_wordiness',
    name: 'Concision',
    category: 'concision' as const,
    severity: 'minor' as const,
    patterns: [
      {
        regex: /\bin\s+order\s+to\b/gi,
        explanation: 'Wordy. Use "to" instead of "in order to."',
        correction: (match: string) => 'to'
      },
      {
        regex: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
        explanation: 'Wordy. Use "because" instead of "due to the fact that."',
        correction: (match: string) => 'because'
      },
      {
        regex: /\bthe\s+reason\s+why\s+is\s+because\b/gi,
        explanation: 'Redundant. Use "The reason is that" or "This is because."',
        correction: (match: string) => 'the reason is that'
      }
    ]
  },

  // Punctuation
  'comma_splice': {
    id: 'comma_splice',
    name: 'Comma Splice',
    category: 'punctuation' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b(\w+),\s+(however|therefore|furthermore|moreover|consequently|thus)\s*,/gi,
        explanation: 'Use semicolon before transitional adverbs connecting independent clauses.',
        correction: (match: string) => match.replace(/,(\s*however|\s*therefore|\s*furthermore|\s*moreover|\s*consequently|\s*thus)/, '; $1')
      }
    ]
  },

  'semicolon_misuse': {
    id: 'semicolon_misuse',
    name: 'Semicolon Usage',
    category: 'punctuation' as const,
    severity: 'major' as const,
    patterns: [
      {
        regex: /\b\w+;\s*(although|because|since|when|while|if|unless)\b/gi,
        explanation: 'Semicolons connect independent clauses. Use comma before dependent clauses introduced by subordinating conjunctions.',
        correction: (match: string) => match.replace(/;(\s*although|\s*because|\s*since|\s*when|\s*while|\s*if|\s*unless)/, ',$1')
      }
    ]
  }
};

// Enhanced SAT scoring function
export function scoreEssaySAT(marks: CorrectionMark[], textStats: { words: number; sentences: number }): SATWritingScore {
  const weights = { grammar: 40, structure: 25, concision: 20, rhetoric: 15 };
  const penalties = { major: 3, minor: 1 };
  
  let traits = {
    grammar: weights.grammar,
    structure: weights.structure,
    concision: weights.concision,
    rhetoric: weights.rhetoric
  };

  let majorCount = 0;
  let minorCount = 0;
  const breakdown: string[] = [];

  // Apply penalties by category
  for (const mark of marks) {
    const sev = penalties[mark.severity];
    
    if (mark.severity === 'major') majorCount++;
    else minorCount++;

    if (mark.type === 'grammar' || mark.type === 'word_choice' || mark.type === 'spelling') {
      traits.grammar -= sev;
      breakdown.push(`-${sev} pts: ${mark.grammarRule || mark.type} (${mark.severity})`);
    } else if (mark.type === 'sentence_structure' || mark.type === 'punctuation') {
      traits.structure -= sev;
      breakdown.push(`-${sev} pts: ${mark.grammarRule || mark.type} (${mark.severity})`);
    } else if (mark.type === 'concision') {
      traits.concision -= sev;
      breakdown.push(`-${sev} pts: ${mark.grammarRule || mark.type} (${mark.severity})`);
    } else if (mark.type === 'rhetoric') {
      traits.rhetoric -= sev;
      breakdown.push(`-${sev} pts: ${mark.grammarRule || mark.type} (${mark.severity})`);
    }
  }

  // Concision bonus for appropriate length without wordiness
  const concisionBonus = calculateConcisionBonus(textStats);
  traits.concision += concisionBonus;
  if (concisionBonus > 0) {
    breakdown.push(`+${concisionBonus} pts: Concise writing bonus`);
  }

  // Clamp scores to valid ranges
  Object.keys(traits).forEach(key => {
    const traitKey = key as keyof typeof traits;
    const weightKey = key as keyof typeof weights;
    traits[traitKey] = Math.max(0, Math.min(weights[weightKey], traits[traitKey]));
  });

  const total = Math.round(traits.grammar + traits.structure + traits.concision + traits.rhetoric);

  return {
    total,
    traits,
    penalties: { major: majorCount, minor: minorCount },
    breakdown
  };
}

function calculateConcisionBonus(textStats: { words: number; sentences: number }): number {
  const avgWordsPerSentence = textStats.words / textStats.sentences;
  
  // Bonus for clear, concise sentences (12-20 words average)
  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 20) {
    return Math.min(6, Math.floor((20 - Math.abs(avgWordsPerSentence - 16)) / 2));
  }
  
  return 0;
}

// Apply SAT grammar rules to text
export function applySATGrammarRules(text: string): CorrectionMark[] {
  const corrections: CorrectionMark[] = [];
  let correctionId = 0;

  Object.values(SAT_GRAMMAR_RULES).forEach(rule => {
    rule.patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern.regex)];
      
      matches.forEach(match => {
        if (match.index !== undefined) {
          const originalText = match[0];
          const correctedText = typeof pattern.correction === 'function' 
            ? pattern.correction(originalText)
            : pattern.correction;

          corrections.push({
            id: `sat_${correctionId++}`,
            type: rule.category,
            severity: rule.severity,
            confidence: 0.9, // High confidence for pattern-based rules
            startIndex: match.index,
            endIndex: match.index + originalText.length,
            originalText,
            correctedText,
            explanation: pattern.explanation,
            grammarRule: rule.name,
            ruleId: rule.id,
            autofixSafe: rule.severity === 'minor' && rule.category !== 'sentence_structure',
            icon: getCorrectionIcon(rule.category)
          });
        }
      });
    });
  });

  return corrections.sort((a, b) => a.startIndex - b.startIndex);
}

function getCorrectionIcon(type: CorrectionMark['type']): string {
  const icons = {
    grammar: '🟥',
    word_choice: '🔵', 
    sentence_structure: '🟡',
    punctuation: '🟣',
    spelling: '🟠',
    concision: '🟢',
    rhetoric: '🔷'
  };
  return icons[type] || '⚪';
}

// Generate SAT-style multiple choice question from correction
export function generateSATQuestion(correction: CorrectionMark, context: string): {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
} {
  const beforeText = context.substring(Math.max(0, correction.startIndex - 30), correction.startIndex);
  const afterText = context.substring(correction.endIndex, Math.min(context.length, correction.endIndex + 30));
  
  const options = [
    correction.correctedText, // Correct answer
    correction.originalText,  // Original (incorrect)
    generateDistractor1(correction),
    generateDistractor2(correction)
  ];

  // Randomize option order but track correct answer
  const shuffled = [...options];
  const correctIndex = 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newCorrectIndex = shuffled.indexOf(correction.correctedText);

  return {
    question: `${beforeText}____${afterText}`,
    options: shuffled,
    correct: newCorrectIndex,
    explanation: `${correction.explanation} (Rule: ${correction.grammarRule})`
  };
}

function generateDistractor1(correction: CorrectionMark): string {
  // Generate plausible wrong answers based on common errors
  const distractors: { [key: string]: string[] } = {
    'subject_verb_basic': ['have been', 'were being', 'are going'],
    'pronoun_case_who_whom': ['whose', 'whichever', 'whoever'],
    'than_then_confusion': ['when', 'that', 'where'],
    'fewer_less': ['lesser', 'smaller', 'reduced']
  };

  const ruleId = correction.ruleId || '';
  const options = distractors[ruleId] || ['NO CHANGE', 'DELETE', 'different option'];
  return options[0];
}

function generateDistractor2(correction: CorrectionMark): string {
  const distractors: { [key: string]: string[] } = {
    'subject_verb_basic': ['was', 'had been', 'will be'],
    'pronoun_case_who_whom': ['that', 'which', 'what'],
    'than_then_confusion': ['than ever', 'then again', 'rather than'],
    'fewer_less': ['much less', 'way fewer', 'more less']
  };

  const ruleId = correction.ruleId || '';
  const options = distractors[ruleId] || ['NO CHANGE', 'DELETE', 'another option'];
  return options[1];
}