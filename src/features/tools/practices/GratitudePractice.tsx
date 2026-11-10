import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pencil, Trash2, Check, X, RotateCcw } from "lucide-react";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { GRATITUDE_SUGGESTIONS, PRACTICES } from "../constants";
import { useGratitudeEntries } from "../hooks/useGratitudeEntries";
import type { PracticeConfigBase, PracticePeriod } from "../types";

export const NIGHT_GRATITUDE_SUGGESTIONS = [
  "Pelo dia que vivi, mesmo com os desafios.",
  "Por uma pessoa que fez diferença no meu dia.",
  "Por algo que aprendi hoje.",
  "Pelo alimento e pelo teto que tenho.",
  "Por ter conseguido chegar ao fim do dia.",
  "Por um momento de paz que vivi hoje.",
  "Pelo meu corpo, que me sustentou hoje.",
  "Pelo descanso que estou prestes a ter.",
];
interface Props {
  open: boolean; onOpenChange: (v: boolean) => void;
  data: PracticeConfigBase; onChange: (patch: Partial<PracticeConfigBase>) => void;
  period?: PracticePeriod; done?: boolean; onComplete?: () => void;
}
export function GratitudePractice({ open, onOpenChange, data, onChange, period = "manha", done }: Props) {
  const { entries, date, busy, loaded, mutate, more } = useGratitudeEntries(period);
  const [draft, setDraft] = useState(""); const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState(""); const [suggestionPage, setSuggestionPage] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const today = entries.filter((e) => e.entry_date === date);
  const past = entries.filter((e) => e.entry_date < date);
  const dates = [...new Set(past.map((e) => e.entry_date))];
  const suggestions = (period === "noite" ? NIGHT_GRATITUDE_SUGGESTIONS : GRATITUDE_SUGGESTIONS).filter((s) => !today.some((e) => e.content === s));
  const pages = Math.max(1, Math.ceil(suggestions.length / 4));
  const meta = PRACTICES.find((p) => p.id === (period === "noite" ? "gratidao_noite" : "gratidao"));
  if (!meta) return null;
  const reuse = (text: string) => { setDraft(text); input.current?.focus(); };
  const add = async () => { if (await mutate("add", draft)) { setDraft(""); input.current?.focus(); } };
  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(active) => onChange({ active })} done={done}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={onChange} />
      <Section title="Sou grato por...">
        <div className="flex flex-wrap gap-2">
          {suggestions.slice((suggestionPage % pages) * 4, (suggestionPage % pages) * 4 + 4).map((s) => <Button key={s} variant="outline" className="h-auto min-h-11 whitespace-normal text-left text-sm px-3 py-2 rounded-full" onClick={() => reuse(s)}>{s}</Button>)}
        </div>
        <Button variant="ghost" className="min-h-11" onClick={() => setSuggestionPage((p) => p + 1)} disabled={pages < 2}>Mais sugestões</Button>
        <form onSubmit={(e) => { e.preventDefault(); void add(); }} className="flex flex-col sm:flex-row gap-2">
          <Input ref={input} aria-label="Nova gratidão" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Pelo que você é grato hoje?" className="text-base min-h-11 flex-1" disabled={!loaded || busy} />
          <Button type="submit" className="min-h-11" disabled={!draft.trim() || busy || !loaded}>Adicionar</Button>
        </form>
        <p className="text-sm text-muted-foreground">{today.length} {today.length === 1 ? "gratidão hoje" : "gratidões hoje"}</p>
        {today.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-card">
          {editing === item.id ? <>
            <Input aria-label="Editar gratidão" className="flex-1 min-w-0 text-base min-h-11" value={editText} onChange={(e) => setEditText(e.target.value)} />
            <Button size="icon" variant="ghost" className="h-11 w-11" aria-label="Salvar gratidão" disabled={busy || !editText.trim()} onClick={async () => { if (await mutate("edit", editText, item.id)) setEditing(null); }}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-11 w-11" aria-label="Cancelar edição" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
          </> : <>
            <p className="flex-1 min-w-0 break-words text-foreground">{item.content}</p>
            <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label="Editar gratidão" disabled={busy} onClick={() => { setEditing(item.id); setEditText(item.content); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label="Excluir gratidão" disabled={busy} onClick={() => void mutate("delete", "", item.id)}><Trash2 className="h-4 w-4" /></Button>
          </>}
        </div>)}
      </Section>
      <Section title="Minhas gratidões anteriores">
        {!past.length && <p className="text-sm text-muted-foreground">Suas gratidões aparecerão aqui.</p>}
        <Accordion type="multiple">
          {dates.map((day) => <AccordionItem key={day} value={day}>
            <AccordionTrigger>{new Date(`${day}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })}</AccordionTrigger>
            <AccordionContent className="space-y-3">
              {past.filter((e) => e.entry_date === day).map((item) => <div key={item.id} className="border-b border-border pb-3">
                <p className="break-words text-foreground">{item.content}</p>
                <Button variant="ghost" className="min-h-11" onClick={() => reuse(item.content)}><RotateCcw className="h-4 w-4 mr-2" />Reutilizar</Button>
              </div>)}
            </AccordionContent>
          </AccordionItem>)}
        </Accordion>
        <Button variant="outline" className="min-h-11" onClick={more}>Ver mais</Button>
      </Section>
    </PracticeDrawer>
  );
}