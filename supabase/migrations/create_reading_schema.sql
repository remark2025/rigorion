-- Reading Schema: Passages with Perspectives, Simplified Viewer, and Idea Tracer
-- This creates the proper structure for SAT reading comprehension

-- 1. Reading Passages Table
CREATE TABLE IF NOT EXISTS public.reading_passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id text UNIQUE NOT NULL, -- e.g., "PASSAGE-001"
  title text NOT NULL,
  source text NOT NULL, -- e.g., "From 'The Great Gatsby' by F. Scott Fitzgerald (1925)"
  genre text NOT NULL, -- literature, history, science, social_studies
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'difficult')),
  word_count integer NOT NULL,
  passage_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Passage Perspectives Table (structured perspectives)
CREATE TABLE IF NOT EXISTS public.passage_perspectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id uuid REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  perspective_type text NOT NULL CHECK (perspective_type IN (
    'author_perspective', 'literary_analysis', 'historical_context', 
    'thematic_interpretation', 'rhetorical_analysis', 'cultural_significance'
  )),
  perspective_title text NOT NULL,
  perspective_content text NOT NULL,
  key_quotes text[], -- Array of relevant quotes from the passage
  analysis_points text[], -- Bullet points of key insights
  created_at timestamptz DEFAULT now()
);

-- 3. Simplified Viewer Components
CREATE TABLE IF NOT EXISTS public.passage_simplified_view (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id uuid REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  simplified_text text NOT NULL, -- Easier vocabulary version
  key_terms jsonb NOT NULL, -- {"difficult_word": "simple_definition"}
  main_ideas text[] NOT NULL, -- Array of core concepts
  structure_outline text NOT NULL, -- Paragraph-by-paragraph breakdown
  reading_tips text[], -- Specific tips for this passage
  created_at timestamptz DEFAULT now()
);

-- 4. Idea Tracer (concept mapping)
CREATE TABLE IF NOT EXISTS public.passage_idea_tracer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id uuid REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  concept_map jsonb NOT NULL, -- Visual concept relationships
  theme_progression jsonb NOT NULL, -- How themes develop through passage
  argument_structure jsonb NOT NULL, -- Logical flow of arguments
  evidence_tracking jsonb NOT NULL, -- How evidence supports claims
  created_at timestamptz DEFAULT now()
);

-- 5. Questions linked to passages
CREATE TABLE IF NOT EXISTS public.passage_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id uuid REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  question_order integer NOT NULL, -- Order within the passage set
  question_focus text NOT NULL, -- main_idea, detail, inference, vocabulary, etc.
  created_at timestamptz DEFAULT now(),
  UNIQUE(passage_id, question_order)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reading_passages_genre ON public.reading_passages(genre);
CREATE INDEX IF NOT EXISTS idx_reading_passages_difficulty ON public.reading_passages(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_passage_perspectives_type ON public.passage_perspectives(perspective_type);
CREATE INDEX IF NOT EXISTS idx_passage_questions_passage ON public.passage_questions(passage_id, question_order);

-- Grant permissions
GRANT SELECT ON public.reading_passages TO authenticated;
GRANT SELECT ON public.passage_perspectives TO authenticated;
GRANT SELECT ON public.passage_simplified_view TO authenticated;
GRANT SELECT ON public.passage_idea_tracer TO authenticated;
GRANT SELECT ON public.passage_questions TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.reading_passages IS 'Core reading passages for SAT practice';
COMMENT ON TABLE public.passage_perspectives IS 'Multiple analytical perspectives for each passage';
COMMENT ON TABLE public.passage_simplified_view IS 'Simplified versions and comprehension aids';
COMMENT ON TABLE public.passage_idea_tracer IS 'Concept mapping and idea flow tracking';
COMMENT ON TABLE public.passage_questions IS 'Questions associated with each passage';

COMMENT ON COLUMN public.passage_perspectives.key_quotes IS 'Relevant quotes that support this perspective';
COMMENT ON COLUMN public.passage_simplified_view.key_terms IS 'Difficult vocabulary with simple definitions';
COMMENT ON COLUMN public.passage_idea_tracer.concept_map IS 'Visual representation of concept relationships';
COMMENT ON COLUMN public.passage_idea_tracer.theme_progression IS 'How themes develop paragraph by paragraph';

-- Success message
SELECT 'Reading schema with passages, perspectives, simplified viewer, and idea tracer created successfully!' as result;