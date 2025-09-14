-- Debug the JOIN relationship between questions and interactive_solutions
SELECT 
    q.id as question_uuid,
    q.public_id,
    i.id as interactive_solution_id,
    i.question_id
FROM public.questions q
LEFT JOIN public.interactive_solutions i ON q.id = i.question_id
WHERE q.public_id IN ('MATH-LINEAR-001', 'MATH-ALG-QUAD-001');