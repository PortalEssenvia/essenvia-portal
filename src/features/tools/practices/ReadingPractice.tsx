import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "../components/Section";
import { ScheduleConfig } from "../components/ScheduleConfig";
import { PracticeDrawer } from "../components/PracticeDrawer";
import { MediaUpload } from "../components/MediaUpload";
import { Progress } from "@/components/ui/progress";
import { READING_SUGGESTIONS, PRACTICES, todayKey } from "../constants";
import type { ReadingData, Book } from "../types";
import { uid } from "../utils";
import { Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: ReadingData;
  onChange: (patch: Partial<ReadingData>) => void;
}

const meta = PRACTICES.find((p) => p.id === "leitura")!;

export function ReadingPractice({ open, onOpenChange, data, onChange }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(data.current?.currentPage || 0);

  const start = (b: Omit<Book, "id" | "currentPage" | "startedAt">) => {
    const newBook: Book = { id: uid(), startedAt: todayKey(), currentPage: 0, ...b };
    onChange({ current: newBook, queue: data.queue.filter((x) => x.title !== b.title) });
    setPage(0);
    toast.success(`Começando: ${b.title}`);
  };

  const updateCurrent = (p: Partial<Book>) => data.current && onChange({ current: { ...data.current, ...p } });

  const finish = () => {
    if (!data.current) return;
    const finished = { ...data.current, finishedAt: todayKey() };
    onChange({ current: undefined, history: [finished, ...data.history] });
    toast.success(`📚 "${finished.title}" concluído!`);
  };

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      {data.current ? (
        <Section title="Minha Leitura Atual">
          <div className="rounded-lg border border-dourado/40 bg-bege-claro p-4 space-y-3">
            <div className="flex items-start gap-3">
              <BookOpen className="w-8 h-8 text-dourado" />
              <div className="flex-1">
                <p className="font-display text-lg text-verde-profundo">{data.current.title}</p>
                <p className="text-sm text-muted-foreground">{data.current.author}</p>
              </div>
            </div>
            <Progress value={(data.current.currentPage / Math.max(data.current.totalPages, 1)) * 100} />
            <p className="text-xs text-muted-foreground">
              Página {data.current.currentPage} de {data.current.totalPages} — {Math.round((data.current.currentPage / Math.max(data.current.totalPages, 1)) * 100)}% concluído
            </p>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-muted-foreground">Página atual</label>
                <Input type="number" value={page} onChange={(e) => setPage(+e.target.value)} />
              </div>
              <Button onClick={() => { updateCurrent({ currentPage: page }); toast.success("Página atualizada"); }}>Atualizar</Button>
              <Button variant="outline" onClick={finish}>Marcar como concluído</Button>
            </div>
            <MediaUpload label="Audiobook" accept="audio/*" kind="audio" value={data.current.audio} onChange={(v) => updateCurrent({ audio: v })} />
            <MediaUpload label="Vídeo (resumo, resenha)" accept="video/*" kind="video" value={data.current.video} onChange={(v) => updateCurrent({ video: v })} />
          </div>
        </Section>
      ) : (
        <Section title="Começar nova leitura">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Input type="number" placeholder="Total de páginas" value={pages || ""} onChange={(e) => setPages(+e.target.value)} />
            <Button onClick={() => { if (!title.trim()) { toast.error("Título obrigatório"); return; } start({ title, author, totalPages: pages }); setTitle(""); setAuthor(""); setPages(0); }}>Começar</Button>
          </div>
        </Section>
      )}

      <Section title={`Lista de leitura (${data.queue.length})`}>
        {data.queue.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro na fila.</p>}
        {data.queue.map((b) => (
          <div key={b.id} className="flex items-center gap-2 p-3 rounded-lg bg-bege-claro/60 border border-bege">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-verde-profundo truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.author}</p>
            </div>
            {!data.current && <Button size="sm" variant="outline" onClick={() => start({ title: b.title, author: b.author, totalPages: b.totalPages })}>Começar</Button>}
            <Button size="icon" variant="ghost" onClick={() => onChange({ queue: data.queue.filter((x) => x.id !== b.id) })}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </Section>

      <Section title={`Histórico (${data.history.length})`} collapsible defaultOpen={false}>
        {data.history.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro concluído ainda.</p>}
        {data.history.map((b) => (
          <div key={b.id} className="p-3 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="font-medium text-verde-profundo">{b.title}</p>
            <p className="text-xs text-muted-foreground">{b.author} · {b.startedAt} → {b.finishedAt}</p>
          </div>
        ))}
      </Section>

      <Section title="Sugestões" collapsible defaultOpen={false}>
        {READING_SUGGESTIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege">
            <p className="flex-1 text-sm text-verde-profundo">📖 <span className="font-medium">{s.title}</span> — {s.author}</p>
            <Button size="sm" variant="outline" onClick={() => { onChange({ queue: [...data.queue, { id: uid(), title: s.title, author: s.author, currentPage: 0, totalPages: 0 }] }); toast.success("Adicionado à fila"); }}>+ Fila</Button>
          </div>
        ))}
      </Section>
    </PracticeDrawer>
  );
}