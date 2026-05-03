import { useCallback, useEffect, useMemo, useState } from "react";
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

/**
 * Practices configuration synced with Supabase (user_state.practices_config).
 */
export function usePracticesConfig() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState<PracticesConfig>(() => defaultConfig());
  const [loaded, setLoaded] = useState(false);

  // Load from server
  useEffect(() => {
    if (!user) { setLoaded(false); setCfg(defaultConfig()); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_state")
        .select("practices_config")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const pc = data?.practices_config as unknown;
      if (pc && typeof pc === "object" && Object.keys(pc as object).length > 0) {
        setCfg({ ...defaultConfig(), ...(pc as PracticesConfig) });
      } else {
        // initialize row
        await supabase.from("user_state").upsert({ user_id: user.id, practices_config: defaultConfig() as any });
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Persist on change (debounced)
  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(() => {
      supabase.from("user_state").upsert({ user_id: user.id, practices_config: cfg as any });
    }, 400);
    return () => clearTimeout(t);
  }, [cfg, user, loaded]);

  const update = useCallback(<K extends PracticeId>(id: K, patch: Partial<PracticesConfig[K]>) => {
    setCfg((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  return { cfg, setCfg, update };
}

/**
 * Today's completed practices, synced with Supabase daily_records.
 */
export function useDailyDone() {
  const { user } = useAuth();
  const today = todayKey();
  const [done, setDone] = useState<PracticeId[]>([]);

  useEffect(() => {
    if (!user) { setDone([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("daily_records")
        .select("done")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      if (cancelled) return;
      setDone((data?.done as PracticeId[]) ?? []);
    })();
    return () => { cancelled = true; };
  }, [user, today]);

  const persist = useCallback(async (next: PracticeId[]) => {
    if (!user) return;
    await supabase.from("daily_records").upsert({
      user_id: user.id, date: today, done: next,
    });
  }, [user, today]);

  const toggle = useCallback((id: PracticeId) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persist(next);
      return next;
    });
  }, [persist]);

  const mark = useCallback((id: PracticeId) => {
    setDone((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next);
      return next;
    });
  }, [persist]);

  return { done, toggle, mark, today };
}

/**
 * Streak based on daily_records of past 366 days.
 */
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
        .from("daily_records")
        .select("date,done")
        .eq("user_id", user.id)
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: false });
      if (cancelled || !data) return;
      const map = new Map<string, number>();
      data.forEach((r: any) => map.set(r.date, (r.done as string[]).length));
      let s = 0;
      const d = new Date();
      for (let i = 0; i < 366; i++) {
        const k = d.toISOString().slice(0, 10);
        const count = map.get(k) ?? 0;
        if (count === PRACTICE_IDS.length) {
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

/**
 * Hook returning a map of date->done[] for the past N days.
 * Used by Ferramentas page for week/month grids.
 */
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
        .from("daily_records")
        .select("date,done")
        .eq("user_id", user.id)
        .gte("date", since.toISOString().slice(0, 10));
      if (cancelled || !data) return;
      const m: Record<string, PracticeId[]> = {};
      data.forEach((r: any) => { m[r.date] = r.done as PracticeId[]; });
      setMap(m);
    })();
  }, [user, days]);

  return map;
}

/**
 * Routine activities synced with Supabase user_state.routine.
 */
export function useRoutineActivities<T = unknown>(): [T[], (v: T[] | ((p: T[]) => T[])) => void] {
  const { user } = useAuth();
  const [list, setList] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setList([]); setLoaded(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_state")
        .select("routine")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setList((data?.routine as T[]) ?? []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !loaded) return;
    const t = setTimeout(() => {
      supabase.from("user_state").upsert({ user_id: user.id, routine: list as any });
    }, 400);
    return () => clearTimeout(t);
  }, [list, user, loaded]);

  const update = useCallback((v: T[] | ((p: T[]) => T[])) => {
    setList((prev) => (typeof v === "function" ? (v as (p: T[]) => T[])(prev) : v));
  }, []);

  return [list, update];
}

/**
 * Routine activities done today (subset of daily_records.routine_done).
 */
export function useRoutineDone(): [string[], (id: string) => void] {
  const { user } = useAuth();
  const today = todayKey();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setDone([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("daily_records")
        .select("routine_done")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      if (cancelled) return;
      setDone((data?.routine_done as string[]) ?? []);
    })();
    return () => { cancelled = true; };
  }, [user, today]);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (user) supabase.from("daily_records").upsert({ user_id: user.id, date: today, routine_done: next });
      return next;
    });
  }, [user, today]);

  return [done, toggle];
}

/**
 * Diary entry for a specific date.
 */
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
        .from("daily_records")
        .select("diary_text,diary_answers")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();
      if (cancelled) return;
      setText(data?.diary_text ?? "");
      setAnswers((data?.diary_answers as Record<string, any>) ?? {});
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, date]);

  const save = useCallback(async () => {
    if (!user) return;
    await supabase.from("daily_records").upsert({
      user_id: user.id, date, diary_text: text, diary_answers: answers,
    });
  }, [user, date, text, answers]);

  return { text, setText, answers, setAnswers, save, loaded };
}

/**
 * History of past diary entries (excluding `excludeDate`).
 */
export function useDiaryHistory(excludeDate?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<{ date: string; text: string; answers: Record<string, any> }[]>([]);

  useEffect(() => {
    if (!user) { setEntries([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("daily_records")
        .select("date,diary_text,diary_answers")
        .eq("user_id", user.id)
        .neq("diary_text", "")
        .order("date", { ascending: false })
        .limit(200);
      if (cancelled || !data) return;
      setEntries(
        data
          .filter((r: any) => r.date !== excludeDate)
          .map((r: any) => ({ date: r.date, text: r.diary_text, answers: r.diary_answers ?? {} }))
      );
    })();
    return () => { cancelled = true; };
  }, [user, excludeDate]);

  return entries;
}

/**
 * Today's gratitude text + recent history.
 */
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
        .from("daily_records")
        .select("date,gratitude_text")
        .eq("user_id", user.id)
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: false });
      if (cancelled || !data) return;
      const today = data.find((r: any) => r.date === date);
      setText(today?.gratitude_text ?? "");
      setHistory(
        data
          .filter((r: any) => r.date !== date && r.gratitude_text)
          .map((r: any) => ({ date: r.date, text: r.gratitude_text }))
      );
    })();
    return () => { cancelled = true; };
  }, [user, date]);

  const save = useCallback(async (newText: string) => {
    if (!user) return;
    await supabase.from("daily_records").upsert({
      user_id: user.id, date, gratitude_text: newText,
    });
  }, [user, date]);

  return { text, setText, history, save };
}