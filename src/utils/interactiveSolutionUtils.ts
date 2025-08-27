import { Question } from "@/types/QuestionInterface";
import { getInteractiveSolution } from "@/data/interactiveSolutions";

/**
 * Enhance questions with interactive solutions
 * This merges the question data with interactive solution data
 */
export function enhanceQuestionsWithInteractiveSolutions(questions: Question[]): Question[] {
  return questions.map(question => {
    const interactiveSolution = getInteractiveSolution(question.id);
    
    if (interactiveSolution) {
      return {
        ...question,
        interactiveSolution
      };
    }
    
    return question;
  });
}

/**
 * Get enhanced question with interactive solution
 */
export function getEnhancedQuestion(question: Question): Question {
  const interactiveSolution = getInteractiveSolution(question.id);
  
  if (interactiveSolution) {
    return {
      ...question,
      interactiveSolution
    };
  }
  
  return question;
}

/**
 * Check if question should show interactive tab
 */
export function shouldShowInteractiveTab(question: Question): boolean {
  return !!(question.interactiveSolution && question.interactiveSolution.hasInteractiveGraph);
}