import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { GRATITUDE_SUGGESTIONS, PRACTICES, todayKey } from "../constants";
import type { GratitudeData } from "../types";
import { uid } from "../utils";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { readLS, writeLS } from "../hooks/useLocalStorage";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: GratitudeData;
  onChange: (patch: Partial<GratitudeData>) => void;
  done?: boolean;
  onComplete?: () => void;
}

const meta = PRACTICES.find((p) => p.id === "gratidao")!;
const dailyKey = (d: string) => `essenvia_gratitude_daily_${d}`;

export function GratitudePractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const today = todayKey();
  const [todayText, setTodayText] = useState("");
  const [history, setHistory] = useState<{ date: string; text: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    setTodayText(readLS<string>(dailyKey(today), ""));
    // load last 14 days
    const h: { date: string; text: string }[] = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const t = readLS<string>(dailyKey(k), "");
      if (t) h.push({ date: k, text: t });
    }
    setHistory(h);
  }, [open, today]);

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })} done={done} onComplete={onComplete}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title="Sou grato por...">
        {data.items.length === 0 && <p className="text-sm text-muted-foreground">Adicione itens permanentes pelos quais você é grato.</p>}
        {data.items.map((g) => (
          <div key={g.id} className="flex items-center gap-2 p-3 rounded-lg bg-bege-claro/60 border border-bege">
            {editingId === g.id ? (
              <>
                <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1" />
                <Button size="icon" variant="ghost" onClick={() => { onChange({ items: data.items.map((x) => x.id === g.id ? { ...x, text: editText } : x) }); setEditingId(null); }}><Check className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <p className="flex-1 text-sm text-verde-profundo">{g.text}</p>
                <Button size="icon" variant="ghost" onClick={() => { setEditingId(g.id); setEditText(g.text); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onChange({ items: data.items.filter((x) => x.id !== g.id) })}><Trash2 className="w-4 h-4" /></Button>
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Pelo que você é grato..." />
          <Button onClick={() => { if (!newItem.trim()) return; onChange({ items: [...data.items, { id: uid(), text: newItem.trim() }] }); setNewItem(""); }}>+ Adicionar</Button>
        </div>
      </Section>

      <Section title="Hoje, especialmente, sou grato por...">
        <Textarea value={todayText} onChange={(e) => setTodayText(e.target.value)} placeholder="Escreva o que tornou hoje especial..." className="min-h-[120px] bg-bege-claro" />
        <Button onClick={() => { writeLS(dailyKey(today), todayText); toast.success("Gratidão de hoje registrada 🙌"); }} className="bg-verde-profundo text-bege-claro">Registrar gratidão de hoje</Button>
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {GRATITUDE_SUGGESTIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="flex-1 text-sm text-verde-profundo">{s}</p>
            <Button size="sm" variant="outline" onClick={() => { onChange({ items: [...data.items, { id: uid(), text: s }] }); toast.success("Adicionada"); }}>Adicionar</Button>
          </div>
        ))}
      </Section>

      <Section title={`Histórico (${history.length})`} collapsible defaultOpen={false}>
        {history.length === 0 && <p className="text-sm text-muted-foreground">Sem registros anteriores.</p>}
        {history.map((h) => (
          <div key={h.date} className="p-3 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" })}</p>
            <p className="text-sm text-verde-profundo mt-1 whitespace-pre-line">{h.text}</p>
          </div>
        ))}
      </Section>
    </PracticeDrawer>
  );
}