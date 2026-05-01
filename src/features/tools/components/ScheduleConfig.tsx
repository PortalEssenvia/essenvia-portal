import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WEEK_DAYS } from "../constants";
import type { WeekDay } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  startTime: string;
  endTime: string;
  days: WeekDay[];
  onChange: (patch: { startTime?: string; endTime?: string; days?: WeekDay[] }) => void;
}

export function ScheduleConfig({ startTime, endTime, days, onChange }: Props) {
  const toggleDay = (d: WeekDay) =>
    onChange({ days: days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort() as WeekDay[] });

  return (
    <div className="rounded-xl border border-bege bg-card p-4 space-y-4">
      <h4 className="font-display text-lg text-verde-profundo">Horário</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Início</Label>
          <Input type="time" value={startTime} onChange={(e) => onChange({ startTime: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Fim</Label>
          <Input type="time" value={endTime} onChange={(e) => onChange({ endTime: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Dias da semana</Label>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => {
            const active = days.includes(d.value as WeekDay);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value as WeekDay)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth",
                  active
                    ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                    : "bg-card text-verde-profundo border-bege hover:border-dourado"
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}