
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
    try {
      setIsLoading(true);
      setError(null);
      
      // Method 1: Try Edge Function first (bypasses PostgREST entirely)
      console.log("🚀 Attempting to load questions using Edge Function...");
      try {
        const edgeFunctionAvailable = await edgeFunctionQuestionService.testFunction();
        console.log("Edge Function test result:", edgeFunctionAvailable);
        
        if (edgeFunctionAvailable) {
          const edgeQuestions = await edgeFunctionQuestionService.fetchQuestions();
          
          if (edgeQuestions.length > 0) {
            console.log(`🎯 Loaded ${edgeQuestions.length} questions from Edge Function!`);
            console.log("First question:", edgeQuestions[0]);
            setQuestions(edgeQuestions);
            return; // Success! Exit early
          }
        }
      } catch (edgeFunctionError) {
        console.log("Edge Function service failed:", edgeFunctionError);
      }

      // Method 2: Try function-based access (bypasses schema cache)
      console.log("🚀 Attempting to load questions using function-based access...");
      try {
        const functionAvailable = await functionQuestionService.testFunction();
        console.log("Function test result:", functionAvailable);
        
        if (functionAvailable) {
          const sampleQuestion = await functionQuestionService.getSampleQuestion();
          
          if (sampleQuestion) {
            console.log(`🎯 Loaded interactive question from function!`);
            console.log("Question data:", sampleQuestion);
            setQuestions([sampleQuestion]);
            return; // Success! Exit early
          }
        }
      } catch (functionError) {
        console.log("Function service failed:", functionError);
      }

      // Method 3: Try new database direct access
      console.log("⚡ Attempting direct database access...");
      try {
        const connectionTest = await databaseQuestionService.testConnection();
        console.log("Database connection test:", connectionTest);
        
        if (connectionTest.success && connectionTest.questionCount > 0) {
          console.log(`✅ Database available with ${connectionTest.questionCount} questions`);
          const databaseQuestions = await databaseQuestionService.fetchQuestions();
          
          if (databaseQuestions.length > 0) {
            console.log(`🎯 Loaded ${databaseQuestions.length} questions from database!`);
            console.log("First question:", databaseQuestions[0]);
            setQuestions(databaseQuestions);
            return; // Success! Exit early
          }
        }
      } catch (dbError) {
        console.log("Database service failed:", dbError);
      }
      
      // Method 4: Try legacy secure data service
      console.log("⚡ Trying legacy secure data service...");
      try {
        const record = await getSecureLatestFunctionData('content');
        
        if (record && record.data) {
          console.log("Found secure question data, processing...");
          const mappedQuestions = mapQuestions(record.data);
          if (mappedQuestions.length > 0) {
            console.log(`📦 Loaded ${mappedQuestions.length} questions from secure service`);
            setQuestions(mappedQuestions);
            return;
          }
        }
      } catch (secureErr) {
        console.log("Secure data service failed:", secureErr);
      }
      
      // Method 5: Fallback to sample questions
      console.log("🔄 Using fallback sample questions (25 questions)");
      setQuestions(sampleQuestions);
      
    } catch (err) {
      console.error("Error in fetchSecureQuestions:", err);
      // Ensure we always have questions
      setQuestions(sampleQuestions);
      setError(err instanceof Error ? err : new Error("Using fallback questions"));
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
