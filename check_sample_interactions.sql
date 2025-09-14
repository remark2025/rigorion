-- Get sample interaction records to see the actual data structure
SELECT 
    user_id,
    question_public_id,
    attempted_at,
    duration_seconds,
    is_correct,
    confidence_level,
    hint_checked,
    solution_checked,
    attempt_number,
    module,
    level,
    topic
FROM public.question_interactions 
ORDER BY attempted_at DESC
LIMIT 10;