#!/bin/bash

# Deploy all edge functions for the subscription system
echo "Deploying edge functions..."

~/bin/supabase functions deploy get-subscription-status
~/bin/supabase functions deploy manage-billing  
~/bin/supabase functions deploy stripe-webhook
~/bin/supabase functions deploy customer-portal
~/bin/supabase functions deploy track-usage

echo "All functions deployed successfully!"
echo ""
echo "Don't forget to:"
echo "1. Set environment variables in Supabase dashboard"
echo "2. Configure Stripe webhook endpoint"
echo "3. Test the subscription flow"
