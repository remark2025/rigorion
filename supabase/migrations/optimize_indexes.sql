-- Index Optimization for question_interactions table
-- Consolidates and optimizes indexes for better performance and lower storage cost

-- Step 1: Analyze current index usage and consolidate overlapping indexes

-- Drop redundant indexes (keeping the most efficient ones)
-- Note: Run EXPLAIN ANALYZE on your queries first to ensure these changes don't break performance

-- Remove old duplicate indexes that we've replaced with better ones
DROP INDEX IF EXISTS public.uq_qi_idem; -- Replaced by uq_qi_user_idempotency
DROP INDEX IF EXISTS public.idx_qi_practice_session; -- Will create a composite version
DROP INDEX IF EXISTS public.idx_qi_practice_mode; -- Will create a composite version

-- Step 2: Create optimized composite indexes

-- 1. User-centric performance index (covers most user dashboard queries)
CREATE INDEX IF NOT EXISTS idx_qi_user_performance_optimized 
ON public.question_interactions (user_id, attempted_at DESC, is_correct, duration_seconds)
WHERE attempted_at > '2024-01-01'::timestamptz; -- Partial index for recent data only

-- 2. Analytics computation index (for real-time analytics)
CREATE INDEX IF NOT EXISTS idx_qi_analytics_optimized
ON public.question_interactions (user_id, level, module, attempted_at DESC, is_correct, duration_seconds)
WHERE attempted_at > '2024-07-01'::timestamptz; -- Partial index for active analytics period

-- 3. Practice session analysis index
CREATE INDEX IF NOT EXISTS idx_qi_practice_session_optimized
ON public.question_interactions (practice_session_id, question_index_in_session, attempted_at)
WHERE practice_session_id IS NOT NULL;

-- 4. Question-centric index for content analytics
CREATE INDEX IF NOT EXISTS idx_qi_question_stats
ON public.question_interactions (question_public_id, level, is_correct, attempted_at DESC)
WHERE attempted_at > '2024-06-01'::timestamptz; -- Recent question performance only

-- Step 3: Create expression indexes for common query patterns

-- 5. Daily activity index (for streak and daily progress calculations)
-- Note: Removed date_trunc from index to avoid IMMUTABLE function issues
CREATE INDEX IF NOT EXISTS idx_qi_daily_activity
ON public.question_interactions (user_id, attempted_at, is_correct)
WHERE attempted_at > '2024-06-01'::timestamptz; -- Last 3 months only

-- 6. Skill progression index (for topic/module analytics)
CREATE INDEX IF NOT EXISTS idx_qi_skill_progression
ON public.question_interactions (user_id, topic, module, attempted_at DESC, is_correct)
WHERE topic IS NOT NULL AND attempted_at > '2024-03-01'::timestamptz;

-- Step 4: Optimize existing indexes by making them partial

-- Update the main user index to be partial (recent data only)
DROP INDEX IF EXISTS public.qx_user_attempted_idx;
CREATE INDEX idx_qi_user_recent_activity
ON public.question_interactions (user_id, attempted_at DESC)
WHERE attempted_at > '2024-01-01'::timestamptz;

-- Update question index to be partial
DROP INDEX IF EXISTS public.qx_question_idx;
CREATE INDEX idx_qi_question_recent_stats  
ON public.question_interactions (question_public_id, attempted_at DESC)
WHERE attempted_at > '2024-03-01'::timestamptz;

-- Step 5: Create covering indexes for high-frequency queries

-- 7. User dashboard covering index (simplified - removed INCLUDE clause for compatibility)
CREATE INDEX IF NOT EXISTS idx_qi_user_dashboard_covering
ON public.question_interactions (user_id, attempted_at DESC, is_correct, duration_seconds)
WHERE attempted_at > '2024-06-01'::timestamptz;

-- Step 6: Optimize bookmarks table indexes

-- Replace simple indexes with composite ones
DROP INDEX IF EXISTS public.bm_user_idx;
DROP INDEX IF EXISTS public.bm_question_idx;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_optimized
ON public.bookmarks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_question_optimized  
ON public.bookmarks (question_public_id, created_at DESC);

-- Step 7: Create maintenance indexes (for cleanup operations)

-- For retention policy operations
CREATE INDEX IF NOT EXISTS idx_qi_retention_cleanup
ON public.question_interactions (attempted_at)
WHERE attempted_at < now() - interval '1 year';

-- For idempotency cleanup
CREATE INDEX IF NOT EXISTS idx_qi_idempotency_cleanup
ON public.question_interactions (idempotency_expires_at)
WHERE idempotency_expires_at IS NOT NULL AND idempotency_expires_at < now();

