import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
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
  // Enhanced skill tracking fields
  module?: 'math' | 'reading' | 'writing';
  chapter?: number;
  exam?: number;
  level?: 'easy' | 'medium' | 'difficult';
  topic?: string;
  question_type?: string;
  // Additional context for better analytics
  practice_session_id?: string;
  question_index_in_session?: number;
  total_questions_in_session?: number;
  selected_answer?: string;
  correct_answer?: string;
  practice_mode?: 'timed' | 'untimed' | 'mock_test' | 'chapter_review';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function: log-interaction starting...')
    console.log('📥 Request method:', req.method)
    console.log('📥 Request URL:', req.url)
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey })
      throw new Error('Missing required environment variables')
    }
    
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

    let requestData: LogInteractionRequest;
    try {
      requestData = await req.json();
      console.log('📝 Request data received:', JSON.stringify(requestData, null, 2))
    } catch (jsonError) {
      console.error('❌ JSON parsing error:', jsonError)
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate required fields
    console.log('🔍 Validating required fields...')
    console.log('- question_id:', requestData.question_id)
    console.log('- is_correct:', requestData.is_correct, typeof requestData.is_correct)
    console.log('- time_spent_seconds:', requestData.time_spent_seconds, typeof requestData.time_spent_seconds)
    
    if (!requestData.question_id || 
        typeof requestData.is_correct !== 'boolean' || 
        typeof requestData.time_spent_seconds !== 'number') {
      console.error('❌ Validation failed')
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: question_id, is_correct, time_spent_seconds",
          received: {
            question_id: requestData.question_id,
            is_correct: requestData.is_correct,
            time_spent_seconds: requestData.time_spent_seconds
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Generate idempotency key if not provided
    const idempotencyKey = requestData.idempotency_key || crypto.randomUUID();

    // Calculate attempt number - always get the next available number
    console.log('🔢 Calculating attempt number for user:', user.id, 'question:', requestData.question_id)
    
    const { data: existingAttempts, error: attemptError } = await supabaseClient
      .from('question_interactions')
      .select('attempt_number')
      .eq('user_id', user.id)
      .eq('question_public_id', requestData.question_id)
      .order('attempt_number', { ascending: false })
      .limit(1);
    
    if (attemptError) {
      console.error('❌ Error fetching existing attempts:', attemptError)
      // Continue with attempt number 1 if we can't fetch existing attempts
    }
    
    const attemptNumber = existingAttempts && existingAttempts.length > 0 
      ? (existingAttempts[0].attempt_number || 0) + 1 
      : 1;
      
    console.log('🎯 Using attempt number:', attemptNumber)

    // Prepare interaction data using enhanced schema
    console.log('📋 Preparing interaction data...')
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
      idempotency_key: idempotencyKey,
      // Enhanced skill tracking fields
      module: requestData.module || null,
      chapter: requestData.chapter || null,
      exam: requestData.exam || null,
      level: requestData.level || null,
      topic: requestData.topic || null,
      question_type: requestData.question_type || null,
      // Note: Additional fields like practice_session_id, selected_answer, etc. 
      // are not yet added to the database schema, so they're commented out for now
      // practice_session_id: requestData.practice_session_id || null,
      // question_index_in_session: requestData.question_index_in_session || null,
      // total_questions_in_session: requestData.total_questions_in_session || null,
      // selected_answer: requestData.selected_answer || null,
      // correct_answer: requestData.correct_answer || null,
      // practice_mode: requestData.practice_mode || null
    };
    
    console.log('✅ Interaction data prepared:', JSON.stringify(interactionData, null, 2))

    // Handle bookmarks separately
    if (requestData.bookmarked) {
      console.log('📖 Processing bookmark...')
      await supabaseClient
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          question_public_id: requestData.question_id
        }, { onConflict: 'user_id,question_public_id' });
    }

    // Log the interaction to database with retry for duplicate key errors
    console.log('💾 Inserting interaction into database...')
    let logResult;
    let logError;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      console.log(`🔄 Database insert attempt ${retryCount + 1}/${maxRetries}`)
      const result = await supabaseClient
        .from('question_interactions')
        .insert(interactionData)
        .select()
        .single();
      
      logResult = result.data;
      logError = result.error;

      // If successful, break out of retry loop
      if (!logError) {
        break;
      }

      // If duplicate key error, recalculate attempt number and retry
      if (logError.code === '23505' && retryCount < maxRetries - 1) {
        console.log(`Duplicate key detected, retrying with new attempt number (attempt ${retryCount + 1})`);
        
        // Recalculate attempt number
        const { data: newExistingAttempts } = await supabaseClient
          .from('question_interactions')
          .select('attempt_number')
          .eq('user_id', user.id)
          .eq('question_public_id', requestData.question_id)
          .order('attempt_number', { ascending: false })
          .limit(1);
        
        const newAttemptNumber = newExistingAttempts && newExistingAttempts.length > 0 
          ? (newExistingAttempts[0].attempt_number || 0) + 1 
          : 1;
        
        interactionData.attempt_number = newAttemptNumber;
        interactionData.idempotency_key = crypto.randomUUID(); // New idempotency key for retry
        retryCount++;
      } else {
        // For other errors or max retries reached, break
        break;
      }
    }

    if (logError) {
      console.error("Error logging interaction after retries:", logError);
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