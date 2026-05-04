ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS practices_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS routine jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS routine_done text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gratitude_text text NOT NULL DEFAULT '';