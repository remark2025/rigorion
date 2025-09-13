# AI Question Generation Guide: SAT Content Database Schema

## Overview
This guide explains how to generate SAT questions using our comprehensive database schema. The system supports rich interactive content, multimedia assets, step-by-step solutions, and advanced educational features.

## Database Schema Summary

### Core Tables Structure
```
content_packs (UUID) → questions (UUID) → solution_steps (UUID)
                    → passages (UUID)     → interactive_solutions (UUID)  
                    → graphs (UUID)       → content_tags (UUID)
                                         → learning_objectives (UUID)
```

### Key Relationships
- **Questions** belong to **Content Packs** and can reference **Passages** and **Graphs**
- **Interactive Solutions** provide rich multimedia experiences
- **Solution Steps** break down explanations into manageable parts
- **Tags** and **Learning Objectives** enable sophisticated content organization

## Essential Data Types & Enums

```sql
-- Core enums you must use
question_type: 'multiple_choice' | 'grid_in' | 'essay' | 'interactive'
subject: 'math' | 'reading' | 'writing' | 'science'  
difficulty: 'easy' | 'medium' | 'hard'
passage_type: 'fiction' | 'nonfiction' | 'poetry' | 'historical' | 'scientific' | 'persuasive'
solution_type: 'graph' | 'calculator' | 'diagram' | 'simulation' | 'step_by_step'
```

## Sample Question Structure

Here's a complete example showing all schema capabilities:

### 1. Content Pack (Container)
```sql
INSERT INTO public.content_packs (
    slug, title, description, category, subject, difficulty, status, access_level
) VALUES (
    'algebra-quadratics-2025',
    'Algebra: Quadratic Functions',
    'Comprehensive coverage of quadratic functions with interactive solutions',
    'math', 'math', 'medium', 'published', 'free'
);
```

### 2. Supporting Passage (Optional)
```sql
INSERT INTO public.passages (
    reference_id, title, content, passage_type, subject, word_count, key_concepts
) VALUES (
    'PASSAGE-PHYSICS-001',
    'Projectile Motion in Sports',
    'When a basketball player shoots the ball, the trajectory follows a parabolic path...',
    'scientific', 'math', 150, 
    ARRAY['projectile motion', 'parabolas', 'real-world applications']
);
```

### 3. Main Question
```sql
INSERT INTO public.questions (
    pack_id, question_number, public_id, content, question_type, subject, topic, difficulty,
    choices, correct_answer, solution_text, explanation, hint,
    calculator_allowed, estimated_time, key_phrases, status
) VALUES (
    pack_uuid,
    1,
    'MATH-QUAD-001',
    'A ball is thrown upward with initial velocity 64 ft/s from height 80 ft. Its height h(t) = -16t² + 64t + 80. When does it reach maximum height?',
    'multiple_choice',
    'math',
    'Quadratic Functions',
    'medium',
    '[
        {"id": "A", "text": "1 second", "explanation": "Too early - vertex formula gives t = -b/(2a)"},
        {"id": "B", "text": "2 seconds", "explanation": "Correct! t = -64/(2×-16) = 2 seconds"},
        {"id": "C", "text": "3 seconds", "explanation": "Too late - ball is falling by this time"},
        {"id": "D", "text": "4 seconds", "explanation": "Way too late - ball has hit ground"}
    ]'::jsonb,
    'B',
    'Use vertex formula t = -b/(2a) where a = -16, b = 64',
    'The vertex of a downward parabola represents the maximum point',
    'Remember: for ax² + bx + c, vertex occurs at x = -b/(2a)',
    false, 90, 
    ARRAY['vertex formula', 'maximum', 'parabola'],
    'published'
);
```

### 4. Step-by-Step Solution
```sql
-- Step 1
INSERT INTO public.solution_steps (
    question_id, step_number, title, description, step_type,
    from_expression, to_expression, explanation, estimated_time, difficulty
) VALUES (
    question_uuid, 1, 'Identify Standard Form',
    'Recognize h(t) = -16t² + 64t + 80 as ax² + bx + c',
    'concept',
    '{"latex": "h(t) = -16t^2 + 64t + 80", "display": "h(t) = -16t² + 64t + 80"}'::jsonb,
    '{"latex": "a = -16, b = 64, c = 80", "display": "a = -16, b = 64, c = 80"}'::jsonb,
    'Identifying coefficients is the first step in finding the vertex',
    20, 'easy'
);

-- Step 2  
INSERT INTO public.solution_steps (
    question_id, step_number, title, description, step_type,
    from_expression, to_expression, explanation, estimated_time, difficulty
) VALUES (
    question_uuid, 2, 'Apply Vertex Formula',
    'Calculate t = -b/(2a) to find vertex time',
    'calculation',
    '{"latex": "t = -\\frac{b}{2a}", "display": "t = -b/(2a)"}'::jsonb,
    '{"latex": "t = -\\frac{64}{2(-16)} = 2", "display": "t = -64/(2×-16) = 2"}'::jsonb,
    'The vertex formula directly gives us the time of maximum height',
    30, 'medium'
);
```

