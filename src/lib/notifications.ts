// Lembretes locais das práticas diárias via Notification API.
// Complementa o push server-side: enquanto a aba/app estiver aberta,
// os avisos são reagendados diariamente e aceitam soneca.

import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ne_notifications_enabled";
const timers = new Set<number>();

export type ReminderConfig = {
  practice_key: string;
  start_time: string | null; // "HH:MM:SS" ou "HH:MM"
  is_active: boolean;
  week_days: number[] | null;
  snooze_min?: number | null;
};

export const PRACTICE_LABEL: Record<string, string> = {
  oracao: "🙏 Hora da oração",
  meditacao: "🧘 Momento de meditação",
  afirmacao: "✨ Afirmações do dia",
  leitura: "📖 Leitura diária",
  gratidao: "💛 Registre sua gratidão",
  visualizacao: "🌅 Visualização guiada",
  atividade_fisica: "🏃 Atividade física",
  diario: "📓 Escreva no seu diário",
  // 🌙 Higiene do sono
  cafeina: "☕ Encerre cafeína e álcool por hoje",
  telas: "🌙 Hora de desligar as telas",
  relaxamento: "🛁 Comece seu ritual de relaxamento",
  gratidao_noite: "🙏 Gratidão da noite",
  respiracao_sono: "🧘 Respiração para dormir",
  ambiente_sono: "🛏️ Prepare o ambiente do sono",
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

async function showReminder(practiceKey: string, snoozeMin: number, snoozed = false) {
  const base = PRACTICE_LABEL[practiceKey] ?? "Hora de uma prática";
  const body = snoozed ? `⏰ Lembrete adiado — ${base}` : base;
  const options: NotificationOptions & { actions?: { action: string; title: string }[] } = {
    body,
    icon: "/logo.png",
    badge: "/logo.png",
    tag: `practice-${practiceKey}`,
    data: { practice_key: practiceKey, snooze_min: snoozeMin, url: "/ferramentas" },
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification("Nova Essenvia", {
        ...options,
        requireInteraction: true,
        actions: [
          { action: "open", title: "Abrir" },
          { action: "snooze", title: `Soneca ${snoozeMin} min` },
        ],
      } as NotificationOptions);
      return;
    }
  } catch {
    /* cai para a Notification simples */
  }

  try {
    new Notification("Nova Essenvia", options);
  } catch {
    /* ignore */
  }
}

/** Reagenda um lembrete local depois de X minutos (soneca). */
export function snoozeLocal(practiceKey: string, minutes: number) {
  const id = window.setTimeout(() => {
    timers.delete(id);
    void showReminder(practiceKey, minutes, true);
  }, Math.max(1, minutes) * 60_000);
  timers.add(id);
}

function scheduleOne(cfg: ReminderConfig) {
  if (!cfg.is_active || !cfg.start_time) return;
  const [h, m] = cfg.start_time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  const days = cfg.week_days && cfg.week_days.length ? cfg.week_days : [0, 1, 2, 3, 4, 5, 6];
  const snoozeMin = cfg.snooze_min ?? 10;

  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);

  // Avança até o próximo dia da semana habilitado (repetição diária/semanal).
  let guard = 0;
  while (!days.includes(target.getDay()) && guard < 7) {
    target.setDate(target.getDate() + 1);
    guard++;
  }
  if (!days.includes(target.getDay())) return;

  const delay = target.getTime() - now.getTime();
  if (delay > 2_147_000_000) return; // limite do setTimeout

  const id = window.setTimeout(() => {
    timers.delete(id);
    void showReminder(cfg.practice_key, snoozeMin);
    scheduleOne(cfg); // repete no próximo dia válido
  }, delay);
  timers.add(id);
}

let swListenerBound = false;
function bindSwListener() {
  if (swListenerBound || typeof navigator === "undefined" || !navigator.serviceWorker) return;
  swListenerBound = true;
  navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
    const data = event.data;
    if (data?.type === "snooze-local" && data.practice_key) {
      snoozeLocal(data.practice_key, Number(data.minutes) || 10);
    }
  });
}

export async function refreshReminders() {
  if (!notificationsEnabled() || Notification.permission !== "granted") return;
  clearAllTimers();
  bindSwListener();
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return;
  const { data } = await supabase
    .from("practice_configs")
    .select("practice_key, start_time, is_active, week_days, snooze_min")
    .eq("user_id", uid);
  (data ?? []).forEach((c) => scheduleOne(c as ReminderConfig));
}

export function initReminders() {
  if (typeof window === "undefined") return;
  if (!notificationsSupported() || !notificationsEnabled()) return;
  if (Notification.permission !== "granted") return;
  void refreshReminders();
}
