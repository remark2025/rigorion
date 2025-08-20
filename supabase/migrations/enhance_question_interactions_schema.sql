-- Enhanced Question Interactions Schema for Proper Skill Analytics
-- Adds module, chapter, exam, and level fields for structured skill tracking

-- Add new columns to question_interactions table
ALTER TABLE public.question_interactions 
ADD COLUMN IF NOT EXISTS module VARCHAR(20) CHECK (module IN ('math', 'reading', 'writing')),
ADD COLUMN IF NOT EXISTS chapter SMALLINT CHECK (chapter BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS exam SMALLINT CHECK (exam BETWEEN 1 AND 24),
ADD COLUMN IF NOT EXISTS level VARCHAR(20) CHECK (level IN ('easy', 'medium', 'difficult')),
ADD COLUMN IF NOT EXISTS topic VARCHAR(100), -- Specific topic within chapter/exam
ADD COLUMN IF NOT EXISTS question_type VARCHAR(50); -- multiple_choice, grid_in, etc.

-- Add comments for documentation
COMMENT ON COLUMN public.question_interactions.module IS 'Subject module: math, reading, or writing';
COMMENT ON COLUMN public.question_interactions.chapter IS 'Chapter number (1-10) for structured practice, null for exam questions';
COMMENT ON COLUMN public.question_interactions.exam IS 'Exam number (1-24) when chapter is null, for exam-based practice';
COMMENT ON COLUMN public.question_interactions.level IS 'Difficulty level: easy, medium, or difficult';
COMMENT ON COLUMN public.question_interactions.topic IS 'Specific topic/skill within the chapter or exam';
COMMENT ON COLUMN public.question_interactions.question_type IS 'Type of question: multiple_choice, grid_in, essay, etc.';

-- Create indexes for efficient filtering and skill analytics
CREATE INDEX IF NOT EXISTS idx_qi_module ON public.question_interactions(module);
CREATE INDEX IF NOT EXISTS idx_qi_chapter ON public.question_interactions(chapter) WHERE chapter IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_exam ON public.question_interactions(exam) WHERE exam IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_level ON public.question_interactions(level);
CREATE INDEX IF NOT EXISTS idx_qi_topic ON public.question_interactions(topic);
CREATE INDEX IF NOT EXISTS idx_qi_module_chapter ON public.question_interactions(module, chapter) WHERE chapter IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_module_exam ON public.question_interactions(module, exam) WHERE exam IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qi_module_level ON public.question_interactions(module, level);

-- Update analytics tables to include skill breakdown
ALTER TABLE public.user_analytics 
ADD COLUMN IF NOT EXISTS math_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS writing_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS easy_questions_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS medium_questions_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficult_questions_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS easy_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS medium_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficult_accuracy DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS strongest_module VARCHAR(20),
ADD COLUMN IF NOT EXISTS weakest_module VARCHAR(20);

-- Create skill analytics view for easy querying
CREATE OR REPLACE VIEW public.skill_analytics AS
SELECT 
  user_id,
  module,
  chapter,
  exam,
  level,
  topic,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
  ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) as success_rate,
  AVG(duration_seconds) as avg_time_seconds,
  AVG(confidence_level) as avg_confidence,
  COUNT(*) FILTER (WHERE hint_checked = true) as hints_used,
  COUNT(*) FILTER (WHERE solution_checked = true) as solutions_checked,
  MIN(attempted_at) as first_attempted,
  MAX(attempted_at) as last_attempted,
  COUNT(DISTINCT question_public_id) as unique_questions
FROM public.question_interactions
WHERE module IS NOT NULL
GROUP BY user_id, module, chapter, exam, level, topic;

COMMENT ON VIEW public.skill_analytics IS 'Aggregated skill performance by user, module, chapter/exam, level, and topic';

-- Create module summary view
CREATE OR REPLACE VIEW public.module_summary AS
SELECT 
  user_id,
  module,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE is_correct = true) as correct_attempts,
  ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) as success_rate,
  AVG(duration_seconds) as avg_time_seconds,
  COUNT(DISTINCT COALESCE(chapter, exam)) as sections_practiced,
  COUNT(DISTINCT topic) as topics_practiced,
  COUNT(DISTINCT question_public_id) as unique_questions
FROM public.question_interactions
WHERE module IS NOT NULL
GROUP BY user_id, module;

COMMENT ON VIEW public.module_summary IS 'High-level module performance summary by user';

-- Create level progression view
CREATE OR REPLACE VIEW public.level_progression AS
SELECT 
  user_id,
  module,
  level,
  COUNT(*) as attempts,
  COUNT(*) FILTER (WHERE is_correct = true) as correct,
  ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) as success_rate,
  AVG(duration_seconds) as avg_time,
  CASE 
    WHEN ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) >= 80 THEN 'mastered'
    WHEN ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) >= 60 THEN 'proficient'
    WHEN ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) >= 40 THEN 'developing'
    ELSE 'needs_work'
  END as mastery_level
