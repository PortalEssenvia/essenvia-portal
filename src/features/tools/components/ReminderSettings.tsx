import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MORNING_PRACTICES, NIGHT_PRACTICES, PRACTICES, WEEK_DAYS, scheduleFor } from "../constants";
import { refreshReminders } from "@/lib/notifications";
import { usePracticesConfig } from "../hooks/usePractices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Mapeia o id usado no app para a chave gravada em practice_configs. */
const DB_KEY: Record<string, string> = { atividade: "atividade_fisica" };
const toDbKey = (id: string) => DB_KEY[id] ?? id;

type Row = {
  practice_key: string;
  is_active: boolean;
  start_time: string; // "HH:MM"
  week_days: number[];
  snooze_min: number;
};

const SNOOZE_OPTIONS = [5, 10, 15, 20, 30];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const hhmm = (v: string | null) => (v ? v.slice(0, 5) : "06:00");

export function ReminderSettings() {
  const { user } = useAuth();
  const { cfg } = usePracticesConfig();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("practice_configs")
        .select("practice_key, is_active, start_time, week_days, snooze_min")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (error) {
        console.error("[Essenvia] Erro ao carregar lembretes:", error);
        toast.error("Não foi possível carregar seus lembretes.");
      }
      const map: Record<string, Row> = {};
      (data ?? []).forEach((r: any) => {
        map[r.practice_key] = {
          practice_key: r.practice_key,
          is_active: !!r.is_active,
          start_time: hhmm(r.start_time),
          week_days: (r.week_days ?? ALL_DAYS) as number[],
          snooze_min: (r.snooze_min ?? 10) as number,
        };
      });
      setRows(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const rowFor = (id: string): Row =>
    rows[toDbKey(id)] ?? {
      practice_key: toDbKey(id),
      is_active: false,
      start_time: "06:00",
      week_days: ALL_DAYS,
      snooze_min: 10,
    };

  const persist = useCallback(
    async (row: Row) => {
      if (!user) return;
      setSaving(row.practice_key);
      const { error } = await supabase
        .from("practice_configs")
        .upsert(
          {
            user_id: user.id,
            practice_key: row.practice_key,
            is_active: row.is_active,
            start_time: `${row.start_time}:00`,
            week_days: row.week_days,
            snooze_min: row.snooze_min,
          },
          { onConflict: "user_id,practice_key" },
        );
      setSaving(null);
      if (error) {
        console.error("[Essenvia] Erro ao salvar lembrete:", error);
        toast.error("Erro ao salvar lembrete.");
        return;
      }
      toast.success("Lembrete salvo ✓", { duration: 1500 });
      void refreshReminders();
    },
    [user],
  );

  const patch = (id: string, p: Partial<Row>) => {
    const next = { ...rowFor(id), ...p };
    setRows((prev) => ({ ...prev, [next.practice_key]: next }));
    void persist(next);
  };

  const toggleDay = (id: string, d: number) => {
    const cur = rowFor(id).week_days;
    patch(id, { week_days: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort() });
  };

  const applyToAll = (id: string) => {
    const src = rowFor(id);
    PRACTICES.forEach((p) => {
      if (toDbKey(p.id) === src.practice_key) return;
      patch(p.id, { week_days: src.week_days });
    });
    toast.success("Dias replicados para todas as práticas.");
  };

  const applySleepWindow = () => {
    const sleep = cfg.sleepWindow;
    NIGHT_PRACTICES.forEach((p) => {
      const { startTime } = scheduleFor(p.id, sleep);
      patch(p.id, { start_time: startTime, is_active: true });
    });
    toast.success(`Horários da noite ajustados para dormir às ${sleep.bedtime}.`);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando lembretes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-verde-profundo" />
        </div>
        <div>
          <h3 className="font-display text-2xl text-verde-profundo">Lembretes das práticas</h3>
          <p className="text-sm text-muted-foreground">
            Ative os avisos por prática e escolha o horário e os dias em que quer ser lembrado.
          </p>
        </div>
      </div>

      {[
        { title: "☀️ Manhã", list: MORNING_PRACTICES },
        { title: "🌙 Noite (higiene do sono)", list: NIGHT_PRACTICES },
      ].map((group) => (
        <div key={group.title} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-xl text-verde-profundo">{group.title}</h4>
            {group.list === NIGHT_PRACTICES && (
              <Button variant="outline" size="sm" onClick={applySleepWindow}>
                Usar horários da janela de sono ({cfg.sleepWindow.bedtime} → {cfg.sleepWindow.wakeTime})
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
        {group.list.map((p) => {
          const row = rowFor(p.id);
          return (
            <Card key={p.id} className={cn("p-5 border-bege transition-smooth", !row.is_active && "opacity-70")}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-display text-lg text-verde-profundo">{p.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {saving === row.practice_key && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={(v) => patch(p.id, { is_active: v })}
                    aria-label={`Ativar lembrete de ${p.label}`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Horário do lembrete</Label>
                  <Input
                    type="time"
                    value={row.start_time}
                    disabled={!row.is_active}
                    onChange={(e) => patch(p.id, { start_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Dias da semana</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS.map((d) => {
                      const active = row.week_days.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          disabled={!row.is_active}
                          onClick={() => toggleDay(p.id, d.value)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-smooth disabled:cursor-not-allowed",
                            active
                              ? "bg-verde-profundo text-bege-claro border-verde-profundo"
                              : "bg-card text-verde-profundo border-bege hover:border-dourado",
                          )}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Soneca (adiar lembrete)</Label>
                  <Select
                    value={String(row.snooze_min)}
                    disabled={!row.is_active}
                    onValueChange={(v) => patch(p.id, { snooze_min: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SNOOZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} minutos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!row.is_active}
                  onClick={() => applyToAll(p.id)}
                >
                  Aplicar estes dias a todas
                </Button>
              </div>
            </Card>
          );
        })}
          </div>
        </div>
      ))}
    </div>
  );
}