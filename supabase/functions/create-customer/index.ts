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

    // Get user profile ID (since your tables reference profiles, not auth.users)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabaseClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', profile.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      return new Response(JSON.stringify({
        customer_id: existingCustomer.stripe_customer_id,
        message: "Customer already exists"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id,
        profile_id: profile.id
      }
    });

    // Create customer record in your customers table
    const { error: customerError } = await supabaseClient
      .from('customers')
      .insert({
        user_id: profile.id,
        stripe_customer_id: stripeCustomer.id
      });

    if (customerError) {
      console.error("Error creating customer record:", customerError);
      return new Response(
        JSON.stringify({ error: "Failed to create customer record" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(JSON.stringify({
      customer_id: stripeCustomer.id,
      message: "Customer created successfully - subscription will be created when payment succeeds"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Customer creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});