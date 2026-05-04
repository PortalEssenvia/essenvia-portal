-- Drop old tables
DROP TABLE IF EXISTS public.daily_records CASCADE;
DROP TABLE IF EXISTS public.user_state CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old trigger/function if exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','essenvia','premium')),
  current_phase TEXT NOT NULL DEFAULT 'despertar' CHECK (current_phase IN ('despertar','libertar','reprogramar','sustentar')),
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.practice_configs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practice_key  TEXT NOT NULL CHECK (practice_key IN ('oracao','meditacao','afirmacao','leitura','gratidao','visualizacao','atividade_fisica','diario')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  start_time    TIME,
  end_time      TIME,
  week_days     INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, practice_key)
);

CREATE TABLE public.daily_practice_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practice_key  TEXT NOT NULL,
  log_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, practice_key, log_date)
);

CREATE TABLE public.streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.prayers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Minha Oração',
  content     TEXT NOT NULL,
  is_heart_prayer BOOLEAN NOT NULL DEFAULT FALSE,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.affirmations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.gratitudes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.gratitude_daily_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  content     TEXT NOT NULL,
  mood_score  INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE public.physical_activities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '🏃',
  duration_min INTEGER NOT NULL DEFAULT 30,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.meditations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'guiada' CHECK (type IN ('guiada','silenciosa','respiracao','mantra')),
  duration_min INTEGER NOT NULL DEFAULT 10,
  instructions TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.readings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  author       TEXT,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages  INTEGER,
  status       TEXT NOT NULL DEFAULT 'queue' CHECK (status IN ('reading','queue','completed')),
  started_at   DATE,
  completed_at DATE,
  notes        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.visualizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.diary_entries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  content             TEXT,
  mood_score          INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  biggest_challenge   TEXT,
  biggest_achievement TEXT,
  could_do_better     TEXT,
  best_moment         TEXT,
  lesson_learned      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE TABLE public.routine_activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'pessoal' CHECK (category IN ('espiritual','mental','fisico','intelectual','profissional','alimentacao','descanso','pessoal')),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  notes           TEXT,
  repeat_type     TEXT NOT NULL DEFAULT 'daily' CHECK (repeat_type IN ('daily','specific_days','once')),
  repeat_days     INTEGER[],
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  linked_practice TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.routine_daily_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_activity_id UUID NOT NULL REFERENCES public.routine_activities(id) ON DELETE CASCADE,
  log_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, routine_activity_id, log_date)
);

CREATE TABLE public.media_files (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('meditation','physical_activity','reading','visualization','prayer')),
  entity_id    UUID NOT NULL,
  file_name    TEXT NOT NULL,
  file_type    TEXT NOT NULL CHECK (file_type IN ('audio','video','image')),
  storage_path TEXT NOT NULL,
  public_url   TEXT,
  file_size    BIGINT,
  mime_type    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_daily_logs_user_date     ON public.daily_practice_logs(user_id, log_date);
