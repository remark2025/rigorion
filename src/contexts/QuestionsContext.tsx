
import React, { createContext, useContext, useState, useEffect } from "react";
import { Question } from "@/types/QuestionInterface";
import { getSecureLatestFunctionData } from "@/services/secureIndexedDbService";
import { useToast } from "@/components/ui/use-toast";
import { mapQuestions, validateQuestion } from "@/utils/mapQuestion";
import { sampleQuestions } from "@/components/practice/sampleQuestion";
import { databaseQuestionService } from "@/services/databaseQuestionService";
import { functionQuestionService } from "@/services/functionQuestionService";
import { edgeFunctionQuestionService } from "@/services/edgeFunctionService";

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

  const fetchSecureQuestions = async () => {
    // Overall timeout for the entire process
    const overallTimeout = setTimeout(() => {
      console.log("🚨 Overall timeout reached, using fallback questions");
      setQuestions(sampleQuestions);
      setIsLoading(false);
    }, 15000); // 15 second timeout

    try {
      setIsLoading(true);
      setError(null);
      
      // Method 1: Try Edge Function first (with timeout)
      console.log("🚀 Attempting to load questions using Edge Function...");
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Edge Function timeout')), 5000)
        );
        
        const edgeFunctionPromise = edgeFunctionQuestionService.fetchQuestions();
        const edgeQuestions = await Promise.race([edgeFunctionPromise, timeoutPromise]) as Question[];
        
        if (edgeQuestions.length > 0) {
          console.log(`🎯 Loaded ${edgeQuestions.length} questions from Edge Function!`);
          console.log("First question:", edgeQuestions[0]);
          setQuestions(edgeQuestions);
          clearTimeout(overallTimeout);
          return; // Success! Exit early
        }
      } catch (edgeFunctionError) {
        console.log("Edge Function service failed:", edgeFunctionError);
      }

      // Method 2: Try function-based access (with timeout)
      console.log("🚀 Attempting to load questions using function-based access...");
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function service timeout')), 3000)
        );
        
        const functionPromise = functionQuestionService.getSampleQuestion();
        const sampleQuestion = await Promise.race([functionPromise, timeoutPromise]);
        
        if (sampleQuestion) {
          console.log(`🎯 Loaded interactive question from function!`);
          console.log("Question data:", sampleQuestion);
          setQuestions([sampleQuestion]);
          clearTimeout(overallTimeout);
          return; // Success! Exit early
        }
      } catch (functionError) {
        console.log("Function service failed:", functionError);
      }

      // Method 3: Try new database direct access (with timeout)
      console.log("⚡ Attempting direct database access...");
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database service timeout')), 3000)
        );
        
        const dbPromise = databaseQuestionService.fetchQuestions();
        const databaseQuestions = await Promise.race([dbPromise, timeoutPromise]) as Question[];
        
        if (databaseQuestions.length > 0) {
          console.log(`🎯 Loaded ${databaseQuestions.length} questions from database!`);
          console.log("First question:", databaseQuestions[0]);
          setQuestions(databaseQuestions);
          clearTimeout(overallTimeout);
          return; // Success! Exit early
        }
      } catch (dbError) {
        console.log("Database service failed:", dbError);
      }
      
      // Method 4: Try legacy secure data service (with timeout)
      console.log("⚡ Trying legacy secure data service...");
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Secure data service timeout')), 2000)
        );
        
        const securePromise = getSecureLatestFunctionData('content');
        const record = await Promise.race([securePromise, timeoutPromise]);
        
        if (record && record.data) {
          console.log("Found secure question data, processing...");
          const mappedQuestions = mapQuestions(record.data);
          if (mappedQuestions.length > 0) {
            console.log(`📦 Loaded ${mappedQuestions.length} questions from secure service`);
            setQuestions(mappedQuestions);
            clearTimeout(overallTimeout);
            return;
          }
        }
      } catch (secureErr) {
        console.log("Secure data service failed:", secureErr);
      }
      
      // Method 5: Fallback to sample questions
      console.log("🔄 Using fallback sample questions (25 questions)");
      setQuestions(sampleQuestions);
      clearTimeout(overallTimeout);
      
    } catch (err) {
      console.error("Error in fetchSecureQuestions:", err);
      // Ensure we always have questions
      setQuestions(sampleQuestions);
      setError(err instanceof Error ? err : new Error("Using fallback questions"));
      clearTimeout(overallTimeout);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecureQuestions();
  }, []);

  const refreshQuestions = async () => {
    await fetchSecureQuestions();
  };

  return (
    <QuestionsContext.Provider value={{ questions, isLoading, error, refreshQuestions }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export default QuestionsProvider;
