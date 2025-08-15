import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Use the database function to get comprehensive subscription info
    const { data: subscriptionInfo, error } = await supabaseClient
      .rpc('get_subscription_info', { user_uuid: user.id });

    if (error) {
      console.error("Error getting subscription info:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get subscription status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (subscriptionInfo.is_trialing && subscriptionInfo.trial_ends_at) {
      const trialEnd = new Date(subscriptionInfo.trial_ends_at);
      const now = new Date();
      const timeDiff = trialEnd.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    }

    // Return enhanced status
    return new Response(JSON.stringify({
      ...subscriptionInfo,
      trial_days_remaining: trialDaysRemaining,
      needs_upgrade: !subscriptionInfo.has_premium_access,
      warning_days: trialDaysRemaining <= 3 && subscriptionInfo.is_trialing
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Subscription status error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});