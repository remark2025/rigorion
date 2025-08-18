-- Analytics Schema for SAT Practice App
-- This creates tables and views for analyzing user performance and question effectiveness

-- User Analytics Table - Aggregated user performance metrics
CREATE TABLE IF NOT EXISTS public.user_analytics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questions_attempted INTEGER DEFAULT 0,
  total_questions_correct INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_confidence DECIMAL(3,2), -- 1.00 to 5.00
  hints_used_count INTEGER DEFAULT 0,
  solutions_checked_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  performance_trend VARCHAR(20) DEFAULT 'stable', -- improving, declining, stable
  skill_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Analytics Table - Performance metrics per question
CREATE TABLE IF NOT EXISTS public.question_analytics (
  question_public_id TEXT PRIMARY KEY,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  average_time_seconds DECIMAL(8,2),
  difficulty_score DECIMAL(3,2), -- 1.00 to 5.00 based on success rate
  hints_requested_count INTEGER DEFAULT 0,
  solutions_checked_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  average_confidence DECIMAL(3,2),
  abandonment_rate DECIMAL(5,4), -- percentage who start but don't finish
  first_attempt_success_rate DECIMAL(5,4),
  improvement_rate DECIMAL(5,4), -- success rate improvement from first to later attempts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Analytics Rollup - Time-series data for trends
CREATE TABLE IF NOT EXISTS public.daily_analytics (
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- user_performance, question_stats, system_usage
  metric_key TEXT NOT NULL, -- specific metric name
  metric_value DECIMAL(12,4),
  metadata JSONB, -- additional context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (date, metric_type, metric_key)
);

-- Learning Session Analytics - Track study sessions
CREATE TABLE IF NOT EXISTS public.session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  topics_covered TEXT[], -- array of topic names
  difficulty_levels TEXT[], -- array of difficulty levels attempted
  session_type VARCHAR(20) DEFAULT 'practice', -- practice, review, test
  completion_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_last_activity ON public.user_analytics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_performance ON public.user_analytics(skill_level, performance_trend);
CREATE INDEX IF NOT EXISTS idx_question_analytics_difficulty ON public.question_analytics(difficulty_score DESC);
CREATE INDEX IF NOT EXISTS idx_question_analytics_attempts ON public.question_analytics(total_attempts DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date_type ON public.daily_analytics(date DESC, metric_type);
CREATE INDEX IF NOT EXISTS idx_session_analytics_user_date ON public.session_analytics(user_id, session_start DESC);

-- Materialized Views for Fast Analytics Queries

-- User Performance Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_user_performance_summary AS
SELECT 
  ua.user_id,
  ua.total_questions_attempted,
  ua.total_questions_correct,
  CASE 
    WHEN ua.total_questions_attempted > 0 
    THEN ROUND((ua.total_questions_correct::DECIMAL / ua.total_questions_attempted) * 100, 2)
    ELSE 0 
  END as accuracy_percentage,
  ua.average_confidence,
  ua.streak_current,
  ua.streak_longest,
  ua.skill_level,
  ua.performance_trend,
  ua.last_activity_at,
  -- Recent performance (last 7 days)
  COUNT(qi.user_id) FILTER (WHERE qi.attempted_at >= NOW() - INTERVAL '7 days') as recent_attempts,
  COUNT(qi.user_id) FILTER (WHERE qi.attempted_at >= NOW() - INTERVAL '7 days' AND qi.is_correct = true) as recent_correct,
  -- Time-based metrics
  CASE 
    WHEN ua.total_questions_attempted > 0 
    THEN ROUND(ua.total_time_spent_seconds::DECIMAL / ua.total_questions_attempted, 2)
    ELSE 0 
  END as avg_time_per_question
FROM public.user_analytics ua
LEFT JOIN public.question_interactions qi ON ua.user_id = qi.user_id
GROUP BY ua.user_id, ua.total_questions_attempted, ua.total_questions_correct, 
         ua.average_confidence, ua.streak_current, ua.streak_longest, 
         ua.skill_level, ua.performance_trend, ua.last_activity_at, ua.total_time_spent_seconds;

-- Question Difficulty Ranking View  
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_question_difficulty_ranking AS
SELECT 
  qa.question_public_id,
  qa.total_attempts,
  qa.correct_attempts,
  CASE 
    WHEN qa.total_attempts > 0 
    THEN ROUND((qa.correct_attempts::DECIMAL / qa.total_attempts) * 100, 2)
    ELSE 0 
  END as success_rate,
  qa.difficulty_score,
  qa.average_time_seconds,
  qa.average_confidence,
  qa.first_attempt_success_rate * 100 as first_attempt_success_percentage,
  CASE 
    WHEN qa.total_attempts >= 10 THEN 'reliable'
    WHEN qa.total_attempts >= 3 THEN 'emerging'
    ELSE 'insufficient_data'
  END as data_confidence_level
FROM public.question_analytics qa
ORDER BY qa.difficulty_score DESC, qa.total_attempts DESC;

-- RLS Policies
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics
CREATE POLICY "users_own_analytics" ON public.user_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_sessions" ON public.session_analytics FOR ALL USING (auth.uid() = user_id);

-- Question analytics are public (read-only for users)
CREATE POLICY "question_analytics_read" ON public.question_analytics FOR SELECT USING (true);

-- Daily analytics are public (read-only for users)
CREATE POLICY "daily_analytics_read" ON public.daily_analytics FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.user_analytics TO authenticated;
GRANT SELECT ON public.question_analytics TO authenticated;
GRANT SELECT ON public.daily_analytics TO authenticated;
GRANT SELECT ON public.session_analytics TO authenticated;
GRANT SELECT ON public.mv_user_performance_summary TO authenticated;
GRANT SELECT ON public.mv_question_difficulty_ranking TO authenticated;

-- Functions to update analytics

-- Ensure gen_random_uuid() exists (needed by session_analytics)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1: refresh_user_analytics – move all DECLAREs to the top + NULL guards
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_user_analytics(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats RECORD;
  bookmark_count INTEGER := 0;
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
BEGIN
  -- Aggregate user stats from interactions
  SELECT 
    COUNT(*)                                   AS total_attempts,
    COUNT(*) FILTER (WHERE is_correct = true)  AS total_correct,
    COALESCE(SUM(duration_seconds), 0)         AS total_time,
    AVG(confidence_level)                      AS avg_confidence,
    COUNT(DISTINCT DATE(attempted_at))         AS session_count,
    AVG(CASE WHEN hint_checked THEN 1 ELSE 0 END)      AS hints_ratio,
    AVG(CASE WHEN solution_checked THEN 1 ELSE 0 END)  AS solutions_ratio,
    MAX(attempted_at)                          AS last_activity
  INTO stats
  FROM public.question_interactions 
  WHERE user_id = target_user_id;

  -- Bookmarks count
  SELECT COUNT(*) INTO bookmark_count 
  FROM public.bookmarks 
  WHERE user_id = target_user_id;

  -- (Optional) streak logic could be added later; default 0 for now

  -- Upsert user analytics
  INSERT INTO public.user_analytics (
    user_id, total_questions_attempted, total_questions_correct,
    total_time_spent_seconds, total_sessions, average_confidence,
    hints_used_count, solutions_checked_count, bookmarks_count,
    streak_current, streak_longest, last_activity_at, updated_at
  ) VALUES (
    target_user_id,
    COALESCE(stats.total_attempts, 0),
    COALESCE(stats.total_correct, 0),
    COALESCE(stats.total_time, 0),
    COALESCE(stats.session_count, 0),
    COALESCE(stats.avg_confidence, 0),
    COALESCE(stats.hints_ratio, 0) * COALESCE(stats.total_attempts, 0),
    COALESCE(stats.solutions_ratio, 0) * COALESCE(stats.total_attempts, 0),
    COALESCE(bookmark_count, 0),
    current_streak,
    longest_streak,
    stats.last_activity,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_questions_attempted = EXCLUDED.total_questions_attempted,
    total_questions_correct    = EXCLUDED.total_questions_correct,
    total_time_spent_seconds   = EXCLUDED.total_time_spent_seconds,
    total_sessions             = EXCLUDED.total_sessions,
    average_confidence         = EXCLUDED.average_confidence,
    hints_used_count           = EXCLUDED.hints_used_count,
    solutions_checked_count    = EXCLUDED.solutions_checked_count,
    bookmarks_count            = EXCLUDED.bookmarks_count,
    last_activity_at           = EXCLUDED.last_activity_at,
    updated_at                 = NOW();
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 2: refresh_question_analytics – move all DECLAREs to the top + NULL guards
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_question_analytics(target_question_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats RECORD;
  bookmark_count INTEGER := 0;
  difficulty DECIMAL(3,2) := 3.00;
  first_success_rate DECIMAL(5,4) := 0;
BEGIN
  -- Aggregate question stats from interactions
  SELECT 
    COUNT(*)                                              AS total_attempts,
    COUNT(*) FILTER (WHERE is_correct = true)             AS total_correct,
    COALESCE(SUM(duration_seconds), 0)                    AS total_time,
    AVG(duration_seconds)                                 AS avg_time,
    AVG(confidence_level)                                 AS avg_confidence,
    COUNT(*) FILTER (WHERE hint_checked = true)           AS hints_used,
    COUNT(*) FILTER (WHERE solution_checked = true)       AS solutions_used,
    COUNT(*) FILTER (WHERE attempt_number = 1 AND is_correct = true) AS first_attempt_correct,
    COUNT(*) FILTER (WHERE attempt_number = 1)            AS first_attempts
  INTO stats
  FROM public.question_interactions 
  WHERE question_public_id = target_question_id;

  -- Bookmarks for this question
  SELECT COUNT(*) INTO bookmark_count 
  FROM public.bookmarks 
  WHERE question_public_id = target_question_id;

  -- Difficulty score (1–5; higher = harder). Default 3.0 if no data.
  IF COALESCE(stats.total_attempts, 0) > 0 THEN
    difficulty := 5.0 - (4.0 * (stats.total_correct::DECIMAL / NULLIF(stats.total_attempts, 0)));
  END IF;

  -- First attempt success rate
  IF COALESCE(stats.first_attempts, 0) > 0 THEN
    first_success_rate := stats.first_attempt_correct::DECIMAL / NULLIF(stats.first_attempts, 0);
  END IF;

  -- Upsert question analytics
  INSERT INTO public.question_analytics (
    question_public_id, total_attempts, correct_attempts,
    total_time_spent_seconds, average_time_seconds, difficulty_score,
    hints_requested_count, solutions_checked_count, bookmarks_count,
    average_confidence, first_attempt_success_rate, updated_at
  ) VALUES (
    target_question_id,
    COALESCE(stats.total_attempts, 0),
    COALESCE(stats.total_correct, 0),
    COALESCE(stats.total_time, 0),
    COALESCE(stats.avg_time, 0),
    COALESCE(difficulty, 3.00),
    COALESCE(stats.hints_used, 0),
    COALESCE(stats.solutions_used, 0),
    COALESCE(bookmark_count, 0),
    COALESCE(stats.avg_confidence, 0),
    COALESCE(first_success_rate, 0),
    NOW()
  )
  ON CONFLICT (question_public_id) DO UPDATE SET
    total_attempts              = EXCLUDED.total_attempts,
    correct_attempts            = EXCLUDED.correct_attempts,
    total_time_spent_seconds    = EXCLUDED.total_time_spent_seconds,
    average_time_seconds        = EXCLUDED.average_time_seconds,
    difficulty_score            = EXCLUDED.difficulty_score,
    hints_requested_count       = EXCLUDED.hints_requested_count,
    solutions_checked_count     = EXCLUDED.solutions_checked_count,
    bookmarks_count             = EXCLUDED.bookmarks_count,
    average_confidence          = EXCLUDED.average_confidence,
    first_attempt_success_rate  = EXCLUDED.first_attempt_success_rate,
    updated_at                  = NOW();
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 3: Add the missing trigger function
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_update_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user analytics
  PERFORM refresh_user_analytics(NEW.user_id);
  
  -- Update question analytics  
  PERFORM refresh_question_analytics(NEW.question_public_id);
  
  -- Refresh materialized views (async, don't block the transaction)
  PERFORM pg_notify('refresh_analytics_views', '');
  
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger stays the same; re-create to be safe
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS tr_update_analytics ON public.question_interactions;
CREATE TRIGGER tr_update_analytics
  AFTER INSERT OR UPDATE ON public.question_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_analytics();

-- Comments for documentation
COMMENT ON TABLE public.user_analytics IS 'Aggregated performance analytics per user';
COMMENT ON TABLE public.question_analytics IS 'Performance analytics per question across all users';
COMMENT ON TABLE public.daily_analytics IS 'Time-series analytics data for trend analysis';
COMMENT ON TABLE public.session_analytics IS 'Study session tracking and analytics';
COMMENT ON FUNCTION refresh_user_analytics(UUID) IS 'Recalculates and updates analytics for a specific user';
COMMENT ON FUNCTION refresh_question_analytics(TEXT) IS 'Recalculates and updates analytics for a specific question';