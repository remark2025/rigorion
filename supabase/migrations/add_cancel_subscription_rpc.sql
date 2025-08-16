-- Create RPC function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_user_subscription(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update subscription status for the user
  UPDATE subscriptions 
  SET 
    status = 'canceled',
    canceled_at = NOW(),
    cancel_at_period_end = TRUE,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Get the updated subscription data
  SELECT row_to_json(s) INTO result
  FROM (
    SELECT 
      id,
      user_id,
      status,
      tier,
      canceled_at,
      cancel_at_period_end
    FROM subscriptions 
    WHERE user_id = user_uuid
    LIMIT 1
  ) s;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to reactivate subscription
CREATE OR REPLACE FUNCTION reactivate_user_subscription(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update subscription status for the user
  UPDATE subscriptions 
  SET 
    status = 'active',
    canceled_at = NULL,
    cancel_at_period_end = FALSE,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Get the updated subscription data
  SELECT row_to_json(s) INTO result
  FROM (
    SELECT 
      id,
      user_id,
      status,
      tier,
      canceled_at,
      cancel_at_period_end
    FROM subscriptions 
    WHERE user_id = user_uuid
    LIMIT 1
  ) s;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;