### 5. Interactive Solution (Advanced)
```sql
INSERT INTO public.interactive_solutions (
    question_id, solution_type, has_interactive_graph, 
    graph_config, parameters, interactive_steps, calculator_type
) VALUES (
    question_uuid, 'graph', true,
    '{"type": "quadratic", "xRange": [0, 5], "yRange": [0, 150], "showGrid": true}'::jsonb,
    '[{"name": "v0", "label": "Initial velocity", "value": 64, "min": 20, "max": 100}]'::jsonb,
    '[{"id": "explore", "title": "Drag the vertex", "type": "interaction"}]'::jsonb,
    'basic'
);
```

### 6. Tags & Learning Objectives
```sql
-- Add educational tags
INSERT INTO public.content_tag_assignments (content_type, content_id, tag_id) 
SELECT 'question', question_uuid, id FROM public.content_tags 
WHERE name IN ('vertex-formula', 'quadratic-functions', 'optimization');

-- Link to learning standards
INSERT INTO public.content_learning_objectives (content_type, content_id, objective_id)
SELECT 'question', question_uuid, id FROM public.learning_objectives 
WHERE code = 'ALG.F.IF.7a';
```

## AI Generation Guidelines

### For Mathematics Questions:
1. **Always include** proper mathematical notation in LaTeX format
2. **Provide multiple solution paths** via solution_steps table
3. **Add interactive elements** for complex concepts (graphs, sliders, animations)
4. **Include real-world context** when possible via passages
5. **Tag with specific skills** (vertex-formula, factoring, etc.)

### For Reading Questions:
1. **Create rich passages** with proper metadata (word_count, reading_level)
2. **Include key_concepts** array for passage analysis
3. **Add vocabulary support** in JSONB fields for difficult terms
4. **Use passage_type** to categorize content appropriately
5. **Link multiple questions** to same passage via question_passages table

### For Writing Prompts:
1. **Provide comprehensive rubrics** in JSONB format
2. **Include planning templates** to guide student thinking
3. **Add sample responses** with score explanations
4. **Set appropriate time_limits** and word_count ranges
5. **Link to source passages** when argument/analysis based

### Interactive Features:
1. **Graph-based solutions**: Use graph_config with parameters for student manipulation
2. **Step-by-step progression**: Break complex solutions into digestible steps
3. **Assessment checkpoints**: Add mini-questions within solution steps
4. **Multimedia integration**: Reference graphs, images, videos via multimedia_assets
5. **Performance tracking**: The system automatically logs interaction data

## Required Fields Checklist

### Every Question Must Have:
- ✅ `pack_id` (reference to content pack)
- ✅ `question_number` (sequential within pack)
- ✅ `public_id` (human-readable like "MATH-ALG-001")
- ✅ `content` (the actual question text)
- ✅ `question_type` (multiple_choice, grid_in, etc.)
- ✅ `subject` (math, reading, writing, science)
- ✅ `difficulty` (easy, medium, hard)
- ✅ `choices` (for multiple choice - JSONB array with explanations)
- ✅ `correct_answer` (the right answer)
- ✅ `solution_text` (basic explanation)
- ✅ `status` ('published' for live questions)

### Recommended Fields:
- ✅ `topic` and `subtopic` for precise categorization
- ✅ `explanation` and `hint` for student support
- ✅ `estimated_time` in seconds (90s = 1.5 minutes typical)
- ✅ `key_phrases` array for search optimization
- ✅ `calculator_allowed` boolean
- ✅ `passage_id` if question references reading material
- ✅ `primary_graph_id` if visual element required

## Advanced Features

