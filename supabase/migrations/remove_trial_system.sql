-- Remove trial system and simplify to free/paid model
-- Migration: remove_trial_system.sql

-- 1. First, update existing subscriptions to remove trial status
UPDATE subscriptions 
SET 
  status = CASE 
    WHEN status = 'trialing' AND stripe_subscription_id IS NOT NULL THEN 'active'
    WHEN status = 'trialing' AND stripe_subscription_id IS NULL THEN 'canceled'
    ELSE status 
  END,
  is_trial = false
WHERE is_trial = true;

-- 2. Remove trial-related columns from subscriptions table
ALTER TABLE subscriptions 
DROP COLUMN IF EXISTS trial_start,
DROP COLUMN IF EXISTS trial_end,
DROP COLUMN IF EXISTS is_trial;

-- 3. Update status column to remove 'trialing' option
-- Note: We keep the column as VARCHAR(50) but update the comment
COMMENT ON COLUMN subscriptions.status IS 'active, past_due, canceled, unpaid';

-- 4. Remove trial_days from subscription_plans
ALTER TABLE subscription_plans 
DROP COLUMN IF EXISTS trial_days;

-- 5. Update the check_subscription_access function to work without trials
CREATE OR REPLACE FUNCTION check_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  -- No subscription found - user has free access
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if paid subscription is active
  IF subscription_record.status = 'active' AND subscription_record.stripe_subscription_id IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- All other cases are free users
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a new function to check if user is free or paid
CREATE OR REPLACE FUNCTION get_user_access_level(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  -- No subscription record means free user
  IF NOT FOUND THEN
    RETURN 'free';
  END IF;
  
  -- Check if paid subscription is active
  IF subscription_record.status = 'active' AND subscription_record.stripe_subscription_id IS NOT NULL THEN
    RETURN 'paid';
  END IF;
  
  -- All other cases are free users
  RETURN 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Remove the start_trial_for_user function as it's no longer needed
DROP FUNCTION IF EXISTS start_trial_for_user(UUID);

-- 8. Create a simpler function to create free user record
CREATE OR REPLACE FUNCTION create_free_user_record(user_uuid UUID)
RETURNS subscriptions AS $$
DECLARE
  new_subscription subscriptions;
BEGIN
  -- Check if user already has a subscription record
  SELECT * INTO new_subscription
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  -- If found, return existing record
  IF FOUND THEN
    RETURN new_subscription;
  END IF;
  
  -- Create free user subscription record (no stripe data)
  INSERT INTO subscriptions (
    user_id,
    status
  ) VALUES (
    user_uuid,
    'active'  -- Free users are "active" but without stripe_subscription_id
  ) RETURNING * INTO new_subscription;
  
  -- Create initial usage record
  INSERT INTO subscription_usage (
    user_id,
    subscription_id,
    period_start,
    period_end
  ) VALUES (
    user_uuid,
    new_subscription.id,
    NOW(),
    NOW() + INTERVAL '1 month'
  );
  
  RETURN new_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update subscription plans to remove trial references
UPDATE subscription_plans 
SET 
  description = REPLACE(description, 'with monthly billing', '- Monthly billing'),
  description = REPLACE(description, 'with annual billing (2 months free)', '- Annual billing (save 17%)'),
  features = features::jsonb - 'trial_days'
WHERE name LIKE 'Premium%';

-- Update plan names to be clearer
UPDATE subscription_plans 
SET 
  name = 'Premium Plan',
  description = 'Full access to all features - Monthly billing'
WHERE name = 'Premium Monthly';

-- Remove the separate annual plan entry if it exists, we'll handle billing frequency in Stripe
DELETE FROM subscription_plans WHERE name = 'Premium Annual';

-- 10. Add indexes for the new access level function
CREATE INDEX IF NOT EXISTS idx_subscriptions_access_check 
ON subscriptions(user_id, status, stripe_subscription_id);