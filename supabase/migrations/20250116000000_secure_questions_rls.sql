-- Security & Performance Migration for Questions System
-- Replaces service-role access with RLS + RPC pattern

-- Add timestamps for incremental sync
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.interactive_solutions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_updated_at ON public.questions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_status_updated ON public.questions(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_qid ON public.interactive_solutions(question_id);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_updated_at ON public.interactive_solutions(updated_at DESC);

-- Ensure unique constraints exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_questions_pack_number') THEN
        ALTER TABLE public.questions ADD CONSTRAINT uq_questions_pack_number UNIQUE (pack_id, question_number);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_questions_public_id') THEN
        ALTER TABLE public.questions ADD CONSTRAINT uq_questions_public_id UNIQUE (public_id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_solutions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "read_published_questions" ON public.questions;
DROP POLICY IF EXISTS "read_interactives_for_published" ON public.interactive_solutions;

-- RLS Policy: Only allow reading published questions
CREATE POLICY "read_published_questions"
ON public.questions FOR SELECT
USING (status = 'published');

-- RLS Policy: Interactive solutions only for published parent questions
CREATE POLICY "read_interactives_for_published"
ON public.interactive_solutions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.questions q
  WHERE q.id = interactive_solutions.question_id
    AND q.status = 'published'
));

-- Create slim view for question cards (excludes sensitive data)
CREATE OR REPLACE VIEW public.question_cards AS
SELECT
  q.public_id AS id,
  q.pack_id,
  q.question_number AS number,
  q.content,
  q.question_type,
  q.subject,
  q.topic,
  q.difficulty,
  q.choices,
  q.calculator_allowed,
  q.has_interactive,
  q.estimated_time,
  q.updated_at
FROM public.questions q
WHERE q.status = 'published';

-- RPC function for paginated + incremental question fetching
CREATE OR REPLACE FUNCTION public.get_question_cards(
  _pack_id UUID DEFAULT NULL,
  _since TIMESTAMPTZ DEFAULT NULL,
  _limit INT DEFAULT 500,
  _cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF public.question_cards
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM public.question_cards
  WHERE (_pack_id IS NULL OR pack_id = _pack_id)
    AND (_since IS NULL OR updated_at > _since)
    AND (_cursor IS NULL OR updated_at < _cursor)
  ORDER BY updated_at DESC
  LIMIT _limit;
$$;

-- RPC function for getting interactive solutions (lazy loaded)
CREATE OR REPLACE FUNCTION public.get_interactive_solution(
  _question_id TEXT
)
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT to_json(i.render_payload)
  FROM public.interactive_solutions i
  JOIN public.questions q ON q.id = i.question_id
  WHERE q.public_id = _question_id
    AND q.status = 'published'
  LIMIT 1;
$$;

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update timestamps
DROP TRIGGER IF EXISTS t_touch_updated_at_questions ON public.questions;
CREATE TRIGGER t_touch_updated_at_questions
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS t_touch_updated_at_interactive ON public.interactive_solutions;
CREATE TRIGGER t_touch_updated_at_interactive
  BEFORE UPDATE ON public.interactive_solutions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Sync has_interactive field automatically
CREATE OR REPLACE FUNCTION sync_has_interactive()
RETURNS TRIGGER 
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.questions q
  SET has_interactive = EXISTS (
    SELECT 1 FROM public.interactive_solutions s
    WHERE s.question_id = q.id
  )
  WHERE q.id = COALESCE(NEW.question_id, OLD.question_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS t_sync_has_interactive_insert ON public.interactive_solutions;
CREATE TRIGGER t_sync_has_interactive_insert
  AFTER INSERT ON public.interactive_solutions
  FOR EACH ROW 
  EXECUTE FUNCTION sync_has_interactive();

DROP TRIGGER IF EXISTS t_sync_has_interactive_delete ON public.interactive_solutions;
CREATE TRIGGER t_sync_has_interactive_delete
  AFTER DELETE ON public.interactive_solutions
  FOR EACH ROW 
  EXECUTE FUNCTION sync_has_interactive();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.question_cards TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_question_cards TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_interactive_solution TO anon, authenticated;