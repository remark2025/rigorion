-- Diagnostic queries to run in Supabase SQL Editor
-- Run these one by one to understand the current state

-- 1. List all tables in public schema
SELECT 'All tables in public schema:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if our specific tables exist
SELECT 'Checking for our new tables:' as info;
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') 
       THEN '✅ questions table exists' 
       ELSE '❌ questions table missing' END as questions_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_packs') 
       THEN '✅ content_packs table exists' 
       ELSE '❌ content_packs table missing' END as content_packs_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interactive_solutions') 
       THEN '✅ interactive_solutions table exists' 
       ELSE '❌ interactive_solutions table missing' END as interactive_status;

-- 3. Check for our sample data (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
    PERFORM 1; -- Table exists, we can query it in next step
  ELSE
    RAISE NOTICE '⚠️ Tables do not exist - migrations need to be applied first';
  END IF;
END$$;

-- 4. If questions table exists, check for sample data
SELECT 'Sample question data:' as info;
-- This will only run if the table exists
SELECT 
  public_id,
  left(content, 100) as content_preview,
  has_interactive,
  difficulty
FROM public.questions 
WHERE public_id = 'MATH-ALG-QUAD-001'
LIMIT 1;