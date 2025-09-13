-- Test RLS access to questions table
-- Run this in Supabase SQL Editor to check if data exists and is accessible

-- 1. Test direct data access (bypass RLS)
SELECT 
  'Direct data access test' as test_type,
  count(*) as total_questions
FROM public.questions;

-- 2. Check if our sample question exists
SELECT 
  'Sample question test' as test_type,
  public_id,
  left(content, 100) as content_preview,
  has_interactive,
  status
FROM public.questions 
WHERE public_id = 'MATH-ALG-QUAD-001';

-- 3. Check RLS policies on questions table
SELECT 
  'RLS policies' as test_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'questions';

-- 3b. Check if RLS is enabled on tables
SELECT 
  'RLS status' as test_type,
  schemaname,
  tablename,
  CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname IN ('questions', 'content_packs', 'interactive_solutions');

-- 4. Test what anonymous user can see (simulate frontend access)
SET ROLE anon;
SELECT 
  'Anonymous access test' as test_type,
  count(*) as visible_questions
FROM public.questions;
RESET ROLE;

-- 5. Check current user context
SELECT 
  'Current user context' as test_type,
  current_user,
  session_user,
  current_setting('role', true) as current_role;