// Lembretes locais das práticas diárias via Notification API.
// Não é push server-side (isso exigiria FCM/VAPID). Funciona enquanto
// a aba/app instalado estiver ativa e reagenda a cada dia.

import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ne_notifications_enabled";
const timers = new Set<number>();

export type ReminderConfig = {
  practice_key: string;
  start_time: string | null; // "HH:MM:SS" ou "HH:MM"
  is_active: boolean;
  week_days: number[] | null;
};

const PRACTICE_LABEL: Record<string, string> = {
  oracao: "🙏 Hora da oração",
  meditacao: "🧘 Momento de meditação",
  afirmacao: "✨ Afirmações do dia",
  leitura: "📖 Leitura diária",
  gratidao: "💛 Registre sua gratidão",
  visualizacao: "🌅 Visualização guiada",
  atividade_fisica: "🏃 Atividade física",
  diario: "📓 Escreva no seu diário",
};

export function notificationsEnabled(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function enableNotifications(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    localStorage.setItem(STORAGE_KEY, "1");
    await refreshReminders();
  }
  return perm;
}

export function disableNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  clearAllTimers();
}

function clearAllTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
}

function scheduleOne(cfg: ReminderConfig) {
  if (!cfg.is_active || !cfg.start_time) return;
  const [h, m] = cfg.start_time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);

  const jsWeekday = target.getDay(); // 0=Dom..6=Sáb
  if (cfg.week_days && cfg.week_days.length && !cfg.week_days.includes(jsWeekday)) return;

  const delay = target.getTime() - now.getTime();
  if (delay > 2_147_000_000) return; // limite do setTimeout

  const id = window.setTimeout(() => {
    timers.delete(id);
    try {
      new Notification("Nova Essenvia", {
        body: PRACTICE_LABEL[cfg.practice_key] ?? "Hora de uma prática",
        icon: "/logo.png",
        badge: "/logo.png",
        tag: `practice-${cfg.practice_key}`,
      });
    } catch {
      /* ignore */
    }
    // reagenda para o próximo dia
    scheduleOne(cfg);
  }, delay);
  timers.add(id);
}

export async function refreshReminders() {
  if (!notificationsEnabled() || Notification.permission !== "granted") return;
  clearAllTimers();
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return;
  const { data } = await supabase
    .from("practice_configs")
    .select("practice_key, start_time, is_active, week_days")
    .eq("user_id", uid);
  (data ?? []).forEach((c) => scheduleOne(c as ReminderConfig));
}

export function initReminders() {
  if (typeof window === "undefined") return;
  if (!notificationsSupported() || !notificationsEnabled()) return;
  if (Notification.permission !== "granted") return;
  void refreshReminders();
}