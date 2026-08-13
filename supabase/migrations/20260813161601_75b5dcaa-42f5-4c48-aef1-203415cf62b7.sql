ALTER TABLE public.practice_configs
  ADD COLUMN IF NOT EXISTS snooze_min integer NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS public.reminder_snoozes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_key text NOT NULL,
  remind_at timestamptz NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reminder_snoozes_due_idx ON public.reminder_snoozes (remind_at) WHERE sent = false;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_snoozes TO authenticated;
GRANT ALL ON public.reminder_snoozes TO service_role;

ALTER TABLE public.reminder_snoozes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own snoozes"
  ON public.reminder_snoozes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);