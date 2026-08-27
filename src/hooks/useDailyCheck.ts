/**
 * useDailyCheck.ts
 * ─────────────────────────────────────────────────────────────
 * Hook React que integra com a tabela `daily_checks` do Supabase.
 *
 * RESPONSABILIDADES:
 *  1. Ler o registro atual da tabela (inserido pelo cron job das 08h).
 *  2. Verificar se o dia registrado é hoje (fuso local do usuário).
 *  3. Se não houver registro para hoje ainda (usuário acessou antes
 *     das 08h ou cron ainda não rodou), fazer o fallback client-side:
 *     inserir/atualizar o registro diretamente do browser via Supabase.
 *  4. Expor `todayChecked: boolean` e `currentDay: string` para uso
 *     em qualquer componente que precise saber se o dia já foi registrado.
 *  5. Revalidar automaticamente quando a aba voltar ao foco.
 *
 * IMPORTANTE:
 *  O cron job (pg_cron no Supabase) é a fonte primária de verdade —
 *  ele roda às 08:00 BRT. Este hook é o complemento client-side que
 *  garante que o registro exista mesmo que o usuário acesse antes disso.
 * ─────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Retorna "YYYY-MM-DD" no fuso horário LOCAL do dispositivo
const localToday = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export interface DailyCheckState {
  /** Dia atual registrado no banco (formato YYYY-MM-DD) */
  currentDay: string | null;
  /** true se o banco já tem o registro de hoje */
  todayChecked: boolean;
  /** true enquanto carrega */
  loading: boolean;
  /** Erro, se houver */
  error: string | null;
  /** Força uma nova leitura/sincronização manual */
  refetch: () => void;
}

export function useDailyCheck(): DailyCheckState {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const isSyncing = useRef(false);

  const today = localToday();

  /**
   * Tenta fazer o fallback client-side:
   * Se não há registro para hoje, apaga o antigo e insere o atual.
   * Só ocorre se o cron ainda não rodou (ex: usuário acordou antes das 08h).
   */
  const syncToday = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      // Deleta registros antigos
      await supabase
        .from("daily_checks")
        .delete()
        .neq("current_day", today); // remove qualquer dia diferente de hoje

      // Insere o de hoje se ainda não existir
      const { error: insertErr } = await supabase
        .from("daily_checks")
        .upsert(
          { current_day: today },
          { onConflict: "current_day", ignoreDuplicates: true }
        );

      if (insertErr) {
        console.warn("[DailyCheck] Fallback insert falhou:", insertErr.message);
      } else {
        setCurrentDay(today);
      }
    } finally {
      isSyncing.current = false;
    }
  }, [today]);

  /**
   * Lê o registro mais recente do banco.
   * Se não for de hoje, dispara o fallback client-side.
   */
  const fetch = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("daily_checks")
        .select("current_day")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        setError(fetchErr.message);
        return;
      }

      const stored = data?.current_day ?? null;
      setCurrentDay(stored);

      // Se o banco não tem registro de hoje → fallback client-side
      if (stored !== today) {
        await syncToday();
      }
    } catch (e: any) {
      setError(e?.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [user, today, syncToday]);

  // Executa ao montar e quando o usuário muda
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Revalida quando a aba volta ao foco (usuário volta depois de longa ausência)
  useEffect(() => {
    const onFocus = () => {
      const nowDay = localToday();
      // Só refaz se o dia mudou desde a última verificação
      if (nowDay !== currentDay) {
        fetch();
      }
    };
    window.addEventListener("visibilitychange", onFocus);
    return () => window.removeEventListener("visibilitychange", onFocus);
  }, [fetch, currentDay]);

  // Verifica uma vez por hora se o dia mudou (para usuários que ficam com a
  // aba aberta durante a meia-noite ou passação das 08h)
  useEffect(() => {
    const interval = setInterval(() => {
      const nowDay = localToday();
      if (nowDay !== currentDay) {
        fetch();
      }
    }, 60 * 60 * 1000); // 1 hora
    return () => clearInterval(interval);
  }, [fetch, currentDay]);

  return {
    currentDay,
    todayChecked: currentDay === today,
    loading,
    error,
    refetch: fetch,
  };
}
