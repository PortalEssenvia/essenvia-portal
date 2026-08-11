import { useState } from "react";
import { Moon, Sunrise, RefreshCw, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sleepHours } from "../constants";
import type { SleepWindow } from "../types";

interface Props {
  value: SleepWindow;
  onChange: (v: SleepWindow, recalc?: boolean) => void;
}

export function SleepWindowCard({ value, onChange }: Props) {
  const [pending, setPending] = useState(false);
  const hours = sleepHours(value);
  const short = hours < 7;

  const patch = (p: Partial<SleepWindow>) => {
    onChange({ ...value, ...p });
    setPending(true);
  };

  return (
    <Card className="p-6 bg-card shadow-soft border-bege">
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verde-profundo/10 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5 text-verde-profundo" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hora de dormir</Label>
            <Input
              type="time"
              className="w-32"
              value={value.bedtime}
              onChange={(e) => patch({ bedtime: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dourado/20 flex items-center justify-center shrink-0">
            <Sunrise className="w-5 h-5 text-verde-profundo" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hora de acordar</Label>
            <Input
              type="time"
              className="w-32"
              value={value.wakeTime}
              onChange={(e) => patch({ wakeTime: e.target.value })}
            />
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <p className="font-display text-2xl text-verde-profundo">{hours}h de sono</p>
          {short ? (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Abaixo das 7h recomendadas para adultos.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Dentro da faixa recomendada (7–9h).</p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => { onChange(value, true); setPending(false); }}
          className={pending ? "border-dourado text-verde-profundo" : ""}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalcular horários
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        As práticas da manhã são encadeadas a partir da hora de acordar e as da noite recuam a partir da hora de dormir.
        Você pode ajustar o horário de cada prática individualmente depois.
      </p>
    </Card>
  );
}
