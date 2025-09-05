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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook Error", { status: 400 });
    }

    console.log(`Processing Stripe event: ${event.type} (${event.id})`);

    // Log the billing event first
    await supabaseClient.rpc('log_billing_event', {
      p_user_id: null, // Will be updated after we find the user
      p_source: 'stripe_webhook',
      p_event_type: event.type,
      p_stripe_event_id: event.id,
      p_payload: event.data
    });

    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID in subscriptions
        const { data: existingSubscription } = await supabaseClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (!existingSubscription) {
          console.error('Customer not found for subscription:', subscription.id);
          break;
        }

        // Update subscription record
        await supabaseClient
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer);

        // Update billing event with user_id
        await supabaseClient.rpc('update_billing_event_user', {
          p_stripe_event_id: event.id,
          p_user_id: existingSubscription.user_id
        });

        console.log(`Created subscription for user ${existingSubscription.user_id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription record
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log(`Updated subscription ${subscription.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Mark subscription as canceled
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
        } else {
          console.log(`Canceled subscription ${subscription.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Find user by subscription
          const { data: subscription } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            // Record usage for successful payment
            await supabaseClient
              .from('subscription_usage')
              .insert({
                user_id: subscription.user_id,
                usage_type: 'payment_received',
                amount: 1,
                metadata: {
                  invoice_id: invoice.id,
                  amount_paid: invoice.amount_paid / 100, // Convert from cents
                  currency: invoice.currency
                }
              });

            // Update billing event with user_id
            await supabaseClient.rpc('update_billing_event_user', {
              p_stripe_event_id: event.id,
              p_user_id: subscription.user_id
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Find user by subscription
          const { data: subscription } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            // Update billing event with user_id
            await supabaseClient.rpc('update_billing_event_user', {
              p_stripe_event_id: event.id,
              p_user_id: subscription.user_id
            });
          }
        }
        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        
        // Customer creation is typically handled during signup
        // This webhook serves as a backup/verification
        console.log(`Customer created: ${customer.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});