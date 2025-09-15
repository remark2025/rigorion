-- Add practice context columns to question_interactions table
-- These columns support enhanced interaction logging and analytics

ALTER TABLE public.question_interactions 
ADD COLUMN IF NOT EXISTS practice_session_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS question_index_in_session INTEGER,
ADD COLUMN IF NOT EXISTS total_questions_in_session INTEGER,
ADD COLUMN IF NOT EXISTS selected_answer TEXT,
ADD COLUMN IF NOT EXISTS correct_answer TEXT,
ADD COLUMN IF NOT EXISTS practice_mode VARCHAR(20) CHECK (practice_mode IN ('timed', 'untimed', 'mock_test', 'chapter_review'));

-- Add comments for documentation
COMMENT ON COLUMN public.question_interactions.practice_session_id IS 'Unique identifier for the practice session';
COMMENT ON COLUMN public.question_interactions.question_index_in_session IS 'Index of this question within the practice session (0-based)';
COMMENT ON COLUMN public.question_interactions.total_questions_in_session IS 'Total number of questions in the practice session';
COMMENT ON COLUMN public.question_interactions.selected_answer IS 'Answer selected by the user (e.g., A, B, C, D or text)';
COMMENT ON COLUMN public.question_interactions.correct_answer IS 'The correct answer for this question';
COMMENT ON COLUMN public.question_interactions.practice_mode IS 'Type of practice session: timed, untimed, mock_test, chapter_review';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_qi_practice_session ON public.question_interactions(practice_session_id) WHERE practice_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_practice_mode ON public.question_interactions(practice_mode) WHERE practice_mode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_session_context ON public.question_interactions(practice_session_id, question_index_in_session) WHERE practice_session_id IS NOT NULL;

-- Update the analytics views to include practice context
CREATE OR REPLACE VIEW public.practice_session_analytics AS
SELECT 
  practice_session_id,
  user_id,
  practice_mode,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE is_correct = true) as correct_answers,
  ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) as accuracy_percentage,
  SUM(duration_seconds) as total_time_seconds,
  AVG(duration_seconds) as avg_time_per_question,
  MIN(attempted_at) as session_start,
  MAX(attempted_at) as session_end,
  MAX(total_questions_in_session) as expected_questions
FROM public.question_interactions
WHERE practice_session_id IS NOT NULL
GROUP BY practice_session_id, user_id, practice_mode;

COMMENT ON VIEW public.practice_session_analytics IS 'Analytics for complete practice sessions';

-- Grant permissions
GRANT SELECT ON public.practice_session_analytics TO authenticated;