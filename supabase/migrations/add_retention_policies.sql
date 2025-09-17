-- Data Retention and TTL Policies
-- Implements automated data lifecycle management for cost optimization

-- 1. Create retention policy configuration table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  table_name text PRIMARY KEY,
  retention_days integer NOT NULL,
  archive_after_days integer,
  enabled boolean DEFAULT true,
  last_cleanup_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default policies
INSERT INTO public.data_retention_policies (table_name, retention_days, archive_after_days, enabled)
VALUES 
  ('question_interactions', 730, 365, true),  -- Keep 2 years, archive after 1 year
  ('bookmarks', 1095, NULL, true),            -- Keep 3 years, no archival
  ('practice_session_analytics', 365, 180, true) -- Keep 1 year, archive after 6 months
ON CONFLICT (table_name) DO NOTHING;

-- 2. Create archive tables for long-term storage
CREATE TABLE IF NOT EXISTS public.question_interactions_archive (
  LIKE public.question_interactions INCLUDING ALL,
  archived_at timestamptz DEFAULT now()
);

-- Add archive-specific indexes (optimized for read-only access) 
-- Note: Simplified to avoid IMMUTABLE function issues
CREATE INDEX IF NOT EXISTS qi_archive_user_attempted_idx ON public.question_interactions_archive(user_id, attempted_at);
CREATE INDEX IF NOT EXISTS qi_archive_attempted_idx ON public.question_interactions_archive(attempted_at);

