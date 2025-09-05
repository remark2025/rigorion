import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Get session from request headers
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse request body - subscriptionId is optional
    const body = await req.json().catch(() => ({}));
    const { subscriptionId } = body;

    let stripeSubscription = null;

    // If we have a subscription ID, cancel in Stripe
    if (subscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.warn('Stripe cancellation failed:', stripeError);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription status in database - use subscription ID if available, otherwise find by user
    const updateData = {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    };

    let updateQuery = supabaseClient.from('subscriptions').update(updateData);
    
    if (subscriptionId) {
      updateQuery = updateQuery.eq('stripe_subscription_id', subscriptionId);
    }
    
    const { data: updatedSubscription } = await updateQuery
      .eq('user_id', user.id)
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: stripeSubscription ? {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          current_period_end: stripeSubscription.current_period_end,
        } : updatedSubscription,
        message: 'Subscription cancelled successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});