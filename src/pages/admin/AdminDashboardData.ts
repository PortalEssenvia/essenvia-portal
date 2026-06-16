// Tipos e helpers compartilhados pelo painel /admin.
import { supabase } from "@/integrations/supabase/client";

export type UserStatus = "active" | "pending" | "blocked" | "trial";
export type UserPlan = "free" | "pro" | "premium";
export type PaymentStatus = "paid" | "awaiting" | "overdue";

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  status: UserStatus | null;
  plan: UserPlan | null;
  payment_status: PaymentStatus | null;
  access_modules: string[] | null;
  last_seen_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface AdminModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  min_plan: UserPlan;
  is_active: boolean;
}

export interface PlanPermission {
  plan: UserPlan;
  module_slug: string;
  allowed: boolean;
}

export interface AdminLog {
  id: string;
  action: string;
  target_user_id: string | null;
  performed_by: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Chama a edge function admin-api passando o JWT do usuário logado. */
export async function callAdmin<T = any>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const PLANS: UserPlan[] = ["free", "pro", "premium"];

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  blocked: "Bloqueado",
  trial: "Trial",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paid: "Pago",
  awaiting: "Aguardando",
  overdue: "Em atraso",
};

export const PLAN_LABEL: Record<UserPlan, string> = {
  free: "Gratuito",
  pro: "Pro",
  premium: "Premium",
};

/** Gera e baixa um CSV simples no browser. */
export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}