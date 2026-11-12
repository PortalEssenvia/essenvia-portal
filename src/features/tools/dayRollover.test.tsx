import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NIGHT_PRACTICES } from "./constants";
import { useNightEntry } from "./hooks/useNightEntry";
import { useDailyDone, useDiaryEntry } from "./hooks/usePractices";
import { useGratitudeEntries } from "./hooks/useGratitudeEntries";

const state = vi.hoisted(() => ({ day: "2026-11-10", rows: [] as Record<string, any>[] }));
vi.mock("./hooks/useLocalDay", () => ({ useLocalDay: () => state.day }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "user" } }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => {
  const filters: ((r: Record<string, any>) => boolean)[] = [];
  const query: any = {
    select: () => query, order: () => query, limit: () => query,
    eq: (k: string, v: unknown) => { filters.push((r) => r[k] === v); return query; },
    lte: (k: string, v: string) => { filters.push((r) => r[k] <= v); return query; },
    gte: (k: string, v: string) => { filters.push((r) => r[k] >= v); return query; },
    maybeSingle: () => Promise.resolve({ data: state.rows.filter((r) => filters.every((f) => f(r)))[0] ?? null }),
    then: (resolve: (value: unknown) => void) => Promise.resolve({ data: state.rows.filter((r) => filters.every((f) => f(r))), error: null }).then(resolve),
  };
  return query;
} } }));
beforeEach(() => { state.day = "2026-11-10"; state.rows = []; });
describe("virada de dia por prática noturna", () => {
  for (const practice of NIGHT_PRACTICES) {
    it(`${practice.id}: ontem não fica concluído hoje`, async () => {
      state.rows = [{ user_id: "user", practice_key: practice.id, log_date: "2026-11-10", completed: true }];
      const { result, rerender } = renderHook(() => useDailyDone());
      await waitFor(() => expect(result.current.done).toContain(practice.id));
      state.day = "2026-11-11"; rerender();
      await waitFor(() => expect(result.current.done).toEqual([]));
      expect(state.rows[0].log_date).toBe("2026-11-10");
    });
  }
  for (const id of ["telas", "cafeina", "relaxamento", "ambiente_sono", "meditacao_sono"] as const) {
    it(`${id}: formulário vazio e ontem só no histórico`, async () => {
      state.rows = [{ user_id: "user", practice_key: id, log_date: "2026-11-10", notes: JSON.stringify({ checked: ["feito"], notes: "ontem", duration: 20 }) }];
      const { result, rerender } = renderHook(() => useNightEntry(id, true));
      await waitFor(() => expect(result.current.entry.notes).toBe("ontem"));
      state.day = "2026-11-11"; rerender();
      await waitFor(() => expect(result.current.loaded).toBe(true));
      expect(result.current.entry).toMatchObject({ checked: [], notes: "", duration: 10 });
      expect(result.current.history[0].entry.notes).toBe("ontem");
    });
  }
  it("diário: texto e respostas são limpos no novo dia", async () => {
    state.rows = [{ user_id: "user", entry_date: "2026-11-10", content: "ontem", answers: { mood: 9 } }];
    const { result, rerender } = renderHook(() => useDiaryEntry(state.day));
    await waitFor(() => expect(result.current.text).toBe("ontem"));
    state.day = "2026-11-11"; rerender();
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.text).toBe(""); expect(result.current.answers).toEqual({});
    expect(state.rows[0].content).toBe("ontem");
  });
  it("gratidões: manhã e noite são independentes e ontem vira histórico", async () => {
    state.rows = [
      { id: "n", user_id: "user", entry_date: "2026-11-10", period: "noite", content: "Noite" },
      { id: "m", user_id: "user", entry_date: "2026-11-10", period: "manha", content: "Manhã" },
    ];
    const night = renderHook(() => useGratitudeEntries("noite"));
    const morning = renderHook(() => useGratitudeEntries("manha"));
    await waitFor(() => expect(night.result.current.entries[0]?.content).toBe("Noite"));
    await waitFor(() => expect(morning.result.current.entries[0]?.content).toBe("Manhã"));
    state.day = "2026-11-11"; night.rerender();
    await waitFor(() => expect(night.result.current.loaded).toBe(true));
    expect(night.result.current.entries.filter((r) => r.entry_date === state.day)).toEqual([]);
    expect(night.result.current.entries[0].content).toBe("Noite");
  });
});