### 1. Multi-Passage Questions
Link multiple passages to one question for comparative analysis:
```sql
INSERT INTO public.question_passages (question_id, passage_id, role, sequence_order)
VALUES (question_uuid, passage1_uuid, 'primary', 1),
       (question_uuid, passage2_uuid, 'contrast', 2);
```

### 2. Adaptive Difficulty
Use success_rate and discrimination_index for automatic difficulty adjustment:
```sql
UPDATE public.questions 
SET success_rate = 75.5, discrimination_index = 0.42 
WHERE id = question_uuid;
```

### 3. AI-Generated Content Tracking
Mark AI-generated content for quality monitoring:
```sql
INSERT INTO public.ai_generated_content (
    content_type, content_id, ai_model_name, model_version, 
    confidence_score, requires_review
) VALUES ('question', question_uuid, 'gpt-4', '2024.1', 0.89, true);
```

### 4. Content Versioning
Create versions for A/B testing:
```sql
SELECT public.create_question_version(question_uuid, 'Simplified language for accessibility', 'minor');
```

### 5. Search Optimization
The system automatically creates search vectors, but you can optimize by:
- Including rich `key_phrases` arrays
- Writing descriptive `topic` and `subtopic` fields
- Using consistent terminology in explanations

## Data Validation Rules

### Automatic Validations:
- ✅ UUIDs for all primary keys
- ✅ Foreign key constraints prevent orphaned data
- ✅ Check constraints ensure valid enums
- ✅ JSONB structure validation for complex fields
- ✅ Search vectors automatically generated and indexed

### Content Quality Rules:
- ✅ Multiple choice questions must have 2+ choices with explanations
- ✅ Correct answers must match one of the provided choices
- ✅ Step-by-step solutions should have logical progression
- ✅ Interactive solutions require proper configuration JSON
- ✅ All mathematical expressions should include both LaTeX and display versions

## Performance Considerations

### Optimized Query Patterns:
1. **Questions by pack**: Use `idx_questions_pack_id_number`
2. **Content filtering**: Use `idx_questions_subject_topic_difficulty`  
3. **Search queries**: Use full-text search functions with GIN indexes
4. **Interactive content**: Use `has_interactive` flag for fast filtering
5. **Analytics**: Use materialized views for aggregate statistics

### Best Practices:
- ✅ Always query by pack_id first for sequential question delivery
- ✅ Use the `is_active` flag for published content only
- ✅ Leverage render_payload for frontend efficiency
- ✅ Cache interactive solutions client-side when possible
- ✅ Use search analytics to improve content discoverability

## Error Handling

### Common Issues:
1. **Missing pack reference**: Always create content_pack first
2. **Invalid enum values**: Use only predefined enum options
3. **JSONB structure errors**: Validate JSON before inserting
4. **Foreign key violations**: Ensure referenced content exists
5. **Duplicate public_ids**: Use unique identifiers across the system

### Debugging Queries:
```sql
-- Check question completeness
SELECT q.public_id, q.status, 
       CASE WHEN ss.question_id IS NULL THEN 'Missing solution steps' END,
       CASE WHEN is_sol.question_id IS NULL THEN 'No interactive solution' END
FROM public.questions q
LEFT JOIN public.solution_steps ss ON ss.question_id = q.id
LEFT JOIN public.interactive_solutions is_sol ON is_sol.question_id = q.id;

-- Validate content relationships
SELECT q.public_id, cp.title, p.title, g.title
FROM public.questions q
JOIN public.content_packs cp ON cp.id = q.pack_id
LEFT JOIN public.passages p ON p.id = q.passage_id
LEFT JOIN public.graphs g ON g.id = q.primary_graph_id;
```

## Integration with Frontend

### Unified API Response:
The `render_payload` field provides everything the frontend needs:
```json
{
  "solution_id": "uuid",
  "question_id": "uuid", 
  "type": "graph",
  "config": {
    "graph": {...},
    "parameters": [...],
    "calculator_type": "basic"
  },
  "interactive_steps": [...],
  "assessment_points": [...],
  "multimedia_assets": [...],
  "accessibility": {...},
  "question_context": {...}
}
```

### Progressive Loading:
1. Load question basic data first
2. Fetch render_payload for interactive features
3. Stream multimedia assets as needed
4. Cache solutions for offline use

This schema provides the foundation for creating world-class SAT content with rich interactivity, comprehensive analytics, and AI-enhanced features. The system is designed to scale to thousands of questions while maintaining sub-100ms query performance.