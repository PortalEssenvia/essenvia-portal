import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { MediaUpload } from "../components/MediaUpload";
import { VISUALIZATION_SUGGESTIONS, PRACTICES } from "../constants";
import type { VisualizationData, VisualizationItem, MediaFile } from "../types";
import { uid, fileToDataUrl } from "../utils";
import { Eye, Trash2, Pencil, X, ChevronDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: VisualizationData;
  onChange: (patch: Partial<VisualizationData>) => void;
}

const meta = PRACTICES.find((p) => p.id === "visualizacao")!;

function ImageGalleryUpload({ images, onChange }: { images: MediaFile[]; onChange: (i: MediaFile[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | null) => {
    if (!files) return;
    const arr: MediaFile[] = [];
    for (const f of Array.from(files)) {
      if (f.size > 5 * 1024 * 1024) { toast.error(`"${f.name}" muito grande`); continue; }
      arr.push(await fileToDataUrl(f));
    }
    onChange([...images, ...arr]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-verde-profundo">🖼️ Imagens ({images.length})</span>
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="w-4 h-4 mr-1" />Adicionar</Button>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-bege">
              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-card/90 rounded-full p-1"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VisualizationPlayer({ item, onClose }: { item: VisualizationItem; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (item.images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % item.images.length), 4000);
    return () => clearInterval(t);
  }, [item.images.length]);

  return (
    <div className="fixed inset-0 z-50 bg-azul-escuro animate-fade-in">
      {item.images[idx] && <img src={item.images[idx].dataUrl} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="" />}
      {item.audio && <audio src={item.audio.dataUrl} autoPlay loop />}
      <div className="absolute inset-0 bg-azul-escuro/40 flex flex-col items-center justify-center p-8 text-bege-claro text-center">
        <h2 className="font-display text-3xl md:text-5xl mb-6">{item.title}</h2>
        <p className="text-lg md:text-xl max-w-2xl whitespace-pre-line">{item.description}</p>
      </div>
      <Button onClick={onClose} className="absolute top-4 right-4 bg-card text-verde-profundo">Encerrar visualização</Button>
    </div>
  );
}

function VisualizationRow({ v, onUpdate, onDelete, onPlay }: { v: VisualizationItem; onUpdate: (p: Partial<VisualizationItem>) => void; onDelete: () => void; onPlay: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(v.title);
  const [desc, setDesc] = useState(v.description);

  return (
    <div className="rounded-lg border border-bege bg-bege-claro/60 p-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-verde-profundo truncate">{v.title}</p>
            <p className="text-xs text-muted-foreground truncate">{v.description}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onPlay}><Eye className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={() => setEditing((e) => !e)}><Pencil className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
          <CollapsibleTrigger asChild>
            <Button size="icon" variant="ghost"><ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} /></Button>
          </CollapsibleTrigger>
        </div>
        {editing && (
          <div className="mt-3 space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição" />
            <Button size="sm" onClick={() => { onUpdate({ title, description: desc }); setEditing(false); toast.success("Salvo"); }}>Salvar</Button>
          </div>
        )}
        <CollapsibleContent className="pt-3 space-y-3">
          <ImageGalleryUpload images={v.images} onChange={(images) => onUpdate({ images })} />
          <MediaUpload label="Vídeo motivacional" accept="video/*" kind="video" value={v.video} onChange={(x) => onUpdate({ video: x })} />
          <MediaUpload label="Áudio (afirmações, música)" accept="audio/*" kind="audio" value={v.audio} onChange={(x) => onUpdate({ audio: x })} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function VisualizationPractice({ open, onOpenChange, data, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [playing, setPlaying] = useState<VisualizationItem | null>(null);

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title="Minhas Visualizações" action={<Button size="sm" variant="outline" onClick={() => setAdding(true)}>+ Adicionar</Button>}>
        {data.items.length === 0 && !adding && <p className="text-sm text-muted-foreground">Nenhuma visualização ainda.</p>}
        {data.items.map((v) => (
          <VisualizationRow key={v.id} v={v}
            onUpdate={(p) => onChange({ items: data.items.map((x) => x.id === v.id ? { ...x, ...p } : x) })}
            onDelete={() => onChange({ items: data.items.filter((x) => x.id !== v.id) })}
            onPlay={() => setPlaying(v)}
          />
        ))}
        {adding && (
          <div className="rounded-lg border border-dourado/50 bg-card p-3 space-y-2">
            <Input placeholder="Título (ex: Minha casa dos sonhos)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="O que você está visualizando..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (!title.trim()) { toast.error("Título obrigatório"); return; } onChange({ items: [...data.items, { id: uid(), title, description: desc, images: [] }] }); setTitle(""); setDesc(""); setAdding(false); }}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {VISUALIZATION_SUGGESTIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="flex-1 text-sm text-verde-profundo">{s}</p>
            <Button size="sm" variant="outline" onClick={() => { onChange({ items: [...data.items, { id: uid(), title: s.slice(0, 40) + "...", description: s, images: [] }] }); toast.success("Adicionada"); }}>Usar</Button>
          </div>
        ))}
      </Section>

      {playing && <VisualizationPlayer item={playing} onClose={() => setPlaying(null)} />}
    </PracticeDrawer>
  );
}