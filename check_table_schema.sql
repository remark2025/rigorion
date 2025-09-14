-- Check the actual table structure and data
\d public.questions
\d public.interactive_solutions

-- Check specific records
SELECT id, public_id FROM public.questions WHERE public_id = 'MATH-LINEAR-001';
SELECT id, question_id FROM public.interactive_solutions LIMIT 3;