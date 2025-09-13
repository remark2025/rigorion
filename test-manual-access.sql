-- Manual test: Create a simple function to access our question data
-- This bypasses PostgREST's table cache issue

CREATE OR REPLACE FUNCTION public.get_sample_question()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'public_id', q.public_id,
    'content', q.content,
    'difficulty', q.difficulty,
    'has_interactive', q.has_interactive,
    'status', q.status,
    'choices', q.choices,
    'correct_answer', q.correct_answer,
    'solution_text', q.solution_text,
    'explanation', q.explanation,
    'hint', q.hint,
    'estimated_time', q.estimated_time,
    'calculator_allowed', q.calculator_allowed,
    'created_at', q.created_at,
    'content_pack', json_build_object(
      'title', cp.title,
      'slug', cp.slug
    ),
    'interactive_solution', COALESCE(
      json_build_object(
        'solution_type', isol.solution_type,
        'has_interactive_graph', isol.has_interactive_graph,
        'render_payload', isol.render_payload
      ), null
    ),
    'solution_steps', COALESCE(
      json_agg(
        json_build_object(
          'step_number', ss.step_number,
          'title', ss.title,
          'description', ss.description,
          'explanation', ss.explanation
        ) ORDER BY ss.step_number
      ) FILTER (WHERE ss.id IS NOT NULL),
      '[]'::json
    )
  )
  FROM public.questions q
  JOIN public.content_packs cp ON cp.id = q.pack_id
  LEFT JOIN public.interactive_solutions isol ON isol.question_id = q.id
  LEFT JOIN public.solution_steps ss ON ss.question_id = q.id
  WHERE q.public_id = 'MATH-ALG-QUAD-001'
  GROUP BY q.id, cp.id, isol.id;
$$;

-- Test the function
SELECT public.get_sample_question();

-- Grant access to anonymous users
GRANT EXECUTE ON FUNCTION public.get_sample_question() TO anon;
GRANT EXECUTE ON FUNCTION public.get_sample_question() TO authenticated;