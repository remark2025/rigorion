import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, {
    headers: corsHeaders
  });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"), 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );
    
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) return new Response(JSON.stringify({
      error: "Not authenticated"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 401
    });

    // Use the RPC function to get subscription info
    const { data: info, error: rpcError } = await supabase.rpc("get_subscription_info", {
      user_uuid: user.id
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return new Response(JSON.stringify({
        error: "Failed to get subscription info"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }

    // The RPC returns an array with one row, so get the first item
    const subscriptionInfo = Array.isArray(info) ? info[0] : info;
    
    if (!subscriptionInfo) {
      // No subscription found - return free user defaults
      return new Response(JSON.stringify({
        status: "free",
        has_premium_access: false,
        access_level: "free",
        needs_upgrade: true,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        tier: "free"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }

    const hasAccess = !!subscriptionInfo.has_premium_access;
    const accessLevel = subscriptionInfo.tier || 'free';

    return new Response(JSON.stringify({
      status: subscriptionInfo.subscription_status || "free",
      has_premium_access: hasAccess,
      access_level: accessLevel,
      needs_upgrade: !hasAccess,
      stripe_customer_id: subscriptionInfo.stripe_customer_id,
      stripe_subscription_id: subscriptionInfo.stripe_subscription_id,
      current_period_end: subscriptionInfo.current_period_end,
      tier: subscriptionInfo.tier || 'free',
      cancel_at_period_end: subscriptionInfo.cancel_at_period_end || false
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

  } catch (e) {
    console.error("Subscription status error:", e);
    return new Response(JSON.stringify({
      error: e.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});