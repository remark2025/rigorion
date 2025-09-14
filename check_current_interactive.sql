-- Check current render_payload status
SELECT 
    q.public_id,
    i.render_payload IS NOT NULL as has_render_payload,
    CASE 
        WHEN i.render_payload IS NOT NULL THEN 'Has render_payload'
        ELSE 'render_payload is NULL'
    END as status
FROM public.questions q
LEFT JOIN public.interactive_solutions i ON q.id = i.question_id
WHERE q.public_id = 'MATH-LINEAR-001';