
import React, { createContext, useContext, useState, useEffect } from "react";
import { Question } from "@/types/QuestionInterface";
import { useToast } from "@/components/ui/use-toast";
import { sampleQuestions } from "@/components/practice/sampleQuestion";
import { getAllMathModuleQuestions } from "@/utils/mathModuleConverter";
import { getAllReadingPassageQuestions } from "@/utils/readingPassageConverter";

interface QuestionsContextType {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
  refreshQuestions: () => Promise<void>;
}

export const QuestionsContext = createContext<QuestionsContextType>({
  questions: [],
  isLoading: true,
  error: null,
  refreshQuestions: async () => {},
});

export const useQuestions = () => useContext(QuestionsContext);

interface QuestionsProviderProps {
  children: React.ReactNode;
}

export const QuestionsProvider: React.FC<QuestionsProviderProps> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchWebsiteQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🚀 Loading questions from website data structure...");
      
      // Load math questions from our modules
      const mathQuestions = await getAllMathModuleQuestions();
      console.log(`📊 Loaded ${mathQuestions.length} math questions from modules`);
      
      // Load reading questions from our passages
      const readingQuestions = await getAllReadingPassageQuestions();
      console.log(`📖 Loaded ${readingQuestions.length} reading questions from passages`);
      
      // Combine all questions
      const allQuestions = [
        ...mathQuestions,
        ...readingQuestions,
        ...sampleQuestions // Keep some comprehensive samples for variety
      ];
      
      console.log(`✅ Total loaded: ${allQuestions.length} questions from website data`);
      
      if (allQuestions.length > 0) {
        setQuestions(allQuestions);
        setIsLoading(false);
        return;
      }
      
      // Fallback to sample questions if nothing loaded
      console.log("⚠️ No questions loaded, falling back to samples");
      setQuestions(sampleQuestions);
      
    } catch (err) {
      console.error("Error loading website questions:", err);
      console.log("🔄 Falling back to sample questions");
      setQuestions(sampleQuestions);
      setError(err instanceof Error ? err : new Error("Using fallback questions"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteQuestions();
  }, []);

  const refreshQuestions = async () => {
    await fetchWebsiteQuestions();
  };

  return (
    <QuestionsContext.Provider value={{ questions, isLoading, error, refreshQuestions }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export default QuestionsProvider;
