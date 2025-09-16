import { Question } from "@/types/QuestionInterface";
import { getInteractiveSolution } from "@/data/interactiveSolutions";
import { interactiveLoader } from "./interactiveLoader";

/**
 * Enhance questions with interactive solutions
 * This merges the question data with static interactive solution data
 * For dynamic loading, use lazy loading functions instead
 */
export function enhanceQuestionsWithInteractiveSolutions(questions: Question[]): Question[] {
  return questions.map(question => {
    // Only use static solutions for immediate enhancement
    // Dynamic solutions are loaded on-demand
    const staticSolution = getInteractiveSolution(question.id);
    
    if (staticSolution) {
      return {
        ...question,
        interactiveSolution: staticSolution,
        hasInteractive: true
      };
    }
    
    // Mark as having interactive if the question indicates it
    if (question.hasInteractive) {
      return {
        ...question,
        hasInteractive: true
      };
    }
    
    return question;
  });
}

/**
 * Lazy load interactive solution for a question
 */
export async function loadInteractiveSolution(questionId: string): Promise<any | null> {
  return interactiveLoader.loadInteractiveSolution(questionId);
}

/**
 * Preload interactive solutions for questions that have them
 */
export async function preloadInteractiveSolutions(questions: Question[]): Promise<void> {
  const interactiveQuestionIds = questions
    .filter(q => q.hasInteractive)
    .map(q => q.id);
    
  if (interactiveQuestionIds.length > 0) {
    await interactiveLoader.preloadSolutions(interactiveQuestionIds);
  }
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