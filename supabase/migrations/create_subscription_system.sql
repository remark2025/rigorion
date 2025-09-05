-- Create subscription plans table
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

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100) UNIQUE,
  stripe_session_id VARCHAR(100),
  
  -- Subscription status
  status VARCHAR(50) DEFAULT 'trialing', -- trialing, active, past_due, canceled, unpaid
  
  -- Trial information
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_trial BOOLEAN DEFAULT true,
  
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

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Usage metrics
  questions_attempted INTEGER DEFAULT 0,
  ai_explanations_used INTEGER DEFAULT 0,
  practice_sessions INTEGER DEFAULT 0,
  
  -- Reset period
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, trial_days) VALUES 
(
  'Premium Monthly',
  'Full access to all features with monthly billing',
  49.99,
  499.99,
  '["Unlimited practice questions", "AI-powered explanations", "Detailed analytics", "Priority support", "Score improvement guarantee"]',
  7
),
(
  'Premium Annual', 
  'Full access to all features with annual billing (2 months free)',
  49.99,
  499.99,
  '["Unlimited practice questions", "AI-powered explanations", "Detailed analytics", "Priority support", "Score improvement guarantee", "2 months free"]',
  7
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for subscriptions (users can only see their own)
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for subscription_usage (users can only see their own)
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check if user has active subscription or trial
CREATE OR REPLACE FUNCTION check_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  -- No subscription found
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if trial is still active
  IF subscription_record.is_trial AND subscription_record.trial_end > NOW() THEN
    RETURN true;
  END IF;
  
  -- Check if paid subscription is active
  IF subscription_record.status IN ('active', 'trialing') AND NOT subscription_record.is_trial THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial for new user
CREATE OR REPLACE FUNCTION start_trial_for_user(user_uuid UUID)
RETURNS subscriptions AS $$
DECLARE
  new_subscription subscriptions;
  default_plan_id UUID;
BEGIN
  -- Get default plan
  SELECT id INTO default_plan_id
  FROM subscription_plans
  WHERE name = 'Premium Monthly'
  LIMIT 1;
  
  -- Create trial subscription
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    is_trial,
    trial_start,
    trial_end
  ) VALUES (
    user_uuid,
    default_plan_id,
    'trialing',
    true,
    NOW(),
    NOW() + INTERVAL '7 days'
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