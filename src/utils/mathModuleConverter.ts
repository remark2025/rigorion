import { Question } from "@/types/QuestionInterface";
import { MathModule, MathPracticeQuestion } from "@/data/math/types";
import { getMathModuleContent } from "@/data/math/modules";

/**
 * Converts math module practice questions to the Question interface format
 * expected by the practice page
 */
export const convertMathModuleToQuestions = async (moduleId: string): Promise<Question[]> => {
  const module = await getMathModuleContent(moduleId);
  if (!module) return [];

  return module.questionBank.map((question: MathPracticeQuestion, index: number): Question => ({
    id: question.id,
    number: index + 1,
    content: question.prompt,
    difficulty: question.difficulty.toLowerCase() as "easy" | "medium" | "hard",
    chapter: module.category,
    module: `${module.category} - ${module.skill}`,
    bookmarked: false,
    examNumber: 1,
    choices: question.choices,
    correctAnswer: question.choices[question.correctChoiceIndex],
    explanation: question.explanation,
    solution: question.strategyTip || question.explanation,
    hint: question.strategyTip || "Review the concept and try again.",
    calculatorAllowed: question.calculatorAllowed,
    // Optional interactive solution for modules that have it
    interactiveSolution: module.interactiveProblem ? {
      hasInteractiveGraph: true,
      graphConfig: {
        type: module.interactiveProblem.graphConfig.type,
        xRange: module.interactiveProblem.graphConfig.xRange,
        yRange: module.interactiveProblem.graphConfig.yRange,
        showGrid: module.interactiveProblem.graphConfig.showGrid,
        showAxis: module.interactiveProblem.graphConfig.showAxis,
        title: module.interactiveProblem.graphConfig.title
      },
      parameters: module.interactiveProblem.parameters.map(param => ({
        name: param.name,
        label: param.label,
        value: param.value,
        min: param.min,
        max: param.max,
        step: param.step,
        description: param.description
      }))
    } : undefined
  }));
};

/**
 * Converts all available math modules to practice questions
 */
export const getAllMathModuleQuestions = async (): Promise<Question[]> => {
  const moduleIds = ['math-linear-equations', 'math-quadratic-functions', 'math-circle-geometry'];
  
  const allQuestions: Question[] = [];
  
  for (const moduleId of moduleIds) {
    const questions = await convertMathModuleToQuestions(moduleId);
    allQuestions.push(...questions);
  }
  
  return allQuestions;
};