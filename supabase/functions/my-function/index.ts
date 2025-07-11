
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch questions from Supabase database
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .limit(50); // Limit to avoid too much data

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!questions || questions.length === 0) {
      console.log("No questions found in database, returning sample data");
      // Fallback to sample data if no questions in database
      const fallbackData = {
        id: "func-fallback",
        name: "Fallback Question Data",
        timestamp: new Date().toISOString(),
        questions: [
          {
            id: "fallback-1",
            number: 1,
            content: "If 3x + 7 = 22, what is the value of x?",
            choices: ["x = 4", "x = 5", "x = 6", "x = 7"],
            correctAnswer: "B",
            solution: [
              {"step": "Start with the equation: 3x + 7 = 22"},
              {"step": "Subtract 7 from both sides: 3x = 15"}, 
              {"step": "Divide both sides by 3: x = 5"}
            ],
            difficulty: "medium",
            chapter: "Algebra",
            module: "SAT Math",
            examNumber: 1,
            hint: "Use inverse operations to isolate the variable"
          }
        ]
      };
      
      return new Response(
        JSON.stringify(fallbackData),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    console.log(`Found ${questions.length} questions in database`);

    // Format the response with questions from Supabase
    const data = {
      id: "func-supabase",
      name: "Supabase Question Data",
      timestamp: new Date().toISOString(),
      questions: questions.map((q: any, index: number) => ({
        id: q.id || `db-${index + 1}`,
        number: q.number || index + 1,
        content: q.content || q.question_text || "Question content not available",
        choices: q.choices || q.options || ["A", "B", "C", "D"],
        correctAnswer: q.correct_answer || q.answer || "A",
        solution: q.solution || q.explanation || "Solution not available",
        difficulty: q.difficulty || "medium",
        chapter: q.chapter || q.topic || "General",
        module: q.module || "SAT Math",
        examNumber: q.exam_number || q.examNumber || 1,
        hint: q.hint || "Think carefully about this problem",
        graph: q.graph || q.image_url,
        solutionSteps: q.solution_steps || q.solutionSteps || []
      })),
      stats: {
        totalQuestions: questions.length,
        answeredCorrect: 0,
        accuracy: 0,
        averageTime: 0
      },
      user: {
        id: "user-db",
        progress: 0,
        lastActive: new Date().toISOString()
      }
    };

    // Return the response with CORS headers
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch questions", 
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
