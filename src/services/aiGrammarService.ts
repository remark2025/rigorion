import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';
import { applySATGrammarRules, scoreEssaySAT } from '@/utils/satGrammarEngine';
import { MockAIService } from './mockAIService';

// AI-powered grammar checking service
class AIGrammarService {
  private apiKey: string;
  private baseURL: string;
  private mockService: MockAIService;
  private useRealAPI: boolean;

  constructor() {
    this.apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
    this.baseURL = 'https://api.aimlapi.com/v1';
    this.mockService = new MockAIService();
    // Set to false to use mock service for testing
    // Set to true to use real API (after verification)
    this.useRealAPI = false; // Using mock until API verification is complete
  }

  async analyzeEssay(essayText: string): Promise<{
    corrections: CorrectionMark[];
    satScore: SATWritingScore;
    aiAnalysis: any;
  }> {
    // Use mock service for testing if real API is not available
    if (!this.useRealAPI) {
      console.log('📝 Using Mock AI Service (for testing)');
      return await this.mockService.analyzeEssay(essayText);
    }

    try {
      // First, apply our rule-based corrections for fast, reliable patterns
      const ruleBasedCorrections = applySATGrammarRules(essayText);
      
      // Calculate text statistics
      const words = essayText.split(/\s+/).filter(word => word.length > 0).length;
      const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const textStats = { words, sentences };

      // Get AI-powered analysis for more sophisticated issues
      const aiAnalysis = await this.getAIAnalysis(essayText);
      
      // Combine rule-based and AI corrections
      const aiCorrections = this.parseAICorrections(aiAnalysis, essayText);
      const allCorrections = this.mergeCorrections(ruleBasedCorrections, aiCorrections);
      
      // Generate SAT-style scoring
      const satScore = scoreEssaySAT(allCorrections, textStats);

      return {
        corrections: allCorrections,
        satScore,
        aiAnalysis
      };
    } catch (error) {
      console.error('Real AI API failed, falling back to mock service:', error);
      
      // Fallback to mock service if real API fails
      return await this.mockService.analyzeEssay(essayText);
    }
  }

