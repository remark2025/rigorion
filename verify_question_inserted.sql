-- Check if MATH-LINEAR-001 was inserted correctly
SELECT 
    q.public_id,
    q.content,
    q.has_interactive,
    q.status,
    i.solution_type,
    i.has_interactive_graph,
    jsonb_pretty(i.render_payload) as render_payload
FROM public.questions q
LEFT JOIN public.interactive_solutions i ON q.id = i.question_id
WHERE q.public_id = 'MATH-LINEAR-001';

-- Also check if it's being returned by our function
SELECT public_id, content, has_interactive 
FROM get_sample_question();