import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PRAYER_SUGGESTIONS, PRACTICES } from "../constants";
import { PracticeDrawer } from "../components/PracticeDrawer";
import type { PrayerData } from "../types";
import { toast } from "sonner";
import { uid } from "../utils";
import { useState } from "react";
import { Trash2, Heart } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: PrayerData;
  onChange: (patch: Partial<PrayerData>) => void;
}

const meta = PRACTICES.find((p) => p.id === "oracao")!;

export function PrayerPractice({ open, onOpenChange, data, onChange }: Props) {
  const [draft, setDraft] = useState(data.text);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })}>
      <ScheduleConfig
        startTime={data.startTime}
        endTime={data.endTime}
        days={data.days}
        onChange={(p) => onChange(p)}
      />

      <Section title="Minha Oração">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva sua oração aqui, com suas próprias palavras..."
          className="min-h-[160px] bg-bege-claro"
        />
        <Button
          onClick={() => { onChange({ text: draft }); toast.success("Oração salva 🙏"); }}
          className="bg-verde-profundo text-bege-claro"
        >
          Salvar oração
        </Button>
      </Section>

      <div className="rounded-xl border border-dourado/40 bg-dourado/10 p-4 flex items-start gap-3">
        <Heart className="w-5 h-5 text-dourado mt-0.5" />
        <div className="flex-1">
          <Label className="font-medium text-verde-profundo">🤍 Oração do coração (na hora, sem texto fixo)</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Ao marcar o hábito, você verá: "Ore do coração agora. Quando terminar, marque como concluído."
          </p>
        </div>
        <Switch checked={data.fromHeart} onCheckedChange={(v) => onChange({ fromHeart: v })} />
      </div>

      <Section title="Sugestões de orações" collapsible defaultOpen={false}>
        {PRAYER_SUGGESTIONS.map((s) => (
          <div key={s.id} className="rounded-lg border border-bege bg-bege-claro/60 p-3">
            <p className="font-medium text-verde-profundo">{s.title}</p>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{s.text}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => { setDraft(s.text); onChange({ text: s.text }); toast.success(`"${s.title}" definida como sua oração`); }}
            >
              Usar esta
            </Button>
          </div>
        ))}

        {data.customSuggestions.map((s) => (
          <div key={s.id} className="rounded-lg border border-bege bg-bege-claro/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-verde-profundo">{s.title}</p>
              <Button size="icon" variant="ghost" onClick={() => onChange({ customSuggestions: data.customSuggestions.filter((x) => x.id !== s.id) })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{s.text}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => { setDraft(s.text); onChange({ text: s.text }); }}>Usar esta</Button>
          </div>
        ))}

        {adding ? (
          <div className="rounded-lg border border-dourado/50 bg-card p-3 space-y-2">
            <Input placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Textarea placeholder="Texto da oração" value={newText} onChange={(e) => setNewText(e.target.value)} />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (!newTitle.trim() || !newText.trim()) { toast.error("Preencha os campos"); return; }
                  onChange({ customSuggestions: [...data.customSuggestions, { id: uid(), title: newTitle.trim(), text: newText.trim() }] });
                  setNewTitle(""); setNewText(""); setAdding(false);
                  toast.success("Oração adicionada");
                }}
              >
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewTitle(""); setNewText(""); }}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>+ Adicionar minha própria oração</Button>
        )}
      </Section>
    </PracticeDrawer>
  );
}