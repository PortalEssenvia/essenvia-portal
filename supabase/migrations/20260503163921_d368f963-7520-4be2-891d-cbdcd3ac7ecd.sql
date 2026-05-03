
-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER STATE (practices config + routine)
CREATE TABLE public.user_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  practices_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  routine JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_state_select_own" ON public.user_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_state_insert_own" ON public.user_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_state_update_own" ON public.user_state FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_state_updated BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DAILY RECORDS
CREATE TABLE public.daily_records (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  done TEXT[] NOT NULL DEFAULT '{}',
  diary_text TEXT NOT NULL DEFAULT '',
  diary_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  gratitude_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date)
);
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_records_select_own" ON public.daily_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_records_insert_own" ON public.daily_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_records_update_own" ON public.daily_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_records_delete_own" ON public.daily_records FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_daily_records_updated BEFORE UPDATE ON public.daily_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_daily_records_user_date ON public.daily_records(user_id, date DESC);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
