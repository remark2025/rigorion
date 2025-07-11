
import { Question } from '@/types/QuestionInterface';

/**
 * Maps a raw question from the API/DB to the shape your UI expects.
 * This ensures your UI always gets consistent data regardless of backend changes.
 */
export function mapQuestion(raw: any, index?: number): Question {
  console.log('[MAPPER] Raw question data:', raw);
  
  // Handle different possible data structures
  const questionData = raw.question || raw;
  
  // Map content field from various possible names
  const content = questionData.content || 
                 questionData.text || 
                 questionData.question_content?.text || 
                 questionData.questionText ||
                 questionData.prompt ||
                 "";

  // Map choices from various possible structures
  let choices: string[] = [];
  if (questionData.choices && Array.isArray(questionData.choices)) {
    choices = questionData.choices.map((choice: any) => 
      typeof choice === "string" ? choice : (choice.text || choice.value || String(choice))
    );
  } else if (questionData.answer_choices && Array.isArray(questionData.answer_choices)) {
    choices = questionData.answer_choices.map((choice: any) => 
      typeof choice === "string" ? choice : (choice.text || choice.value || String(choice))
    );
  } else if (questionData.options && Array.isArray(questionData.options)) {
    choices = questionData.options.map((option: any) => 
      typeof option === "string" ? option : (option.text || option.value || String(option))
    );
  } else {
    // Fallback choices
    choices = ["Option A", "Option B", "Option C", "Option D"];
  }

  // Map correct answer - ensure it's a single character for animation
  const correctAnswer = questionData.correctAnswer || 
                       questionData.correct_answer || 
                       questionData.answer || 
                       "A";

  // Enhanced solution mapping with better structure and formatting
  let solution = questionData.solution || 
                questionData.explanation || 
                questionData.answer_explanation ||
                questionData.rationale ||
                questionData.detailed_solution ||
                "Solution not available";

  // Format solution content with proper HTML structure
  if (solution && solution !== "Solution not available") {
    // Convert line breaks to proper HTML
    solution = solution.replace(/\n/g, '<br>');
    // Add proper formatting for mathematical expressions
    solution = solution.replace(/(\d+\.\s)/g, '<strong>$1</strong>');
    // Format formulas and equations
    solution = solution.replace(/([A-Z]\s*=\s*[^<\n]+)/g, '<span class="formula">$1</span>');
  }

  // Enhanced solution steps mapping with proper handling of objects and arrays
  let solutionSteps: string[] = [];
  
  if (Array.isArray(questionData.solutionSteps)) {
    solutionSteps = questionData.solutionSteps.map((step: any) => {
      if (typeof step === 'string') {
        return step;
      } else if (typeof step === 'object' && step !== null) {
        // Handle step objects like {"step": "Identify fixed cost: $50"}
        return step.step || step.description || step.text || String(step);
      }
      return String(step);
    });
  } else if (Array.isArray(questionData.solution_steps)) {
    solutionSteps = questionData.solution_steps.map((step: any) => {
      if (typeof step === 'string') {
        return step;
      } else if (typeof step === 'object' && step !== null) {
        return step.step || step.description || step.text || String(step);
      }
      return String(step);
    });
  } else if (Array.isArray(questionData.steps)) {
    solutionSteps = questionData.steps.map((step: any) => {
      if (typeof step === 'string') {
        return step;
      } else if (typeof step === 'object' && step !== null) {
        return step.step || step.description || step.text || String(step);
      }
      return String(step);
    });
  } else if (questionData.step_by_step) {
    const stepData = Array.isArray(questionData.step_by_step) 
      ? questionData.step_by_step 
      : [questionData.step_by_step];
    solutionSteps = stepData.map((step: any) => {
      if (typeof step === 'string') {
        return step;
      } else if (typeof step === 'object' && step !== null) {
        return step.step || step.description || step.text || String(step);
      }
      return String(step);
    });
  } else if (solution && solution !== "Solution not available") {
    // Try to split solution into steps if it contains numbered steps
    const stepPattern = /\d+\./g;
    if (stepPattern.test(solution)) {
      solutionSteps = solution.split(/(?=\d+\.)/).filter(step => step.trim().length > 0);
    } else {
      solutionSteps = [solution];
    }
  } else {
    solutionSteps = ["Solution steps not available"];
  }

  // Map difficulty
  const difficulty = questionData.difficulty === "easy" || questionData.difficulty === "hard" 
    ? questionData.difficulty 
    : "medium";

  // Enhanced chapter mapping with normalization
  let chapter = questionData.chapter || 
               questionData.chapter_name ||
               questionData.section ||
               questionData.unit ||
               "General";

  // Normalize chapter format to "Chapter X" if it's just a number
  if (/^\d+$/.test(chapter)) {
    chapter = `Chapter ${chapter}`;
  } else if (!chapter.toLowerCase().includes('chapter') && /\d+/.test(chapter)) {
    const chapterNum = chapter.match(/\d+/)?.[0];
    if (chapterNum) {
      chapter = `Chapter ${chapterNum}`;
    }
  }

  // Map module field for filtering
  const module = questionData.module || 
                questionData.module_name ||
                questionData.exam_module ||
                questionData.test_module ||
                "General";

  // FIXED: Ensure examNumber is always a number
  let examNumber = questionData.examNumber || 
                  questionData.exam_number ||
                  questionData.exam_id ||
                  questionData.test_id ||
                  1;

  // Convert string examNumber to number
  if (typeof examNumber === 'string') {
    const parsed = parseInt(examNumber, 10);
    examNumber = isNaN(parsed) ? 1 : parsed;
  } else if (typeof examNumber !== 'number') {
    examNumber = 1;
  }

  console.log('[MAPPER] Mapped examNumber:', examNumber, 'type:', typeof examNumber);

  // Map question number
  const number = questionData.number || 
                questionData.questionNumber ||
                questionData.question_number ||
                (index !== undefined ? index + 1 : 1);

  // Map other fields
  const hint = questionData.hint || 
              questionData.help_text || 
              questionData.clue ||
              "Think about the problem step by step";

  // Enhanced graph mapping to handle text links
  let graph: { url: string; alt?: string; caption?: string } | string | undefined;
  
  if (questionData.graph) {
    if (typeof questionData.graph === 'string' && questionData.graph.trim() !== '') {
      // If graph is a string URL, store it directly
      graph = questionData.graph.trim();
    } else if (typeof questionData.graph === 'object' && questionData.graph.url) {
      // If graph is an object with URL property
      graph = {
        url: questionData.graph.url,
        alt: questionData.graph.alt || "Question graph",
        caption: questionData.graph.caption
      };
    }
  }

  // Create the normalized question object
  const mappedQuestion: Question = {
    id: questionData.question_id?.toString() || questionData.id?.toString() || `mapped-${index || Date.now()}`,
    number: number,
    content: content,
    solution: solution,
    difficulty: difficulty,
    chapter: chapter,
    module: module,
    bookmarked: questionData.bookmarked || false,
    examNumber: examNumber, // Now guaranteed to be a number
    choices: choices,
    correctAnswer: correctAnswer,
    explanation: questionData.explanation || solution,
    solutionSteps: solutionSteps,
    hint: hint,
    graph: graph,
    quote: questionData.quote ? {
      text: questionData.quote.text || questionData.quote,
      source: questionData.quote.source || "Unknown"
    } : undefined
  };

  console.log('[MAPPER] Mapped question with examNumber:', mappedQuestion.examNumber);
  return mappedQuestion;
}

