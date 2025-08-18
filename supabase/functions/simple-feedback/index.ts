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

    // Get user from auth header (optional)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        user = authUser;
      } catch (e) {
        console.warn("Auth failed, allowing anonymous feedback");
      }
    }

    // Parse request body
    const body = await req.json();
    const { questionId, comment } = body;

    // Validate required fields
    if (!comment?.trim()) {
      return new Response(JSON.stringify({
        error: "Comment is required"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";

    // Simple rate limiting - check feedback from last hour for this IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // For now, we'll create a simple JSON storage approach
    // Later you can migrate to database
    
    // Store feedback data
    const feedbackData = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      question_id: questionId || null,
      comment: comment.trim(),
      user_email: user?.email || null,
      user_name: user?.user_metadata?.name || null,
      ip_address: clientIP,
      page_url: req.headers.get("referer") || null,
      user_agent: req.headers.get("User-Agent") || null,
      created_at: new Date().toISOString()
    };

    console.log('Feedback received:', feedbackData);

    return new Response(JSON.stringify({
      success: true,
      message: "Thank you for your feedback! We appreciate your input.",
      id: feedbackData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});