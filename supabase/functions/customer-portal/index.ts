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

    const { return_url } = await req.json();

    // Get customer ID from database - try customers table first, then subscriptions
    let stripeCustomerId = null;
    
    // Try customers table first
    const { data: customer } = await supabaseClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
    
    if (customer?.stripe_customer_id) {
      stripeCustomerId = customer.stripe_customer_id;
    } else {
      // Fallback to subscriptions table
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();
      
      if (subscription?.stripe_customer_id) {
        stripeCustomerId = subscription.stripe_customer_id;
      }
    }

    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer ID found for this user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: return_url || `${req.headers.get('origin') || 'http://localhost:8081'}/account`,
    });

    // Optional: Log the portal access (skip if RPC doesn't exist)
    try {
      await supabaseClient.rpc('log_billing_event', {
        p_user_id: user.id,
        p_source: 'customer_portal',
        p_event_type: 'portal_session_created',
        p_stripe_event_id: null,
        p_payload: { 
          portal_session_id: portalSession.id,
          return_url: return_url
        }
      });
    } catch (logError) {
      console.warn('Could not log billing event:', logError);
      // Continue without logging
    }

    return new Response(JSON.stringify({
      url: portalSession.url,
      session_id: portalSession.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Customer portal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});