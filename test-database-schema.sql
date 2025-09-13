-- ============================================
-- Database Schema Test Suite
-- Run this in Supabase SQL Editor to verify everything works
-- ============================================

-- Test 1: Check all new tables exist
SELECT 'Testing table existence...' as test_step;

SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'content_packs', 'questions', 'passages', 'graphs', 
    'solution_steps', 'interactive_solutions', 'content_tags',
    'learning_objectives', 'writing_prompts'
  )
ORDER BY tablename;

-- Test 2: Check enums are created
SELECT 'Testing enums...' as test_step;

SELECT 
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('subject', 'difficulty', 'question_type', 'passage_type', 'content_status')
GROUP BY t.typname
ORDER BY t.typname;

-- Test 3: Insert a simple test content pack
INSERT INTO public.content_packs (
  slug, title, description, category, subject, difficulty, 
  status, access_level, question_count
) VALUES (
  'test-pack-001',
  'Test Content Pack',
  'A test pack to verify the schema works',
  'math', 'math', 'easy',
  'published', 'free', 0
) 
ON CONFLICT (slug) DO UPDATE SET 
  updated_at = now()
RETURNING id, slug, title;

-- Test 4: Insert a test question
WITH test_pack AS (
  SELECT id FROM public.content_packs WHERE slug = 'test-pack-001'
)
INSERT INTO public.questions (
  pack_id, question_number, public_id, content, question_type,
  subject, difficulty, choices, correct_answer, 
  solution_text, status
)
SELECT 
  tp.id,
  1,
  'TEST-QUESTION-001',
  'What is 2 + 2?',
  'multiple_choice',
  'math',
  'easy',
  '[
    {"id": "A", "text": "3", "explanation": "Incorrect"},
    {"id": "B", "text": "4", "explanation": "Correct! 2 + 2 = 4"},
    {"id": "C", "text": "5", "explanation": "Incorrect"}
  ]'::jsonb,
  'B',
  'Simple addition: 2 + 2 = 4',
  'published'
FROM test_pack tp
ON CONFLICT (public_id) DO UPDATE SET 
  updated_at = now()
RETURNING id, public_id, content;

-- Test 5: Insert test solution steps
WITH test_question AS (
  SELECT id FROM public.questions WHERE public_id = 'TEST-QUESTION-001'
)
INSERT INTO public.solution_steps (
  question_id, step_number, title, description, step_type,
  explanation, estimated_time, difficulty
)
SELECT 
  tq.id,
  1,
  'Add the numbers',
  'Simply add 2 + 2',
  'calculation',
  'Basic addition operation',
  10,
  'easy'
FROM test_question tq
ON CONFLICT (question_id, step_number) DO UPDATE SET
  updated_at = now()
RETURNING id, title;

-- Test 6: Test interactive solution
WITH test_question AS (
  SELECT id FROM public.questions WHERE public_id = 'TEST-QUESTION-001'
)
INSERT INTO public.interactive_solutions (
  question_id, solution_type, has_interactive_graph,
  parameters, version
)
SELECT 
  tq.id,
  'step_by_step',
  false,
  '[{"name": "test", "value": 1}]'::jsonb,
  '1.0.0'
FROM test_question tq
ON CONFLICT (question_id) DO UPDATE SET
  updated_at = now()
RETURNING id, solution_type;

-- Test 7: Update has_interactive flag (should be automatic via trigger)
UPDATE public.questions 
SET updated_at = now() 
WHERE public_id = 'TEST-QUESTION-001';

-- Test 8: Verify the complete test data structure
SELECT 'Final verification...' as test_step;

SELECT 
  cp.title as pack_title,
  q.public_id,
  q.content as question_text,
  q.difficulty,
  q.has_interactive,
  COUNT(ss.id) as solution_steps_count,
  CASE WHEN isol.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_interactive_solution
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
LEFT JOIN public.solution_steps ss ON ss.question_id = q.id
LEFT JOIN public.interactive_solutions isol ON isol.question_id = q.id
WHERE q.public_id = 'TEST-QUESTION-001'
GROUP BY cp.title, q.public_id, q.content, q.difficulty, q.has_interactive, isol.id;

-- Test 9: Test search functionality (if search migration was applied)
SELECT 'Testing search...' as test_step;

SELECT 
  content_type,
  title,
  rank,
  highlight
FROM public.search_content('test addition', ARRAY['question'], 'math', 'easy', 5, 0)
LIMIT 3;

-- Test 10: Clean up test data
DELETE FROM public.interactive_solutions 
WHERE question_id IN (SELECT id FROM public.questions WHERE public_id = 'TEST-QUESTION-001');

DELETE FROM public.solution_steps 
WHERE question_id IN (SELECT id FROM public.questions WHERE public_id = 'TEST-QUESTION-001');

DELETE FROM public.questions WHERE public_id = 'TEST-QUESTION-001';
DELETE FROM public.content_packs WHERE slug = 'test-pack-001';

SELECT '✅ Database schema test completed successfully!' as result;