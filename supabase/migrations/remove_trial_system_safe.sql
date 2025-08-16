-- Safe migration to remove trial system and simplify to free/paid model
-- This version checks for column existence first

-- 1. Check and update existing subscriptions (only if columns exist)
DO $$
BEGIN
    -- Check if is_trial column exists before updating
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' AND column_name = 'is_trial') THEN
        
        UPDATE subscriptions 
        SET 
          status = CASE 
            WHEN status = 'trialing' AND stripe_subscription_id IS NOT NULL THEN 'active'
            WHEN status = 'trialing' AND stripe_subscription_id IS NULL THEN 'canceled'
            ELSE status 
          END,
          is_trial = false
        WHERE is_trial = true;
    END IF;
END $$;

-- 2. Safe removal of trial-related columns (only if they exist)
DO $$
BEGIN
    -- Remove trial_start if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' AND column_name = 'trial_start') THEN
        ALTER TABLE subscriptions DROP COLUMN trial_start;
    END IF;
    
    -- Remove trial_end if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' AND column_name = 'trial_end') THEN
        ALTER TABLE subscriptions DROP COLUMN trial_end;
    END IF;
    
    -- Remove is_trial if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' AND column_name = 'is_trial') THEN
        ALTER TABLE subscriptions DROP COLUMN is_trial;
    END IF;
END $$;

-- 3. Update status column comment
COMMENT ON COLUMN subscriptions.status IS 'active, past_due, canceled, unpaid';

-- 4. Safe removal of trial_days from subscription_plans (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscription_plans' AND column_name = 'trial_days') THEN
        ALTER TABLE subscription_plans DROP COLUMN trial_days;
    END IF;
END $$;

-- 5. Update/create the check_subscription_access function
CREATE OR REPLACE FUNCTION check_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  -- No subscription found - user has free access (no premium access)
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

-- 6. Create function to check user access level
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

-- 7. Safe removal of start_trial_for_user function
DROP FUNCTION IF EXISTS start_trial_for_user(UUID);

-- 8. Create function to handle free user records
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
  
  -- Create initial usage record if subscription_usage table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_usage') THEN
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
  END IF;
  
  RETURN new_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update subscription plans (safe updates)
DO $$
BEGIN
    -- Update existing plans to remove trial references
    UPDATE subscription_plans 
    SET 
      description = REPLACE(description, 'with monthly billing', '- Monthly billing'),
      description = REPLACE(description, 'with annual billing (2 months free)', '- Annual billing (save 17%)')
    WHERE name LIKE 'Premium%';
    
    -- Remove trial_days from features if it exists in JSONB
    UPDATE subscription_plans 
    SET features = features::jsonb - 'trial_days'
    WHERE features::text LIKE '%trial_days%';
    
    -- Update plan names
    UPDATE subscription_plans 
    SET 
      name = 'Premium Plan',
      description = 'Full access to all features - Monthly billing'
    WHERE name = 'Premium Monthly';
    
    -- Remove annual plan if it exists
    DELETE FROM subscription_plans WHERE name = 'Premium Annual';
END $$;

-- 10. Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_access_check 
ON subscriptions(user_id, status, stripe_subscription_id);

-- 11. Create a view for easier access level checking
CREATE OR REPLACE VIEW user_access_levels AS
SELECT 
  user_id,
  CASE 
    WHEN status = 'active' AND stripe_subscription_id IS NOT NULL THEN 'paid'
    ELSE 'free'
  END as access_level,
  status,
  stripe_subscription_id,
  created_at
FROM subscriptions;