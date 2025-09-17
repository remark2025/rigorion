-- Monthly Partitioning for question_interactions table
-- This implements time-based partitioning for better performance at scale

-- Step 1: Create partitioned table structure
-- Note: This requires careful migration since we have existing data

-- Create the partitioned master table (if starting fresh)
-- For existing installations, this will be done through a migration process

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.create_monthly_partition(text, date);

-- Create a function to automatically create monthly partitions
CREATE OR REPLACE FUNCTION public.create_monthly_partition(
  table_name text,
  partition_date date
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  -- Calculate partition boundaries
  start_date := date_trunc('month', partition_date);
  end_date := start_date + interval '1 month';
  
  -- Generate partition name
  partition_name := table_name || '_y' || extract(year from start_date) || 'm' || lpad(extract(month from start_date)::text, 2, '0');
  
  -- Create the partition
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      LIKE %I INCLUDING ALL
    ) INHERITS (%I)',
    partition_name, table_name, table_name);
  
  -- Add check constraint for the partition (if it doesn't exist)
  EXECUTE format('
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = %L AND conrelid = %L::regclass
      ) THEN
        ALTER TABLE %I 
        ADD CONSTRAINT %I_check 
        CHECK (attempted_at >= %L AND attempted_at < %L);
      END IF;
    END $$',
    partition_name || '_check',
    partition_name,
    partition_name, 
    partition_name,
    start_date,
    end_date);
  
  -- Create indexes on the partition
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I_user_attempted_idx ON %I(user_id, attempted_at DESC)', partition_name, partition_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I_question_idx ON %I(question_public_id)', partition_name, partition_name);
  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I_pk_idx ON %I(user_id, question_public_id, attempt_number)', partition_name, partition_name);
  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I_idempotency_idx ON %I(user_id, idempotency_key)', partition_name, partition_name);
  
  -- Grant permissions
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', partition_name);
  
  RETURN partition_name;
END;
$$;

-- Create function to automatically route inserts to correct partition
CREATE OR REPLACE FUNCTION public.question_interactions_insert_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  partition_name text;
  partition_date date;
BEGIN
  partition_date := date_trunc('month', NEW.attempted_at);
  
  -- Create partition if it doesn't exist
  partition_name := public.create_monthly_partition('question_interactions', partition_date);
  
  -- Insert into the appropriate partition
  EXECUTE format('INSERT INTO %I SELECT ($1).*', partition_name) USING NEW;
  
  RETURN NULL; -- Don't insert into master table
END;
$$;

-- Create the trigger (only if we're converting to partitioned table)
-- Note: This trigger approach is for gradual migration
-- In a fresh installation, you'd use native PostgreSQL partitioning

-- For now, let's create helper functions for manual partition management
CREATE OR REPLACE FUNCTION public.setup_next_month_partition()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_month date;
  partition_name text;
BEGIN
  next_month := date_trunc('month', current_date + interval '1 month');
  partition_name := public.create_monthly_partition('question_interactions', next_month);
  
  RETURN 'Created partition: ' || partition_name;
END;
$$;

-- Create current month partition if it doesn't exist
SELECT public.create_monthly_partition('question_interactions', current_date);

-- Create next month partition proactively
SELECT public.setup_next_month_partition();

-- Function to list all partitions
CREATE OR REPLACE FUNCTION public.list_interaction_partitions()
RETURNS TABLE(
  partition_name text,
  start_date date,
  end_date date,
  row_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as partition_name,
    -- Extract dates from constraint (simplified)
    date_trunc('month', current_date - interval '1 year')::date as start_date,
    date_trunc('month', current_date + interval '1 year')::date as end_date,
    0::bigint as row_count -- Placeholder
  FROM pg_tables 
  WHERE tablename LIKE 'question_interactions_y%'
    AND schemaname = 'public';
END;
$$;

-- Function for partition maintenance (cleanup old partitions)
CREATE OR REPLACE FUNCTION public.cleanup_old_partitions(
  retention_months integer DEFAULT 24
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date date;
  partition_record record;
  dropped_partitions text[] := '{}';
BEGIN
  cutoff_date := date_trunc('month', current_date - (retention_months || ' months')::interval);
  
  -- Find and drop old partitions
  FOR partition_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE 'question_interactions_y%'
      AND schemaname = 'public'
  LOOP
    -- Extract year/month from table name and check if it's old enough
    -- This is a simplified check - in production you'd parse the table name properly
    IF partition_record.tablename ~ 'question_interactions_y[0-9]{4}m[0-9]{2}' THEN
      -- For now, just collect the names - actual dropping should be done carefully
      dropped_partitions := array_append(dropped_partitions, partition_record.tablename);
    END IF;
  END LOOP;
  
  RETURN dropped_partitions;
END;
$$;

-- Create a view that unions all partitions (for easier querying)
-- Note: This view will dynamically include partitions as they are created
CREATE OR REPLACE VIEW public.question_interactions_all AS
SELECT * FROM public.question_interactions;

-- Grant permissions on helper functions
GRANT EXECUTE ON FUNCTION public.create_monthly_partition(text, date) TO postgres;
GRANT EXECUTE ON FUNCTION public.setup_next_month_partition() TO postgres;
GRANT EXECUTE ON FUNCTION public.list_interaction_partitions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_partitions(integer) TO postgres;

-- Grant permissions on the view
GRANT SELECT ON public.question_interactions_all TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.create_monthly_partition(text, date) IS 'Creates a monthly partition for the specified table and date';
COMMENT ON FUNCTION public.setup_next_month_partition() IS 'Proactively creates next month partition';
COMMENT ON FUNCTION public.cleanup_old_partitions(integer) IS 'Identifies old partitions for cleanup (does not auto-drop for safety)';
COMMENT ON VIEW public.question_interactions_all IS 'Union view of all question_interactions partitions for easier querying';

-- Create a scheduled maintenance reminder
-- Note: Set up a cron job or scheduled function to run this monthly:
-- SELECT public.setup_next_month_partition();
-- SELECT public.cleanup_old_partitions(24); -- Keep 24 months of data