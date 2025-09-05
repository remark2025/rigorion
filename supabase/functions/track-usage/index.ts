import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface UsageRequest {
  usage_type: 'practice_question' | 'ai_explanation' | 'progress_view' | 'custom';
  amount?: number;
  metadata?: any;
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { usage_type, amount = 1, metadata }: UsageRequest = await req.json();

    // Validate usage_type
    const validUsageTypes = ['practice_question', 'ai_explanation', 'progress_view', 'custom'];
    if (!validUsageTypes.includes(usage_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid usage_type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user has premium access first
    const { data: subscriptionInfo } = await supabaseClient
      .rpc('get_subscription_info', { user_uuid: user.id });

    if (!subscriptionInfo) {
      return new Response(
        JSON.stringify({ error: "Could not get subscription info" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // For non-premium users, check if they're within free tier limits
    if (!subscriptionInfo.has_premium_access) {
      // Get current usage for today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayUsage } = await supabaseClient
        .from('subscription_usage')
        .select('amount')
        .eq('user_id', user.id)
        .eq('usage_type', usage_type)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      const currentUsage = todayUsage?.reduce((sum, record) => sum + record.amount, 0) || 0;
      
      // Define free tier limits
      const freeLimits: { [key: string]: number } = {
        practice_question: 10,
        ai_explanation: 5,
        progress_view: 20,
        custom: 5
      };

      const limit = freeLimits[usage_type] || 5;

      if (currentUsage + amount > limit) {
        return new Response(
          JSON.stringify({ 
            error: "Free tier limit exceeded",
            limit: limit,
            current_usage: currentUsage,
            requested_amount: amount
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    // Record the usage
    const { data: usageRecord, error: usageError } = await supabaseClient
      .from('subscription_usage')
      .insert({
        user_id: user.id,
        usage_type,
        amount,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (usageError) {
      console.error("Error recording usage:", usageError);
      return new Response(
        JSON.stringify({ error: "Failed to record usage" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get updated usage statistics for the user
    const { data: usageStats } = await supabaseClient
      .from('subscription_usage')
      .select('usage_type, amount')
      .eq('user_id', user.id)
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()); // Last 30 days

    // Calculate usage by type
    const usageSummary = usageStats?.reduce((summary: any, record) => {
      if (!summary[record.usage_type]) {
        summary[record.usage_type] = 0;
      }
      summary[record.usage_type] += record.amount;
      return summary;
    }, {}) || {};

    return new Response(JSON.stringify({
      success: true,
      usage_recorded: usageRecord,
      monthly_usage_summary: usageSummary,
      has_premium_access: subscriptionInfo.has_premium_access,
      is_trialing: subscriptionInfo.is_trialing
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Usage tracking error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});