-- 3. Function to archive old data
CREATE OR REPLACE FUNCTION public.archive_old_interactions(
  archive_older_than_days integer DEFAULT 365
)
RETURNS TABLE(
  archived_count bigint,
  archive_date_cutoff timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE  -- Mark as VOLATILE since it uses now()
AS $$
DECLARE
  cutoff_date timestamptz;
  moved_count bigint;
BEGIN
  cutoff_date := now() - (archive_older_than_days || ' days')::interval;
  
  -- Move old records to archive table
  WITH moved_records AS (
    DELETE FROM public.question_interactions
    WHERE attempted_at < cutoff_date
    RETURNING *
  )
  INSERT INTO public.question_interactions_archive 
  SELECT *, now() as archived_at
  FROM moved_records;
  
  GET DIAGNOSTICS moved_count = ROW_COUNT;
  
  -- Update policy tracking
  UPDATE public.data_retention_policies 
  SET last_cleanup_at = now()
  WHERE table_name = 'question_interactions';
  
  RETURN QUERY SELECT moved_count, cutoff_date;
END;
$$;

-- 4. Function to permanently delete very old data
CREATE OR REPLACE FUNCTION public.cleanup_expired_data(
  table_name_param text DEFAULT 'question_interactions'
)
RETURNS TABLE(
  deleted_count bigint,
  retention_cutoff timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE  -- Mark as VOLATILE since it uses now()
AS $$
DECLARE
  policy_record record;
  cutoff_date timestamptz;
  deleted_rows bigint;
BEGIN
  -- Get retention policy
  SELECT * INTO policy_record
  FROM public.data_retention_policies
  WHERE table_name = table_name_param AND enabled = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No retention policy found for table: %', table_name_param;
  END IF;
  
  cutoff_date := now() - (policy_record.retention_days || ' days')::interval;
  
  -- Delete based on table type
  CASE table_name_param
    WHEN 'question_interactions' THEN
      DELETE FROM public.question_interactions
      WHERE attempted_at < cutoff_date;
      
    WHEN 'question_interactions_archive' THEN
      DELETE FROM public.question_interactions_archive
      WHERE attempted_at < cutoff_date;
      
    WHEN 'bookmarks' THEN
      DELETE FROM public.bookmarks
      WHERE created_at < cutoff_date;
      
    ELSE
      RAISE EXCEPTION 'Unsupported table for retention: %', table_name_param;
  END CASE;
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- Update policy tracking
  UPDATE public.data_retention_policies 
  SET last_cleanup_at = now()
  WHERE table_name = table_name_param;
  
  RETURN QUERY SELECT deleted_rows, cutoff_date;
END;
$$;

-- 5. Function to get retention status
CREATE OR REPLACE FUNCTION public.get_retention_status()
RETURNS TABLE(
  table_name text,
  total_rows bigint,
  oldest_record timestamptz,
  newest_record timestamptz,
  archive_eligible_count bigint,
  deletion_eligible_count bigint,
  last_cleanup timestamptz,
  next_cleanup_due boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN 
    SELECT * FROM public.data_retention_policies WHERE enabled = true
  LOOP
    CASE policy_record.table_name
      WHEN 'question_interactions' THEN
        RETURN QUERY
        SELECT 
          policy_record.table_name,
          (SELECT count(*) FROM public.question_interactions)::bigint as total_rows,
          (SELECT min(attempted_at) FROM public.question_interactions) as oldest_record,
          (SELECT max(attempted_at) FROM public.question_interactions) as newest_record,
          (SELECT count(*) FROM public.question_interactions 
           WHERE attempted_at < now() - (COALESCE(policy_record.archive_after_days, 365) || ' days')::interval
          )::bigint as archive_eligible_count,
          (SELECT count(*) FROM public.question_interactions 
           WHERE attempted_at < now() - (policy_record.retention_days || ' days')::interval
          )::bigint as deletion_eligible_count,
          policy_record.last_cleanup_at,
          (policy_record.last_cleanup_at IS NULL OR policy_record.last_cleanup_at < now() - interval '7 days') as next_cleanup_due;
          
      WHEN 'bookmarks' THEN
        RETURN QUERY
        SELECT 
          policy_record.table_name,
          (SELECT count(*) FROM public.bookmarks)::bigint,
          (SELECT min(created_at) FROM public.bookmarks),
          (SELECT max(created_at) FROM public.bookmarks),
          0::bigint, -- No archival for bookmarks
          (SELECT count(*) FROM public.bookmarks 
           WHERE created_at < now() - (policy_record.retention_days || ' days')::interval
          )::bigint,
          policy_record.last_cleanup_at,
          (policy_record.last_cleanup_at IS NULL OR policy_record.last_cleanup_at < now() - interval '30 days') as next_cleanup_due;
    END CASE;
  END LOOP;
END;
$$;

-- 6. Automated cleanup function (run via cron/scheduler)
CREATE OR REPLACE FUNCTION public.run_automated_retention_cleanup()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_record record;
  result_text text := '';
  archive_result record;
  cleanup_result record;
BEGIN
  result_text := 'Automated retention cleanup started at ' || now() || E'\n';
  
  FOR policy_record IN 
    SELECT * FROM public.data_retention_policies 
    WHERE enabled = true 
      AND (last_cleanup_at IS NULL OR last_cleanup_at < now() - interval '7 days')
  LOOP
    result_text := result_text || 'Processing table: ' || policy_record.table_name || E'\n';
    
    -- Archive old data if archival is configured
    IF policy_record.archive_after_days IS NOT NULL AND policy_record.table_name = 'question_interactions' THEN
      SELECT * INTO archive_result 
      FROM public.archive_old_interactions(policy_record.archive_after_days);
      
      result_text := result_text || '  Archived ' || archive_result.archived_count || ' records older than ' || policy_record.archive_after_days || ' days' || E'\n';
    END IF;
    
    -- Clean up expired data
    SELECT * INTO cleanup_result
    FROM public.cleanup_expired_data(policy_record.table_name);
    
    result_text := result_text || '  Deleted ' || cleanup_result.deleted_count || ' records older than ' || policy_record.retention_days || ' days' || E'\n';
  END LOOP;
  
  result_text := result_text || 'Cleanup completed at ' || now();
  
  RETURN result_text;
END;
$$;

-- 7. Function to estimate storage savings
CREATE OR REPLACE FUNCTION public.estimate_retention_savings()
RETURNS TABLE(
  table_name text,
  current_size text,
  archivable_rows bigint,
  deletable_rows bigint,
  estimated_space_savings text
)
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE  -- Mark as VOLATILE since it uses now()
AS $$
DECLARE
  cutoff_365 timestamptz := now() - interval '365 days';
  cutoff_730 timestamptz := now() - interval '730 days';
BEGIN
  RETURN QUERY
  SELECT 
    'question_interactions'::text,
    pg_size_pretty(pg_total_relation_size('public.question_interactions')) as current_size,
    (SELECT count(*) FROM public.question_interactions 
     WHERE attempted_at < cutoff_365)::bigint as archivable_rows,
    (SELECT count(*) FROM public.question_interactions 
     WHERE attempted_at < cutoff_730)::bigint as deletable_rows,
    pg_size_pretty(
      (SELECT count(*) FROM public.question_interactions WHERE attempted_at < cutoff_730) * 
      (pg_total_relation_size('public.question_interactions')::bigint / GREATEST((SELECT count(*) FROM public.question_interactions), 1))
    ) as estimated_space_savings;
END;
$$;

-- 8. Create indexes for efficient retention operations
-- Note: Using simple indexes without WHERE clauses to avoid IMMUTABLE function requirement
CREATE INDEX IF NOT EXISTS qi_attempted_at_retention_idx ON public.question_interactions(attempted_at);

CREATE INDEX IF NOT EXISTS bookmarks_created_at_retention_idx ON public.bookmarks(created_at);

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.archive_old_interactions(integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_data(text) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_retention_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_automated_retention_cleanup() TO postgres;
GRANT EXECUTE ON FUNCTION public.estimate_retention_savings() TO authenticated;

GRANT SELECT ON public.data_retention_policies TO authenticated;
GRANT SELECT ON public.question_interactions_archive TO authenticated;

-- 10. Add comments
COMMENT ON TABLE public.data_retention_policies IS 'Configuration for automated data retention and archival';
COMMENT ON TABLE public.question_interactions_archive IS 'Long-term archive storage for old interaction data';
COMMENT ON FUNCTION public.run_automated_retention_cleanup() IS 'Main function for automated data lifecycle management - run via scheduler';
COMMENT ON FUNCTION public.get_retention_status() IS 'Monitor retention policy status and data aging';

-- Example scheduled cleanup (set up in Supabase dashboard or external cron):
-- Run weekly: SELECT public.run_automated_retention_cleanup();
-- Monitor status: SELECT * FROM public.get_retention_status();
-- Estimate savings: SELECT * FROM public.estimate_retention_savings();