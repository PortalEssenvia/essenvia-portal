import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NIGHT_PRACTICES, localDateKey } from "../constants";
import type { PracticeId } from "../types";
import { DayDetailDialog, type DayDetail } from "./DayDetailDialog";
import { downloadCsv, downloadPdf } from "../lib/exportHistory";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Legend, Cell,
} from "recharts";

type Mode = "semanal" | "mensal";
type View = "total" | "praticas";

const DAYS_BACK = 364; // 52 semanas / ~12 meses
const GOALS = [50, 80, 100];

const LINE_COLORS = [
  "#0F5132", "#C9A227", "#3E7C59", "#8B5E3C", "#2F6F8F", "#A14A76", "#6B7280", "#B45309",
];

/**
 * Tendência semanal e mensal da taxa de cumprimento das práticas da NOITE:
 *  - comparação de médias e média móvel
 *  - comparação por prática individual
 *  - destaque dos períodos/dias abaixo da meta
 *  - clique no gráfico abre o detalhe dos dias
 *  - exportação CSV / PDF
 */
export function NightTrendCard() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("semanal");
  const [view, setView] = useState<View>("total");
  const [goal, setGoal] = useState(80);
  const [dayMap, setDayMap] = useState<Map<string, Set<PracticeId>>>(new Map());
  const [times, setTimes] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [openBucket, setOpenBucket] = useState<string | null>(null);
  const [detail, setDetail] = useState<DayDetail | null>(null);

  const nightIds = useMemo(() => new Set(NIGHT_PRACTICES.map((p) => p.id as string)), []);
  const total = NIGHT_PRACTICES.length;

  useEffect(() => {
    if (!user) { setDayMap(new Map()); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - DAYS_BACK);
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("log_date,practice_key,completed,completed_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("log_date", localDateKey(since));
      if (cancelled) return;
      const m = new Map<string, Set<PracticeId>>();
      const t = new Map<string, string>();
      ((data ?? []) as any[]).forEach((r) => {
        if (!nightIds.has(r.practice_key)) return;
        const s = m.get(r.log_date) ?? new Set<PracticeId>();
        s.add(r.practice_key);
        m.set(r.log_date, s);
        if (r.completed_at) {
          t.set(
            `${r.log_date}|${r.practice_key}`,
            new Date(r.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          );
        }
      });
      setDayMap(m);
      setTimes(t);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, nightIds]);

  const rateOf = (key: string) => ((dayMap.get(key)?.size ?? 0) / total) * 100;

  type Bucket = {
    label: string;
    rate: number;
    days: number;
    belowDays: number;
    dates: string[];
  } & Record<string, any>;

  const buckets = useMemo<Bucket[]>(() => {
    const out: Bucket[] = [];
    const today = new Date();

    const build = (start: Date, end: Date, label: string) => {
      let sum = 0, days = 0, belowDays = 0;
      const dates: string[] = [];
      const perPractice: Record<string, number> = {};
      NIGHT_PRACTICES.forEach((p) => (perPractice[p.id] = 0));
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d > today) break;
        const k = localDateKey(d);
        const r = rateOf(k);
        sum += r; days++;
        dates.push(k);
        if (r < goal) belowDays++;
        const set = dayMap.get(k);
        NIGHT_PRACTICES.forEach((p) => { if (set?.has(p.id)) perPractice[p.id] += 1; });
      }
      const row: Bucket = {
        label,
        rate: days ? Math.round(sum / days) : 0,
        days,
        belowDays,
        dates,
      };
      NIGHT_PRACTICES.forEach((p) => {
        row[`p_${p.id}`] = days ? Math.round((perPractice[p.id] / days) * 100) : 0;
      });
      return row;
    };

    if (mode === "semanal") {
      for (let w = 11; w >= 0; w--) {
        const end = new Date(today);
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        out.push(build(start, end, start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })));
      }
    } else {
      for (let mth = 11; mth >= 0; mth--) {
        const ref = new Date(today.getFullYear(), today.getMonth() - mth, 1);
        const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
        out.push(build(ref, last, ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")));
      }
    }
    return out;
  }, [dayMap, mode, goal, total]);

  const series = useMemo(
    () =>
      buckets.map((b, i) => {
        const win = buckets.slice(Math.max(0, i - 2), i + 1);
        return { ...b, media: Math.round(win.reduce((a, x) => a + x.rate, 0) / win.length) };
      }),
    [buckets]
  );

  const half = Math.floor(buckets.length / 2);
  const avgOf = (arr: Bucket[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b.rate, 0) / arr.length) : 0;
  const avgAll = avgOf(buckets);
  const avgPrev = avgOf(buckets.slice(0, half));
  const avgRecent = avgOf(buckets.slice(half));
  const delta = avgRecent - avgPrev;
  const current = buckets[buckets.length - 1]?.rate ?? 0;
  const unit = mode === "semanal" ? "semanas" : "meses";
  const belowBuckets = buckets.filter((b) => b.rate < goal).length;
  const belowDaysTotal = buckets.reduce((a, b) => a + b.belowDays, 0);
  const totalDays = buckets.reduce((a, b) => a + b.days, 0);

  const selected = buckets.find((b) => b.label === openBucket) ?? null;

  const exportRows = useMemo(
    () =>
      buckets.map((b) => {
        const row: Record<string, string | number> = {
          Período: b.label,
          Dias: b.days,
          "Taxa média (%)": b.rate,
          "Meta (%)": goal,
          "Abaixo da meta": b.rate < goal ? "sim" : "não",
          "Dias abaixo da meta": b.belowDays,
        };
        NIGHT_PRACTICES.forEach((p) => { row[`${p.label} (%)`] = b[`p_${p.id}`]; });
        return row;
      }),
    [buckets, goal]
  );
  const exportHeaders = useMemo(
    () => Object.keys(exportRows[0] ?? { Período: "" }),
    [exportRows]
  );

  const stamp = localDateKey(new Date());

  return (
    <Card className="p-6 bg-card border-bege shadow-soft">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="font-display text-lg text-verde-profundo">
            📈 Tendência das práticas da noite
          </h4>
          <p className="text-sm text-muted-foreground">
            Taxa média de cumprimento nas últimas 12 {unit}. Clique em um período para ver os dias.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["semanal", "mensal"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setOpenBucket(null); }}
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

      {/* View + meta */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {([["total", "Total da noite"], ["praticas", "Por prática"]] as [View, string][]).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth border",
              view === v
                ? "bg-dourado text-verde-profundo border-dourado"
                : "bg-card text-verde-profundo border-bege hover:border-dourado"
            )}
          >
            {l}
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Meta:</span>
        {GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGoal(g)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-smooth border",
              goal === g
                ? "bg-verde-medio text-bege-claro border-verde-medio"
                : "bg-card text-verde-profundo border-bege hover:border-dourado"
            )}
          >
            {g}%
          </button>
        ))}
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
        <div
          className={cn(
            "p-4 rounded-xl border",
            delta >= 0 ? "bg-verde-medio/10 border-verde-medio/50" : "bg-dourado/15 border-dourado/60"
          )}
        >
          <p className="text-xs text-muted-foreground">6 {unit} recentes</p>
          <p className="font-display text-3xl text-verde-profundo">{avgRecent}%</p>
          <p className="text-xs text-muted-foreground">
            {delta >= 0 ? "▲ +" : "▼ "}
            {Math.abs(delta)} p.p. vs {avgPrev}% anteriores
          </p>
        </div>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/40">
          <p className="text-xs text-muted-foreground">Abaixo da meta ({goal}%)</p>
          <p className="font-display text-3xl text-verde-profundo">{belowBuckets}</p>
          <p className="text-xs text-muted-foreground">
            {unit} · {belowDaysTotal} de {totalDays} dias
          </p>
        </div>
      </div>

      <div className="h-72">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={series}
              margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              onClick={(e: any) => {
                const label = e?.activeLabel;
                if (label) setOpenBucket((cur) => (cur === label ? null : String(label)));
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, n: string) => [`${v}%`, n]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {/* Área de destaque: abaixo da meta */}
              <ReferenceArea y1={0} y2={goal} fill="hsl(var(--destructive))" fillOpacity={0.07} />
              <ReferenceLine
                y={goal}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 4"
                label={{ value: `meta ${goal}%`, position: "insideTopRight", fontSize: 11 }}
              />
              <ReferenceLine
                y={avgAll}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{ value: `média ${avgAll}%`, position: "insideBottomRight", fontSize: 11 }}
              />

              {view === "total" ? (
                <>
                  <Bar dataKey="rate" name="Taxa do período" radius={[6, 6, 0, 0]}>
                    {series.map((b) => (
                      <Cell
                        key={b.label}
                        fill={b.rate < goal ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                        fillOpacity={b.rate < goal ? 0.65 : 1}
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="media"
                    name="Tendência (média móvel)"
                    stroke="hsl(var(--accent-foreground))"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              ) : (
                NIGHT_PRACTICES.map((p, i) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={`p_${p.id}`}
                    name={`${p.icon} ${p.label}`}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                ))
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Dias do período selecionado */}
      {selected && (
        <div className="mt-5 p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="text-sm font-medium text-verde-profundo">
              Dias de {selected.label} · taxa média {selected.rate}% · {selected.belowDays} dia(s) abaixo da meta
            </p>
            <button
              type="button"
              onClick={() => setOpenBucket(null)}
              className="text-xs text-muted-foreground hover:text-verde-profundo"
            >
              fechar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.dates.map((d) => {
              const r = Math.round(rateOf(d));
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDetail({ date: d, done: dayMap.get(d) ?? new Set(), times })}
                  className={cn(
                    "px-2 py-1 rounded-lg border text-xs transition-smooth",
                    r >= goal
                      ? "bg-verde-medio/15 border-verde-medio/60 text-verde-profundo"
                      : "bg-destructive/10 border-destructive/40 text-verde-profundo"
                  )}
                  title={`${r}% de cumprimento`}
                >
                  {new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · {r}%
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Exportações */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCsv(`tendencia-noite-${mode}-${stamp}.csv`, exportHeaders, exportRows)}
        >
          ⬇️ Tendência {mode} (CSV)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadPdf(
              `tendencia-noite-${mode}-${stamp}.pdf`,
              "Tendência das práticas da noite",
              `Modo ${mode} · meta ${goal}% · média geral ${avgAll}% · ${belowBuckets} ${unit} abaixo da meta · gerado em ${new Date().toLocaleString("pt-BR")}`,
              [{ title: `Resumo ${mode}`, headers: ["Período", "Dias", "Taxa média (%)", "Abaixo da meta", "Dias abaixo da meta"], rows: exportRows }]
            )
          }
        >
          ⬇️ Tendência {mode} (PDF)
        </Button>
      </div>

      <DayDetailDialog
        detail={detail}
        practices={NIGHT_PRACTICES}
        onClose={() => setDetail(null)}
        scopeLabel="práticas da noite"
      />
    </Card>
  );
}
