
// services/questionService.ts
import { Question } from '@/types/QuestionInterface';
import { toast } from "@/hooks/use-toast";
import { callEdgeFunction } from './edgeFunctionService';

// Function to fetch math questions via standard fetch API
export async function fetchMathQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await callEdgeFunction<Question[]>('get-sat-math-questions');
    
    if (error || !data) {
      console.error('Error fetching math questions:', error);
      toast({
        title: "Error loading questions",
        description: "Using fallback questions instead",
        variant: "destructive",
      });
      return getSampleQuestions();
    }

    console.log(`Loaded ${data.length} questions from Edge Function`);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    toast({
      title: "Error loading questions",
      description: "Using fallback questions instead",
      variant: "destructive",
    });
    return getSampleQuestions();
  }
}

// Function that provides fallback questions without using Supabase directly
export async function fetchMathQuestionsViaFunctions(): Promise<Question[]> {
  try {
    console.log('Attempting to fetch math questions via fallback method');
    
    // Use our callEdgeFunction instead of directly using supabase.functions.invoke
    const { data, error } = await callEdgeFunction<Question[]>('get-sat-math-questions');

    if (error || !data) {
      console.error('Edge Function error:', error);
      toast({
        title: "Error loading questions",
        description: "Failed to fetch questions from edge function",
        variant: "destructive",
      });
      return getSampleQuestions();
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received");
    }

    console.log(`Loaded ${data.length} questions from Edge Function via functions.invoke()`);
    return data as Question[];
  } catch (error) {
    console.error('Functions invoke error:', error);
    toast({
      title: "Error loading questions",
      description: "Using fallback questions instead",
      variant: "destructive",
    });
    return getSampleQuestions();
  }
}

// Sample questions fallback function
function getSampleQuestions(): Question[] {
  return [
    {
      id: "1",
      content: "What is the probability of rolling a prime number on a fair 20-sided die?",
      solution: "Prime numbers between 1-20: 2, 3, 5, 7, 11, 13, 17, 19 (8 primes)\n\nProbability = 8/20 = 2/5 = 40%",
      difficulty: "medium",
      chapter: "Chapter 1",
      bookmarked: false,
      examNumber: 1,
      choices: ["1/20", "2/5", "3/10", "1/4"],
      correctAnswer: "2/5",
      solutionSteps: [
        "Identify prime numbers from 1-20: 2, 3, 5, 7, 11, 13, 17, 19",
        "Count the number of prime numbers: 8",
        "Calculate probability: 8/20 = 2/5 = 40%"
      ],
      quote: {
        text: "Mathematics is the music of reason.",
        source: "James Joseph Sylvester"
      }
    },
    {
      id: "2",
      content: "What's the area of a circle with radius 5 cm?",
      solution: "Using formula A = πr²\nA = π × 5² = 25π ≈ 78.54 cm²",
      difficulty: "easy",
      chapter: "Chapter 1",
      bookmarked: false,
      examNumber: 1,
      choices: ["25π cm²", "10π cm²", "5π cm²", "100π cm²"],
      correctAnswer: "25π cm²",
      solutionSteps: [
        "Recall the formula for the area of a circle: A = πr²",
        "Substitute r = 5: A = π × 5²",
        "Calculate: A = 25π ≈ 78.54 cm²"
      ],
      quote: {
        text: "Geometry is the archetype of the beauty of the world.",
        source: "Johannes Kepler"
      }
    },
    {
      id: "3",
      content: "Solve for x: 3(x + 5) = 2x + 20",
      solution: "3x + 15 = 2x + 20\n3x - 2x = 20 - 15\nx = 5",
      difficulty: "medium",
      chapter: "Chapter 2",
      bookmarked: false,
      examNumber: 1,
      choices: ["x = 3", "x = 5", "x = 7", "x = 15"],
      correctAnswer: "x = 5",
      solutionSteps: [
        "Distribute: 3(x + 5) = 3x + 15",
        "Set equal to the right side: 3x + 15 = 2x + 20",
        "Subtract 2x from both sides: 3x - 2x + 15 = 20",
        "Simplify: x + 15 = 20",
        "Subtract 15 from both sides: x = 5"
      ],
      quote: {
        text: "Algebra is the intellectual instrument which has been created for rendering clear the quantitative aspects of the world.",
        source: "Alfred North Whitehead"
      }
    }
  ];
}
