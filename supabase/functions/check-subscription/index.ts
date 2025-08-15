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

    // Check if user has subscription
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          description,
          features,
          trial_days
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("Error fetching subscription:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // No subscription found - start trial
    if (!subscription) {
      console.log("No subscription found, starting trial for user:", user.id);
      
      const { data: newSubscription, error: trialError } = await supabaseClient
        .rpc('start_trial_for_user', { user_uuid: user.id });

      if (trialError) {
        console.error("Error starting trial:", trialError);
        return new Response(
          JSON.stringify({ error: "Failed to start trial" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(JSON.stringify({
        hasAccess: true,
        isTrialing: true,
        trialEndsAt: newSubscription.trial_end,
        subscription: newSubscription
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check subscription access
    const now = new Date();
    const trialEnd = new Date(subscription.trial_end);
    const isTrialActive = subscription.is_trial && now < trialEnd;
    const isPaidActive = subscription.status === 'active' && !subscription.is_trial;
    const hasAccess = isTrialActive || isPaidActive;

    // Calculate days remaining for trial
    let daysRemaining = 0;
    if (subscription.is_trial) {
      const timeDiff = trialEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    }

    return new Response(JSON.stringify({
      hasAccess,
      isTrialing: subscription.is_trial,
      isPaid: !subscription.is_trial && subscription.status === 'active',
      trialEndsAt: subscription.trial_end,
      trialDaysRemaining: daysRemaining,
      status: subscription.status,
      subscription: subscription
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Subscription check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});