import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { DIARY_QUESTIONS, PRACTICES, todayKey } from "../constants";
import type { DiaryData, DiaryAnswers } from "../types";
import { formatDateBR } from "../utils";
import { toast } from "sonner";
import { useDiaryEntry, useDiaryHistory } from "../hooks/usePractices";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: DiaryData;
  onChange: (patch: Partial<DiaryData>) => void;
  done?: boolean;
  onComplete?: () => void;
}

const meta = PRACTICES.find((p) => p.id === "diario")!;

export function DiaryPractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const today = todayKey();
  const { text, setText, answers, setAnswers, save: saveEntry } = useDiaryEntry(today);
  const history = useDiaryHistory(today);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const save = async () => {
    await saveEntry();
    toast.success("📓 Registro de hoje salvo");
  };

  const setAnswer = <K extends keyof DiaryAnswers>(k: K, v: DiaryAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [k]: v }));

  const filtered = history.filter((h) => !search || h.text.toLowerCase().includes(search.toLowerCase()) || h.date.includes(search));

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })} done={done} onComplete={onComplete}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title={`📓 ${formatDateBR(today)}`}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Como foi seu dia? O que você sentiu, aprendeu, superou hoje?"
          className="min-h-[200px] bg-bege-claro"
        />
        <Button onClick={save} className="bg-verde-profundo text-bege-claro">Salvar registro de hoje</Button>
      </Section>

      <Section title="Perguntas guiadas" collapsible defaultOpen={false}>
        {DIARY_QUESTIONS.map((q) => (
          <div key={q.key} className="space-y-2">
            <Label className="text-sm text-verde-profundo">{q.label}</Label>
            {q.type === "slider" ? (
              <div className="flex items-center gap-3">
                <Slider value={[answers.mood ?? 5]} min={1} max={10} step={1} onValueChange={(v) => setAnswer("mood", v[0])} className="flex-1" />
                <span className="font-display text-2xl text-verde-profundo w-10 text-center">{answers.mood ?? 5}</span>
              </div>
            ) : (
              <Textarea value={(answers as any)[q.key] || ""} onChange={(e) => setAnswer(q.key as keyof DiaryAnswers, e.target.value as never)} className="bg-bege-claro" />
            )}
          </div>
        ))}
      </Section>

      <Section title={`Histórico do Diário (${history.length})`} collapsible defaultOpen={false}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por palavra ou data..." className="pl-9" />
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro anterior.</p>}
        {filtered.map((h) => (
          <div key={h.date} className="rounded-lg border border-bege bg-bege-claro/60 overflow-hidden">
            <button className="w-full p-3 text-left" onClick={() => setOpenId((id) => id === h.date ? null : h.date)}>
              <p className="text-xs text-muted-foreground">{formatDateBR(h.date)}</p>
              <p className="text-sm text-verde-profundo truncate mt-1">{h.text.split("\n")[0] || "(sem texto)"}</p>
              {h.answers.mood && <span className="text-xs text-dourado">Humor: {h.answers.mood}/10</span>}
            </button>
            {openId === h.date && (
              <div className="px-3 pb-3 space-y-2 border-t border-bege pt-3">
                <p className="text-sm text-verde-profundo whitespace-pre-line">{h.text}</p>
                {Object.entries(h.answers).map(([k, v]) => v != null && v !== "" ? (
                  <p key={k} className="text-xs text-muted-foreground"><strong>{DIARY_QUESTIONS.find((q) => q.key === k)?.label}</strong>: {String(v)}</p>
                ) : null)}
              </div>
            )}
          </div>
        ))}
      </Section>
    </PracticeDrawer>
  );
}