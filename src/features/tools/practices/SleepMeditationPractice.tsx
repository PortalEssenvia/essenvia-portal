import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square } from "lucide-react";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { Section } from "../components/Section";
import { PRACTICES } from "../constants";
import { useNightEntry } from "../hooks/useNightEntry";
import type { SleepStepData } from "../types";

const kinds: Record<string, string> = {
  "Respiração 4-7-8": "Inspire por 4 segundos, segure por 7 e expire por 8, sem forçar. Volte à respiração natural se sentir desconforto.",
  "Body Scan (relaxamento corporal)": "Percorra o corpo dos pés à cabeça, soltando suavemente a tensão em cada região.",
  "Meditação guiada para dormir": "Feche os olhos, sinta o apoio da cama e acompanhe a respiração. Relaxe o rosto e os ombros; deixe os pensamentos passarem.",
  "Silenciosa": "Permaneça em silêncio. Observe a respiração natural e acolha os pensamentos sem se prender a eles.",
};
interface Props { open: boolean; onOpenChange: (v: boolean) => void; data: SleepStepData; onChange: (p: Partial<SleepStepData>) => void; done: boolean; onComplete: () => void }
export function SleepMeditationPractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const { entry, update, history, loaded } = useNightEntry("meditacao_sono", done);
  const [remaining, setRemaining] = useState(600); const [running, setRunning] = useState(false); const [finished, setFinished] = useState(false);
  useEffect(() => { setRemaining(entry.duration * 60); setRunning(false); setFinished(false); }, [entry.duration]);
  useEffect(() => {
    if (!running) return;
    const end = Date.now() + remaining * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); setRemaining(left);
      if (left === 0) { setRunning(false); setFinished(true); }
    }, 250);
    return () => clearInterval(timer);
  }, [running]);
  const meta = PRACTICES.find((p) => p.id === "meditacao_sono"); if (!meta) return null;
  return <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(active) => onChange({ active })} done={done}>
    <p className="text-muted-foreground">Desacelere a mente e o corpo para um sono profundo.</p>
    <Section title="Meditação de hoje">
      <Label htmlFor="sleep-kind">Tipo</Label>
      <Select value={entry.kind} onValueChange={(kind) => update({ kind })} disabled={!loaded || running}>
        <SelectTrigger id="sleep-kind" className="min-h-11 text-base"><SelectValue /></SelectTrigger>
        <SelectContent>{Object.keys(kinds).map((kind) => <SelectItem key={kind} value={kind}>{kind}</SelectItem>)}</SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">{kinds[entry.kind]}</p>
      <Label>Duração</Label>
      <div className="flex flex-wrap gap-2">{[5, 10, 15, 20].map((duration) => <Button key={duration} variant={duration === entry.duration ? "default" : "outline"} className="min-h-11" disabled={!loaded || running} onClick={() => update({ duration })}>{duration} min</Button>)}</div>
      <div className="py-5 text-center space-y-4">
        <p aria-live="off" className="font-display text-5xl tabular-nums text-foreground">{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</p>
        <div className="flex justify-center gap-3">
          <Button size="icon" className="h-11 w-11" aria-label={running ? "Pausar meditação" : "Iniciar meditação"} disabled={!loaded || finished} onClick={() => setRunning((v) => !v)}>{running ? <Pause /> : <Play />}</Button>
          <Button size="icon" variant="outline" className="h-11 w-11" aria-label="Encerrar meditação" onClick={() => { setRunning(false); setRemaining(0); setFinished(true); }} disabled={!loaded}><Square /></Button>
        </div>
        {finished && <Button className="min-h-11" onClick={() => { onComplete(); onOpenChange(false); }}>{done ? "Concluída — voltar" : "Concluir prática"}</Button>}
      </div>
      <Label htmlFor="sleep-feeling">Como me senti ao terminar?</Label>
      <Textarea id="sleep-feeling" value={entry.notes} onChange={(e) => update({ notes: e.target.value })} disabled={!loaded} className="text-base" placeholder="Observação opcional" />
    </Section>
    <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={onChange} />
    <Section title="Meditações anteriores" collapsible defaultOpen={false}>
      {!history.length && <p className="text-sm text-muted-foreground">Suas meditações aparecerão aqui.</p>}
      {history.map((h) => <div key={h.date} className="border-b border-border py-3"><p className="text-sm text-muted-foreground">{new Date(`${h.date}T12:00:00`).toLocaleDateString("pt-BR")}</p><p>{h.entry.kind} · {h.entry.duration} min</p><p className="break-words">{h.entry.notes}</p></div>)}
    </Section>
  </PracticeDrawer>;
}