  private async getAIAnalysis(essayText: string): Promise<any> {
    const prompt = this.buildGrammarPrompt(essayText);
    
    const response = await fetch(this.baseURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent grammar checking
        top_p: 0.9,
        frequency_penalty: 0.5,
        max_tokens: 1536,
        top_k: 40
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = analysisText;
      if (analysisText.includes('```json')) {
        cleanedText = analysisText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (analysisText.includes('```')) {
        cleanedText = analysisText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Try to parse JSON response
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError.message);
      console.log('Raw response:', analysisText);
      // If not JSON, return as text analysis
      return { textAnalysis: analysisText };
    }
  }

  private buildGrammarPrompt(essayText: string): string {
    return `You are a SAT Writing expert. Analyze this student essay for grammar, style, and SAT Writing conventions. Return your analysis as JSON in this exact format:

{
  "corrections": [
    {
      "type": "grammar|word_choice|sentence_structure|punctuation|spelling|concision|rhetoric",
      "severity": "major|minor",
      "startIndex": 0,
      "endIndex": 10,
      "originalText": "text to replace",
      "correctedText": "replacement text",
      "explanation": "Why this correction improves the writing",
      "grammarRule": "Specific SAT rule name",
      "confidence": 0.95
    }
  ],
  "overallFeedback": {
    "strengths": ["Clear thesis", "Good organization"],
    "weaknesses": ["Some run-on sentences", "Word choice could be more precise"],
    "suggestions": ["Break long sentences", "Use more specific vocabulary"],
    "score": 85
  },
  "satFocus": {
    "mainIssues": ["Subject-verb agreement", "Pronoun clarity"],
    "priorities": ["Fix major grammar errors first", "Then work on concision"]
  }
}

Focus on SAT Writing standards:
- Subject-verb agreement (including with intervening phrases)
- Pronoun case, agreement, and clarity
- Verb tense consistency and subjunctive mood
- Modifier placement and dangling modifiers
- Parallelism in lists and correlative conjunctions
- Logical comparisons and idiomatic expressions
- Concision (eliminate wordiness)
- Sentence structure and punctuation
- Transitional words and rhetorical effectiveness

Student Essay:
"""
${essayText}
"""

Provide specific, actionable feedback that helps the student improve their SAT Writing score.`;
  }

  private parseAICorrections(aiAnalysis: any, essayText: string): CorrectionMark[] {
    const corrections: CorrectionMark[] = [];
    const occupiedRanges: Array<{ start: number; end: number }> = [];

    const overlaps = (start: number, end: number) =>
      occupiedRanges.some(range => !(end <= range.start || start >= range.end));

    const reserveRange = (start: number, end: number) => {
      occupiedRanges.push({ start, end });
    };

    if (aiAnalysis?.corrections && Array.isArray(aiAnalysis.corrections)) {
      aiAnalysis.corrections.forEach((rawCorrection: any, index: number) => {
        if (!rawCorrection) {
          return;
        }

        const hasCorrectedText = typeof rawCorrection.correctedText === 'string' && rawCorrection.correctedText.length > 0;
        const hasExplanation = typeof rawCorrection.explanation === 'string' && rawCorrection.explanation.length > 0;

        if (!hasCorrectedText || !hasExplanation) {
          console.warn('Skipping AI correction missing required fields:', rawCorrection);
          return;
        }

        const providedStart = rawCorrection.startIndex;
        const providedEnd = rawCorrection.endIndex;

        let startIndex = typeof providedStart === 'number' ? providedStart : Number(providedStart);
        let endIndex = typeof providedEnd === 'number' ? providedEnd : Number(providedEnd);

        const indicesAreValid =
          Number.isFinite(startIndex) &&
          Number.isFinite(endIndex) &&
          startIndex >= 0 &&
          endIndex > startIndex &&
          endIndex <= essayText.length;

        if (indicesAreValid) {
          startIndex = Math.max(0, Math.floor(startIndex));
          endIndex = Math.min(essayText.length, Math.ceil(endIndex));
          if (endIndex > startIndex) {
            const originalSlice = essayText.substring(startIndex, endIndex);
            if (originalSlice && !overlaps(startIndex, endIndex)) {
              reserveRange(startIndex, endIndex);
              corrections.push(this.buildCorrectionMark(rawCorrection, index, startIndex, endIndex, originalSlice));
              return;
            }
          }
        }

        const originalText = typeof rawCorrection.originalText === 'string' ? rawCorrection.originalText : '';
        if (!originalText) {
          console.warn('Skipping AI correction without originalText:', rawCorrection);
          return;
        }

        let searchPosition = 0;
        while (searchPosition < essayText.length) {
          const foundIndex = essayText.indexOf(originalText, searchPosition);
          if (foundIndex === -1) {
            break;
          }
          const rangeEnd = foundIndex + originalText.length;
          if (!overlaps(foundIndex, rangeEnd)) {
            reserveRange(foundIndex, rangeEnd);
            corrections.push(this.buildCorrectionMark(rawCorrection, index, foundIndex, rangeEnd, essayText.substring(foundIndex, rangeEnd)));
            return;
          }
          searchPosition = foundIndex + 1;
        }

        console.warn('Could not find text in essay:', originalText);
      });
    }

    return corrections;
  }

  private buildCorrectionMark(correction: any, index: number, startIndex: number, endIndex: number, originalText: string): CorrectionMark {
    const confidence = typeof correction.confidence === 'number' ? correction.confidence : 0.8;
    const severity = correction.severity === 'major' ? 'major' : 'minor';
    const rawType = typeof correction.type === 'string' ? correction.type : '';
    const allowedTypes: CorrectionMark['type'][] = ['grammar', 'word_choice', 'sentence_structure', 'punctuation', 'spelling', 'concision', 'rhetoric'];
    const type = allowedTypes.includes(rawType as CorrectionMark['type']) ? (rawType as CorrectionMark['type']) : 'grammar';

    return {
      id: `ai_${index}`,
      type,
      severity,
      confidence,
      startIndex,
      endIndex,
      originalText,
      correctedText: correction.correctedText,
      explanation: correction.explanation,
      grammarRule: correction.grammarRule,
      ruleId: `ai_${type}_${index}`,
      autofixSafe: severity === 'minor' && confidence > 0.85,
      icon: this.getCorrectionIcon(type)
    };
  }

  private isValidCorrection(correction: any, essayText: string): boolean {
    // Validate correction object has required fields and indices are valid
    return (
      correction.type &&
      correction.severity &&
      typeof correction.startIndex === 'number' &&
      typeof correction.endIndex === 'number' &&
      correction.startIndex >= 0 &&
      correction.endIndex <= essayText.length &&
      correction.startIndex < correction.endIndex &&
      correction.originalText &&
      correction.correctedText &&
      correction.explanation &&
      // Verify the originalText actually exists at the specified location
      essayText.substring(correction.startIndex, correction.endIndex) === correction.originalText
    );
  }

  private mergeCorrections(ruleBasedCorrections: CorrectionMark[], aiCorrections: CorrectionMark[]): CorrectionMark[] {
    const merged: CorrectionMark[] = [...ruleBasedCorrections];
    
    // Add AI corrections that don't overlap with rule-based ones
    aiCorrections.forEach(aiCorrection => {
      const hasOverlap = ruleBasedCorrections.some(ruleCorrection => 
        this.correctionsOverlap(ruleCorrection, aiCorrection)
      );
      
      if (!hasOverlap) {
        merged.push(aiCorrection);
      }
    });

    // Sort by position in text
    return merged.sort((a, b) => a.startIndex - b.startIndex);
  }

  private correctionsOverlap(correction1: CorrectionMark, correction2: CorrectionMark): boolean {
    return !(correction1.endIndex <= correction2.startIndex || correction2.endIndex <= correction1.startIndex);
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

  // Method to get quick feedback without full correction analysis
  async getQuickFeedback(essayText: string): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `Provide quick SAT Writing feedback for this essay. Return JSON format:

{
  "score": 85,
  "strengths": ["Clear thesis", "Good structure"],
  "improvements": ["Grammar errors", "Word choice"],
  "suggestions": ["Proofread carefully", "Use varied vocabulary"]
}

Essay: """${essayText}"""`;

      const response = await fetch(this.baseURL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'google/gemma-3-4b-it',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 512
        })
      });

      const result = await response.json();
      const analysis = JSON.parse(result.choices[0].message.content);
      
      return {
        score: analysis.score || 75,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        suggestions: analysis.suggestions || []
      };
    } catch (error) {
      console.error('Quick feedback error:', error);
      return {
        score: 75,
        strengths: ['Essay submitted successfully'],
        improvements: ['Analysis temporarily unavailable'],
        suggestions: ['Please try again later']
      };
    }
  }
}

export const aiGrammarService = new AIGrammarService();