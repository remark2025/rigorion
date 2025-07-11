
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const nowpaymentsApiKey = Deno.env.get("NOWPAYMENTS_API_KEY");
    
    if (!nowpaymentsApiKey) {
      throw new Error("NOWPayments API key is not configured");
    }

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

    // Parse request body
    const { priceAmount, currency, cryptoCurrency, successUrl, cancelUrl } = await req.json();

    // Call NOWPayments API to create an invoice
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": nowpaymentsApiKey,
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: currency || "EUR",
        pay_currency: cryptoCurrency || "BTC",
        order_id: `order-${Date.now()}`,
        order_description: "Monthly subscription",
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${paymentData.message || "Unknown error"}`);
    }

    // Save payment info
    await supabaseClient
      .from('crypto_payments')
      .insert({
        user_id: user.id,
        invoice_id: paymentData.id,
        payment_status: "pending",
        price_amount: priceAmount,
        price_currency: currency || "EUR",
        crypto_currency: cryptoCurrency || "BTC",
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ url: paymentData.invoice_url }),
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
