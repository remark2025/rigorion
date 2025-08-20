

// types/QuestionInterface.ts
export interface Question {
    id: string;
    number: number;
    content: string;
    keyPhrases?: string[]; // For highlighting key terms/concepts
    solution: string | Array<{step: string}>;
    difficulty: "easy" | "medium" | "hard";
    chapter: string;
    module?: string;
    bookmarked: boolean;
    examNumber: number;
    choices: string[];
    correctAnswer: string;
    explanation?: string;
    graph?: {
        url: string;
        alt?: string;
        caption?: string;
    } | string;
    solutionSteps: string[];
    quote?: {
        text: string;
        source?: string;
    };
    hint?: string;
    calculatorAllowed?: boolean;
    passage?: {
        title?: string;
        content: string;
        source?: string;
    };
}

export default interface QuestionInterface {} // Or remove if unnecessary

