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

    // Get subscription info from subscriptions table
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("Error getting subscription info:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get subscription status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Default response for no subscription
    if (!subscription) {
      return new Response(JSON.stringify({
        status: 'none',
        has_premium_access: false,
        is_trialing: false,
        trial_days_remaining: 0,
        needs_upgrade: true,
        warning_days: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate trial days remaining - using trial_end column
    let trialDaysRemaining = 0;
    const isTrialing = subscription.status === 'trialing';
    
    if (isTrialing && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const timeDiff = trialEnd.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    }

    // Determine premium access
    const hasAccess = subscription.status === 'active' || (subscription.status === 'trialing' && trialDaysRemaining > 0);

    // Return enhanced status
    return new Response(JSON.stringify({
      status: subscription.status,
      has_premium_access: hasAccess,
      is_trialing: isTrialing,
      trial_ends_at: subscription.trial_end,
      trial_days_remaining: trialDaysRemaining,
      needs_upgrade: !hasAccess,
      warning_days: trialDaysRemaining <= 3 && isTrialing,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id
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