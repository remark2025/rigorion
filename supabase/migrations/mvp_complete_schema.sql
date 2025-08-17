-- SAT Practice App - Complete MVP Database Schema
-- Combines all necessary tables and functions for production launch

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SUBSCRIPTION SYSTEM
-- ============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  features JSONB DEFAULT '[]',
  trial_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100) UNIQUE,
  
  -- Subscription details
  status VARCHAR(50) DEFAULT 'none', -- none, active, past_due, canceled, unpaid
  tier VARCHAR(50) DEFAULT 'free', -- free, premium, pro
  
  -- Billing periods
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id) -- One subscription per user
);

-- ============================================================================
-- QUESTION INTERACTIONS & BOOKMARKS
-- ============================================================================

-- Question interactions for tracking user progress
CREATE TABLE IF NOT EXISTS question_interactions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_public_id TEXT NOT NULL, -- e.g., "MATH-001" from content packs
  attempt_number SMALLINT NOT NULL DEFAULT 1,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  is_correct BOOLEAN,
  confidence_level SMALLINT CHECK (confidence_level BETWEEN 1 AND 5),
  hint_checked BOOLEAN NOT NULL DEFAULT false,
  solution_checked BOOLEAN NOT NULL DEFAULT false,
  objective_progress SMALLINT CHECK (objective_progress BETWEEN 0 AND 100),
  idempotency_key UUID NOT NULL, -- for exactly-once writes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_public_id, attempt_number)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_public_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_public_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Question interaction indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_qi_idem ON question_interactions (user_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_qi_user_created ON question_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qi_user_attempted ON question_interactions(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qi_question ON question_interactions(question_public_id);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_bm_user ON bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bm_question ON bookmarks(question_public_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read for active plans)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Subscriptions policies (users can only see their own)
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Question interactions policies
DROP POLICY IF EXISTS "qi read" ON question_interactions;
DROP POLICY IF EXISTS "qi insert" ON question_interactions;
DROP POLICY IF EXISTS "qi update" ON question_interactions;
CREATE POLICY "qi read" ON question_interactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "qi insert" ON question_interactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qi update" ON question_interactions 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
DROP POLICY IF EXISTS "bm read" ON bookmarks;
DROP POLICY IF EXISTS "bm insert" ON bookmarks;
DROP POLICY IF EXISTS "bm delete" ON bookmarks;
CREATE POLICY "bm read" ON bookmarks 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bm insert" ON bookmarks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm delete" ON bookmarks 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ESSENTIAL RPC FUNCTIONS
-- ============================================================================

-- Get subscription info function (returns TABLE for edge function compatibility)
DROP FUNCTION IF EXISTS get_subscription_info(uuid);
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

-- Check premium access function
DROP FUNCTION IF EXISTS has_premium_access(uuid);
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

-- Cancel subscription function
DROP FUNCTION IF EXISTS cancel_user_subscription(uuid);
CREATE FUNCTION cancel_user_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    cancel_at_period_end = true,
    canceled_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_uuid 
  AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reactivate subscription function
DROP FUNCTION IF EXISTS reactivate_user_subscription(uuid);
CREATE FUNCTION reactivate_user_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    cancel_at_period_end = false,
    canceled_at = NULL,
    updated_at = NOW()
  WHERE user_id = user_uuid 
  AND status = 'active'
  AND cancel_at_period_end = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subscription plans (only if they don't exist)
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, trial_days) 
SELECT 'Premium Monthly', 'Full access to all features with monthly billing', 49.99, 499.99, 
       '["Unlimited practice questions", "AI-powered explanations", "Detailed analytics", "Priority support", "Score improvement guarantee"]', 7
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium Monthly');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, trial_days) 
SELECT 'Premium Annual', 'Full access to all features with annual billing (2 months free)', 49.99, 499.99,
       '["Unlimited practice questions", "AI-powered explanations", "Detailed analytics", "Priority support", "Score improvement guarantee", "2 months free"]', 7
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium Annual');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON question_interactions TO authenticated;
GRANT SELECT, INSERT, DELETE ON bookmarks TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_subscription_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_premium_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_user_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_user_subscription(uuid) TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'User subscription data with Stripe integration';
COMMENT ON TABLE question_interactions IS 'Tracks all user interactions with practice questions';
COMMENT ON TABLE bookmarks IS 'User bookmarked questions for easy access';
COMMENT ON FUNCTION get_subscription_info(uuid) IS 'Returns comprehensive subscription status for edge functions';
COMMENT ON FUNCTION has_premium_access(uuid) IS 'Quick check if user has active premium subscription';