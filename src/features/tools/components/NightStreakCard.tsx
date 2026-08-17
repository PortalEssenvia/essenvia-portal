import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NIGHT_PRACTICES, localDateKey } from "../constants";
import { useNightStreak } from "../hooks/usePractices";
import type { PracticeId } from "../types";

const THRESHOLDS = [50, 80, 100] as const;

/**
 * Sequência (streak) das práticas da noite: dias seguidos mantendo a taxa
 * mínima de cumprimento escolhida pelo usuário.
 */
export function NightStreakCard({
  logs = [],
}: {
  /** Logs já carregados (data + prática) para desenhar as últimas noites. */
  logs?: { date: string; practice: PracticeId }[];
}) {
  const [minRate, setMinRate] = useState<number>(80);
  const { streak, best, todayRate } = useNightStreak(minRate);

  const nightIds = useMemo(() => new Set(NIGHT_PRACTICES.map((p) => p.id as string)), []);

  // Últimas 14 noites
  const lastNights = useMemo(() => {
    const map = new Map<string, Set<string>>();
    logs.forEach((l) => {
      if (!nightIds.has(l.practice)) return;
      const s = map.get(l.date) ?? new Set<string>();
      s.add(l.practice);
      map.set(l.date, s);
    });
    const out: { key: string; label: string; rate: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = localDateKey(d);
      out.push({
        key: k,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        rate: Math.round(((map.get(k)?.size ?? 0) / nightIds.size) * 100),
      });
    }
    return out;
  }, [logs, nightIds]);

  return (
    <Card className="p-6 bg-card border-bege shadow-soft">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="font-display text-lg text-verde-profundo">🌙 Sequência das práticas da noite</h4>
          <p className="text-sm text-muted-foreground">
            Dias seguidos mantendo pelo menos {minRate}% das práticas noturnas.
          </p>
        </div>
        <div className="flex gap-2">
          {THRESHOLDS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMinRate(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-smooth border",
                minRate === t
                  ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                  : "bg-card text-verde-profundo border-bege hover:border-dourado"
              )}
            >
              meta {t}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-verde-medio/10 border border-verde-medio/50">
          <p className="text-xs text-muted-foreground">Sequência atual</p>
          <p className="font-display text-3xl text-verde-profundo">
            {streak}
            <span className="text-base ml-1">🔥</span>
          </p>
          <p className="text-xs text-muted-foreground">{streak === 1 ? "dia" : "dias"} seguidos</p>
        </div>
        <div className="p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <p className="text-xs text-muted-foreground">Melhor sequência</p>
          <p className="font-display text-3xl text-verde-profundo">{best}</p>
          <p className="text-xs text-muted-foreground">no último ano</p>
        </div>
        <div className="p-4 rounded-xl bg-bege-claro/60 border border-bege">
          <p className="text-xs text-muted-foreground">Hoje</p>
          <p className="font-display text-3xl text-verde-profundo">{todayRate}%</p>
          <p className="text-xs text-muted-foreground">
            {todayRate >= minRate ? "meta atingida ✓" : "meta ainda não atingida"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {lastNights.map((n) => (
          <div
            key={n.key}
            title={`${n.label} — ${n.rate}%`}
            className={cn(
              "w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-medium",
              n.rate >= minRate
                ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                : n.rate > 0
                ? "bg-dourado/25 text-verde-profundo border-dourado/60"
                : "bg-bege-claro/50 text-muted-foreground border-bege"
            )}
          >
            {n.rate > 0 ? n.rate : "–"}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">Últimas 14 noites (% de cumprimento)</p>
    </Card>
  );
}
