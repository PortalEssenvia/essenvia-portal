import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { toast } from "@/hooks/use-toast";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const practices = [
  { id: "oracao", icon: "🙏", label: "Oração" },
  { id: "meditacao", icon: "🧘", label: "Meditação" },
  { id: "afirmacao", icon: "✨", label: "Afirmação Positiva" },
  { id: "leitura", icon: "📚", label: "Leitura" },
  { id: "gratidao", icon: "🙌", label: "Gratidão" },
  { id: "visualizacao", icon: "🌟", label: "Visualizações" },
  { id: "atividade", icon: "🏃", label: "Atividade Física" },
  { id: "diario", icon: "📓", label: "Diário" },
];

const STORAGE_KEY = "essenvia_habits_v1";
const todayKey = () => new Date().toISOString().slice(0, 10);

type Store = Record<string, string[]>; // dateKey -> [practiceId]

const loadStore = (): Store => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
};

const Ferramentas = () => {
  const [store, setStore] = useState<Store>({});
  const [now, setNow] = useState(new Date());

  useEffect(() => { setStore(loadStore()); }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }, [store]);

  const today = todayKey();
  const todayDone = store[today] || [];

  const toggle = (id: string) => {
    setStore((prev) => {
      const cur = prev[today] || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      const newStore = { ...prev, [today]: next };
      const p = practices.find((x) => x.id === id)!;
      if (!cur.includes(id)) {
        toast({ title: `${p.icon} ${p.label}`, description: "Prática registrada. Continue assim!" });
        if (next.length === practices.length) {
          setTimeout(() => toast({ title: "🌟 Dia completo!", description: "Você completou todas as práticas hoje!" }), 400);
        }
      }
      return newStore;
    });
  };

  const progress = (todayDone.length / practices.length) * 100;

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if ((store[k] || []).length === practices.length) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }, [store]);

  // Month calendar
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dayStatus = (day: number) => {
    const k = new Date(year, month, day).toISOString().slice(0, 10);
    const done = (store[k] || []).length;
    if (done === practices.length) return "full";
    if (done > 0) return "partial";
    return "empty";
  };

  // Weekly summary (last 7 days)
  const week = useMemo(() => {
    const out: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      out.push({ label: d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3), count: (store[k] || []).length });
    }
    return out;
  }, [store]);

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-soft">
        <div className="container">
          <SectionHeader eyebrow="Ferramentas" title="Sua rotina diária consciente" subtitle="Pequenos passos diários, todos os dias. É assim que se constrói uma vida nova." />
        </div>
      </section>

      <section className="pb-24 -mt-10">
        <div className="container grid lg:grid-cols-3 gap-8">
          {/* Practices checklist */}
          <Card className="lg:col-span-2 p-8 bg-card shadow-soft border-bege">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-2xl text-verde-profundo">Práticas de hoje</h3>
                <p className="text-sm text-muted-foreground">{todayDone.length} de {practices.length} práticas concluídas</p>
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
              {practices.map((p) => {
                const done = todayDone.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border text-left transition-smooth",
                      done ? "bg-verde-profundo/5 border-verde-medio" : "bg-bege-claro border-bege hover:border-dourado"
                    )}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="flex-1 font-medium text-verde-profundo">{p.label}</span>
                    <span className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-smooth",
                      done ? "bg-verde-medio border-verde-medio scale-110" : "border-bege"
                    )}>
                      {done && <Check className="w-4 h-4 text-bege-claro animate-scale-in" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {todayDone.length === practices.length && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-gold text-verde-profundo text-center font-semibold animate-fade-in">
                🌟 Você completou todas as práticas hoje!
              </div>
            )}
          </Card>

          {/* Weekly chart */}
          <Card className="p-8 bg-card shadow-soft border-bege">
            <h3 className="font-display text-2xl text-verde-profundo mb-6">Últimos 7 dias</h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {week.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-verde-profundo to-verde-medio rounded-t transition-all"
                      style={{ height: `${(d.count / practices.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Calendar */}
          <Card className="lg:col-span-3 p-8 bg-card shadow-soft border-bege">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-verde-profundo capitalize">
                {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-verde-medio" />Completo</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-dourado/60" />Parcial</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-bege" />Vazio</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((d) => {
                const st = dayStatus(d);
                return (
                  <div
                    key={d}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-sm font-medium",
                      st === "full" && "bg-verde-medio text-bege-claro",
                      st === "partial" && "bg-dourado/40 text-verde-profundo",
                      st === "empty" && "bg-bege text-verde-profundo/50"
                    )}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Ferramentas;
