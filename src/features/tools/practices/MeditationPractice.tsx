import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { MediaUpload } from "../components/MediaUpload";
import { MEDITATION_SUGGESTIONS, PRACTICES } from "../constants";
import type { MeditationData, MeditationItem, MeditationType } from "../types";
import { uid, playBell } from "../utils";
import { Trash2, Pencil, ChevronDown, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: MeditationData;
  onChange: (patch: Partial<MeditationData>) => void;
}

const meta = PRACTICES.find((p) => p.id === "meditacao")!;
const TYPES: MeditationType[] = ["Guiada", "Silenciosa", "Respiração", "Mantra"];

function Timer() {
  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          playBell();
          toast.success("🔔 Meditação concluída");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const start = (m: number) => { setRemaining(m * 60); setRunning(true); };
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="rounded-xl bg-gradient-deep text-bege-claro p-6 text-center space-y-3">
      <p className="text-xs uppercase tracking-widest opacity-70">Timer de meditação</p>
      <p className="font-display text-5xl tabular-nums">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</p>
      <div className="flex justify-center gap-2 flex-wrap">
        {[5, 10, 15, 20, 30].map((m) => (
          <Button key={m} size="sm" variant="outline" className="border-dourado/50 text-bege-claro hover:bg-dourado/20 hover:text-bege-claro" onClick={() => start(m)}>{m} min</Button>
        ))}
        <Input type="number" value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="w-20 bg-card text-verde-profundo" />
        <Button size="sm" className="bg-dourado text-verde-profundo hover:bg-dourado-claro" onClick={() => start(minutes)}><Play className="w-4 h-4" /></Button>
      </div>
      <div className="flex justify-center gap-2">
        {running ? (
          <Button variant="ghost" size="sm" className="text-bege-claro" onClick={() => setRunning(false)}><Pause className="w-4 h-4 mr-1" />Pausar</Button>
        ) : remaining > 0 && (
          <Button variant="ghost" size="sm" className="text-bege-claro" onClick={() => setRunning(true)}><Play className="w-4 h-4 mr-1" />Continuar</Button>
        )}
        {remaining > 0 && <Button variant="ghost" size="sm" className="text-bege-claro" onClick={() => { setRunning(false); setRemaining(0); }}><RotateCcw className="w-4 h-4 mr-1" />Resetar</Button>}
      </div>
    </div>
  );
}

function MeditationRow({ m, onUpdate, onDelete }: { m: MeditationItem; onUpdate: (p: Partial<MeditationItem>) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(m.name);
  const [duration, setDuration] = useState(m.durationMin);
  const [type, setType] = useState<MeditationType>(m.type);

  return (
    <div className="rounded-lg border border-bege bg-bege-claro/60 p-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-verde-profundo truncate">{m.name}</p>
            <p className="text-xs text-muted-foreground">{m.durationMin} min · {m.type}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setEditing((v) => !v)}><Pencil className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
          <CollapsibleTrigger asChild>
            <Button size="icon" variant="ghost"><ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} /></Button>
          </CollapsibleTrigger>
        </div>
        {editing && (
          <div className="mt-3 space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} />
              <Select value={type} onValueChange={(v) => setType(v as MeditationType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => { onUpdate({ name, durationMin: duration, type }); setEditing(false); }}>Salvar</Button>
          </div>
        )}
        <CollapsibleContent className="pt-3 space-y-3">
          <MediaUpload label="Vídeo guiado" accept="video/*" kind="video" value={m.video} onChange={(v) => onUpdate({ video: v })} />
          <MediaUpload label="Áudio (música, mantra, natureza)" accept="audio/*" kind="audio" value={m.audio} onChange={(v) => onUpdate({ audio: v })} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function MeditationPractice({ open, onOpenChange, data, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(10);
  const [type, setType] = useState<MeditationType>("Guiada");

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Timer />

      <Section title="Minhas Meditações" action={<Button size="sm" variant="outline" onClick={() => setAdding(true)}>+ Adicionar</Button>}>
        {data.items.length === 0 && !adding && <p className="text-sm text-muted-foreground">Nenhuma meditação configurada.</p>}
        {data.items.map((m) => (
          <MeditationRow key={m.id} m={m}
            onUpdate={(p) => onChange({ items: data.items.map((x) => x.id === m.id ? { ...x, ...p } : x) })}
            onDelete={() => onChange({ items: data.items.filter((x) => x.id !== m.id) })}
          />
        ))}
        {adding && (
          <div className="rounded-lg border border-dourado/50 bg-card p-3 space-y-2">
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} placeholder="Min" />
              <Select value={type} onValueChange={(v) => setType(v as MeditationType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (!name.trim()) { toast.error("Nome obrigatório"); return; } onChange({ items: [...data.items, { id: uid(), name, durationMin: duration, type }] }); setName(""); setAdding(false); }}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {MEDITATION_SUGGESTIONS.map((s, i) => (
          <div key={i} className="p-3 rounded-lg bg-bege-claro/60 border border-bege">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-verde-profundo text-sm">{s.name} <span className="text-muted-foreground">({s.durationMin} min · {s.type})</span></p>
              <Button size="sm" variant="outline" onClick={() => { onChange({ items: [...data.items, { id: uid(), name: s.name, durationMin: s.durationMin, type: s.type }] }); toast.success("Adicionada"); }}>Usar</Button>
            </div>
            {s.desc && <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>}
          </div>
        ))}
      </Section>
    </PracticeDrawer>
  );
}