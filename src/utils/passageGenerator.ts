import { PassageContent, PassageMetadata } from '@/data/reading/types';

/**
 * Template for creating new passages
 * Copy this structure when adding new passages
 */
export const createPassageTemplate = (
  id: number,
  title: string,
  category: 'Science' | 'History' | 'Literature' | 'Social Science' | 'Technology',
  difficulty: 'Easy' | 'Medium' | 'Hard'
): { metadata: PassageMetadata; content: PassageContent } => {
  
  const metadata: PassageMetadata = {
    id,
    title,
    category,
    difficulty,
    questionCount: 3, // Update based on actual questions
    imageUrl: `/resources/passages/${title.toLowerCase().replace(/\s+/g, '-')}.webp`,
    description: "Add description here",
    estimatedTime: 8, // minutes
    tags: ["tag1", "tag2", "tag3"]
  };

  const content: PassageContent = {
    id,
    title,
    text: `Add your passage text here. Make sure to include:
    
1. Clear topic sentences and transitions
2. Evidence and examples
3. Vocabulary that can be highlighted
4. Multiple perspectives or arguments
5. A logical conclusion

Remember to structure paragraphs clearly and include transition words that can be highlighted.`,
    
    highlights: {
      evidence: [
        "Specific facts, statistics, or research findings",
        "Expert quotes or authoritative sources",
        "Concrete examples that support main points"
      ],
      toneShifters: [
        "However",
        "Nevertheless", 
        "On the other hand",
        "Despite",
        "Although"
      ],
      transitions: [
        "Furthermore",
        "Moreover",
        "In addition",
        "For example",
        "In conclusion"
      ],
      difficult: {
        "difficult_word_1": "Definition of the word",
        "difficult_word_2": "Another definition",
        "technical_term": "Explanation of technical term"
      }
    },
    
    questions: [
      {
        id: 1,
        text: "What is the main idea of this passage?",
        type: "main-idea",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 1, // 0-based index
        hint: "Look for the central theme that connects all paragraphs."
      },
      {
        id: 2,
        text: "The author's tone can best be described as:",
        type: "tone",
        options: ["Neutral", "Critical", "Optimistic", "Concerned"],
        correctAnswer: 0,
        hint: "Consider the language choices and overall approach."
      },
      {
        id: 3,
        text: "Which evidence supports the main argument?",
        type: "evidence",
        options: ["Evidence A", "Evidence B", "Evidence C", "Evidence D"],
        correctAnswer: 2,
        hint: "Look for specific facts, data, or examples cited."
      }
    ]
  };

  return { metadata, content };
};

/**
 * Validates a passage for completeness and consistency
 */
export const validatePassage = (metadata: PassageMetadata, content: PassageContent): string[] => {
  const errors: string[] = [];

  // Check ID consistency
  if (metadata.id !== content.id) {
    errors.push("Metadata and content IDs don't match");
  }

  // Check title consistency
  if (metadata.title !== content.title) {
    errors.push("Metadata and content titles don't match");
  }

  // Check question count
  if (metadata.questionCount !== content.questions.length) {
    errors.push("Question count doesn't match actual questions");
  }

  // Check image URL format
  if (!metadata.imageUrl.includes('/resources/passages/')) {
    errors.push("Image URL should be in /resources/passages/ directory");
  }

  // Check for required highlights
  if (content.highlights.evidence.length === 0) {
    errors.push("At least one evidence highlight is required");
  }

  if (content.highlights.difficult && Object.keys(content.highlights.difficult).length === 0) {
    errors.push("At least one difficult word definition is required");
  }

  // Check question structure
  content.questions.forEach((question, index) => {
    if (question.options.length !== 4) {
      errors.push(`Question ${index + 1} must have exactly 4 options`);
    }
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      errors.push(`Question ${index + 1} has invalid correct answer index`);
    }
    if (!question.hint.trim()) {
      errors.push(`Question ${index + 1} is missing a hint`);
    }
  });

  return errors;
};