-- Verification Script: Check Sample Questions and Filter Data
-- Run this after adding sample questions to verify everything is set up correctly

-- 1. Verify question counts by module
SELECT 
  module,
  level,
  COUNT(*) as question_count,
  COUNT(DISTINCT topic) as unique_topics
FROM public.questions 
WHERE status = 'published'
GROUP BY module, level
ORDER BY module, level;

-- 2. Verify step builder questions have interactive solutions
SELECT 
  q.public_id,
  q.question_text,
  q.level,
  q.topic,
  CASE WHEN is_sol.question_id IS NOT NULL THEN 'Has Step Builder' ELSE 'No Step Builder' END as step_builder_status
FROM public.questions q
LEFT JOIN public.interactive_solutions is_sol ON q.id = is_sol.question_id
WHERE q.module = 'math' AND q.status = 'published'
ORDER BY q.public_id;

-- 3. Verify reading questions have multiple perspectives  
SELECT 
  q.public_id,
  q.question_text,
  COUNT(qp.id) as perspective_count,
  STRING_AGG(qp.perspective_type, ', ') as perspective_types
FROM public.questions q
LEFT JOIN public.question_perspectives qp ON q.id = qp.question_id
WHERE q.module = 'reading' AND q.status = 'published'
GROUP BY q.id, q.public_id, q.question_text
ORDER BY q.public_id;

-- 4. Check filter options available
SELECT 
  'Module' as filter_type,
  module as filter_value,
  COUNT(*) as question_count
FROM public.questions 
WHERE status = 'published'
GROUP BY module

UNION ALL

SELECT 
  'Level' as filter_type,
  level as filter_value,
  COUNT(*) as question_count
FROM public.questions 
WHERE status = 'published'
GROUP BY level

UNION ALL

SELECT 
  'Question Type' as filter_type,
  question_type as filter_value,
  COUNT(*) as question_count
FROM public.questions 
WHERE status = 'published'
GROUP BY question_type

ORDER BY filter_type, filter_value;

-- 5. Verify pack assignments
SELECT 
  cp.name as pack_name,
  cp.is_free,
  COUNT(q.id) as question_count,
  STRING_AGG(DISTINCT q.level, ', ') as difficulty_levels
FROM public.content_packs cp
LEFT JOIN public.questions q ON cp.id = q.pack_id
GROUP BY cp.id, cp.name, cp.is_free
ORDER BY cp.name;

-- 6. Sample query for practice page filters (what the frontend should use)
-- Example: Get math questions, medium difficulty, algebra topic
SELECT 
  q.public_id,
  q.question_text,
  q.level,
  q.topic,
  q.choice_a,
  q.choice_b, 
  q.choice_c,
  q.choice_d,
  q.correct_answer,
  CASE WHEN is_sol.question_id IS NOT NULL THEN true ELSE false END as has_step_builder
FROM public.questions q
LEFT JOIN public.interactive_solutions is_sol ON q.id = is_sol.question_id
WHERE q.status = 'published'
  AND q.module = 'math'
  AND q.level = 'medium'
  AND q.topic ILIKE '%algebra%'
ORDER BY q.question_number;

-- 7. Sample query for mock test (mixed questions)
-- Example: Get 10 questions for a mini mock test
SELECT 
  q.public_id,
  q.question_text,
  q.level,
  q.module,
  q.topic,
  q.choice_a,
  q.choice_b,
  q.choice_c, 
  q.choice_d,
  q.correct_answer
FROM public.questions q
WHERE q.status = 'published'
ORDER BY RANDOM()
LIMIT 10;

-- 8. Check for any missing data or issues
SELECT 
  'Missing Explanations' as issue_type,
  COUNT(*) as count
FROM public.questions 
WHERE (explanation IS NULL OR explanation = '') AND status = 'published'

UNION ALL

SELECT 
  'Missing Topics' as issue_type,
  COUNT(*) as count
FROM public.questions 
WHERE (topic IS NULL OR topic = '') AND status = 'published'

UNION ALL

SELECT 
  'Invalid Choice Format' as issue_type,
  COUNT(*) as count
FROM public.questions 
WHERE status = 'published' 
  AND question_type = 'multiple_choice'
  AND (choice_a IS NULL OR choice_b IS NULL OR choice_c IS NULL OR choice_d IS NULL);

-- Success message
SELECT 'Question data verification completed!' as result;