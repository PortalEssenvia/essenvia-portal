import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { PracticesConfig } from "../hooks/usePractices";
import { ROUTINE_CATEGORIES, ROUTINE_TEMPLATES, WEEK_DAYS, PRACTICES } from "../constants";
import type { RoutineActivity, RoutineCategory, WeekDay, PracticeId } from "../types";
import { useRoutineActivities, useRoutineDone } from "../hooks/usePractices";
import { uid, minutesBetween } from "../utils";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  practicesCfg: PracticesConfig;
  /**
   * FIX 02 — Lista de IDs de práticas já concluídas hoje (vinda de useDailyDone em Ferramentas.tsx).
   * Permite que a Rotina mostre como concluídas as atividades vinculadas a práticas
   * que o usuário marcou na tela "Práticas de Hoje".
   */
  practicesDone: PracticeId[];
  /**
   * FIX 02 — Callback chamado quando o usuário marca como concluída uma atividade
   * da rotina que está vinculada a uma prática. Isso sincroniza o estado de volta
   * para a tela "Práticas de Hoje".
   */
  onPracticeDone: (id: PracticeId) => void;
}

const categoryIcon = (c: RoutineCategory) => ROUTINE_CATEGORIES.find((x) => x.value === c)?.icon || "📌";

function ActivityForm({ initial, onSave, onCancel }: { initial?: Partial<RoutineActivity>; onSave: (a: Omit<RoutineActivity, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "07:00");
  const [endTime, setEndTime] = useState(initial?.endTime || "07:30");
  const [category, setCategory] = useState<RoutineCategory>(initial?.category || "Pessoal");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [repeat, setRepeat] = useState<"daily" | "weekly" | "once">(initial?.repeat || "daily");
  const [days, setDays] = useState<WeekDay[]>(initial?.days || [1, 2, 3, 4, 5]);

  return (
    <div className="space-y-3">
      <div>
        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reunião de equipe" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Início</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
        <div><Label>Fim</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
      </div>
      <div>
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as RoutineCategory)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROUTINE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.icon} {c.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Repetição</Label>
        <Select value={repeat} onValueChange={(v) => setRepeat(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Todos os dias</SelectItem>
            <SelectItem value="weekly">Dias específicos</SelectItem>
            <SelectItem value="once">Apenas hoje</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {repeat === "weekly" && (
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => {
            const a = days.includes(d.value as WeekDay);
            return (
              <button key={d.value} type="button" onClick={() => setDays(a ? days.filter((x) => x !== d.value) : [...days, d.value as WeekDay])}
                className={cn("px-3 py-1 rounded-full text-xs border", a ? "bg-verde-profundo text-bege-claro border-verde-profundo" : "bg-card border-bege")}>
                {d.label}
              </button>
            );
          })}
        </div>
      )}
      <div><Label>Observações (opcional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <div className="flex gap-2">
        <Button onClick={() => { if (!name.trim()) { toast.error("Nome obrigatório"); return; } onSave({ name, startTime, endTime, category, notes, repeat, days: repeat === "weekly" ? days : undefined }); }}>Salvar</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

export function RoutineBuilder({ practicesCfg, practicesDone, onPracticeDone }: Props) {
  const [activities, setActivities] = useRoutineActivities<RoutineActivity>();
  const [doneIds, toggleDoneId] = useRoutineDone();
  const [view, setView] = useState<"list" | "timeline">("timeline");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Merge practice schedules (read-only entries, not stored in routine)
  const merged = useMemo(() => {
    const today = now.getDay() as WeekDay;
    const fromPractices: RoutineActivity[] = PRACTICES
      .filter((p) => practicesCfg[p.id].active && practicesCfg[p.id].days.includes(today) && !activities.some((a) => a.practiceId === p.id))
      .map((p) => ({
        id: `practice-${p.id}`,
        name: `${p.icon} ${p.label}`,
        startTime: practicesCfg[p.id].startTime,
        endTime: practicesCfg[p.id].endTime,
        category: "Espiritual" as RoutineCategory,
        repeat: "daily" as const,
        practiceId: p.id,
      }));
    return [...activities.filter((a) => a.repeat !== "weekly" || (a.days || []).includes(today)), ...fromPractices]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [activities, practicesCfg, now]);

  /**
   * FIX 02 — `isActivityDone` verifica se uma atividade está concluída considerando
   * DUAS fontes de verdade:
   * 1. `doneIds` — atividades marcadas diretamente na tela "Minha Rotina"
   * 2. `practicesDone` — práticas marcadas em "Práticas de Hoje" (via prop do pai)
   *
   * Isso garante que se o usuário conclui "Oração" em "Práticas de Hoje",
   * a atividade "Oração" em "Minha Rotina" também aparece como concluída.
   */
  const isActivityDone = (a: RoutineActivity): boolean => {
    if (doneIds.includes(a.id)) return true;
    // Se a atividade tem um practiceId vinculado, verifica se a prática foi concluída
    if (a.practiceId && practicesDone.includes(a.practiceId as PracticeId)) return true;
    return false;
  };

  /**
   * FIX 02 — `handleToggleDone` agora sincroniza nos dois sentidos:
   * - Se a atividade tem practiceId, chama `onPracticeDone` para atualizar
   *   "Práticas de Hoje" também.
   * - Sempre chama `toggleDoneId` para atualizar o estado local da rotina.
   */
  const handleToggleDone = (a: RoutineActivity) => {
    toggleDoneId(a.id);
    // FIX 02: sincroniza com "Práticas de Hoje" se houver vínculo
    if (a.practiceId && !practicesDone.includes(a.practiceId as PracticeId)) {
      onPracticeDone(a.practiceId as PracticeId);
    }
  };

  // FIX 02: completed considera ambas as fontes
  const completed = merged.filter((a) => isActivityDone(a)).length;
  const total = merged.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isCurrent = (a: RoutineActivity) => {
    const [sh, sm] = a.startTime.split(":").map(Number);
    const [eh, em] = a.endTime.split(":").map(Number);
    return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
  };
  const next = merged.find((a) => {
    const [sh, sm] = a.startTime.split(":").map(Number);
    return sh * 60 + sm > currentMinutes;
  });
  const minutesUntilNext = next ? (() => {
    const [sh, sm] = next.startTime.split(":").map(Number);
    return sh * 60 + sm - currentMinutes;
  })() : null;

  const applyTemplate = (key: string) => {
    const tpl = ROUTINE_TEMPLATES[key];
    if (!tpl) return;
    setActivities(tpl.activities.map((a) => ({ ...a, id: uid() })));
    toast.success(`Template "${tpl.name}" aplicado`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-verde-profundo">Minha Rotina</h3>
          <p className="text-sm text-muted-foreground">{completed} de {total} atividades concluídas {minutesUntilNext != null && next && `· próxima em ${minutesUntilNext} min`}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">📋 Usar template</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(ROUTINE_TEMPLATES).map(([k, v]) => (
                <DropdownMenuItem key={k} onClick={() => applyTemplate(k)}>{v.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setView(view === "list" ? "timeline" : "list")}>
            {view === "list" ? <Calendar className="w-4 h-4 mr-1" /> : <List className="w-4 h-4 mr-1" />}{view === "list" ? "Timeline" : "Lista"}
          </Button>
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild><Button size="sm" className="bg-dourado text-verde-profundo hover:bg-dourado-claro"><Plus className="w-4 h-4 mr-1" />Atividade</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova atividade</DialogTitle></DialogHeader>
              <ActivityForm onSave={(a) => { setActivities([...activities, { id: uid(), ...a }]); setAdding(false); toast.success("Adicionada"); }} onCancel={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="h-2 bg-bege rounded-full overflow-hidden">
        <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} />
      </div>

      {merged.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bege p-12 text-center text-muted-foreground">
          Nenhuma atividade ainda. Use um template ou adicione a primeira.
        </div>
      ) : view === "timeline" ? (
        <div className="relative">
          <div className="absolute left-16 top-0 bottom-0 w-px bg-bege" />
          <div className="space-y-3">
            {merged.map((a) => {
              // FIX 02: usa isActivityDone que considera ambas as fontes
              const isDone = isActivityDone(a);
              const cur = isCurrent(a);
              const dur = minutesBetween(a.startTime, a.endTime);
              return (
                <div key={a.id} className="flex items-start gap-4 relative">
                  <div className="w-12 text-right pt-3 text-sm font-medium text-verde-medio tabular-nums">{a.startTime}</div>
                  <div className={cn("w-3 h-3 rounded-full mt-4 z-10 border-2", cur ? "bg-dourado border-dourado animate-pulse" : isDone ? "bg-verde-medio border-verde-medio" : "bg-card border-bege")} />
                  <div className={cn(
                    "flex-1 rounded-xl border p-3 transition-smooth",
                    cur ? "border-dourado bg-dourado/10 shadow-card" : isDone ? "border-verde-medio/40 bg-verde-medio/5" : "border-bege bg-bege-claro/60"
                  )}>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{categoryIcon(a.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-verde-profundo", isDone && "line-through opacity-60")}>{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.startTime} – {a.endTime} · {dur} min · {a.category}</p>
                        {a.notes && <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>}
                      </div>
                      {/* FIX 02: handleToggleDone sincroniza entre as duas telas */}
                      <Button size="icon" variant="ghost" onClick={() => handleToggleDone(a)} className={cn(isDone && "text-verde-medio")}><Check className="w-4 h-4" /></Button>
                      {!a.practiceId && (
                        <>
                          <Dialog open={editingId === a.id} onOpenChange={(o) => setEditingId(o ? a.id : null)}>
                            <DialogTrigger asChild><Button size="icon" variant="ghost"><Pencil className="w-4 h-4" /></Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Editar atividade</DialogTitle></DialogHeader>
                              <ActivityForm initial={a} onSave={(p) => { setActivities(activities.map((x) => x.id === a.id ? { ...x, ...p } : x)); setEditingId(null); }} onCancel={() => setEditingId(null)} />
                            </DialogContent>
                          </Dialog>
                          <Button size="icon" variant="ghost" onClick={() => setActivities(activities.filter((x) => x.id !== a.id))}><Trash2 className="w-4 h-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {merged.map((a) => {
            // FIX 02: usa isActivityDone que considera ambas as fontes
            const isDone = isActivityDone(a);
            return (
              <div key={a.id} className={cn("flex items-center gap-3 p-3 rounded-lg border", isDone ? "bg-verde-medio/5 border-verde-medio/40" : "bg-bege-claro/60 border-bege")}>
                <span className="text-xl">{categoryIcon(a.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-verde-profundo", isDone && "line-through opacity-60")}>{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.startTime} – {a.endTime} · {a.category}</p>
                </div>
                {/* FIX 02: handleToggleDone sincroniza entre as duas telas */}
                <Button size="icon" variant="ghost" onClick={() => handleToggleDone(a)}><Check className={cn("w-4 h-4", isDone && "text-verde-medio")} /></Button>
                {!a.practiceId && <Button size="icon" variant="ghost" onClick={() => setActivities(activities.filter((x) => x.id !== a.id))}><Trash2 className="w-4 h-4" /></Button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
