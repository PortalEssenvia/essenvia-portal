import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { DIARY_QUESTIONS, PRACTICES, STORAGE_KEYS, todayKey } from "../constants";
import type { DiaryData, DiaryEntry, DiaryAnswers } from "../types";
import { formatDateBR } from "../utils";
import { toast } from "sonner";
import { readLS, writeLS } from "../hooks/useLocalStorage";
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

function loadAllEntries(): DiaryEntry[] {
  const out: DiaryEntry[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith("essenvia_diary_")) {
      const e = readLS<DiaryEntry | null>(k, null);
      if (e) out.push(e);
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function DiaryPractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const today = todayKey();
  const todayKeyLS = STORAGE_KEYS.diary(today);
  const [entry, setEntry] = useState<DiaryEntry>(() => readLS(todayKeyLS, { date: today, text: "", answers: {} as DiaryAnswers }));
  const [history, setHistory] = useState<DiaryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => { if (open) setHistory(loadAllEntries().filter((e) => e.date !== today)); }, [open, today]);

  const save = () => {
    writeLS(todayKeyLS, entry);
    toast.success("📓 Registro de hoje salvo");
  };

  const setAnswer = <K extends keyof DiaryAnswers>(k: K, v: DiaryAnswers[K]) =>
    setEntry((e) => ({ ...e, answers: { ...e.answers, [k]: v } }));

  const filtered = history.filter((h) => !search || h.text.toLowerCase().includes(search.toLowerCase()) || h.date.includes(search));

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })} done={done} onComplete={onComplete}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title={`📓 ${formatDateBR(today)}`}>
        <Textarea
          value={entry.text}
          onChange={(e) => setEntry((p) => ({ ...p, text: e.target.value }))}
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
                <Slider value={[entry.answers.mood ?? 5]} min={1} max={10} step={1} onValueChange={(v) => setAnswer("mood", v[0])} className="flex-1" />
                <span className="font-display text-2xl text-verde-profundo w-10 text-center">{entry.answers.mood ?? 5}</span>
              </div>
            ) : (
              <Textarea value={(entry.answers as any)[q.key] || ""} onChange={(e) => setAnswer(q.key as keyof DiaryAnswers, e.target.value as never)} className="bg-bege-claro" />
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