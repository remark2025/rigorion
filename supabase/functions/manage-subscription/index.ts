import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

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

    const { action } = await req.json();

    switch (action) {
      case 'cancel': {
        // Cancel subscription
        const { data: subscription } = await supabaseClient
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .single();

        if (!subscription?.stripe_subscription_id) {
          return new Response(
            JSON.stringify({ error: "No active or trial subscription found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }

        // Cancel in Stripe
        const stripeSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          { cancel_at_period_end: true }
        );

        // Update in database
        await supabaseClient
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        return new Response(JSON.stringify({
          success: true,
          message: "Subscription will be canceled at the end of the current billing period",
          cancelAt: stripeSubscription.current_period_end
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'reactivate': {
        // Reactivate canceled subscription
        const { data: subscription } = await supabaseClient
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .single();

        if (!subscription?.stripe_subscription_id) {
          return new Response(
            JSON.stringify({ error: "No subscription found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }

        // Reactivate in Stripe
        await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          { cancel_at_period_end: false }
        );

        // Update in database
        await supabaseClient
          .from('subscriptions')
          .update({
            cancel_at_period_end: false,
            canceled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        return new Response(JSON.stringify({
          success: true,
          message: "Subscription reactivated successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'billing_portal': {
        // Create Stripe billing portal session
        const { data: subscription } = await supabaseClient
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();

        if (!subscription?.stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: "No customer found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: `${req.headers.get('origin') || 'http://localhost:8081'}/account`,
        });

        return new Response(JSON.stringify({
          url: portalSession.url
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }

  } catch (error) {
    console.error("Subscription management error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});