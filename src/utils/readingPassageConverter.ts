import { Question } from "@/types/QuestionInterface";
import { PassageContent } from "@/data/reading/types";
import { getPassageContent, getAllPassageIds } from "@/data/reading/passages";

/**
 * Converts reading passage questions to the Question interface format
 * expected by the practice page
 */
export const convertPassageToQuestions = async (passageId: number): Promise<Question[]> => {
  const passage = await getPassageContent(passageId);
  if (!passage || !passage.questions) return [];

  return passage.questions.map((question, index): Question => ({
    id: `${passage.id}-${question.id}`,
    number: index + 1,
    content: question.text,
    difficulty: "medium" as const, // Default difficulty for reading
    chapter: "Reading Comprehension",
    module: "Reading and Writing",
    bookmarked: false,
    examNumber: 1,
    choices: question.options,
    correctAnswer: question.options[question.correct],
    explanation: question.explanation,
    solution: question.explanation,
    hint: "Refer back to the passage to find textual evidence for your answer.",
    calculatorAllowed: false,
    passage: passage.text // Include the full passage text
  }));
};

/**
 * Converts all available reading passages to practice questions
 */
export const getAllReadingPassageQuestions = async (): Promise<Question[]> => {
  const passageIds = getAllPassageIds();
  
  const allQuestions: Question[] = [];
  
  for (const passageId of passageIds) {
    const questions = await convertPassageToQuestions(passageId);
    allQuestions.push(...questions);
  }
  
  return allQuestions;
};