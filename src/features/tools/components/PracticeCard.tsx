import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PracticeMeta } from "../types";

interface Props {
  meta: PracticeMeta;
  done: boolean;
  scheduleLabel?: string;
  active?: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

export function PracticeCard({ meta, done, scheduleLabel, active = true, onToggle, onOpen }: Props) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border transition-smooth cursor-pointer",
        done
          ? "bg-verde-medio/10 border-verde-medio/60 shadow-sm"
          : "bg-bege-claro border-bege hover:border-dourado hover:shadow-card",
        !active && "opacity-50"
      )}
      onClick={onOpen}
    >
      <span className="text-2xl">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-verde-profundo truncate">{meta.label}</p>
        {scheduleLabel && (
          <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-bege text-verde-profundo/80">
            {scheduleLabel}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        aria-label={done ? "Desmarcar" : "Marcar como concluída"}
        className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-smooth shrink-0",
          done
            ? "bg-verde-medio border-verde-medio scale-110"
            : "border-bege bg-card hover:border-dourado"
        )}
      >
        {done && <Check className="w-4 h-4 text-bege-claro animate-scale-in" strokeWidth={3} />}
      </button>
    </div>
  );
}