FROM public.question_interactions
WHERE module IS NOT NULL AND level IS NOT NULL
GROUP BY user_id, module, level;

COMMENT ON VIEW public.level_progression IS 'User progression through difficulty levels by module';

-- Function to get user skill breakdown
CREATE OR REPLACE FUNCTION get_user_skill_breakdown(target_user_id UUID)
RETURNS TABLE (
  module VARCHAR(20),
  chapter SMALLINT,
  exam SMALLINT,
  level VARCHAR(20),
  topic VARCHAR(100),
  total_attempts INTEGER,
  correct_attempts INTEGER,
  success_rate DECIMAL,
  avg_time_seconds DECIMAL,
  mastery_level TEXT,
  last_practiced TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.module,
    sa.chapter,
    sa.exam,
    sa.level,
    sa.topic,
    sa.total_attempts::INTEGER,
    sa.correct_attempts::INTEGER,
    sa.success_rate,
    ROUND(sa.avg_time_seconds::DECIMAL, 2) as avg_time_seconds,
    CASE 
      WHEN sa.success_rate >= 85 THEN 'Advanced'
      WHEN sa.success_rate >= 70 THEN 'Proficient'
      WHEN sa.success_rate >= 50 THEN 'Developing'
      ELSE 'Beginner'
    END as mastery_level,
    sa.last_attempted
  FROM public.skill_analytics sa
  WHERE sa.user_id = target_user_id
  ORDER BY sa.module, sa.chapter NULLS LAST, sa.exam NULLS FIRST, sa.level, sa.success_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended practice areas
CREATE OR REPLACE FUNCTION get_recommended_practice(target_user_id UUID)
RETURNS TABLE (
  module VARCHAR(20),
  area TEXT,
  reason TEXT,
  success_rate DECIMAL,
  attempts INTEGER,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Areas that need improvement (low success rate, sufficient attempts)
  SELECT 
    sa.module,
    COALESCE(
      CASE WHEN sa.chapter IS NOT NULL THEN 'Chapter ' || sa.chapter::TEXT END,
      CASE WHEN sa.exam IS NOT NULL THEN 'Exam ' || sa.exam::TEXT END,
      sa.topic
    ) as area,
    CASE 
      WHEN sa.success_rate < 50 THEN 'Needs significant improvement'
      WHEN sa.success_rate < 70 THEN 'Room for improvement'
      ELSE 'Maintain proficiency'
    END as reason,
    sa.success_rate,
    sa.total_attempts::INTEGER,
    CASE 
      WHEN sa.success_rate < 50 AND sa.total_attempts >= 5 THEN 1
      WHEN sa.success_rate < 70 AND sa.total_attempts >= 3 THEN 2
      WHEN sa.total_attempts < 3 THEN 3
      ELSE 4
    END as priority
  FROM public.skill_analytics sa
  WHERE sa.user_id = target_user_id
  ORDER BY priority, sa.success_rate, sa.total_attempts DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.skill_analytics TO authenticated;
GRANT SELECT ON public.module_summary TO authenticated;
GRANT SELECT ON public.level_progression TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_skill_breakdown(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_practice(UUID) TO authenticated;

-- Update existing analytics functions to use new fields
CREATE OR REPLACE FUNCTION refresh_user_analytics_enhanced(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  stats RECORD;
  math_stats RECORD;
  reading_stats RECORD;
  writing_stats RECORD;
  level_stats RECORD;
  strongest_module VARCHAR(20);
  weakest_module VARCHAR(20);
BEGIN
  -- Get overall stats
  SELECT 
    COUNT(*)                                   AS total_attempts,
    COUNT(*) FILTER (WHERE is_correct = true)  AS total_correct,
    COALESCE(SUM(duration_seconds), 0)         AS total_time,
    AVG(confidence_level)                      AS avg_confidence,
    COUNT(DISTINCT DATE(attempted_at))         AS session_count,
    AVG(CASE WHEN hint_checked THEN 1 ELSE 0 END) AS hints_ratio,
    AVG(CASE WHEN solution_checked THEN 1 ELSE 0 END) AS solutions_ratio,
    MAX(attempted_at)                          AS last_activity
  INTO stats
  FROM public.question_interactions 
  WHERE user_id = target_user_id;

  -- Get module-specific stats
  SELECT 
    COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 0) AS accuracy
  INTO math_stats
  FROM public.question_interactions
  WHERE user_id = target_user_id AND module = 'math';

  SELECT 
    COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 0) AS accuracy
  INTO reading_stats
  FROM public.question_interactions
  WHERE user_id = target_user_id AND module = 'reading';

  SELECT 
    COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 0) AS accuracy
  INTO writing_stats
  FROM public.question_interactions
  WHERE user_id = target_user_id AND module = 'writing';

  -- Get level-specific stats
  SELECT 
    COUNT(*) FILTER (WHERE level = 'easy') AS easy_attempts,
    COUNT(*) FILTER (WHERE level = 'medium') AS medium_attempts,
    COUNT(*) FILTER (WHERE level = 'difficult') AS difficult_attempts,
    COALESCE(AVG(CASE WHEN level = 'easy' AND is_correct THEN 100.0 ELSE 0.0 END), 0) AS easy_acc,
    COALESCE(AVG(CASE WHEN level = 'medium' AND is_correct THEN 100.0 ELSE 0.0 END), 0) AS medium_acc,
    COALESCE(AVG(CASE WHEN level = 'difficult' AND is_correct THEN 100.0 ELSE 0.0 END), 0) AS difficult_acc
  INTO level_stats
  FROM public.question_interactions
  WHERE user_id = target_user_id AND level IS NOT NULL;

  -- Determine strongest and weakest modules
  SELECT module INTO strongest_module
  FROM public.module_summary
  WHERE user_id = target_user_id
  ORDER BY success_rate DESC, total_attempts DESC
  LIMIT 1;

  SELECT module INTO weakest_module
  FROM public.module_summary
  WHERE user_id = target_user_id AND total_attempts >= 3
  ORDER BY success_rate ASC, total_attempts DESC
  LIMIT 1;

  -- Update user_analytics with enhanced data
  INSERT INTO public.user_analytics (
    user_id, total_questions_attempted, total_questions_correct,
    total_time_spent_seconds, total_sessions, average_confidence,
    hints_used_count, solutions_checked_count, last_activity_at,
    math_accuracy, reading_accuracy, writing_accuracy,
    easy_questions_attempted, medium_questions_attempted, difficult_questions_attempted,
    easy_accuracy, medium_accuracy, difficult_accuracy,
    strongest_module, weakest_module, updated_at
  ) VALUES (
    target_user_id,
    COALESCE(stats.total_attempts, 0),
    COALESCE(stats.total_correct, 0),
    COALESCE(stats.total_time, 0),
    COALESCE(stats.session_count, 0),
    COALESCE(stats.avg_confidence, 0),
    COALESCE(stats.hints_ratio, 0) * COALESCE(stats.total_attempts, 0),
    COALESCE(stats.solutions_ratio, 0) * COALESCE(stats.total_attempts, 0),
    stats.last_activity,
    math_stats.accuracy,
    reading_stats.accuracy,
    writing_stats.accuracy,
    level_stats.easy_attempts,
    level_stats.medium_attempts,
    level_stats.difficult_attempts,
    level_stats.easy_acc,
    level_stats.medium_acc,
    level_stats.difficult_acc,
    strongest_module,
    weakest_module,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_questions_attempted = EXCLUDED.total_questions_attempted,
    total_questions_correct = EXCLUDED.total_questions_correct,
    total_time_spent_seconds = EXCLUDED.total_time_spent_seconds,
    total_sessions = EXCLUDED.total_sessions,
    average_confidence = EXCLUDED.average_confidence,
    hints_used_count = EXCLUDED.hints_used_count,
    solutions_checked_count = EXCLUDED.solutions_checked_count,
    last_activity_at = EXCLUDED.last_activity_at,
    math_accuracy = EXCLUDED.math_accuracy,
    reading_accuracy = EXCLUDED.reading_accuracy,
    writing_accuracy = EXCLUDED.writing_accuracy,
    easy_questions_attempted = EXCLUDED.easy_questions_attempted,
    medium_questions_attempted = EXCLUDED.medium_questions_attempted,
    difficult_questions_attempted = EXCLUDED.difficult_questions_attempted,
    easy_accuracy = EXCLUDED.easy_accuracy,
    medium_accuracy = EXCLUDED.medium_accuracy,
    difficult_accuracy = EXCLUDED.difficult_accuracy,
    strongest_module = EXCLUDED.strongest_module,
    weakest_module = EXCLUDED.weakest_module,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to use enhanced analytics function
CREATE OR REPLACE FUNCTION trigger_enhanced_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update analytics if we have proper skill data
  IF NEW.module IS NOT NULL THEN
    PERFORM refresh_user_analytics_enhanced(NEW.user_id);
  ELSE
    -- Fall back to basic analytics
    PERFORM refresh_user_analytics(NEW.user_id);
  END IF;
  
  PERFORM refresh_question_analytics(NEW.question_public_id);
  PERFORM pg_notify('refresh_analytics_views', '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger to use enhanced function
DROP TRIGGER IF EXISTS tr_update_analytics ON public.question_interactions;
CREATE TRIGGER tr_update_analytics
  AFTER INSERT OR UPDATE ON public.question_interactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_enhanced_analytics();

-- Grant permissions on enhanced function
GRANT EXECUTE ON FUNCTION refresh_user_analytics_enhanced(UUID) TO authenticated;