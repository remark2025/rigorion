-- Additional RPC functions needed for the analytics system

-- Function to get overall question statistics
CREATE OR REPLACE FUNCTION get_overall_question_stats()
RETURNS TABLE (
  total_questions INTEGER,
  total_attempts INTEGER,
  average_success_rate DECIMAL,
  average_difficulty DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_questions,
    COALESCE(SUM(qa.total_attempts), 0)::INTEGER as total_attempts,
    COALESCE(AVG(
      CASE 
        WHEN qa.total_attempts > 0 
        THEN (qa.correct_attempts::DECIMAL / qa.total_attempts) * 100
        ELSE 0 
      END
    ), 0)::DECIMAL as average_success_rate,
    COALESCE(AVG(qa.difficulty_score), 3.0)::DECIMAL as average_difficulty
  FROM public.question_analytics qa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user topic performance
CREATE OR REPLACE FUNCTION get_user_topic_performance(target_user_id UUID)
RETURNS TABLE (
  topic_name TEXT,
  total_attempts INTEGER,
  correct_attempts INTEGER,
  success_rate DECIMAL,
  average_time DECIMAL,
  question_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN qi.question_public_id ~ '^[A-Z]+-[A-Z]+' 
      THEN substring(qi.question_public_id from '^([A-Z]+-[A-Z]+)')
      ELSE split_part(qi.question_public_id, '-', 1)
    END as topic_name,
    COUNT(*)::INTEGER as total_attempts,
    COUNT(*) FILTER (WHERE qi.is_correct = true)::INTEGER as correct_attempts,
    COALESCE(
      (COUNT(*) FILTER (WHERE qi.is_correct = true)::DECIMAL / COUNT(*)) * 100, 
      0
    )::DECIMAL as success_rate,
    COALESCE(AVG(qi.duration_seconds), 0)::DECIMAL as average_time,
    COUNT(DISTINCT qi.question_public_id)::INTEGER as question_count
  FROM public.question_interactions qi
  WHERE qi.user_id = target_user_id
  GROUP BY 
    CASE 
      WHEN qi.question_public_id ~ '^[A-Z]+-[A-Z]+' 
      THEN substring(qi.question_public_id from '^([A-Z]+-[A-Z]+)')
      ELSE split_part(qi.question_public_id, '-', 1)
    END
  ORDER BY total_attempts DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user streaks
CREATE OR REPLACE FUNCTION calculate_user_streaks(target_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_type TEXT
) AS $$
DECLARE
  current_streak_count INTEGER := 0;
  longest_streak_count INTEGER := 0;
  daily_results RECORD;
  temp_streak INTEGER := 0;
  last_date DATE;
  current_date DATE;
  is_current_ongoing BOOLEAN := false;
BEGIN
  -- Get daily results for the user, ordered by date
  FOR daily_results IN
    SELECT 
      DATE(qi.attempted_at) as attempt_date,
      BOOL_AND(qi.is_correct) as all_correct,
      COUNT(*) as attempts_count
    FROM public.question_interactions qi
    WHERE qi.user_id = target_user_id
      AND qi.attempted_at >= NOW() - INTERVAL '365 days' -- Last year only
    GROUP BY DATE(qi.attempted_at)
    ORDER BY DATE(qi.attempted_at) DESC
  LOOP
    current_date := daily_results.attempt_date;
    
    -- For the first iteration, check if it's today or yesterday (current streak)
    IF last_date IS NULL THEN
      IF current_date >= CURRENT_DATE - INTERVAL '1 day' THEN
        IF daily_results.all_correct AND daily_results.attempts_count > 0 THEN
          current_streak_count := 1;
          temp_streak := 1;
          is_current_ongoing := true;
        END IF;
      END IF;
    ELSE
      -- Check if this date is consecutive with the last date
      IF current_date = last_date - INTERVAL '1 day' THEN
        IF daily_results.all_correct AND daily_results.attempts_count > 0 THEN
          temp_streak := temp_streak + 1;
          IF is_current_ongoing THEN
            current_streak_count := temp_streak;
          END IF;
        ELSE
          -- Streak broken
          IF temp_streak > longest_streak_count THEN
            longest_streak_count := temp_streak;
          END IF;
          temp_streak := 0;
          is_current_ongoing := false;
        END IF;
      ELSE
        -- Gap in dates, streak broken
        IF temp_streak > longest_streak_count THEN
          longest_streak_count := temp_streak;
        END IF;
        temp_streak := 0;
        is_current_ongoing := false;
        
        -- Start new streak if this day was successful
        IF daily_results.all_correct AND daily_results.attempts_count > 0 THEN
          temp_streak := 1;
        END IF;
      END IF;
    END IF;
    
    last_date := current_date;
  END LOOP;
  
  -- Check final streak
  IF temp_streak > longest_streak_count THEN
    longest_streak_count := temp_streak;
  END IF;
  
  -- If current streak is 0 but longest is greater, set longest to current
  IF current_streak_count = 0 AND longest_streak_count = 0 THEN
    longest_streak_count := 0;
  ELSIF longest_streak_count < current_streak_count THEN
    longest_streak_count := current_streak_count;
  END IF;
  
  RETURN QUERY SELECT 
    current_streak_count as current_streak,
    longest_streak_count as longest_streak,
    CASE 
      WHEN current_streak_count > 0 THEN 'active'
      WHEN longest_streak_count > 0 THEN 'broken'
      ELSE 'none'
    END as streak_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
  -- Refresh all materialized views concurrently
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_performance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_question_difficulty_ranking;
  
  -- Log the refresh
  INSERT INTO public.daily_analytics (date, metric_type, metric_key, metric_value)
  VALUES (CURRENT_DATE, 'system', 'materialized_views_refreshed', 1)
  ON CONFLICT (date, metric_type, metric_key) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value + 1, created_at = NOW();
  
EXCEPTION
  WHEN OTHERS THEN
    -- If concurrent refresh fails, try regular refresh
    REFRESH MATERIALIZED VIEW public.mv_user_performance_summary;
    REFRESH MATERIALIZED VIEW public.mv_question_difficulty_ranking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily analytics rollup
CREATE OR REPLACE FUNCTION update_daily_analytics_rollup()
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- User activity metrics
  INSERT INTO public.daily_analytics (date, metric_type, metric_key, metric_value, metadata)
  SELECT 
    today_date,
    'user_activity',
    'total_active_users',
    COUNT(DISTINCT qi.user_id)::DECIMAL,
    jsonb_build_object('calculation_time', NOW())
  FROM public.question_interactions qi
  WHERE DATE(qi.attempted_at) = today_date
  ON CONFLICT (date, metric_type, metric_key) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    created_at = NOW();

  -- Question attempt metrics
  INSERT INTO public.daily_analytics (date, metric_type, metric_key, metric_value, metadata)
  SELECT 
    today_date,
    'question_stats',
    'total_attempts',
    COUNT(*)::DECIMAL,
    jsonb_build_object('calculation_time', NOW())
  FROM public.question_interactions qi
  WHERE DATE(qi.attempted_at) = today_date
  ON CONFLICT (date, metric_type, metric_key) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    created_at = NOW();

  -- Success rate metrics
  INSERT INTO public.daily_analytics (date, metric_type, metric_key, metric_value, metadata)
  SELECT 
    today_date,
    'question_stats',
    'success_rate',
    (COUNT(*) FILTER (WHERE qi.is_correct = true)::DECIMAL / COUNT(*)) * 100,
    jsonb_build_object('calculation_time', NOW())
  FROM public.question_interactions qi
  WHERE DATE(qi.attempted_at) = today_date
  AND COUNT(*) > 0
  ON CONFLICT (date, metric_type, metric_key) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    created_at = NOW();

  -- Average time metrics
  INSERT INTO public.daily_analytics (date, metric_type, metric_key, metric_value, metadata)
  SELECT 
    today_date,
    'question_stats',
    'average_time_seconds',
    AVG(qi.duration_seconds)::DECIMAL,
    jsonb_build_object('calculation_time', NOW())
  FROM public.question_interactions qi
  WHERE DATE(qi.attempted_at) = today_date
  ON CONFLICT (date, metric_type, metric_key) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    created_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics summary for dashboard
CREATE OR REPLACE FUNCTION get_analytics_dashboard_summary()
RETURNS TABLE (
  total_users INTEGER,
  total_questions INTEGER,
  total_interactions INTEGER,
  average_success_rate DECIMAL,
  active_users_today INTEGER,
  questions_answered_today INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT user_id) FROM public.question_interactions)::INTEGER as total_users,
    (SELECT COUNT(DISTINCT question_public_id) FROM public.question_interactions)::INTEGER as total_questions,
    (SELECT COUNT(*) FROM public.question_interactions)::INTEGER as total_interactions,
    (SELECT COALESCE(AVG(
      CASE 
        WHEN qa.total_attempts > 0 
        THEN (qa.correct_attempts::DECIMAL / qa.total_attempts) * 100
        ELSE 0 
      END
    ), 0) FROM public.question_analytics qa)::DECIMAL as average_success_rate,
    (SELECT COUNT(DISTINCT user_id) FROM public.question_interactions 
     WHERE DATE(attempted_at) = CURRENT_DATE)::INTEGER as active_users_today,
    (SELECT COUNT(*) FROM public.question_interactions 
     WHERE DATE(attempted_at) = CURRENT_DATE)::INTEGER as questions_answered_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_overall_question_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_topic_performance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streaks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_analytics_rollup() TO service_role;
GRANT EXECUTE ON FUNCTION get_analytics_dashboard_summary() TO authenticated;

-- Create a scheduled job to update daily analytics (this would typically be done via pg_cron or external scheduler)
-- For now, we'll just document that this should be run daily
COMMENT ON FUNCTION update_daily_analytics_rollup() IS 'Should be run daily via cron job to update analytics rollup data';
COMMENT ON FUNCTION refresh_materialized_views() IS 'Should be run periodically to refresh materialized views for better query performance';

-- Create indexes to optimize the new functions
CREATE INDEX IF NOT EXISTS idx_question_interactions_date ON public.question_interactions(DATE(attempted_at));
CREATE INDEX IF NOT EXISTS idx_question_interactions_user_date ON public.question_interactions(user_id, DATE(attempted_at));
CREATE INDEX IF NOT EXISTS idx_question_interactions_topic ON public.question_interactions(substring(question_public_id from '^([A-Z]+-[A-Z]+)'));

-- Comments for documentation
COMMENT ON FUNCTION get_overall_question_stats() IS 'Returns overall statistics about questions and user performance';
COMMENT ON FUNCTION get_user_topic_performance(UUID) IS 'Returns performance breakdown by topic for a specific user';
COMMENT ON FUNCTION calculate_user_streaks(UUID) IS 'Calculates current and longest streaks for a user based on daily success rates';
COMMENT ON FUNCTION get_analytics_dashboard_summary() IS 'Returns high-level analytics summary for dashboard display';