import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const { action, productId } = await req.json();

    if (action === "list_prices") {
      // List existing prices for the product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });

      return new Response(JSON.stringify({
        success: true,
        prices: prices.data.map(price => ({
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          interval_count: price.recurring?.interval_count,
        }))
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "create_prices") {
      const { monthlyAmount, yearlyAmount, currency = "usd" } = await req.json();
      
      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: monthlyAmount * 100, // Convert dollars to cents
        currency: currency,
        recurring: {
          interval: 'month',
        },
        nickname: 'Monthly Subscription',
      });

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: yearlyAmount * 100, // Convert dollars to cents
        currency: currency,
        recurring: {
          interval: 'year',
        },
        nickname: 'Annual Subscription',
      });

      return new Response(JSON.stringify({
        success: true,
        monthly_price: {
          id: monthlyPrice.id,
          amount: monthlyPrice.unit_amount,
        },
        yearly_price: {
          id: yearlyPrice.id,
          amount: yearlyPrice.unit_amount,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});