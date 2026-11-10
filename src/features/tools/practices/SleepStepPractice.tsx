import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { Section } from "../components/Section";
import { NIGHT_GUIDES, PRACTICES } from "../constants";
import type { PracticeId, SleepStepData } from "../types";
import { useNightEntry } from "../hooks/useNightEntry";

interface Props {
  id: PracticeId;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: SleepStepData;
  onChange: (p: Partial<SleepStepData>) => void;
  done: boolean;
  onComplete: () => void;
}

export function SleepStepPractice({ id, open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const meta = PRACTICES.find((p) => p.id === id);
  const { entry, update, history, loaded } = useNightEntry(id, done);
  const guide = NIGHT_GUIDES[id] ?? { intro: "", steps: [] };
  const checked = entry.checked;
  if (!meta) return null;

  const toggle = (step: string) => {
    update({ checked: checked.includes(step) ? checked.filter((s) => s !== step) : [...checked, step] });
  };

  return (
    <PracticeDrawer
      open={open}
      onOpenChange={onOpenChange}
      meta={meta}
      active={data.active}
      onActiveChange={(v) => onChange({ active: v })}
      done={done}
      onComplete={onComplete}
    >
      <div className="rounded-xl bg-verde-profundo/5 border border-bege p-4">
        <p className="text-sm text-verde-profundo/90">{guide.intro}</p>
      </div>

      <Section title="Checklist da noite">
        <div className="space-y-3">
          {guide.steps.map((s) => (
            <label key={s} className="flex items-start gap-3 cursor-pointer min-h-11">
              <Checkbox disabled={!loaded} checked={checked.includes(s)} onCheckedChange={() => toggle(s)} className="mt-0.5" />
              <span className="text-sm text-verde-profundo">{s}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Anotações">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Como foi hoje? O que atrapalhou ou ajudou seu sono?
        </Label>
        <Textarea
          rows={3}
          value={entry.notes}
          disabled={!loaded}
          className="text-base"
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Escreva aqui..."
        />
      </Section>

      <Section title="Noites anteriores" collapsible defaultOpen={false}>
        {!history.length && <p className="text-sm text-muted-foreground">Seus registros aparecerão aqui.</p>}
        {history.map((h) => <div key={h.date} className="border-b border-border py-3 space-y-2">
          <p className="text-sm text-muted-foreground">{new Date(`${h.date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
          {h.entry.checked.map((s) => <p key={s} className="text-sm">✓ {s}</p>)}
          <p className="break-words">{h.entry.notes}</p>
        </div>)}
      </Section>
      <ScheduleConfig
        startTime={data.startTime}
        endTime={data.endTime}
        days={data.days}
        onChange={(p) => onChange(p)}
      />
    </PracticeDrawer>
  );
}
