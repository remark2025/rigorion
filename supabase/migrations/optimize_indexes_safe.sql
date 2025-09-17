-- Safe Index Optimization (No IMMUTABLE function issues)
-- This version avoids all function expressions and complex WHERE clauses

-- Step 1: Drop old indexes that we'll replace
DROP INDEX IF EXISTS public.idx_qi_practice_session;
DROP INDEX IF EXISTS public.idx_qi_practice_mode;

-- Step 2: Create basic composite indexes (no WHERE clauses with functions)

-- 1. User-centric performance index
CREATE INDEX IF NOT EXISTS idx_qi_user_performance_basic
ON public.question_interactions (user_id, attempted_at DESC, is_correct, duration_seconds);

-- 2. Analytics computation index
CREATE INDEX IF NOT EXISTS idx_qi_analytics_basic
ON public.question_interactions (user_id, level, module, attempted_at DESC, is_correct);

-- 3. Practice session analysis index
CREATE INDEX IF NOT EXISTS idx_qi_practice_session_basic
ON public.question_interactions (practice_session_id, question_index_in_session, attempted_at)
WHERE practice_session_id IS NOT NULL;

-- 4. Question-centric index
CREATE INDEX IF NOT EXISTS idx_qi_question_stats_basic
ON public.question_interactions (question_public_id, level, is_correct, attempted_at DESC);

-- 5. Daily activity index (simplified - no date_trunc)
CREATE INDEX IF NOT EXISTS idx_qi_daily_activity_basic
ON public.question_interactions (user_id, attempted_at, is_correct);

-- 6. Skill progression index
CREATE INDEX IF NOT EXISTS idx_qi_skill_progression_basic
ON public.question_interactions (user_id, topic, module, attempted_at DESC, is_correct)
WHERE topic IS NOT NULL;

-- Step 3: Update existing indexes

-- Replace old user index
DROP INDEX IF EXISTS public.qx_user_attempted_idx;
CREATE INDEX IF NOT EXISTS idx_qi_user_recent
ON public.question_interactions (user_id, attempted_at DESC);

-- Replace old question index
DROP INDEX IF EXISTS public.qx_question_idx;
CREATE INDEX IF NOT EXISTS idx_qi_question_recent
ON public.question_interactions (question_public_id, attempted_at DESC);

-- Step 4: Optimize bookmarks table indexes

-- Replace simple indexes with composite ones
DROP INDEX IF EXISTS public.bm_user_idx;
DROP INDEX IF EXISTS public.bm_question_idx;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_basic
ON public.bookmarks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_question_basic
ON public.bookmarks (question_public_id, created_at DESC);

-- Step 5: Create monitoring functions (safe versions)

CREATE OR REPLACE FUNCTION public.get_basic_index_stats()
RETURNS TABLE(
  index_name text,
  table_name text,
  index_size text,
  index_scans bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    indexrelname::text as index_name,
    relname::text as table_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public' 
    AND (relname = 'question_interactions' OR relname = 'bookmarks')
  ORDER BY idx_scan DESC;
$$;

-- Step 6: Create basic monitoring view

CREATE OR REPLACE VIEW public.basic_index_summary AS
SELECT 
  'question_interactions' as table_name,
  count(*) as total_indexes,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes 
WHERE relname = 'question_interactions' AND schemaname = 'public'

UNION ALL

SELECT 
  'bookmarks' as table_name,
  count(*) as total_indexes,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes 
WHERE relname = 'bookmarks' AND schemaname = 'public';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_basic_index_stats() TO authenticated;
GRANT SELECT ON public.basic_index_summary TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_basic_index_stats() IS 'Basic index usage statistics without complex expressions';
COMMENT ON VIEW public.basic_index_summary IS 'Simple index health summary';

-- Success message
SELECT 'Safe index optimization completed successfully!' as result;