import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface LogInteractionRequest {
  question_id: string;
  user_id?: string;
  is_correct: boolean;
  time_spent_seconds: number;
  attempted_at?: string;
  bookmarked?: boolean;
  hint_checked?: boolean;
  solution_checked?: boolean;
  confidence_level?: number;
  objective_progress?: number;
  idempotency_key?: string;
  attempt_number?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const requestData: LogInteractionRequest = await req.json();

    // Validate required fields
    if (!requestData.question_id || 
        typeof requestData.is_correct !== 'boolean' || 
        typeof requestData.time_spent_seconds !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: question_id, is_correct, time_spent_seconds" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Generate idempotency key if not provided
    const idempotencyKey = requestData.idempotency_key || crypto.randomUUID();

    // Calculate attempt number if not provided
    let attemptNumber = requestData.attempt_number;
    if (!attemptNumber) {
      // Get existing attempts for this user/question combination
      const { data: existingAttempts } = await supabaseClient
        .from('question_interactions')
        .select('attempt_number')
        .eq('user_id', user.id)
        .eq('question_public_id', requestData.question_id)
        .order('attempt_number', { ascending: false })
        .limit(1);
      
      attemptNumber = existingAttempts && existingAttempts.length > 0 
        ? (existingAttempts[0].attempt_number || 0) + 1 
        : 1;
    }

    // Prepare interaction data using new schema
    const interactionData = {
      user_id: user.id,
      question_public_id: requestData.question_id,
      attempt_number: attemptNumber,
      attempted_at: requestData.attempted_at || new Date().toISOString(),
      duration_seconds: Math.max(0, Math.min(3600, requestData.time_spent_seconds)),
      is_correct: requestData.is_correct,
      confidence_level: requestData.confidence_level || null,
      hint_checked: requestData.hint_checked || false,
      solution_checked: requestData.solution_checked || false,
      objective_progress: requestData.objective_progress ? Math.max(0, Math.min(100, requestData.objective_progress)) : null,
      idempotency_key: idempotencyKey
    };

    // Handle bookmarks separately
    if (requestData.bookmarked) {
      await supabaseClient
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          question_public_id: requestData.question_id
        }, { onConflict: 'user_id,question_public_id' });
    }

    // Log the interaction to database
    const { data: logResult, error: logError } = await supabaseClient
      .from('question_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (logError) {
      console.error("Error logging interaction:", logError);
      return new Response(
        JSON.stringify({ error: "Failed to log interaction", details: logError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      logged_interaction: logResult,
      message: "Interaction logged successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Log interaction error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});