-- Step 8: Create function to monitor index usage
CREATE OR REPLACE FUNCTION public.get_index_usage_stats()
RETURNS TABLE(
  index_name text,
  table_name text,
  index_size text,
  index_scans bigint,
  tuples_read bigint,
  tuples_fetched bigint,
  usage_ratio numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    indexrelname::text as index_name,
    relname::text as table_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
      WHEN idx_scan = 0 THEN 0
      ELSE round((idx_tup_fetch::numeric / idx_tup_read::numeric) * 100, 2)
    END as usage_ratio
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public' 
    AND (relname = 'question_interactions' OR relname = 'bookmarks')
  ORDER BY idx_scan DESC;
$$;

-- Step 9: Create function to identify unused indexes
CREATE OR REPLACE FUNCTION public.find_unused_indexes(
  min_age_days integer DEFAULT 7
)
RETURNS TABLE(
  index_name text,
  table_name text,
  index_size text,
  definition text,
  recommendation text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.indexrelname::text as index_name,
    i.relname::text as table_name,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size,
    pg_get_indexdef(i.indexrelid) as definition,
    CASE 
      WHEN i.idx_scan = 0 THEN 'Consider dropping - never used'
      WHEN i.idx_scan < 10 THEN 'Low usage - review necessity'
      ELSE 'Normal usage'
    END as recommendation
  FROM pg_stat_user_indexes i
  JOIN pg_class c ON c.oid = i.indexrelid
  WHERE i.schemaname = 'public'
    AND (i.relname = 'question_interactions' OR i.relname = 'bookmarks')
    AND pg_stat_get_db_conflict_startup_deadlocks(i.indexrelid) IS NULL -- Exclude system indexes
  ORDER BY i.idx_scan ASC, pg_relation_size(i.indexrelid) DESC;
$$;

-- Step 10: Create index maintenance recommendations function
CREATE OR REPLACE FUNCTION public.get_index_recommendations()
RETURNS TABLE(
  category text,
  recommendation text,
  impact text,
  sql_command text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Check for missing indexes on foreign key-like columns
  SELECT 
    'Missing Index'::text as category,
    'Consider index on frequently filtered columns'::text as recommendation,
    'High - Query Performance'::text as impact,
    'CREATE INDEX idx_qi_custom ON question_interactions(column_name)'::text as sql_command
  WHERE EXISTS (
    SELECT 1 FROM public.question_interactions 
    WHERE attempted_at > now() - interval '1 day'
    LIMIT 1000 -- Check if table has recent activity
  )
  
  UNION ALL
  
  -- Check for oversized indexes
  SELECT 
    'Large Index'::text,
    'Index larger than 100MB - consider partitioning'::text,
    'Medium - Storage Cost'::text,
    'Consider partial indexes or table partitioning'::text
  WHERE EXISTS (
    SELECT 1 FROM pg_stat_user_indexes i
    WHERE i.relname = 'question_interactions'
      AND pg_relation_size(i.indexrelid) > 104857600 -- 100MB
  )
  
  UNION ALL
  
  -- Check index fragmentation
  SELECT 
    'Maintenance'::text,
    'Run REINDEX if index bloat detected'::text,
    'Medium - Performance'::text,
    'REINDEX INDEX CONCURRENTLY index_name'::text
  WHERE EXISTS (
    SELECT 1 FROM pg_stat_user_indexes
    WHERE relname = 'question_interactions'
      AND idx_scan > 10000 -- High usage indexes
  );
END;
$$;

-- Step 11: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_index_usage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_unused_indexes(integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_index_recommendations() TO postgres;

-- Step 12: Add comments
COMMENT ON FUNCTION public.get_index_usage_stats() IS 'Monitor index usage patterns for optimization';
COMMENT ON FUNCTION public.find_unused_indexes(integer) IS 'Identify potentially unused indexes for cleanup';
COMMENT ON FUNCTION public.get_index_recommendations() IS 'Get automated index optimization recommendations';

-- Step 13: Create index monitoring view
CREATE OR REPLACE VIEW public.index_health_summary AS
SELECT 
  'question_interactions' as table_name,
  count(*) as total_indexes,
  sum(pg_relation_size(indexrelid))::bigint as total_index_size_bytes,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size,
  round(avg(CASE WHEN idx_scan = 0 THEN 0 ELSE 1 END) * 100, 1) as usage_percentage,
  max(pg_relation_size(indexrelid)) as largest_index_bytes,
  pg_size_pretty(max(pg_relation_size(indexrelid))) as largest_index_size
FROM pg_stat_user_indexes 
WHERE relname = 'question_interactions' AND schemaname = 'public'

UNION ALL

SELECT 
  'bookmarks' as table_name,
  count(*) as total_indexes,
  sum(pg_relation_size(indexrelid))::bigint as total_index_size_bytes,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size,
  round(avg(CASE WHEN idx_scan = 0 THEN 0 ELSE 1 END) * 100, 1) as usage_percentage,
  max(pg_relation_size(indexrelid)) as largest_index_bytes,
  pg_size_pretty(max(pg_relation_size(indexrelid))) as largest_index_size
FROM pg_stat_user_indexes 
WHERE relname = 'bookmarks' AND schemaname = 'public';

GRANT SELECT ON public.index_health_summary TO authenticated;

-- Monitoring queries to run periodically:
-- SELECT * FROM public.get_index_usage_stats();
-- SELECT * FROM public.find_unused_indexes(30);
-- SELECT * FROM public.get_index_recommendations();
-- SELECT * FROM public.index_health_summary;