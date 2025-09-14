-- Check all interactive solutions in the database
SELECT 
    q.public_id,
    q.content,
    q.has_interactive,
    i.solution_type,
    i.has_interactive_graph,
    i.render_payload IS NOT NULL as has_render_payload
FROM public.questions q
LEFT JOIN public.interactive_solutions i ON q.id = i.question_id
WHERE q.status = 'published'
ORDER BY q.public_id;