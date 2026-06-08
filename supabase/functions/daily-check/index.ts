// Edge Function: daily-check
// Executada diariamente pelo pg_cron às 08:00 (horário de Brasília).
// Garante que a tabela `daily_checks` contenha SEMPRE apenas 1 registro,
// referente ao dia atual em formato ISO (AAAA-MM-DD).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  // Pré-flight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) Cliente com service_role para conseguir escrever ignorando RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 2) Calcula o dia atual em America/Sao_Paulo no formato ISO AAAA-MM-DD
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const currentDay = fmt.format(new Date()); // ex.: "2026-06-08"
    console.log(`[daily-check] iniciando rotina para ${currentDay}`);

    // 3) Salvaguarda: se já existe registro do dia, não faz nada
    const { data: existing, error: selErr } = await supabase
      .from("daily_checks")
      .select("current_day")
      .eq("current_day", currentDay)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing) {
      console.log("[daily-check] registro do dia já existe, nada a fazer");
      return new Response(
        JSON.stringify({ ok: true, current_day: currentDay, skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4) Apaga TODOS os registros anteriores — mantém sempre apenas 1
    const { error: delErr } = await supabase
      .from("daily_checks")
      .delete()
      .not("id", "is", null);

    if (delErr) throw delErr;
    console.log("[daily-check] registros antigos removidos");

    // 5) Insere o registro do dia atual
    const { error: insErr } = await supabase
      .from("daily_checks")
      .insert({ current_day: currentDay });

    if (insErr) throw insErr;
    console.log(`[daily-check] novo registro inserido: ${currentDay}`);

    return new Response(
      JSON.stringify({ ok: true, current_day: currentDay }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[daily-check] erro:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});