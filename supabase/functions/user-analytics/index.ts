import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

interface UserAnalyticsRequest {
  userId?: string; // Optional - if not provided, use authenticated user
  timeframe?: 'week' | 'month' | 'all'; // Default: 'all'
  includeRecentActivity?: boolean; // Default: true
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser(token);
    
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse request parameters from body or URL
    let requestData: UserAnalyticsRequest;
    
    if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json();
      requestData = {
        userId: body.userId || user?.id,
        timeframe: body.timeframe || 'all',
        includeRecentActivity: body.includeRecentActivity !== false
      };
    } else {
      // Fallback to URL parameters for GET requests
      const url = new URL(req.url);
      requestData = {
        userId: url.searchParams.get('userId') || user?.id,
        timeframe: (url.searchParams.get('timeframe') as any) || 'all',
        includeRecentActivity: url.searchParams.get('includeRecentActivity') !== 'false'
      };
    }

    // Ensure user can only access their own data (unless admin)
    const targetUserId = requestData.userId || user.id;
    if (targetUserId !== user.id) {
      // TODO: Add admin role check here if needed
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Get user analytics summary
    const { data: userAnalytics, error: analyticsError } = await supabaseClient
      .from('mv_user_performance_summary')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      console.error('Error fetching user analytics:', analyticsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch analytics" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Calculate timeframe filter
    let timeFilter = '';
    const now = new Date();
    if (requestData.timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilter = weekAgo.toISOString();
    } else if (requestData.timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      timeFilter = monthAgo.toISOString();
    }

    // Get detailed performance data based on timeframe
    let performanceQuery = supabaseClient
      .from('question_interactions')
      .select(`
        question_public_id,
        is_correct,
        duration_seconds,
        confidence_level,
        hint_checked,
        solution_checked,
        attempted_at,
        attempt_number
      `)
      .eq('user_id', targetUserId)
      .order('attempted_at', { ascending: false });

    if (timeFilter) {
      performanceQuery = performanceQuery.gte('attempted_at', timeFilter);
    }

    const { data: recentActivity, error: activityError } = await performanceQuery.limit(100);

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
    }

    // Get topic-wise performance (based on question patterns)
    const { data: topicPerformance, error: topicError } = await supabaseClient
      .rpc('get_user_topic_performance', { target_user_id: targetUserId });

    // Get learning streaks and patterns
    const { data: streakData, error: streakError } = await supabaseClient
      .rpc('calculate_user_streaks', { target_user_id: targetUserId });

    // Get session analytics for the timeframe
    let sessionQuery = supabaseClient
      .from('session_analytics')
      .select('*')
      .eq('user_id', targetUserId)
      .order('session_start', { ascending: false });

    if (timeFilter) {
      sessionQuery = sessionQuery.gte('session_start', timeFilter);
    }

    const { data: sessions, error: sessionError } = await sessionQuery.limit(20);

    // Process and analyze the data
    const analytics = {
      // Core metrics
      summary: userAnalytics || {
        total_questions_attempted: 0,
        total_questions_correct: 0,
        accuracy_percentage: 0,
        average_confidence: 0,
        streak_current: 0,
        streak_longest: 0,
        skill_level: 'beginner',
        performance_trend: 'stable',
        avg_time_per_question: 0,
        recent_attempts: 0,
        recent_correct: 0
      },

      // Performance trends
      performance: {
        timeframe: requestData.timeframe,
        recent_accuracy: recentActivity?.length ? 
          (recentActivity.filter(a => a.is_correct).length / recentActivity.length * 100).toFixed(2) : 0,
        average_time: recentActivity?.length ?
          (recentActivity.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / recentActivity.length).toFixed(2) : 0,
        confidence_trend: recentActivity?.length ?
          (recentActivity.reduce((sum, a) => sum + (a.confidence_level || 3), 0) / recentActivity.length).toFixed(2) : 3,
        hint_usage_rate: recentActivity?.length ?
          (recentActivity.filter(a => a.hint_checked).length / recentActivity.length * 100).toFixed(2) : 0,
        solution_usage_rate: recentActivity?.length ?
          (recentActivity.filter(a => a.solution_checked).length / recentActivity.length * 100).toFixed(2) : 0
      },

      // Recent activity (if requested)
      recentActivity: requestData.includeRecentActivity ? (recentActivity || []).map(activity => ({
        question_id: activity.question_public_id,
        is_correct: activity.is_correct,
        time_spent: activity.duration_seconds,
        confidence: activity.confidence_level,
        used_hint: activity.hint_checked,
        checked_solution: activity.solution_checked,
        attempted_at: activity.attempted_at,
        attempt_number: activity.attempt_number
      })) : [],

      // Learning patterns
      patterns: {
        most_active_time: calculateMostActiveTime(recentActivity || []),
        average_session_length: sessions?.length ? 
          (sessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0) / sessions.length / 60).toFixed(2) : 0,
        questions_per_session: sessions?.length ?
          (sessions.reduce((sum, s) => sum + (s.questions_attempted || 0), 0) / sessions.length).toFixed(2) : 0,
        preferred_difficulty: calculatePreferredDifficulty(recentActivity || []),
        learning_velocity: calculateLearningVelocity(recentActivity || [])
      },

      // Topic performance (if available)
      topics: topicPerformance || [],

      // Streaks and achievements
      streaks: streakData || {
        current_streak: 0,
        longest_streak: 0,
        streak_type: 'none'
      },

      // Recommendations
      recommendations: generateRecommendations(userAnalytics, recentActivity || []),

      // Metadata
      generated_at: new Date().toISOString(),
      data_points: recentActivity?.length || 0
    };

    return new Response(JSON.stringify({
      success: true,
      data: analytics
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("User analytics error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper functions for analytics calculations

function calculateMostActiveTime(activities: any[]): string {
  if (!activities.length) return 'No data';

  const hourCounts: { [key: number]: number } = {};
  
  activities.forEach(activity => {
    const hour = new Date(activity.attempted_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostActiveHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (!mostActiveHour) return 'No data';

  const hour = parseInt(mostActiveHour[0]);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  
  return `${displayHour}:00 ${period}`;
}

function calculatePreferredDifficulty(activities: any[]): string {
  if (!activities.length) return 'Unknown';

  // This is a simplified calculation - in practice, you'd map question IDs to difficulty
  const avgTime = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / activities.length;
  const avgConfidence = activities.reduce((sum, a) => sum + (a.confidence_level || 3), 0) / activities.length;

  if (avgTime > 180 || avgConfidence < 2.5) return 'Challenging';
  if (avgTime < 60 && avgConfidence > 4) return 'Easy';
  return 'Moderate';
}

function calculateLearningVelocity(activities: any[]): number {
  if (activities.length < 2) return 0;

  // Calculate questions per hour based on recent activity
  const sortedActivities = activities.sort((a, b) => 
    new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
  );

  const firstActivity = new Date(sortedActivities[0].attempted_at);
  const lastActivity = new Date(sortedActivities[sortedActivities.length - 1].attempted_at);
  const hoursDiff = (lastActivity.getTime() - firstActivity.getTime()) / (1000 * 60 * 60);

  if (hoursDiff === 0) return activities.length;

  return parseFloat((activities.length / hoursDiff).toFixed(2));
}

function generateRecommendations(userAnalytics: any, recentActivity: any[]): string[] {
  const recommendations: string[] = [];

  if (!userAnalytics) return ['Complete more questions to get personalized recommendations'];

  const accuracy = userAnalytics.accuracy_percentage || 0;
  const avgConfidence = userAnalytics.average_confidence || 3;
  const avgTime = userAnalytics.avg_time_per_question || 0;

  if (accuracy < 60) {
    recommendations.push('Focus on understanding concepts before speed');
    recommendations.push('Review solution explanations for missed questions');
  }

  if (accuracy > 85 && avgTime < 90) {
    recommendations.push('Try more challenging questions to advance your skill level');
  }

  if (avgConfidence < 2.5) {
    recommendations.push('Build confidence by reviewing fundamentals');
  }

  if (avgTime > 240) {
    recommendations.push('Practice time management techniques');
    recommendations.push('Try setting a timer for each question');
  }

  const hintUsage = recentActivity.filter(a => a.hint_checked).length / Math.max(recentActivity.length, 1);
  if (hintUsage > 0.7) {
    recommendations.push('Try solving questions without hints first');
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the great work! Maintain consistent practice');
    recommendations.push('Challenge yourself with varied question types');
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}