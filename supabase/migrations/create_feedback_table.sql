-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_type VARCHAR(50) DEFAULT 'general', -- general, bug, suggestion, question
  user_email TEXT,
  user_name TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET, -- For rate limiting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_question_id ON feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies - anyone can insert feedback, only admins can read
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Optionally allow users to see their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT INSERT ON feedback TO authenticated;
GRANT INSERT ON feedback TO anon; -- Allow anonymous feedback
GRANT SELECT ON feedback TO authenticated;

-- Function to check daily feedback limit (5 per day per user/IP)
CREATE OR REPLACE FUNCTION check_feedback_rate_limit(
  user_uuid UUID DEFAULT NULL,
  user_ip INET DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  feedback_count INTEGER;
BEGIN
  -- Count feedback from today for this user or IP
  SELECT COUNT(*) INTO feedback_count
  FROM feedback
  WHERE 
    (user_id = user_uuid OR (user_uuid IS NULL AND ip_address = user_ip))
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  -- Return true if under limit (5 per day)
  RETURN feedback_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE feedback IS 'User feedback, suggestions, and bug reports with rate limiting';