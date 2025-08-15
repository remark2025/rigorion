#!/bin/bash

# Deploy all edge functions for the subscription system
echo "Deploying edge functions..."

supabase functions deploy get-subscription-status
supabase functions deploy manage-billing  
supabase functions deploy stripe-webhook
supabase functions deploy customer-portal
supabase functions deploy track-usage

echo "All functions deployed successfully!"
echo ""
echo "Don't forget to:"
echo "1. Set environment variables in Supabase dashboard"
echo "2. Configure Stripe webhook endpoint"
echo "3. Test the subscription flow"
