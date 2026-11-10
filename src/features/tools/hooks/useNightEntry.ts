import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLocalDay } from "./useLocalDay";
import type { PracticeId } from "../types";

export interface NightEntry { checked: string[]; notes: string; duration: number; kind: string }
export const emptyNightEntry = (): NightEntry => ({ checked: [], notes: "", duration: 10, kind: "Meditação guiada para dormir" });
export function parseNightEntry(notes: string | null): NightEntry {
  if (!notes) return emptyNightEntry();
  try { return { ...emptyNightEntry(), ...JSON.parse(notes) }; } catch { return { ...emptyNightEntry(), notes }; }
}
export function useNightEntry(id: PracticeId, done: boolean) {
  const { user } = useAuth();
  const date = useLocalDay();
  const [entry, setEntry] = useState(emptyNightEntry);
  const [history, setHistory] = useState<{ date: string; entry: NightEntry }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    setEntry(emptyNightEntry()); setLoaded(false);
    if (!user) return;
    void (async () => {
      const { data, error } = await supabase.from("daily_practice_logs").select("log_date,notes").eq("user_id", user.id).eq("practice_key", id).lte("log_date", date).order("log_date", { ascending: false }).limit(200);
      if (cancelled) return;
      if (error) { toast.error("Não foi possível carregar a prática."); return; }
      setEntry(parseNightEntry(data?.find((r) => r.log_date === date)?.notes ?? null));
      setHistory((data ?? []).filter((r) => r.log_date < date && r.notes).map((r) => ({ date: r.log_date, entry: parseNightEntry(r.notes) })));
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, id, date]);
  const update = (patch: Partial<NightEntry>) => {
    if (!loaded || !user) return;
    const next = { ...entry, ...patch }; setEntry(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        const { error } = await supabase.from("daily_practice_logs").upsert({ user_id: user.id, practice_key: id, log_date: date, notes: JSON.stringify(next) }, { onConflict: "user_id,practice_key,log_date" });
        if (error) toast.error("Não foi possível salvar suas anotações.");
      });
    }, 400);
  };
  return { entry, update, history, loaded, date };
}