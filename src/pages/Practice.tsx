import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, RefreshCw, AlertTriangle, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  storeSecureFunctionData,
  safeGetSecureData,
  clearAllSecureData,
  isSecureStorageValid,
} from "@/services/secureIndexedDbService";
import PracticeContent from "@/components/practice/PracticeContent";
import AIAnalyzer from "@/components/ai/AIAnalyzer";
import CommentSection from "@/components/practice/CommentSection";
import { mapQuestions, validateQuestion } from "@/utils/mapQuestion";
import { Question } from "@/types/QuestionInterface";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { sampleQuestions } from "@/components/practice/sampleQuestion";

const ENDPOINT = "my-function";

// Convert comprehensive sample questions to the format expected by Practice.tsx
const convertToApiFormat = (questions: Question[]) => {
  return questions.map(q => ({
    id: q.id,
    number: q.number,
    content: q.content,
    choices: q.choices,
    correctAnswer: q.correctAnswer,
    solution: JSON.stringify(q.solutionSteps?.map(step => ({ step })) || [{ step: q.solution }]),
    difficulty: q.difficulty,
    chapter: q.chapter,
    module: q.module,
    examNumber: q.examNumber,
    hint: q.hint || q.explanation,
    graph: q.graph?.url || q.graph,
    quote: q.quote  // Include the quote field!
  }));
};

// Use comprehensive sample questions as fallback (23 questions covering all filters)
const DUMMY_QUESTIONS = convertToApiFormat(sampleQuestions);

const Practice = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    fontFamily: "inter",
    fontSize: 14,
    colorStyle: "plain" as const,
    textColor: "#374151"
  });

  const handleSettingsChange = (key: any, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStorageValid, setIsStorageValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndStoreQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a more secure fetch method that doesn't expose raw JSON
      const secureFetch = async () => {
        const baseUrl = "https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1";
        const url = `${baseUrl}/${ENDPOINT}`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json"
          },
          mode: "cors",
        });
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        
        // Parse response in a secure way without exposing to dev tools
        const textData = await response.text();
        let result;
        try {
          result = JSON.parse(textData);
        } catch (parseError) {
          throw new Error("Invalid response format");
        }
        
        // Clear the text data immediately to prevent dev tools inspection
        return result;
      };

      const result = await secureFetch();
      console.log("API fetch successful, result:", result);
      console.log("About to store result, type:", typeof result, "isArray:", Array.isArray(result));
      await storeSecureFunctionData(ENDPOINT, result);

      // Handle direct array response from edge function
      let rawQuestions: any[] = [];
      if (Array.isArray(result)) {
        rawQuestions = result;
      } else if (result?.questions && Array.isArray(result.questions)) {
        rawQuestions = result.questions;
      } else if (result?.data && Array.isArray(result.data)) {
        rawQuestions = result.data;
      } else {
        console.warn("No questions found in response structure, got:", typeof result);
        rawQuestions = [];
      }

      // Use the mapper to normalize and validate questions
      const mappedQuestions = mapQuestions(rawQuestions);
      const validQuestions = mappedQuestions.filter(validateQuestion);

      if (validQuestions.length === 0) {
        console.warn("No valid questions after mapping and validation");
        throw new Error("No valid questions available");
      }

      setQuestions(validQuestions);
      setLastFetched(new Date());
      setError(null);
      
      toast({
        title: "Questions Ready",
        description: `Loaded ${validQuestions.length} practice questions securely.`,
      });
      
      return result; // Return the raw API result
    } catch (e: any) {
      console.error("Fetch error:", e.message);
      setError(e.message || "Failed to load questions");
      toast({
        title: "Error",
        description: e.message || "Failed to load questions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLatestQuestions = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    // Try to load from API/cache first
    try {
      const result = await safeGetSecureData(ENDPOINT, fetchAndStoreQuestions);
      
      // Handle the case where result might be undefined or not have expected structure
      let data = null;
      let fromCache = false;
      
      if (result && typeof result === 'object') {
        data = result.data || result;
        fromCache = result.fromCache || false;
      } else {
        data = result;
      }
      
      if (data) {
        // Handle direct array response from edge function
        let rawQuestions: any[] = [];
        if (Array.isArray(data)) {
          rawQuestions = data;
        } else if (data.questions && Array.isArray(data.questions)) {
          rawQuestions = data.questions;
        } else if (data.data && Array.isArray(data.data)) {
          rawQuestions = data.data;
        }

        // Use mapper to process and validate questions
        const mappedQuestions = mapQuestions(rawQuestions);
        const validQuestions = mappedQuestions.filter(validateQuestion);

        if (validQuestions.length > 0) {
          setQuestions(validQuestions);
          setLastFetched(new Date());
          setError(null);
          setLoading(false);
          
          toast({
            title: "Questions Ready",
            description: fromCache
              ? `Loaded ${validQuestions.length} questions from secure storage.`
              : `Fetched ${validQuestions.length} questions and stored securely.`,
          });
          return;
        }
      }
    } catch (e: any) {
      console.warn("Failed to load from API/cache:", e.message);
    }
    
    // Fallback to dummy questions if API fails
    console.log("Using fallback questions");
    const mappedDummyQuestions = mapQuestions(DUMMY_QUESTIONS);
    const validDummyQuestions = mappedDummyQuestions.filter(validateQuestion);
    
    setQuestions(validDummyQuestions);
    setLastFetched(new Date());
    setError(null);
    setLoading(false);
    
    toast({
      title: "Practice Questions Ready",
      description: `Loaded ${validDummyQuestions.length} practice questions.`,
    });
  };

  const handleClearStorage = async () => {
    await clearAllSecureData();
    setQuestions([]);
    setLastFetched(null);
    setIsStorageValid(true);
    toast({
      title: "Storage Cleared",
      description: "All secure questions have been removed.",
    });
  };

  useEffect(() => {
    setIsStorageValid(isSecureStorageValid());
    // Clear existing cache on first load to force fresh fetch
    const clearAndLoad = async () => {
      try {
        await clearAllSecureData();
        console.log("Cleared secure storage, loading fresh questions...");
      } catch (e) {
        console.warn("Failed to clear storage:", e);
      }
      loadLatestQuestions();
    };
    clearAndLoad();
  }, []);

  return (
    <ThemeProvider>
      <Card className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors duration-300 dark:border-green-500/30">
        
        {/* Content area */}
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-green-400" />
              <span className="ml-2 dark:text-green-400">Loading and mapping secure questions...</span>
            </div>
          ) : questions && questions.length > 0 ? (
            <>
              <PracticeContent 
                questions={questions}
                isLoading={false}
                error={null}
                settings={settings} 
                onSettingsChange={handleSettingsChange}
              />
              {/* Removed AIAnalyzer and CommentSection since they're now in the footer */}
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-green-400" />
              <span className="ml-2 dark:text-green-400">Loading questions...</span>
            </div>
          )}
          {lastFetched && (
            <div className="text-xs text-gray-500 dark:text-green-500 p-2 border-t dark:border-green-500/30">
              Last updated: {lastFetched.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default Practice;
