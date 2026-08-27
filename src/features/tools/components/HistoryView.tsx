import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PRACTICES, MORNING_PRACTICES, NIGHT_PRACTICES, localDateKey } from "../constants";
import type { PracticeId } from "../types";
import { cn } from "@/lib/utils";
import { NightStreakCard } from "./NightStreakCard";
import { NightTrendCard } from "./NightTrendCard";
import { DayDetailDialog, type DayDetail } from "./DayDetailDialog";
import { downloadCsv, downloadPdf } from "../lib/exportHistory";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts";


type Range = 7 | 30 | 90;
type PeriodFilter = "todas" | "manha" | "noite";

type LogRow = { date: string; practice: PracticeId; at: string | null };

/**
 * Histórico & Evolução — busca daily_practice_logs do usuário no intervalo
 * selecionado e exibe:
 *  - gráfico de linha: práticas concluídas por dia
 *  - gráfico de barras: total por prática no período
 *  - lista de dias com detalhe das práticas concluídas
 */
export function HistoryView() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>(30);
  const [period, setPeriod] = useState<PeriodFilter>("todas");
  const [allLogs, setAllLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setAllLogs([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - (range - 1));
      const { data } = await supabase
        .from("daily_practice_logs")
        .select("log_date,practice_key,completed,completed_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("log_date", localDateKey(since))
        .order("log_date", { ascending: false });
      if (cancelled) return;
      setAllLogs(((data ?? []) as any[]).map((r) => ({
        date: r.log_date, practice: r.practice_key, at: r.completed_at ?? null,
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, range]);

  // Practices considered for the selected period
  const scopePractices = useMemo(
    () => (period === "manha" ? MORNING_PRACTICES : period === "noite" ? NIGHT_PRACTICES : PRACTICES),
    [period]
  );
  const scopeIds = useMemo(() => new Set(scopePractices.map((p) => p.id)), [scopePractices]);
  const target = scopePractices.length;

  const logs = useMemo(() => allLogs.filter((l) => scopeIds.has(l.practice)), [allLogs, scopeIds]);

  // Completion time per date+practice
  const timeOf = useMemo(() => {
    const m = new Map<string, string>();
    allLogs.forEach((l) => {
      if (!l.at) return;
      m.set(`${l.date}|${l.practice}`, new Date(l.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    });
    return m;
  }, [allLogs]);

  // Map date -> practices done
  const byDate = useMemo(() => {
    const m = new Map<string, Set<PracticeId>>();
    logs.forEach((l) => {
      const s = m.get(l.date) ?? new Set<PracticeId>();
      s.add(l.practice);
      m.set(l.date, s);
    });
    return m;
  }, [logs]);

  // Build continuous day series for the range
  const series = useMemo(() => {
    const out: { date: string; label: string; count: number; rate: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = localDateKey(d);
      out.push({
        date: k,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        count: byDate.get(k)?.size ?? 0,
        rate: Math.round(((byDate.get(k)?.size ?? 0) / target) * 100),
      });
    }
    return out;
  }, [byDate, range, target]);

  // Per-practice totals
  const perPractice = useMemo(() => {
    return scopePractices.map((p) => ({
      name: p.label,
      icon: p.icon,
      total: logs.filter((l) => l.practice === p.id).length,
    }));
  }, [logs, scopePractices]);

  const totalDone = logs.length;
  const fullDays = useMemo(
    () => Array.from(byDate.values()).filter((s) => s.size === target).length,
    [byDate, target]
  );
  const avgPerDay = (totalDone / range).toFixed(1);
  const adherence = Math.round((totalDone / (range * target)) * 100);

  // Detailed history list (only days with at least one practice)
  const historyList = useMemo(() => {
    return series
      .slice()
      .reverse()
      .filter((d) => d.count > 0)
      .map((d) => ({
        ...d,
        practices: scopePractices.filter((p) => byDate.get(d.date)?.has(p.id)),
        full: (byDate.get(d.date)?.size ?? 0) === target,
        prettyDate: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", {
          weekday: "long", day: "2-digit", month: "long",
        }),
      }));
  }, [series, byDate, scopePractices, target]);

  // Day detail dialog
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const openDay = (date: string) =>
    setDetail({ date, done: byDate.get(date) ?? new Set<PracticeId>(), times: timeOf });

  const periodLabel = period === "manha" ? "Manhã" : period === "noite" ? "Noite" : "Todas";
  const stamp = localDateKey(new Date());

  const exportHeaders = ["Data", "Concluídas", "Meta", "Cumprimento (%)", "Práticas"];
  const exportRows = useMemo(
    () =>
      series
        .slice()
        .reverse()
        .map((d) => ({
          Data: d.date,
          "Concluídas": d.count,
          Meta: target,
          "Cumprimento (%)": d.rate,
          "Práticas": scopePractices
            .filter((p) => byDate.get(d.date)?.has(p.id))
            .map((p) => p.label)
            .join(", "),
        })),
    [series, byDate, scopePractices, target]
  );


  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl text-verde-profundo">Histórico & Evolução</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua jornada e veja como você está evoluindo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([["todas", "Todas"], ["manha", "☀️ Manhã"], ["noite", "🌙 Noite"]] as [PeriodFilter, string][]).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setPeriod(v)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth border",
                period === v
                  ? "bg-dourado text-verde-profundo border-dourado"
                  : "bg-card text-verde-profundo border-bege hover:border-dourado"
              )}
            >
              {l}
            </button>
          ))}
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-smooth border",
                range === r
                  ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                  : "bg-card text-verde-profundo border-bege hover:border-dourado"
              )}
            >
              {r} dias
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-card border-bege shadow-soft">
          <p className="text-xs text-muted-foreground">Práticas concluídas</p>
          <p className="font-display text-3xl text-verde-profundo">{totalDone}</p>
        </Card>
        <Card className="p-4 bg-card border-bege shadow-soft">
          <p className="text-xs text-muted-foreground">Dias completos</p>
          <p className="font-display text-3xl text-verde-profundo">{fullDays}</p>
        </Card>
        <Card className="p-4 bg-card border-bege shadow-soft">
          <p className="text-xs text-muted-foreground">Média por dia</p>
          <p className="font-display text-3xl text-verde-profundo">{avgPerDay}</p>
        </Card>
        <Card className="p-4 bg-card border-bege shadow-soft">
          <p className="text-xs text-muted-foreground">Aderência</p>
          <p className="font-display text-3xl text-verde-profundo">{adherence}%</p>
        </Card>
      </div>

      {/* Night streak */}
      <NightStreakCard logs={allLogs} />

      {/* Night trend */}
      <NightTrendCard />

      {/* Evolution chart */}
      <Card className="p-6 bg-card border-bege shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h4 className="font-display text-lg text-verde-profundo">Evolução diária</h4>
          <p className="text-xs text-muted-foreground">Clique em um dia para ver os detalhes</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              onClick={(s: any) => {
                const d = s?.activePayload?.[0]?.payload;
                if (d?.date) openDay(d.date);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                domain={[0, target]}
                allowDecimals={false}
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
                formatter={(v: number) => [`${v} / ${target} (${Math.round((v / target) * 100)}%)`, "Práticas"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Per-practice chart */}
      <Card className="p-6 bg-card border-bege shadow-soft">
        <h4 className="font-display text-lg text-verde-profundo mb-4">Por prática</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perPractice} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="icon" tick={{ fontSize: 16 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, _n, p: any) => [`${v} dias`, p?.payload?.name]}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed history list */}
      <Card className="p-6 bg-card border-bege shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h4 className="font-display text-lg text-verde-profundo">Dias anteriores</h4>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(`historico-${period}-${range}d-${stamp}.csv`, exportHeaders, exportRows)
              }
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadPdf(
                  `historico-${period}-${range}d-${stamp}.pdf`,
                  "Histórico de práticas",
                  `Período: ${periodLabel} · Últimos ${range} dias · Aderência ${adherence}%`,
                  [{ title: "Resumo diário", headers: exportHeaders, rows: exportRows }]
                )
              }
            >
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : historyList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma prática concluída neste período ainda. Comece marcando suas práticas de hoje!
          </p>
        ) : (
          <ul className="space-y-3">
            {historyList.map((d) => (
              <li
                key={d.date}
                role="button"
                tabIndex={0}
                onClick={() => openDay(d.date)}
                onKeyDown={(e) => e.key === "Enter" && openDay(d.date)}
                className={cn(
                  "p-4 rounded-xl border flex flex-wrap items-center gap-3 cursor-pointer transition-smooth hover:border-dourado",
                  d.full
                    ? "bg-verde-medio/10 border-verde-medio/60"
                    : "bg-bege-claro/50 border-bege"
                )}
              >
                <div className="min-w-[180px]">
                  <p className="font-medium text-verde-profundo capitalize">{d.prettyDate}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.count} de {target} práticas · {d.rate}% de cumprimento
                    {d.full && " · 🌟 dia completo"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {d.practices.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-bege text-xs text-verde-profundo"
                      title={p.label}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {timeOf.get(`${d.date}|${p.id}`) && (
                        <span className="text-muted-foreground">
                          {timeOf.get(`${d.date}|${p.id}`)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}