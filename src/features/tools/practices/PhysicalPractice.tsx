import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { MediaUpload } from "../components/MediaUpload";
import { ACTIVITY_ICONS, ACTIVITY_SUGGESTIONS, PRACTICES } from "../constants";
import type { PhysicalActivity, PhysicalData } from "../types";
import { uid } from "../utils";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: PhysicalData;
  onChange: (patch: Partial<PhysicalData>) => void;
  done?: boolean;
  onComplete?: () => void;
}

const meta = PRACTICES.find((p) => p.id === "atividade")!;

function ActivityRow({ a, onUpdate, onDelete }: { a: PhysicalActivity; onUpdate: (p: Partial<PhysicalActivity>) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(a.name);
  const [duration, setDuration] = useState(a.durationMin);
  const [icon, setIcon] = useState(a.icon);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-bege bg-bege-claro/60 p-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{a.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-verde-profundo truncate">{a.name}</p>
            <p className="text-xs text-muted-foreground">{a.durationMin} min</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setEditing((v) => !v)}><Pencil className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
          <CollapsibleTrigger asChild>
            <Button size="icon" variant="ghost"><ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} /></Button>
          </CollapsibleTrigger>
        </div>

        {editing && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {ACTIVITY_ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)} className={cn("text-xl p-1.5 rounded-md", icon === i ? "bg-dourado/30" : "hover:bg-bege")}>{i}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} placeholder="Duração (min)" />
            </div>
            <Button size="sm" onClick={() => { onUpdate({ name, durationMin: duration, icon }); setEditing(false); toast.success("Atualizado"); }}>Salvar</Button>
          </div>
        )}

        <CollapsibleContent className="pt-3 space-y-3">
          <MediaUpload label="Vídeo (treino guiado)" accept="video/*" kind="video" value={a.video} onChange={(v) => onUpdate({ video: v })} />
          <MediaUpload label="Áudio (playlist, motivacional)" accept="audio/*" kind="audio" value={a.audio} onChange={(v) => onUpdate({ audio: v })} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function PhysicalPractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [icon, setIcon] = useState("🏃");

  const addActivity = (a: Omit<PhysicalActivity, "id">) =>
    onChange({ activities: [...data.activities, { id: uid(), ...a }] });

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })} done={done} onComplete={onComplete}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title="Minhas Atividades" action={<Button size="sm" variant="outline" onClick={() => setAdding(true)}>+ Adicionar</Button>}>
        {data.activities.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">Nenhuma atividade configurada.</p>
        )}

        {data.activities.map((a) => (
          <ActivityRow
            key={a.id}
            a={a}
            onUpdate={(p) => onChange({ activities: data.activities.map((x) => x.id === a.id ? { ...x, ...p } : x) })}
            onDelete={() => onChange({ activities: data.activities.filter((x) => x.id !== a.id) })}
          />
        ))}

        {adding && (
          <div className="rounded-lg border border-dourado/50 bg-card p-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {ACTIVITY_ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)} className={cn("text-xl p-1.5 rounded-md", icon === i ? "bg-dourado/30" : "hover:bg-bege")}>{i}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} placeholder="Min" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (!name.trim()) { toast.error("Nome obrigatório"); return; } addActivity({ name, durationMin: duration, icon }); setName(""); setDuration(30); setAdding(false); }}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {ACTIVITY_SUGGESTIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege">
            <span className="text-xl">{s.icon}</span>
            <p className="flex-1 text-sm text-verde-profundo">{s.name} <span className="text-muted-foreground">{s.durationMin} min</span></p>
            <Button size="sm" variant="outline" onClick={() => { addActivity({ name: s.name, durationMin: s.durationMin, icon: s.icon }); toast.success("Adicionada"); }}>Adicionar</Button>
          </div>
        ))}
      </Section>
    </PracticeDrawer>
  );
}