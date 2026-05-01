import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRACTICE_IDS,
  STORAGE_KEYS,
  todayKey,
} from "../constants";
import type {
  AffirmationsData, DiaryData, GratitudeData,
  MeditationData, PhysicalData, PracticeId, PrayerData,
  ReadingData, VisualizationData, WeekDay,
} from "../types";
import { readLS, writeLS } from "./useLocalStorage";

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

export function usePracticesConfig() {
  const [cfg, setCfg] = useState<PracticesConfig>(() =>
    readLS<PracticesConfig>(STORAGE_KEYS.practicesConfig, defaultConfig())
  );

  useEffect(() => writeLS(STORAGE_KEYS.practicesConfig, cfg), [cfg]);

  const update = useCallback(<K extends PracticeId>(id: K, patch: Partial<PracticesConfig[K]>) => {
    setCfg((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  return { cfg, setCfg, update };
}

export function useDailyDone() {
  const today = todayKey();
  const key = STORAGE_KEYS.daily(today);
  const [done, setDone] = useState<PracticeId[]>(() => readLS<PracticeId[]>(key, []));

  useEffect(() => writeLS(key, done), [key, done]);

  const toggle = useCallback((id: PracticeId) => {
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const mark = useCallback((id: PracticeId) => {
    setDone((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  return { done, toggle, mark, today };
}

export function useStreak() {
  return useMemo(() => {
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 366; i++) {
      const k = d.toISOString().slice(0, 10);
      const arr = readLS<PracticeId[]>(STORAGE_KEYS.daily(k), []);
      if (arr.length === PRACTICE_IDS.length) {
        s++;
        d.setDate(d.getDate() - 1);
      } else if (i === 0) {
        // today incomplete — still allow streak from yesterday
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }, []);
}

export function readDailyDone(date: string): PracticeId[] {
  return readLS<PracticeId[]>(STORAGE_KEYS.daily(date), []);
}