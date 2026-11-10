CREATE TABLE public.gratitude_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 entry_date date NOT NULL,
 period text NOT NULL CHECK (period IN ('manha','noite')),
 content text NOT NULL CHECK (length(trim(content)) > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gratitude_entries TO authenticated;
GRANT ALL ON public.gratitude_entries TO service_role;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own gratitude entries" ON public.gratitude_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX gratitude_entries_user_period_date ON public.gratitude_entries(user_id,period,entry_date DESC);
CREATE TRIGGER gratitude_entries_updated_at BEFORE UPDATE ON public.gratitude_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.gratitude_entries(user_id,entry_date,period,content)
SELECT user_id,entry_date,'manha',gratitude_text FROM public.diary_entries WHERE length(trim(gratitude_text)) > 0;
COMMENT ON COLUMN public.diary_entries.gratitude_text IS 'DEPRECATED: daily gratitude is now stored in gratitude_entries; legacy values belong to morning gratitude.';
CREATE FUNCTION public.sync_gratitude_completion() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE owner_id uuid; day_key date; day_period text; has_items boolean;
BEGIN
 IF TG_OP = 'DELETE' THEN owner_id := OLD.user_id; day_key := OLD.entry_date; day_period := OLD.period;
 ELSE owner_id := NEW.user_id; day_key := NEW.entry_date; day_period := NEW.period; END IF;
 SELECT EXISTS(SELECT 1 FROM public.gratitude_entries WHERE user_id=owner_id AND entry_date=day_key AND period=day_period) INTO has_items;
 INSERT INTO public.daily_practice_logs(user_id,practice_key,log_date,completed,completed_at)
 VALUES(owner_id,CASE WHEN day_period='noite' THEN 'gratidao_noite' ELSE 'gratidao' END,day_key,has_items,CASE WHEN has_items THEN now() ELSE NULL END)
 ON CONFLICT(user_id,practice_key,log_date) DO UPDATE SET completed=EXCLUDED.completed,completed_at=CASE WHEN EXCLUDED.completed THEN coalesce(daily_practice_logs.completed_at,EXCLUDED.completed_at) ELSE NULL END;
 RETURN NULL;
END $$;
CREATE TRIGGER gratitude_entries_completion AFTER INSERT OR UPDATE OR DELETE ON public.gratitude_entries FOR EACH ROW EXECUTE FUNCTION public.sync_gratitude_completion();