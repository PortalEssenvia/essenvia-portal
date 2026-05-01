import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { AFFIRMATION_SUGGESTIONS, PRACTICES } from "../constants";
import type { AffirmationsData } from "../types";
import { uid } from "../utils";
import { Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, Play, Square } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: AffirmationsData;
  onChange: (patch: Partial<AffirmationsData>) => void;
}

const meta = PRACTICES.find((p) => p.id === "afirmacao")!;

export function AffirmationsPractice({ open, onOpenChange, data, onChange }: Props) {
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);

  const add = (text: string) => {
    if (!text.trim()) return;
    onChange({ items: [...data.items, { id: uid(), text: text.trim() }] });
  };

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title="Minhas Afirmações" action={<Button size="sm" variant="outline" onClick={() => { if (data.items.length) { setRunning(true); setIdx(0); } else toast.error("Adicione afirmações primeiro"); }}><Play className="w-4 h-4 mr-1" />Praticar</Button>}>
        {data.items.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma afirmação ainda. Adicione abaixo ou use uma sugestão.</p>}
        {data.items.map((a) => (
          <div key={a.id} className="flex items-center gap-2 p-3 rounded-lg bg-bege-claro/60 border border-bege">
            {editingId === a.id ? (
              <>
                <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1" />
                <Button size="icon" variant="ghost" onClick={() => { onChange({ items: data.items.map((x) => x.id === a.id ? { ...x, text: editText } : x) }); setEditingId(null); }}><Check className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <p className="flex-1 text-sm text-verde-profundo">{a.text}</p>
                <Button size="icon" variant="ghost" onClick={() => { setEditingId(a.id); setEditText(a.text); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onChange({ items: data.items.filter((x) => x.id !== a.id) })}><Trash2 className="w-4 h-4" /></Button>
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Nova afirmação..." />
          <Button onClick={() => { add(newText); setNewText(""); }}>+ Adicionar</Button>
        </div>
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {AFFIRMATION_SUGGESTIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="flex-1 text-sm text-verde-profundo">{s}</p>
            <Button size="sm" variant="outline" onClick={() => { add(s); toast.success("Adicionada"); }}>Adicionar</Button>
          </div>
        ))}
      </Section>

      {running && data.items.length > 0 && (
        <div className="fixed inset-0 z-50 bg-verde-profundo flex flex-col items-center justify-center p-8 animate-fade-in">
          <p className="text-dourado-claro font-display text-3xl md:text-5xl text-center max-w-2xl leading-relaxed">
            {data.items[idx].text}
          </p>
          <p className="mt-8 text-bege-claro/70 text-sm">{idx + 1} / {data.items.length}</p>
          <div className="mt-8 flex items-center gap-3">
            <Button variant="outline" size="icon" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} className="text-verde-profundo"><ChevronLeft /></Button>
            {idx < data.items.length - 1 ? (
              <Button onClick={() => setIdx((i) => i + 1)} className="bg-dourado text-verde-profundo hover:bg-dourado-claro"><ChevronRight className="mr-1" />Próxima</Button>
            ) : (
              <Button onClick={() => { setRunning(false); toast.success("✅ Todas as afirmações concluídas!"); }} className="bg-dourado text-verde-profundo hover:bg-dourado-claro">Concluir</Button>
            )}
            <Button variant="outline" size="icon" onClick={() => setRunning(false)} className="text-verde-profundo"><Square /></Button>
          </div>
        </div>
      )}
    </PracticeDrawer>
  );
}