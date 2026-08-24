import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PracticeMeta, PracticeId } from "../types";

export type DayDetail = {
  date: string;
  done: Set<PracticeId> | PracticeId[];
  times?: Map<string, string>;
};

type Props = {
  detail: DayDetail | null;
  practices: PracticeMeta[];
  onClose: () => void;
  scopeLabel?: string;
};

/** Painel com as práticas concluídas e pendentes de um dia específico. */
export function DayDetailDialog({ detail, practices, onClose, scopeLabel = "práticas" }: Props) {
  const doneSet = new Set<string>(detail ? Array.from(detail.done as Iterable<PracticeId>) : []);
  const done = practices.filter((p) => doneSet.has(p.id));
  const pending = practices.filter((p) => !doneSet.has(p.id));
  const rate = practices.length ? Math.round((done.length / practices.length) * 100) : 0;

  return (
    <Dialog open={!!detail} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-verde-profundo capitalize">
            {detail
              ? new Date(detail.date + "T00:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </DialogTitle>
          <DialogDescription>
            {done.length} de {practices.length} {scopeLabel} · {rate}% de cumprimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <p className="text-sm font-medium text-verde-profundo mb-2">✅ Concluídas ({done.length})</p>
            {done.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma prática concluída neste dia.</p>
            ) : (
              <ul className="space-y-1.5">
                {done.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-verde-medio/10 border border-verde-medio/50 text-sm text-verde-profundo"
                  >
                    <span>{p.icon}</span>
                    <span className="flex-1">{p.label}</span>
                    {detail?.times?.get(`${detail.date}|${p.id}`) && (
                      <span className="text-xs text-muted-foreground">
                        {detail.times.get(`${detail.date}|${p.id}`)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="text-sm font-medium text-verde-profundo mb-2">⏳ Pendentes ({pending.length})</p>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">🌟 Dia completo, nada pendente!</p>
            ) : (
              <ul className="space-y-1.5">
                {pending.map((p) => (
                  <li
                    key={p.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg bg-bege-claro/60 border border-bege text-sm",
                      "text-muted-foreground"
                    )}
                  >
                    <span className="opacity-60">{p.icon}</span>
                    <span className="flex-1">{p.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
