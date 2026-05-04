import { useCallback, useEffect, useState } from "react";
import { PRACTICE_IDS, todayKey } from "../constants";
import type {
  AffirmationsData, DiaryData, GratitudeData,
  MeditationData, PhysicalData, PracticeId, PrayerData,
  ReadingData, VisualizationData, WeekDay,
} from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PracticesConfig {
  oracao: PrayerData;
  afirmacao: AffirmationsData;
  gratidao: GratitudeData;
  atividade: PhysicalData;
  meditacao: MeditationData;
  leitura: ReadingData;
  visualizacao: VisualizationData;
  diario: DiaryData;
}

const allDays: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

const baseCfg = (start: string, end: string) => ({
  active: true, startTime: start, endTime: end, days: allDays,
});

export const defaultConfig = (): PracticesConfig => ({
  oracao: { ...baseCfg("06:00", "06:10"), text: "", fromHeart: false, customSuggestions: [] },
  afirmacao: { ...baseCfg("06:10", "06:20"), items: [] },
  gratidao: { ...baseCfg("06:20", "06:30"), items: [] },
  atividade: { ...baseCfg("07:00", "07:30"), activities: [] },
  meditacao: { ...baseCfg("06:30", "06:50"), items: [] },
  leitura: { ...baseCfg("20:00", "20:30"), queue: [], history: [] },
  visualizacao: { ...baseCfg("06:50", "07:00"), items: [] },
  diario: { ...baseCfg("21:00", "21:15") },
});

/** Practices configuration synced with profiles.practices_config (jsonb). */
export function usePracticesConfig() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState<PracticesConfig>(() => defaultConfig());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(false); setCfg(defaultConfig()); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("practices_config")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const pc = (data as any)?.practices_config as unknown;
      if (pc && typeof pc === "object" && Object.keys(pc as object).length > 0) {
        setCfg({ ...defaultConfig(), ...(pc as PracticesConfig) });
      } else {
        await supabase.from("profiles").update({ practices_config: defaultConfig() as any }).eq("id", user.id);
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(() => {
      supabase.from("profiles").update({ practices_config: cfg as any }).eq("id", user.id);
    }, 400);
    return () => clearTimeout(t);
  }, [cfg, user, loaded]);

  const update = useCallback(<K extends PracticeId>(id: K, patch: Partial<PracticesConfig[K]>) => {
    setCfg((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  return { cfg, setCfg, update };
}

/** Today's completed practices, synced with daily_practice_logs. */
export function useDailyDone() {
  const { user } = useAuth();
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
    await supabase.from("daily_practice_logs").upsert({
      user_id: user.id,
      practice_key: id,
      log_date: today,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }, { onConflict: "user_id,practice_key,log_date" });
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
        .gte("log_date", since.toISOString().slice(0, 10));
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
        const k = d.toISOString().slice(0, 10);
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
        .gte("log_date", since.toISOString().slice(0, 10));
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
      const { data } = await supabase
        .from("profiles")
        .select("routine")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setList(((data as any)?.routine as T[]) ?? []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(() => {
      supabase.from("profiles").update({ routine: list as any }).eq("id", user.id);
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

/** Routine activities done today (stored in diary_entries.routine_done). */
export function useRoutineDone(): [string[], (id: string) => void] {
  const { user } = useAuth();
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
          await supabase.from("diary_entries")
            .update({ routine_done: next })
            .eq("user_id", user.id)
            .eq("entry_date", today);
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
    await supabase.from("diary_entries").upsert({
      user_id: user.id, entry_date: date, content: text, answers: answers as any,
    }, { onConflict: "user_id,entry_date" });
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
      const since = new Date(); since.setDate(since.getDate() - 14);
      const { data } = await supabase
        .from("diary_entries")
        .select("entry_date,gratitude_text")
        .eq("user_id", user.id)
        .gte("entry_date", since.toISOString().slice(0, 10))
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
    await supabase.from("diary_entries").upsert({
      user_id: user.id, entry_date: date, gratitude_text: newText,
    }, { onConflict: "user_id,entry_date" });
  }, [user, date]);

  return { text, setText, history, save };
}
