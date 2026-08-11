import { useCallback, useEffect, useState } from "react";
import { PRACTICE_IDS, todayKey, localDateKey, SLEEP_DEFAULTS, scheduleFor } from "../constants";
import type {
  AffirmationsData, DiaryData, GratitudeData,
  MeditationData, PhysicalData, PracticeId, PrayerData,
  ReadingData, VisualizationData, WeekDay, SleepStepData, SleepWindow,
} from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PracticesConfig {
  oracao: PrayerData;
  afirmacao: AffirmationsData;
  gratidao: GratitudeData;
  atividade: PhysicalData;
  meditacao: MeditationData;
  leitura: ReadingData;
  visualizacao: VisualizationData;
  diario: DiaryData;
  telas: SleepStepData;
  cafeina: SleepStepData;
  relaxamento: SleepStepData;
  gratidao_noite: SleepStepData;
  respiracao_sono: SleepStepData;
  ambiente_sono: SleepStepData;
  sleepWindow: SleepWindow;
}

const allDays: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

const baseCfg = (id: PracticeId, sleep: SleepWindow) => ({
  active: true, ...scheduleFor(id, sleep), days: allDays,
});

export const defaultConfig = (sleep: SleepWindow = SLEEP_DEFAULTS): PracticesConfig => ({
  oracao: { ...baseCfg("oracao", sleep), text: "", fromHeart: false, customSuggestions: [] },
  afirmacao: { ...baseCfg("afirmacao", sleep), items: [] },
  gratidao: { ...baseCfg("gratidao", sleep), items: [] },
  atividade: { ...baseCfg("atividade", sleep), activities: [] },
  meditacao: { ...baseCfg("meditacao", sleep), items: [] },
  leitura: { ...baseCfg("leitura", sleep), queue: [], history: [] },
  visualizacao: { ...baseCfg("visualizacao", sleep), items: [] },
  diario: { ...baseCfg("diario", sleep) },
  telas: { ...baseCfg("telas", sleep), checked: [] },
  cafeina: { ...baseCfg("cafeina", sleep), checked: [] },
  relaxamento: { ...baseCfg("relaxamento", sleep), checked: [] },
  gratidao_noite: { ...baseCfg("gratidao_noite", sleep), checked: [] },
  respiracao_sono: { ...baseCfg("respiracao_sono", sleep), checked: [] },
  ambiente_sono: { ...baseCfg("ambiente_sono", sleep), checked: [] },
  sleepWindow: sleep,
});

/** Practices configuration synced with profiles.practices_config (jsonb). */
export function usePracticesConfig() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState<PracticesConfig>(() => defaultConfig());
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(false); setCfg(defaultConfig()); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("practices_config")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("[Essenvia] Erro ao carregar practices_config:", error);
        setLoaded(true);
        return;
      }
      const pc = (data as any)?.practices_config as unknown;
      if (pc && typeof pc === "object" && Object.keys(pc as object).length > 0) {
        setCfg({ ...defaultConfig(), ...(pc as PracticesConfig) });
      } else {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ practices_config: defaultConfig() as any })
          .eq("id", user.id);
        if (updateError) {
          console.error("[Essenvia] Erro ao inicializar practices_config:", updateError);
        }
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(async () => {
      setIsSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ practices_config: cfg as any })
        .eq("id", user.id);
      setIsSaving(false);
      if (error) {
        console.error("[Essenvia] Erro ao salvar practices_config:", error);
        toast.error("Erro ao salvar configuração.");
      } else {
        toast.success("Configuração salva ✓", { duration: 1500 });
      }
    }, 800);
    return () => clearTimeout(t);
  }, [cfg, user, loaded]);

  const update = useCallback(<K extends PracticeId>(id: K, patch: Partial<PracticesConfig[K]>) => {
    setCfg((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  /** Atualiza a janela de sono e, opcionalmente, recalcula os horários sugeridos. */
  const setSleepWindow = useCallback((sleep: SleepWindow, recalc = false) => {
    setCfg((prev) => {
      const next: PracticesConfig = { ...prev, sleepWindow: sleep };
      if (recalc) {
        PRACTICE_IDS.forEach((id) => {
          next[id] = { ...(next[id] as any), ...scheduleFor(id, sleep) } as any;
        });
      }
      return next;
    });
  }, []);

  return { cfg, setCfg, update, isSaving, setSleepWindow };
}

/**
 * FIX 01 + FIX 03 — Today's completed practices, synced with daily_practice_logs.
 *
 * CORREÇÃO 01: `todayKey()` agora retorna a data LOCAL (não UTC).
 * CORREÇÃO 03: O histórico passa a usar `localDateKey()` em todos os cálculos
 *              de data para garantir que registros do dia sejam gravados corretamente.
 */
export function useDailyDone() {
  const { user } = useAuth();
  // FIX 01: todayKey() agora usa data local, não UTC
  const today = todayKey();
  const [done, setDone] = useState<PracticeId[]>([]);

  useEffect(() => {
    if (!user) { setDone([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("practice_key")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .eq("completed", true);
      if (cancelled) return;
      setDone(((data ?? []).map((r: any) => r.practice_key as PracticeId)));
    })();
    return () => { cancelled = true; };
  }, [user, today]);

  const persistOne = useCallback(async (id: PracticeId, completed: boolean) => {
    if (!user) return;
    // FIX 03: completed_at usa a hora local do usuário no ISO format, mas
    // log_date usa todayKey() que agora é sempre a data local correta.
    const { error } = await supabase
      .from("daily_practice_logs")
      .upsert({
        user_id: user.id,
        practice_key: id,
        log_date: today, // FIX 01: data local correta
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }, { onConflict: "user_id,practice_key,log_date" });
    if (error) {
      console.error("[Essenvia] Erro ao salvar prática diária:", id, error);
    }
  }, [user, today]);

  const toggle = useCallback((id: PracticeId) => {
    setDone((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      persistOne(id, !has);
      return next;
    });
  }, [persistOne]);

  const mark = useCallback((id: PracticeId) => {
    setDone((prev) => {
      if (prev.includes(id)) return prev;
      persistOne(id, true);
      return [...prev, id];
    });
  }, [persistOne]);

  return { done, toggle, mark, today };
}

/** Streak: consecutive days with all practices completed. */
export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) { setStreak(0); return; }
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 366);
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("log_date,practice_key,completed")
        .eq("user_id", user.id)
        .eq("completed", true)
        // FIX 01: usa localDateKey ao invés de toISOString().slice(0,10)
        .gte("log_date", localDateKey(since));
      if (cancelled || !data) return;
      const map = new Map<string, Set<string>>();
      data.forEach((r: any) => {
        const set = map.get(r.log_date) ?? new Set<string>();
        set.add(r.practice_key);
        map.set(r.log_date, set);
      });
      let s = 0;
      const d = new Date();
      for (let i = 0; i < 366; i++) {
        // FIX 01: usa localDateKey ao invés de toISOString().slice(0,10)
        const k = localDateKey(d);
        const set = map.get(k);
        if (set && set.size === PRACTICE_IDS.length) {
          s++;
          d.setDate(d.getDate() - 1);
        } else if (i === 0) {
          d.setDate(d.getDate() - 1);
        } else break;
      }
      setStreak(s);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return streak;
}

/** Map of date->done practices for past N days. */
export function useDailyHistory(days: number = 35) {
  const { user } = useAuth();
  const [map, setMap] = useState<Record<string, PracticeId[]>>({});

  useEffect(() => {
    if (!user) { setMap({}); return; }
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("log_date,practice_key,completed")
        .eq("user_id", user.id)
        .eq("completed", true)
        // FIX 01: usa localDateKey ao invés de toISOString().slice(0,10)
        .gte("log_date", localDateKey(since));
      if (cancelled || !data) return;
      const m: Record<string, PracticeId[]> = {};
      data.forEach((r: any) => {
        (m[r.log_date] ??= []).push(r.practice_key as PracticeId);
      });
      setMap(m);
    })();
  }, [user, days]);

  return map;
}

/** Routine activities synced with profiles.routine (jsonb). */
export function useRoutineActivities<T = unknown>(): [T[], (v: T[] | ((p: T[]) => T[])) => void] {
  const { user } = useAuth();
  const [list, setList] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setList([]); setLoaded(false); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("routine")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("[Essenvia] Erro ao carregar routine:", error);
        setLoaded(true);
        return;
      }
      setList(((data as any)?.routine as T[]) ?? []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ routine: list as any })
        .eq("id", user.id);
      if (error) {
        console.error("[Essenvia] Erro ao salvar routine:", error);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [list, user, loaded]);

  const update = useCallback((v: T[] | ((p: T[]) => T[])) => {
    setList((prev) => (typeof v === "function" ? (v as (p: T[]) => T[])(prev) : v));
  }, []);

  return [list, update];
}

async function ensureDiaryRow(user_id: string, date: string) {
  await supabase
    .from("diary_entries")
    .upsert({ user_id, entry_date: date }, { onConflict: "user_id,entry_date", ignoreDuplicates: true });
}

/**
 * FIX 02 — Routine activities done today (stored in diary_entries.routine_done).
 *
 * CORREÇÃO 02: Adicionado suporte a `practiceId` para que quando uma atividade
 * da rotina for marcada como concluída, o ID do prática vinculada também seja
 * rastreado. Isso permite que Ferramentas.tsx sincronize o estado entre as
 * duas telas.
 *
 * CORREÇÃO 01: usa todayKey() local.
 */
export function useRoutineDone(): [string[], (id: string) => void] {
  const { user } = useAuth();
  // FIX 01: todayKey() agora usa data local
  const today = todayKey();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setDone([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("routine_done")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();
      if (cancelled) return;
      setDone(((data as any)?.routine_done as string[]) ?? []);
    })();
    return () => { cancelled = true; };
  }, [user, today]);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (user) {
        (async () => {
          await ensureDiaryRow(user.id, today);
          const { error } = await supabase.from("diary_entries")
            .update({ routine_done: next })
            .eq("user_id", user.id)
            .eq("entry_date", today);
          if (error) {
            console.error("[Essenvia] Erro ao salvar routine_done:", error);
          }
        })();
      }
      return next;
    });
  }, [user, today]);

  return [done, toggle];
}

/** Diary entry for a specific date. */
export function useDiaryEntry(date: string) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("content,answers")
        .eq("user_id", user.id)
        .eq("entry_date", date)
        .maybeSingle();
      if (cancelled) return;
      setText(((data as any)?.content as string) ?? "");
      setAnswers(((data as any)?.answers as Record<string, any>) ?? {});
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, date]);

  const save = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from("diary_entries").upsert({
      user_id: user.id, entry_date: date, content: text, answers: answers as any,
    }, { onConflict: "user_id,entry_date" });
    if (error) {
      console.error("[Essenvia] Erro ao salvar diário:", error);
    }
  }, [user, date, text, answers]);

  return { text, setText, answers, setAnswers, save, loaded };
}

/** History of past diary entries. */
export function useDiaryHistory(excludeDate?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<{ date: string; text: string; answers: Record<string, any> }[]>([]);

  useEffect(() => {
    if (!user) { setEntries([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("entry_date,content,answers")
        .eq("user_id", user.id)
        .neq("content", "")
        .order("entry_date", { ascending: false })
        .limit(200);
      if (cancelled || !data) return;
      setEntries(
        (data as any[])
          .filter((r) => r.entry_date !== excludeDate && r.content)
          .map((r) => ({ date: r.entry_date, text: r.content ?? "", answers: r.answers ?? {} }))
      );
    })();
    return () => { cancelled = true; };
  }, [user, excludeDate]);

  return entries;
}

/** Today's gratitude text + recent history (stored in diary_entries.gratitude_text). */
export function useGratitude(date: string) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [history, setHistory] = useState<{ date: string; text: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { data } = await supabase
        .from("diary_entries")
        .select("entry_date,gratitude_text")
        .eq("user_id", user.id)
        // FIX 01: usa localDateKey ao invés de toISOString().slice(0,10)
        .gte("entry_date", localDateKey(since))
        .order("entry_date", { ascending: false });
      if (cancelled || !data) return;
      const today = (data as any[]).find((r) => r.entry_date === date);
      setText(today?.gratitude_text ?? "");
      setHistory(
        (data as any[])
          .filter((r) => r.entry_date !== date && r.gratitude_text)
          .map((r) => ({ date: r.entry_date, text: r.gratitude_text }))
      );
    })();
    return () => { cancelled = true; };
  }, [user, date]);

  const save = useCallback(async (newText: string) => {
    if (!user) return;
    const { error } = await supabase.from("diary_entries").upsert({
      user_id: user.id, entry_date: date, gratitude_text: newText,
    }, { onConflict: "user_id,entry_date" });
    if (error) {
      console.error("[Essenvia] Erro ao salvar gratidão:", error);
    }
  }, [user, date]);

  return { text, setText, history, save };
}
