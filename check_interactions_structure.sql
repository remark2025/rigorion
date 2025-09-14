-- Check the actual structure and sample data from question_interactions
SELECT 
    user_id,
    question_public_id,
    attempted_at,
    duration_seconds,
    is_correct,
    confidence_level,
    hint_checked,
    solution_checked,
    module,
    chapter,
    level,
    topic,
    question_type
FROM public.question_interactions 
ORDER BY attempted_at DESC
LIMIT 5;

-- Also check how much data we have
SELECT 
    COUNT(*) as total_interactions,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(attempted_at) as earliest_interaction,
    MAX(attempted_at) as latest_interaction
FROM public.question_interactions;