CREATE INDEX idx_diary_user_date          ON public.diary_entries(user_id, entry_date);
CREATE INDEX idx_routine_logs_user_date   ON public.routine_daily_logs(user_id, log_date);
CREATE INDEX idx_media_entity             ON public.media_files(entity_type, entity_id);
CREATE INDEX idx_prayers_user             ON public.prayers(user_id);
CREATE INDEX idx_affirmations_user        ON public.affirmations(user_id);
CREATE INDEX idx_gratitudes_user          ON public.gratitudes(user_id);
CREATE INDEX idx_readings_user_status     ON public.readings(user_id, status);
CREATE INDEX idx_routine_user             ON public.routine_activities(user_id);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_practice_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affirmations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitudes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_daily_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_daily_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files           ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES (granular per command)
-- ============================================
-- profiles uses id = auth.uid()
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- macro for user_id-based tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'practice_configs','daily_practice_logs','streaks','prayers','affirmations',
    'gratitudes','gratitude_daily_logs','physical_activities','meditations',
    'readings','visualizations','diary_entries','routine_activities',
    'routine_daily_logs','media_files'
  ] LOOP
    EXECUTE format('CREATE POLICY "%I_select" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "%I_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "%I_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "%I_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t, t);
  END LOOP;
END $$;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','practice_configs','prayers','affirmations','gratitudes',
    'physical_activities','meditations','readings','visualizations',
    'diary_entries','routine_activities'
  ] LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.streaks (user_id) VALUES (NEW.id);

  INSERT INTO public.practice_configs (user_id, practice_key, sort_order) VALUES
    (NEW.id, 'oracao', 1),
    (NEW.id, 'meditacao', 2),
    (NEW.id, 'afirmacao', 3),
    (NEW.id, 'leitura', 4),
    (NEW.id, 'gratidao', 5),
    (NEW.id, 'visualizacao', 6),
    (NEW.id, 'atividade_fisica', 7),
    (NEW.id, 'diario', 8);

  INSERT INTO public.affirmations (user_id, content, sort_order) VALUES
    (NEW.id, 'Eu sou capaz de superar qualquer desafio.', 1),
    (NEW.id, 'Eu mereço amor, paz e abundância.', 2),
    (NEW.id, 'Cada dia eu me torno uma versão melhor de mim.', 3),
    (NEW.id, 'Eu tenho força, foco e determinação.', 4),
    (NEW.id, 'Sou grato pela vida que tenho e pela que estou construindo.', 5);

  INSERT INTO public.gratitudes (user_id, content, sort_order) VALUES
    (NEW.id, 'Pela saúde que tenho.', 1),
    (NEW.id, 'Pela família que me apoia.', 2),
    (NEW.id, 'Por ter um lar e comida na mesa.', 3),
    (NEW.id, 'Pela capacidade de recomeçar.', 4),
    (NEW.id, 'Por este novo dia e suas possibilidades.', 5);

  INSERT INTO public.prayers (user_id, title, content, is_default) VALUES
    (NEW.id, 'Oração da Manhã',
     'Senhor, obrigado por mais um dia. Guia meus passos, ilumina minha mente e protege minha família. Que eu seja instrumento do bem hoje.',
     TRUE);

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_active_count INTEGER;
  v_done_count INTEGER;
  v_current INTEGER;
  v_longest INTEGER;
  v_last DATE;
BEGIN
  SELECT COUNT(*) INTO v_active_count FROM public.practice_configs
    WHERE user_id = p_user_id AND is_active = TRUE;

  SELECT COUNT(*) INTO v_done_count FROM public.daily_practice_logs dpl
    JOIN public.practice_configs pc ON pc.user_id = dpl.user_id AND pc.practice_key = dpl.practice_key AND pc.is_active = TRUE
    WHERE dpl.user_id = p_user_id AND dpl.log_date = v_today AND dpl.completed = TRUE;

  IF v_active_count > 0 AND v_done_count >= v_active_count THEN
    SELECT current_streak, longest_streak, last_active_date
      INTO v_current, v_longest, v_last
      FROM public.streaks WHERE user_id = p_user_id;

    IF v_last = v_yesterday THEN
      v_current := v_current + 1;
    ELSIF v_last = v_today THEN
      -- already counted today
      RETURN;
    ELSE
      v_current := 1;
    END IF;

    IF v_current > v_longest THEN v_longest := v_current; END IF;

    UPDATE public.streaks SET
      current_streak = v_current,
      longest_streak = v_longest,
      last_active_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END; $$;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('media-prayers', 'media-prayers', FALSE),
  ('media-meditations', 'media-meditations', FALSE),
  ('media-physical_activities', 'media-physical_activities', FALSE),
  ('media-readings', 'media-readings', FALSE),
  ('media-visualizations', 'media-visualizations', FALSE),
  ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Avatars: public read, owner write
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private media buckets: only owner can read/write own folder
CREATE POLICY "media_owner_select" ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('media-prayers','media-meditations','media-physical_activities','media-readings','media-visualizations')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "media_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('media-prayers','media-meditations','media-physical_activities','media-readings','media-visualizations')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "media_owner_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('media-prayers','media-meditations','media-physical_activities','media-readings','media-visualizations')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "media_owner_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('media-prayers','media-meditations','media-physical_activities','media-readings','media-visualizations')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );