
-- Extensões necessárias para o cron job interno
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Tabela que mantém SEMPRE apenas 1 registro do dia atual
CREATE TABLE IF NOT EXISTS public.daily_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_day date NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_checks TO authenticated;
GRANT ALL ON public.daily_checks TO service_role;

ALTER TABLE public.daily_checks ENABLE ROW LEVEL SECURITY;

-- Leitura liberada para usuários autenticados; escrita apenas via service_role (edge function)
CREATE POLICY "Authenticated can read daily_checks"
  ON public.daily_checks
  FOR SELECT
  TO authenticated
  USING (true);
