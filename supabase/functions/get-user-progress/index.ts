
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    // Get period parameter from URL instead of body
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'weekly';
    
    // Create admin client to access data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Generate performance data for the last 15 days
    const today = new Date();
    const performanceGraph = [];
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Generate random data with some realistic patterns
      let attempted = 0;
      
      // Weekends have higher activity
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        attempted = Math.floor(Math.random() * 40) + 20; // 20-60 questions
      } else {
        attempted = Math.floor(Math.random() * 30) + 5; // 5-35 questions
      }
      
      // Some days with no activity
      if (Math.random() < 0.2) {
        attempted = 0;
      }
      
      performanceGraph.push({
        date: formattedDate,
        attempted
      });
    }

    // Generate complete progress data
    const progressData = {
      user_id: "55fb126c-109d-4c10-96af-18edc09a81c7",
      speed: 0.85,
      streak_days: 7,
      avg_score: 92,
      rank: 120,
      projected_score: 92,
      total_attempted: 74,
      total_questions: 130,
      correct_count: 53,
      incorrect_count: 21,
      unattempted_count: 56,
      questions_answered_today: 12,
      easy: {
        total: 50,
        accuracy: 0.9,
        avg_time: 90, // in seconds
        completed: 45
      },
      medium: {
        total: 50,
        accuracy: 0.7,
        avg_time: 150, // in seconds
        completed: 35
      },
      hard: {
        total: 30,
        accuracy: 0.83,
        avg_time: 240, // in seconds
        completed: 25
      },
      avg_time_per_question: 150, // in seconds
      avg_time_correct: 120, // in seconds
      avg_time_incorrect: 210, // in seconds
      longest_time: 480, // in seconds
      chapter_stats: {
        chapter_1: { correct: 12, accuracy: 0.75, incorrect: 3, unattempted: 5 },
        chapter_2: { correct: 8, accuracy: 0.67, incorrect: 2, unattempted: 5 },
        chapter_3: { correct: 10, accuracy: 0.6, incorrect: 5, unattempted: 10 },
        chapter_4: { correct: 20, accuracy: 0.8, incorrect: 4, unattempted: 6 },
        chapter_5: { correct: 5, accuracy: 0.44, incorrect: 3, unattempted: 10 },
        chapter_6: { correct: 14, accuracy: 0.75, incorrect: 1, unattempted: 5 },
        chapter_7: { correct: 9, accuracy: 0.6, incorrect: 6, unattempted: 5 },
        chapter_8: { correct: 11, accuracy: 0.68, incorrect: 3, unattempted: 6 },
        chapter_9: { correct: 7, accuracy: 0.63, incorrect: 4, unattempted: 9 },
        chapter_10: { correct: 13, accuracy: 0.76, incorrect: 2, unattempted: 5 }
      },
      goals: [
        { title: "Complete 100 Questions", target: 100, percent: 0.75, due_date: "2024-05-01", completed: 75 },
        { title: "Achieve 90% in Hard Questions", target: 90, percent: 0.92, due_date: "2024-05-15", completed: 83 }
      ],
      performance_graph: performanceGraph,
      last_question_id: null,
      active_objective_id: null
    };

    return new Response(
      JSON.stringify([progressData]),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
