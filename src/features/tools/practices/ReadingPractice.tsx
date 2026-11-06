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
import { Trash2, BookOpen, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: ReadingData;
  onChange: (patch: Partial<ReadingData>) => void;
  done?: boolean;
  onComplete?: () => void;
}

const meta = PRACTICES.find((p) => p.id === "leitura")!;

function ReadingCard({ book, onUpdate, onFinish, onRemove }: {
  book: Book; onUpdate: (p: Partial<Book>) => void; onFinish: () => void; onRemove: () => void;
}) {
  const [page, setPage] = useState(book.currentPage || 0);
  const [showMedia, setShowMedia] = useState(false);
  const pct = Math.round((book.currentPage / Math.max(book.totalPages, 1)) * 100);
  return (
    <div className="rounded-lg border border-dourado/40 bg-bege-claro p-4 space-y-3">
      <div className="flex items-start gap-3">
        <BookOpen className="w-7 h-7 text-dourado shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg text-verde-profundo break-words">{book.title}</p>
          <p className="text-sm text-muted-foreground">{book.author}{book.startedAt ? ` · desde ${book.startedAt}` : ""}</p>
        </div>
        <Button size="icon" variant="ghost" aria-label="Remover leitura" onClick={onRemove}><Trash2 className="w-4 h-4" /></Button>
      </div>
      <Progress value={pct} />
      <p className="text-xs text-muted-foreground">
        Página {book.currentPage} de {book.totalPages || "?"} — {pct}% concluído
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs text-muted-foreground">Página atual</label>
          <Input type="number" value={page} onChange={(e) => setPage(+e.target.value)} />
        </div>
        <Button onClick={() => { onUpdate({ currentPage: page }); toast.success("Página atualizada"); }}>Atualizar</Button>
        <Button variant="outline" onClick={onFinish}>Concluído</Button>
      </div>
      <button type="button" className="text-xs text-verde-profundo flex items-center gap-1" onClick={() => setShowMedia((v) => !v)}>
        {showMedia ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Audiobook e vídeo
      </button>
      {showMedia && (
        <>
          <MediaUpload label="Audiobook" accept="audio/*" kind="audio" value={book.audio} onChange={(v) => onUpdate({ audio: v })} />
          <MediaUpload label="Vídeo (resumo, resenha)" accept="video/*" kind="video" value={book.video} onChange={(v) => onUpdate({ video: v })} />
        </>
      )}
    </div>
  );
}

export function ReadingPractice({ open, onOpenChange, data, onChange, done, onComplete }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState(0);

  // Compatibilidade: antigo campo "current" vira o primeiro da lista
  const reading: Book[] = data.reading ?? (data.current ? [data.current] : []);
  const save = (list: Book[], extra: Partial<ReadingData> = {}) =>
    onChange({ reading: list, current: undefined, ...extra });

  const start = (b: { title: string; author: string; totalPages: number }) => {
    const newBook: Book = { id: uid(), startedAt: todayKey(), currentPage: 0, ...b };
    save([...reading, newBook], { queue: data.queue.filter((x) => x.title !== b.title) });
    toast.success(`Começando: ${b.title}`);
  };

  const updateBook = (id: string, p: Partial<Book>) =>
    save(reading.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const finish = (id: string) => {
    const b = reading.find((x) => x.id === id);
    if (!b) return;
    const finished = { ...b, currentPage: b.totalPages || b.currentPage, finishedAt: todayKey() };
    save(reading.filter((x) => x.id !== id), { history: [finished, ...data.history] });
    toast.success(`📚 "${finished.title}" concluído!`);
  };

  const timesRead = (t: string) => data.history.filter((h) => h.title === t).length;

  return (
    <PracticeDrawer open={open} onOpenChange={onOpenChange} meta={meta} active={data.active} onActiveChange={(v) => onChange({ active: v })} done={done} onComplete={onComplete}>
      <ScheduleConfig startTime={data.startTime} endTime={data.endTime} days={data.days} onChange={(p) => onChange(p)} />

      <Section title={`Lendo agora (${reading.length})`}>
        {reading.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro em leitura. Adicione abaixo.</p>}
        <div className="space-y-3">
          {reading.map((b) => (
            <ReadingCard key={b.id} book={b}
              onUpdate={(p) => updateBook(b.id, p)}
              onFinish={() => finish(b.id)}
              onRemove={() => save(reading.filter((x) => x.id !== b.id))} />
          ))}
        </div>
      </Section>

      <Section title="Adicionar livro">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <Input type="number" placeholder="Total de páginas" value={pages || ""} onChange={(e) => setPages(+e.target.value)} />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => { if (!title.trim()) { toast.error("Título obrigatório"); return; } start({ title, author, totalPages: pages }); setTitle(""); setAuthor(""); setPages(0); }}>Começar a ler</Button>
            <Button variant="outline" onClick={() => { if (!title.trim()) { toast.error("Título obrigatório"); return; } onChange({ queue: [...data.queue, { id: uid(), title, author, totalPages: pages, currentPage: 0 }] }); toast.success("Adicionado à fila"); setTitle(""); setAuthor(""); setPages(0); }}>+ Fila</Button>
          </div>
        </div>
      </Section>

      <Section title={`Lista de leitura (${data.queue.length})`}>
        {data.queue.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro na fila.</p>}
        {data.queue.map((b) => (
          <div key={b.id} className="flex items-center gap-2 p-3 rounded-lg bg-bege-claro/60 border border-bege">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-verde-profundo truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.author}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => start({ title: b.title, author: b.author, totalPages: b.totalPages })}>Começar</Button>
            <Button size="icon" variant="ghost" aria-label="Remover da fila" onClick={() => onChange({ queue: data.queue.filter((x) => x.id !== b.id) })}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </Section>

      <Section title={`Livros já lidos (${data.history.length})`} collapsible defaultOpen={false}>
        {data.history.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro concluído ainda.</p>}
        {data.history.map((b) => {
          const n = timesRead(b.title);
          const isReading = reading.some((r) => r.title === b.title);
          return (
            <div key={b.id} className="flex items-center gap-2 p-3 rounded-lg bg-bege-claro/60 border border-bege">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-verde-profundo break-words">{b.title}{n > 1 && <span className="ml-2 text-xs text-dourado">lido {n}x</span>}</p>
                <p className="text-xs text-muted-foreground">{b.author} · {b.startedAt} → {b.finishedAt}</p>
              </div>
              <Button size="sm" variant="outline" disabled={isReading} onClick={() => start({ title: b.title, author: b.author, totalPages: b.totalPages })}>
                <RotateCcw className="w-3 h-3 mr-1" /> {isReading ? "Lendo" : "Ler de novo"}
              </Button>
            </div>
          );
        })}
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