/**
 * Maps an array of raw questions to normalized Question objects
 */
export function mapQuestions(rawQuestions: any[]): Question[] {
  if (!Array.isArray(rawQuestions)) {
    console.warn('[MAPPER] Expected array of questions, got:', typeof rawQuestions);
    return [];
  }

  return rawQuestions.map((raw, index) => mapQuestion(raw, index));
}

/**
 * Filter questions by chapter
 */
export function filterQuestionsByChapter(questions: Question[], chapter?: string): Question[] {
  if (!chapter || chapter === "All Chapters") {
    return questions;
  }
  
  return questions.filter(q => 
    q.chapter === chapter || 
    q.chapter.toLowerCase().includes(chapter.toLowerCase())
  );
}

/**
 * Get unique chapters from questions array
 */
export function getUniqueChapters(questions: Question[]): string[] {
  const chapters = questions.map(q => q.chapter);
  return Array.from(new Set(chapters)).sort();
}

/**
 * Validates that a question has the required fields for the UI
 */
export function validateQuestion(question: Question): boolean {
  const hasContent = typeof question.content === 'string' && question.content.length > 0;
  const hasChoices = Array.isArray(question.choices) && question.choices.length > 0;
  const hasCorrectAnswer = typeof question.correctAnswer === 'string' && question.correctAnswer.length > 0;
  
  if (!hasContent) {
    console.error('[MAPPER] Question missing content:', question);
  }
  if (!hasChoices) {
    console.error('[MAPPER] Question missing choices:', question);
  }
  if (!hasCorrectAnswer) {
    console.error('[MAPPER] Question missing correct answer:', question);
  }
  
  return hasContent && hasChoices && hasCorrectAnswer;
}

/**
 * Filter questions by module
 */
export function filterQuestionsByModule(questions: Question[], module?: string): Question[] {
  if (!module || module === "All Modules") {
    return questions;
  }
  
  return questions.filter(q => 
    q.module === module || 
    q.module?.toLowerCase().includes(module.toLowerCase())
  );
}

/**
 * Get unique modules from questions array
 */
export function getUniqueModules(questions: Question[]): string[] {
  const modules = questions.map(q => q.module).filter(Boolean);
  return Array.from(new Set(modules)).sort();
}
