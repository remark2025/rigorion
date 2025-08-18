import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header (optional - feedback can be anonymous)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    // Parse request body
    const body = await req.json();
    const {
      questionId,
      comment,
      rating,
      feedbackType = 'general',
      userEmail,
      userName,
      pageUrl
    } = body;

    // Validate required fields
    if (!comment?.trim()) {
      return new Response(JSON.stringify({
        error: "Comment is required"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Get client IP for rate limiting - extract first IP from comma-separated list
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIP = req.headers.get("x-real-ip");
    
    let clientIP = "unknown";
    if (forwardedFor) {
      // Extract first IP from comma-separated list
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP.trim();
    }

    // Check rate limit (5 feedback per day per user/IP)
    const { data: canSubmit, error: rateLimitError } = await supabase
      .rpc('check_feedback_rate_limit', {
        user_uuid: user?.id || null,
        user_ip: clientIP !== "unknown" ? clientIP : null
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (!canSubmit) {
      return new Response(JSON.stringify({
        error: "Daily feedback limit reached (5 per day). Please try again tomorrow.",
        limit: 5,
        period: "daily"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429 // Too Many Requests
      });
    }

    // Prepare feedback data
    const feedbackData = {
      user_id: user?.id || null,
      question_id: questionId || null,
      comment: comment.trim(),
      rating: rating || null,
      feedback_type: feedbackType,
      user_email: userEmail || user?.email || null,
      user_name: userName || user?.user_metadata?.name || null,
      page_url: pageUrl || null,
      user_agent: req.headers.get("User-Agent") || null,
      ip_address: clientIP !== "unknown" ? clientIP : null
    };

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: "Failed to save feedback"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }

    console.log('Feedback saved:', data);

    return new Response(JSON.stringify({
      success: true,
      message: "Thank you for your feedback!",
      id: data.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});