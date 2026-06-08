import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PRACTICES, PRACTICE_IDS, localDateKey } from "@/features/tools/constants";
import { useDailyDone, useDailyHistory, usePracticesConfig, useStreak } from "@/features/tools/hooks/usePractices";
import type { PracticeId } from "@/features/tools/types";
import { PracticeCard } from "@/features/tools/components/PracticeCard";
import { RoutineBuilder } from "@/features/tools/components/RoutineBuilder";
import { HistoryView } from "@/features/tools/components/HistoryView";

import { PrayerPractice } from "@/features/tools/practices/PrayerPractice";
import { AffirmationsPractice } from "@/features/tools/practices/AffirmationsPractice";
import { GratitudePractice } from "@/features/tools/practices/GratitudePractice";
import { PhysicalPractice } from "@/features/tools/practices/PhysicalPractice";
import { MeditationPractice } from "@/features/tools/practices/MeditationPractice";
import { ReadingPractice } from "@/features/tools/practices/ReadingPractice";
import { VisualizationPractice } from "@/features/tools/practices/VisualizationPractice";
import { DiaryPractice } from "@/features/tools/practices/DiaryPractice";

const Ferramentas = () => {
  const { cfg, update, isSaving } = usePracticesConfig();
  const { done, toggle, mark } = useDailyDone();
  const streak = useStreak();
  const history = useDailyHistory(35);
  const [open, setOpen] = useState<PracticeId | null>(null);

  /**
   * FIX 01 — Usa `new Date()` apenas para calcular o calendário/semana,
   * mas todas as comparações de data usam `localDateKey()` ao invés de
   * `toISOString().slice(0,10)` (UTC) para garantir o fuso horário correto.
   */
  const [now] = useState(new Date());

  const handleToggle = (id: PracticeId) => {
    const wasDone = done.includes(id);
    toggle(id);
    const meta = PRACTICES.find((p) => p.id === id)!;
    if (!wasDone) {
      toast.success(`${meta.icon} ${meta.label} concluída!`);
      const newCount = done.length + 1;
      if (newCount === PRACTICE_IDS.length) {
        setTimeout(() => toast.success("🌟 Você completou todas as práticas hoje!", { duration: 5000 }), 400);
      }
    }
  };

  const handleComplete = (id: PracticeId) => {
    if (done.includes(id)) return;
    mark(id);
    const meta = PRACTICES.find((p) => p.id === id)!;
    toast.success(`${meta.icon} ${meta.label} concluída!`);
    const newCount = done.length + 1;
    if (newCount === PRACTICE_IDS.length) {
      setTimeout(() => toast.success("🌟 Você completou todas as práticas hoje!", { duration: 5000 }), 400);
    }
  };

  const progress = (done.length / PRACTICE_IDS.length) * 100;

  // Month calendar
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  /**
   * FIX 01 — dayStatus usa `localDateKey()` para construir a chave da data
   * de forma correta no fuso do usuário, ao invés de `toISOString().slice(0,10)`.
   * FIX 03 — O dia de hoje usa `done` (estado reativo atualizado em tempo real)
   * para refletir as práticas concluídas imediatamente no calendário.
   */
  const todayLocalKey = localDateKey(now);
  const dayStatus = (day: number) => {
    const k = localDateKey(new Date(year, month, day));
    const arr = (k === todayLocalKey ? done : history[k]) ?? [];
    if (arr.length === PRACTICE_IDS.length) return "full";
    if (arr.length > 0) return "partial";
    return "empty";
  };

  /**
   * FIX 01 — O gráfico de "Últimos 7 dias" usa `localDateKey()` para calcular
   * as datas corretamente no fuso horário do usuário.
   * FIX 03 — O dia de hoje usa o estado `done` reativo para mostrar progresso
   * em tempo real, sem depender de uma recarga ou nova busca no banco.
   */
  const week = useMemo(() => {
    const out: { label: string; count: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // FIX 01: usa localDateKey ao invés de toISOString().slice(0,10)
      const k = localDateKey(d);
      const arr = (k === todayLocalKey ? done : history[k]) ?? [];
      out.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3),
        count: arr.length,
        date: k,
      });
    }
    return out;
  }, [done, history, todayLocalKey]);

  return (
    <>
      {isSaving && (
        <div className="fixed top-32 right-4 z-50 px-3 py-1.5 rounded-full bg-verde-profundo/90 text-bege-claro text-xs font-medium shadow-soft animate-fade-in">
          Salvando...
        </div>
      )}
      <section className="py-12 md:py-20 bg-gradient-soft">
        <div className="container">
          <SectionHeader
            eyebrow="Ferramentas"
            title="Sua rotina diária consciente"
            subtitle="Pequenos passos diários, todos os dias. É assim que se constrói uma vida nova."
          />
        </div>
      </section>

      <section className="pb-24 -mt-6">
        <div className="container">
          <Tabs defaultValue="praticas" className="w-full">
            <TabsList className="bg-bege border border-bege mb-8">
              <TabsTrigger value="praticas">🌿 Práticas</TabsTrigger>
              <TabsTrigger value="rotina">📅 Minha Rotina</TabsTrigger>
              <TabsTrigger value="historico">📈 Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="praticas" className="space-y-8">
              <div className="grid lg:grid-cols-10 gap-6">
                {/* LEFT 70% */}
                <div className="lg:col-span-7 space-y-6">
                  <Card className="p-6 md:p-8 bg-card shadow-soft border-bege">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-display text-2xl text-verde-profundo">Práticas de Hoje</h3>
                        <p className="text-sm text-muted-foreground">{done.length} de {PRACTICE_IDS.length} práticas concluídas</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-dourado/15 text-verde-profundo">
                        <Flame className="w-4 h-4 text-dourado" />
                        <span className="font-semibold text-sm">{streak} {streak === 1 ? "dia" : "dias"} seguidos</span>
                      </div>
                    </div>

                    <div className="h-3 bg-bege rounded-full overflow-hidden mb-8">
                      <div className="h-full bg-gradient-gold transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {PRACTICES.map((p) => (
                        <PracticeCard
                          key={p.id}
                          meta={p}
                          done={done.includes(p.id)}
                          active={cfg[p.id].active}
                          scheduleLabel={`${cfg[p.id].startTime} – ${cfg[p.id].endTime}`}
                          onToggle={() => handleToggle(p.id)}
                          onOpen={() => setOpen(p.id)}
                        />
                      ))}
                    </div>

                    {done.length === PRACTICE_IDS.length && (
                      <div className="mt-6 p-4 rounded-xl bg-gradient-gold text-verde-profundo text-center font-semibold animate-fade-in">
                        🌟 Você completou todas as práticas hoje!
                      </div>
                    )}
                  </Card>
                </div>

                {/* RIGHT 30% */}
                <div className="lg:col-span-3 space-y-6">
                  <Card className="p-6 bg-card shadow-soft border-bege">
                    <h3 className="font-display text-xl text-verde-profundo mb-4">Últimos 7 dias</h3>
                    <div className="flex items-end justify-between gap-2 h-32">
                      {week.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex-1 flex items-end">
                            <div
                              className="w-full bg-gradient-to-t from-verde-profundo to-verde-medio rounded-t transition-all"
                              style={{ height: `${(d.count / PRACTICE_IDS.length) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground capitalize">{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card shadow-soft border-bege">
                    <h3 className="font-display text-lg text-verde-profundo capitalize mb-4">
                      {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </h3>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-[10px] text-muted-foreground text-center">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <div key={i}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                        const st = dayStatus(d);
                        const isToday = d === now.getDate();
                        return (
                          <div key={d} className={cn(
                            "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                            st === "full" && "bg-verde-medio text-bege-claro",
                            st === "partial" && "bg-dourado/40 text-verde-profundo",
                            st === "empty" && "bg-bege/60 text-verde-profundo/50",
                            isToday && "ring-2 ring-dourado"
                          )}>{d}</div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-verde-medio" />Completo</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-dourado/60" />Parcial</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-bege" />Vazio</span>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/**
             * FIX 02 — `done` (estado reativo das práticas do dia) é passado ao
             * RoutineBuilder. Com isso, quando o usuário marca uma prática como
             * concluída em "Práticas de Hoje", a atividade vinculada em "Minha Rotina"
             * também aparece como concluída automaticamente (e vice-versa via onPracticeDone).
             */}
            <TabsContent value="rotina">
              <Card className="p-6 md:p-8 bg-card shadow-soft border-bege">
                <RoutineBuilder
                  practicesCfg={cfg}
                  practicesDone={done}
                  onPracticeDone={handleComplete}
                />
              </Card>
            </TabsContent>

            {/* Histórico & evolução do usuário ao longo do tempo */}
            <TabsContent value="historico">
              <Card className="p-6 md:p-8 bg-card shadow-soft border-bege">
                <HistoryView />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Drawers */}
      <PrayerPractice open={open === "oracao"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.oracao} onChange={(p) => update("oracao", p)} done={done.includes("oracao")} onComplete={() => handleComplete("oracao")} />
      <AffirmationsPractice open={open === "afirmacao"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.afirmacao} onChange={(p) => update("afirmacao", p)} done={done.includes("afirmacao")} onComplete={() => handleComplete("afirmacao")} />
      <GratitudePractice open={open === "gratidao"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.gratidao} onChange={(p) => update("gratidao", p)} done={done.includes("gratidao")} onComplete={() => handleComplete("gratidao")} />
      <PhysicalPractice open={open === "atividade"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.atividade} onChange={(p) => update("atividade", p)} done={done.includes("atividade")} onComplete={() => handleComplete("atividade")} />
      <MeditationPractice open={open === "meditacao"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.meditacao} onChange={(p) => update("meditacao", p)} done={done.includes("meditacao")} onComplete={() => handleComplete("meditacao")} />
      <ReadingPractice open={open === "leitura"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.leitura} onChange={(p) => update("leitura", p)} done={done.includes("leitura")} onComplete={() => handleComplete("leitura")} />
      <VisualizationPractice open={open === "visualizacao"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.visualizacao} onChange={(p) => update("visualizacao", p)} done={done.includes("visualizacao")} onComplete={() => handleComplete("visualizacao")} />
      <DiaryPractice open={open === "diario"} onOpenChange={(o) => !o && setOpen(null)} data={cfg.diario} onChange={(p) => update("diario", p)} done={done.includes("diario")} onComplete={() => handleComplete("diario")} />
    </>
  );
};

export default Ferramentas;
