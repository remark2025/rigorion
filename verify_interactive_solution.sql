-- Check the exact interactive solution data for MATH-LINEAR-001
SELECT 
    q.public_id,
    q.has_interactive,
    i.solution_type,
    i.has_interactive_graph,
    i.graph_config,
    i.parameters,
    i.interactive_steps,
    i.assessment_points,
    i.render_payload
FROM public.questions q
LEFT JOIN public.interactive_solutions i ON q.id = i.question_id
WHERE q.public_id = 'MATH-LINEAR-001';