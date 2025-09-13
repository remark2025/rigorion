-- Verify our sample question exists and is accessible
SELECT 
  'Question count check' as test,
  count(*) as total_questions
FROM public.questions;

SELECT 
  'Sample question check' as test,
  public_id,
  left(content, 80) as content_preview,
  status,
  has_interactive
FROM public.questions 
WHERE public_id = 'MATH-ALG-QUAD-001';

SELECT 
  'Published questions check' as test,
  count(*) as published_count
FROM public.questions 
WHERE status = 'published';

SELECT 
  'All questions preview' as test,
  public_id,
  left(content, 50) as preview,
  status
FROM public.questions 
ORDER BY created_at DESC;