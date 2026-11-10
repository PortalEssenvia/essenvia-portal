import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { localDateKey } from "../constants";
import { useLocalDay } from "./useLocalDay";
import { toast } from "sonner";
import type { PracticePeriod } from "../types";

export interface GratitudeEntry { id: string; entry_date: string; content: string }
export const gratitudeCompleted = (entries: GratitudeEntry[], date: string) => entries.some((e) => e.entry_date === date);
export function useGratitudeEntries(period: PracticePeriod) {
  const { user } = useAuth(); const date = useLocalDay();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [days, setDays] = useState(14); const [busy, setBusy] = useState(false); const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    if (!user) return [];
    const since = new Date(`${date}T12:00:00`); since.setDate(since.getDate() - days);
    const { data, error } = await supabase.from("gratitude_entries").select("id,entry_date,content").eq("user_id", user.id).eq("period", period).gte("entry_date", localDateKey(since)).lte("entry_date", date).order("entry_date", { ascending: false }).order("created_at");
    if (error) throw error;
    return data ?? [];
  }, [user, period, date, days]);
  useEffect(() => {
    let cancelled = false; setEntries([]); setLoaded(false);
    void load().then((rows) => { if (!cancelled) { setEntries(rows); setLoaded(true); } }).catch(() => { if (!cancelled) toast.error("Não foi possível carregar suas gratidões."); });
    return () => { cancelled = true; };
  }, [load]);
  const mutate = async (action: "add" | "edit" | "delete", content = "", id?: string) => {
    if (!user || busy || !loaded) return false;
    if (action !== "delete" && !content.trim()) return false;
    setBusy(true);
    try {
      const result = action === "add" ? await supabase.from("gratitude_entries").insert({ user_id: user.id, period, entry_date: date, content: content.trim() }) : action === "edit" ? await supabase.from("gratitude_entries").update({ content: content.trim() }).eq("id", id ?? "").eq("user_id", user.id) : await supabase.from("gratitude_entries").delete().eq("id", id ?? "").eq("user_id", user.id);
      if (result.error) throw result.error;
      setEntries(await load()); window.dispatchEvent(new Event("practice-logs-changed")); return true;
    } catch { toast.error("Não foi possível salvar a gratidão. Tente novamente."); return false; }
    finally { setBusy(false); }
  };
  return { entries, date, busy, loaded, mutate, days, more: () => setDays((n) => n + 14) };
}