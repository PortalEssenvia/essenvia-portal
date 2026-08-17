import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NIGHT_PRACTICES, localDateKey } from "../constants";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";

type Mode = "semanal" | "mensal";

const DAYS_BACK = 364; // 52 semanas / ~12 meses

/**
 * Tendência semanal e mensal da taxa de cumprimento das práticas da NOITE,
 * com média do período e comparação com o período anterior.
 */
export function NightTrendCard() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("semanal");
  const [dates, setDates] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const nightIds = useMemo(() => new Set(NIGHT_PRACTICES.map((p) => p.id as string)), []);

  useEffect(() => {
    if (!user) { setDates(new Map()); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - DAYS_BACK);
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("log_date,practice_key,completed")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("log_date", localDateKey(since));
      if (cancelled) return;
      const counts = new Map<string, Set<string>>();
      ((data ?? []) as any[]).forEach((r) => {
        if (!nightIds.has(r.practice_key)) return;
        const s = counts.get(r.log_date) ?? new Set<string>();
        s.add(r.practice_key);
        counts.set(r.log_date, s);
      });
      const m = new Map<string, number>();
      counts.forEach((s, k) => m.set(k, (s.size / nightIds.size) * 100));
      setDates(m);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, nightIds]);

  // Buckets: 12 semanas ou 12 meses
  const buckets = useMemo(() => {
    const out: { label: string; rate: number; done: number; days: number }[] = [];
    const today = new Date();

    if (mode === "semanal") {
      for (let w = 11; w >= 0; w--) {
        const end = new Date(today);
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        let sum = 0, days = 0, done = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const r = dates.get(localDateKey(d)) ?? 0;
          sum += r; days++;
          if (r > 0) done++;
        }
        out.push({
          label: `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`,
          rate: days ? Math.round(sum / days) : 0,
          done, days,
        });
      }
    } else {
      for (let mth = 11; mth >= 0; mth--) {
        const ref = new Date(today.getFullYear(), today.getMonth() - mth, 1);
        const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
        let sum = 0, days = 0, done = 0;
        for (let d = new Date(ref); d <= last && d <= today; d.setDate(d.getDate() + 1)) {
          const r = dates.get(localDateKey(d)) ?? 0;
          sum += r; days++;
          if (r > 0) done++;
        }
        out.push({
          label: ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
          rate: days ? Math.round(sum / days) : 0,
          done, days,
        });
      }
    }
    return out;
  }, [dates, mode]);

  // Média móvel de 3 períodos para suavizar a tendência
  const series = useMemo(
    () =>
      buckets.map((b, i) => {
        const win = buckets.slice(Math.max(0, i - 2), i + 1);
        return { ...b, media: Math.round(win.reduce((a, x) => a + x.rate, 0) / win.length) };
      }),
    [buckets]
  );

  const half = Math.floor(buckets.length / 2);
  const avgOf = (arr: typeof buckets) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b.rate, 0) / arr.length) : 0;
  const avgAll = avgOf(buckets);
  const avgPrev = avgOf(buckets.slice(0, half));
  const avgRecent = avgOf(buckets.slice(half));
  const delta = avgRecent - avgPrev;
  const current = buckets[buckets.length - 1]?.rate ?? 0;
  const unit = mode === "semanal" ? "semanas" : "meses";

  return (
    <Card className="p-6 bg-card border-bege shadow-soft">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="font-display text-lg text-verde-profundo">
            📈 Tendência das práticas da noite
          </h4>
          <p className="text-sm text-muted-foreground">
            Taxa média de cumprimento nas últimas 12 {unit}.
          </p>
        </div>
        <div className="flex gap-2">
          {(["semanal", "mensal"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-smooth border",
                mode === m
                  ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                  : "bg-card text-verde-profundo border-bege hover:border-dourado"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Comparação de médias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <p className="text-xs text-muted-foreground">
            {mode === "semanal" ? "Semana atual" : "Mês atual"}
          </p>
          <p className="font-display text-3xl text-verde-profundo">{current}%</p>
        </div>
        <div className="p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <p className="text-xs text-muted-foreground">Média geral</p>
          <p className="font-display text-3xl text-verde-profundo">{avgAll}%</p>
        </div>
        <div className="p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <p className="text-xs text-muted-foreground">
            6 {unit} anteriores
          </p>
          <p className="font-display text-3xl text-verde-profundo">{avgPrev}%</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl border",
            delta >= 0
              ? "bg-verde-medio/10 border-verde-medio/50"
              : "bg-dourado/15 border-dourado/60"
          )}
        >
          <p className="text-xs text-muted-foreground">6 {unit} recentes</p>
          <p className="font-display text-3xl text-verde-profundo">{avgRecent}%</p>
          <p className="text-xs text-muted-foreground">
            {delta >= 0 ? "▲ +" : "▼ "}
            {Math.abs(delta)} p.p. vs anterior
          </p>
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, n: string) => [`${v}%`, n === "rate" ? "Taxa" : "Tendência"]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(v) => (v === "rate" ? "Taxa do período" : "Tendência (média móvel)")}
              />
              <ReferenceLine
                y={avgAll}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{ value: `média ${avgAll}%`, position: "insideTopRight", fontSize: 11 }}
              />
              <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="media"
                stroke="hsl(var(--accent-foreground))"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
