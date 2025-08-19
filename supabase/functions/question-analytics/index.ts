import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

interface QuestionAnalyticsRequest {
  questionId?: string; // Specific question, if not provided returns aggregated data
  sortBy?: 'difficulty' | 'attempts' | 'success_rate' | 'time'; // Default: 'difficulty'
  order?: 'asc' | 'desc'; // Default: 'desc'
  limit?: number; // Default: 50
  includeUserPerformance?: boolean; // Include current user's performance on questions
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user (optional for question analytics)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user: authUser } } = await supabaseClient.auth.getUser(token);
        user = authUser;
      } catch (e) {
        console.warn("Auth failed for question analytics");
      }
    }

    // Parse request parameters from body or URL
    let requestData: QuestionAnalyticsRequest;
    
    if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json();
      requestData = {
        questionId: body.questionId,
        sortBy: body.sortBy || 'difficulty',
        order: body.order || 'desc',
        limit: body.limit || 50,
        includeUserPerformance: body.includeUserPerformance || false
      };
    } else {
      // Fallback to URL parameters for GET requests
      const url = new URL(req.url);
      requestData = {
        questionId: url.searchParams.get('questionId') || undefined,
        sortBy: (url.searchParams.get('sortBy') as any) || 'difficulty',
        order: (url.searchParams.get('order') as any) || 'desc',
        limit: parseInt(url.searchParams.get('limit') || '50'),
        includeUserPerformance: url.searchParams.get('includeUserPerformance') === 'true'
      };
    }

    if (requestData.questionId) {
      // Get analytics for a specific question
      const { data: questionAnalytics, error: analyticsError } = await supabaseClient
        .from('question_analytics')
        .select('*')
        .eq('question_public_id', requestData.questionId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        console.error('Error fetching question analytics:', analyticsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch question analytics" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Get user's performance on this question if authenticated
      let userPerformance = null;
      if (user && requestData.includeUserPerformance) {
        const { data: userQuestionData } = await supabaseClient
          .from('question_interactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('question_public_id', requestData.questionId)
          .order('attempted_at', { ascending: false });

        if (userQuestionData && userQuestionData.length > 0) {
          const attempts = userQuestionData;
          userPerformance = {
            total_attempts: attempts.length,
            correct_attempts: attempts.filter(a => a.is_correct).length,
            best_time: Math.min(...attempts.map(a => a.duration_seconds)),
            latest_attempt: attempts[0],
            improvement_trend: calculateImprovementTrend(attempts),
            is_bookmarked: false // Will be set below
          };

          // Check if user has bookmarked this question
          const { data: bookmark } = await supabaseClient
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .eq('question_public_id', requestData.questionId)
            .single();

          userPerformance.is_bookmarked = !!bookmark;
        }
      }

      const result = {
        success: true,
        data: {
          question: questionAnalytics || {
            question_public_id: requestData.questionId,
            total_attempts: 0,
            correct_attempts: 0,
            difficulty_score: 3.0,
            average_time_seconds: 0,
            average_confidence: 3.0
          },
          user_performance: userPerformance,
          generated_at: new Date().toISOString()
        }
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      // Get aggregated question analytics
      let query = supabaseClient
        .from('mv_question_difficulty_ranking')
        .select('*');

      // Apply sorting
      const sortColumn = getSortColumn(requestData.sortBy);
      query = query.order(sortColumn, { ascending: requestData.order === 'asc' });

      // Apply limit
      query = query.limit(requestData.limit);

      const { data: questionsData, error: questionsError } = await query;

      if (questionsError) {
        console.error('Error fetching questions analytics:', questionsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch questions analytics" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Get overall statistics
      const { data: overallStats } = await supabaseClient
        .rpc('get_overall_question_stats');

      // Get topic-based analytics (group by question patterns/prefixes)
      const topicStats = await generateTopicStatistics(questionsData || []);

      // Get difficulty distribution
      const difficultyDistribution = calculateDifficultyDistribution(questionsData || []);

      // Get user's performance on these questions if authenticated
      let userQuestionPerformance = [];
      if (user && requestData.includeUserPerformance && questionsData) {
        const questionIds = questionsData.map(q => q.question_public_id);
        const { data: userInteractions } = await supabaseClient
          .from('question_interactions')
          .select('question_public_id, is_correct, duration_seconds, attempted_at')
          .eq('user_id', user.id)
          .in('question_public_id', questionIds);

        userQuestionPerformance = processUserQuestionPerformance(userInteractions || []);
      }

      const result = {
        success: true,
        data: {
          questions: questionsData || [],
          overall_stats: overallStats || {
            total_questions: 0,
            total_attempts: 0,
            average_success_rate: 0,
            average_difficulty: 3.0
          },
          topic_stats: topicStats,
          difficulty_distribution: difficultyDistribution,
          user_performance: userQuestionPerformance,
          filters: {
            sort_by: requestData.sortBy,
            order: requestData.order,
            limit: requestData.limit
          },
          generated_at: new Date().toISOString()
        }
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    console.error("Question analytics error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper functions

function getSortColumn(sortBy: string): string {
  switch (sortBy) {
    case 'difficulty':
      return 'difficulty_score';
    case 'attempts':
      return 'total_attempts';
    case 'success_rate':
      return 'success_rate';
    case 'time':
      return 'average_time_seconds';
    default:
      return 'difficulty_score';
  }
}

function calculateImprovementTrend(attempts: any[]): 'improving' | 'declining' | 'stable' {
  if (attempts.length < 2) return 'stable';

  const sortedAttempts = attempts.sort((a, b) => 
    new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
  );

  const firstHalf = sortedAttempts.slice(0, Math.ceil(attempts.length / 2));
  const secondHalf = sortedAttempts.slice(Math.ceil(attempts.length / 2));

  const firstHalfAccuracy = firstHalf.filter(a => a.is_correct).length / firstHalf.length;
  const secondHalfAccuracy = secondHalf.filter(a => a.is_correct).length / secondHalf.length;

  if (secondHalfAccuracy > firstHalfAccuracy + 0.1) return 'improving';
  if (secondHalfAccuracy < firstHalfAccuracy - 0.1) return 'declining';
  return 'stable';
}

function generateTopicStatistics(questions: any[]): any[] {
  const topicMap = new Map();

  questions.forEach(question => {
    // Extract topic from question_public_id (e.g., "MATH-ALG-001" -> "MATH-ALG")
    const parts = question.question_public_id.split('-');
    const topic = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : parts[0] || 'Unknown';

    if (!topicMap.has(topic)) {
      topicMap.set(topic, {
        topic_name: topic,
        question_count: 0,
        total_attempts: 0,
        total_correct: 0,
        average_difficulty: 0,
        average_time: 0
      });
    }

    const topicData = topicMap.get(topic);
    topicData.question_count++;
    topicData.total_attempts += question.total_attempts || 0;
    topicData.total_correct += question.correct_attempts || 0;
    topicData.average_difficulty += question.difficulty_score || 0;
    topicData.average_time += question.average_time_seconds || 0;
  });

  // Calculate averages and success rates
  return Array.from(topicMap.values()).map(topic => ({
    ...topic,
    success_rate: topic.total_attempts > 0 ? 
      (topic.total_correct / topic.total_attempts * 100).toFixed(2) : 0,
    average_difficulty: (topic.average_difficulty / topic.question_count).toFixed(2),
    average_time: (topic.average_time / topic.question_count).toFixed(2)
  }));
}

function calculateDifficultyDistribution(questions: any[]): any {
  const distribution = {
    easy: 0,      // difficulty 1.0 - 2.0
    medium: 0,    // difficulty 2.0 - 3.5
    hard: 0,      // difficulty 3.5 - 4.5
    expert: 0     // difficulty 4.5 - 5.0
  };

  questions.forEach(question => {
    const difficulty = question.difficulty_score || 3.0;
    if (difficulty <= 2.0) distribution.easy++;
    else if (difficulty <= 3.5) distribution.medium++;
    else if (difficulty <= 4.5) distribution.hard++;
    else distribution.expert++;
  });

  return {
    ...distribution,
    total: questions.length,
    percentages: {
      easy: questions.length > 0 ? (distribution.easy / questions.length * 100).toFixed(1) : 0,
      medium: questions.length > 0 ? (distribution.medium / questions.length * 100).toFixed(1) : 0,
      hard: questions.length > 0 ? (distribution.hard / questions.length * 100).toFixed(1) : 0,
      expert: questions.length > 0 ? (distribution.expert / questions.length * 100).toFixed(1) : 0
    }
  };
}

function processUserQuestionPerformance(interactions: any[]): any[] {
  const questionMap = new Map();

  interactions.forEach(interaction => {
    const qId = interaction.question_public_id;
    if (!questionMap.has(qId)) {
      questionMap.set(qId, {
        question_id: qId,
        attempts: [],
        total_attempts: 0,
        correct_attempts: 0,
        best_time: Infinity,
        latest_attempt: null
      });
    }

    const qData = questionMap.get(qId);
    qData.attempts.push(interaction);
    qData.total_attempts++;
    if (interaction.is_correct) qData.correct_attempts++;
    if (interaction.duration_seconds < qData.best_time) {
      qData.best_time = interaction.duration_seconds;
    }
    if (!qData.latest_attempt || 
        new Date(interaction.attempted_at) > new Date(qData.latest_attempt.attempted_at)) {
      qData.latest_attempt = interaction;
    }
  });

  return Array.from(questionMap.values()).map(qData => ({
    question_id: qData.question_id,
    total_attempts: qData.total_attempts,
    correct_attempts: qData.correct_attempts,
    success_rate: (qData.correct_attempts / qData.total_attempts * 100).toFixed(2),
    best_time: qData.best_time === Infinity ? null : qData.best_time,
    latest_attempt: qData.latest_attempt,
    improvement_trend: calculateImprovementTrend(qData.attempts)
  }));
}