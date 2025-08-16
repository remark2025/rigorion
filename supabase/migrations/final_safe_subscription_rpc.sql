-- Final safe migration - drops existing functions and creates new ones
-- Safe since no active users in development

-- Drop existing subscription functions
DROP FUNCTION IF EXISTS get_subscription_info(uuid);
DROP FUNCTION IF EXISTS has_premium_access(uuid);

-- Create improved get_subscription_info function that returns TABLE instead of JSON
-- This matches what the edge function expects
CREATE FUNCTION get_subscription_info(user_uuid UUID)
RETURNS TABLE (
  subscription_status TEXT,
  has_premium_access BOOLEAN,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  tier TEXT,
  cancel_at_period_end BOOLEAN
) AS $$
DECLARE
  sub_record subscriptions%ROWTYPE;
BEGIN
  -- Get subscription record for user
  SELECT * INTO sub_record
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  LIMIT 1;
  
  -- If no subscription found, return free user defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'none'::TEXT as subscription_status,
      FALSE as has_premium_access,
      NULL::TEXT as stripe_customer_id,
      NULL::TEXT as stripe_subscription_id,
      NULL::TIMESTAMP WITH TIME ZONE as current_period_end,
      'free'::TEXT as tier,
      FALSE as cancel_at_period_end;
    RETURN;
  END IF;
  
  -- Return subscription info
  RETURN QUERY SELECT 
    sub_record.status::TEXT as subscription_status,
    (sub_record.tier != 'free' AND sub_record.status = 'active')::BOOLEAN as has_premium_access,
    sub_record.stripe_customer_id,
    CASE 
      WHEN sub_record.stripe_subscription_id = '' THEN NULL 
      ELSE sub_record.stripe_subscription_id 
    END as stripe_subscription_id,
    sub_record.current_period_end,
    sub_record.tier::TEXT,
    COALESCE(sub_record.cancel_at_period_end, FALSE) as cancel_at_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate has_premium_access function
CREATE FUNCTION has_premium_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_record subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO sub_record
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  AND s.status = 'active'
  LIMIT 1;
  
  -- Return true if user has active premium/pro subscription
  RETURN FOUND AND sub_record.tier != 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;