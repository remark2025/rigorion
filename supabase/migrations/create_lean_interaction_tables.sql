-- Minimal questions stub (only for mapping external codes later if you want)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.question_interactions (
  user_id               uuid      NOT NULL,
  question_public_id    text      NOT NULL,               -- e.g., "MATH-001" from your packs
  attempt_number        smallint  NOT NULL DEFAULT 1,
  attempted_at          timestamptz NOT NULL DEFAULT now(),
  duration_seconds      integer   NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  is_correct            boolean,
  confidence_level      smallint  CHECK (confidence_level BETWEEN 1 AND 5),
  hint_checked          boolean   NOT NULL DEFAULT false,
  solution_checked      boolean   NOT NULL DEFAULT false,
  objective_progress    smallint  CHECK (objective_progress BETWEEN 0 AND 100),  -- Added for current tracking
  idempotency_key       uuid      NOT NULL,               -- for exactly-once writes
  created_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_public_id, attempt_number)
);

-- Prevent duplicate processing of the same client request
CREATE UNIQUE INDEX IF NOT EXISTS uq_qi_idem ON public.question_interactions (user_id, idempotency_key);

CREATE INDEX IF NOT EXISTS qx_user_created_idx   ON public.question_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS qx_user_attempted_idx ON public.question_interactions(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS qx_question_idx       ON public.question_interactions(question_public_id);

-- Bookmarks (derived "bookmarked" = existence in this table)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id     uuid NOT NULL,
  question_public_id text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_public_id)
);

CREATE INDEX IF NOT EXISTS bm_user_idx     ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bm_question_idx ON public.bookmarks(question_public_id);

-- RLS
ALTER TABLE public.question_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks            ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qi read"   ON public.question_interactions;
DROP POLICY IF EXISTS "qi insert" ON public.question_interactions;
DROP POLICY IF EXISTS "qi update" ON public.question_interactions;
CREATE POLICY "qi read"   ON public.question_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "qi insert" ON public.question_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qi update" ON public.question_interactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bm read"   ON public.bookmarks;
DROP POLICY IF EXISTS "bm insert" ON public.bookmarks;
DROP POLICY IF EXISTS "bm delete" ON public.bookmarks;
CREATE POLICY "bm read"   ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bm insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);