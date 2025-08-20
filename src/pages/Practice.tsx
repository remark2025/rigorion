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

const ENDPOINT = "content";

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
    emphasis: {
      bold: false,
      italic: false,
      underline: false,
      highlight: false
    }
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
        const baseUrl = "https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1";
        const url = `${baseUrl}/${ENDPOINT}?id=core&v=${Date.now()}`; // Fetch core pack questions with cache buster
        
        // Get user session for authentication
        const token = localStorage.getItem('sb-zmsqscxqxlhhehzwbylv-auth-token');
        let authToken = null;
        
        if (token) {
          try {
            const session = JSON.parse(token);
            authToken = session?.access_token;
          } catch (e) {
            console.warn('Failed to parse auth token');
          }
        }
        
        const response = await fetch(url, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": authToken ? `Bearer ${authToken}` : "",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ"
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

      // Handle content pack response format - your JSON structure
      let rawQuestions: any[] = [];
      console.log("Processing content pack result:", result);
      
      if (result?.questions && Array.isArray(result.questions)) {
        // Enhanced content pack format with skill tracking
        rawQuestions = result.questions.map((q: any, index: number) => {
          const correctOption = q.options?.find((opt: any) => opt.id === q.correct_answer);
          console.log(`Question ${q.id}: correct_answer=${q.correct_answer}, correctOption=`, correctOption);
          return {
            id: q.id,
            number: index + 1,
            content: q.content,
            keyPhrases: q.keyPhrases || [],
            choices: q.options ? q.options.map((opt: any) => opt.text) : [],
            correctAnswer: correctOption?.text || q.correct_answer,
            solution: q.solution || q.explanation || "No solution available",
            solutionSteps: q.solutionSteps || [],
            difficulty: q.difficulty || q.level || "intermediate", 
            chapter: q.chapter || result.title || "SAT Practice",
            module: q.module || result.category || "General",
            examNumber: q.exam || 0,
            hint: q.hint || q.explanation || "No hint available",
            explanation: q.explanation || "No explanation available",
            calculatorAllowed: q.calculatorAllowed !== undefined ? q.calculatorAllowed : true,
            type: q.type || "multiple_choice",
            topics: q.topics || [],
            estimatedTime: q.estimatedTime || 30,
            topic: q.topic || "General",
            bookmarked: false,
            // Enhanced fields for skill tracking
            level: q.level || q.difficulty || "medium",
            passage: q.passage || undefined,
            quote: q.quote || undefined,
            graph: q.graph || undefined
          };
        });
        console.log("Mapped questions:", rawQuestions);
      } else if (Array.isArray(result)) {
        rawQuestions = result;
      } else {
        console.warn("No questions found in response structure, got:", typeof result);
        rawQuestions = [];
      }

      // Use the mapper to normalize and validate questions
      console.log("Raw questions before mapping:", rawQuestions.length, rawQuestions[0]);
      const mappedQuestions = mapQuestions(rawQuestions);
      console.log("Mapped questions:", mappedQuestions.length, mappedQuestions[0]);
      const validQuestions = mappedQuestions.filter(validateQuestion);
      console.log("Valid questions after validation:", validQuestions.length);

      if (validQuestions.length === 0) {
        console.warn("No valid questions after mapping and validation");
        console.log("First mapped question for debugging:", mappedQuestions[0]);
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
        // Handle content pack response format - your JSON structure
        let rawQuestions: any[] = [];
        console.log("Loading cached content pack data:", data);
        
        if (data?.questions && Array.isArray(data.questions)) {
          // Your content pack format: {id, title, questions: [...]}
          rawQuestions = data.questions.map((q: any, index: number) => {
            const correctOption = q.options?.find((opt: any) => opt.id === q.correct_answer);
            return {
              id: q.id,
              number: index + 1,
              content: q.content,
              choices: q.options ? q.options.map((opt: any) => opt.text) : [],
              correctAnswer: correctOption?.text || q.correct_answer,
              solution: q.explanation || "No explanation available",
              difficulty: q.difficulty || "intermediate",
              chapter: data.title || "SAT Practice",
              module: data.category || "General",
              hint: q.explanation,
              calculatorAllowed: true,
              type: q.type || "multiple_choice",
              topics: q.topics || [],
              estimatedTime: q.estimatedTime || 30
            };
          });
          console.log("Mapped cached questions:", rawQuestions);
        } else if (Array.isArray(data)) {
          rawQuestions = data;
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
      {/* SAT Practice - Clean White Interface */}
      <div className="min-h-screen bg-white relative">
        
        {/* Content area */}
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Loading practice questions...</span>
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
            </>
          ) : (
            <div className="flex justify-center items-center h-64 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Loading questions...</span>
            </div>
          )}
          {lastFetched && (
            <div className="text-xs text-gray-500 p-2 border-t border-gray-200 bg-white">
              Last updated: {lastFetched.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Practice;
