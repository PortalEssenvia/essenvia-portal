// Edge Function: snooze-reminder
// Recebe o token assinado enviado junto com a notificação e agenda um novo
// lembrete alguns minutos depois (soneca).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { verifySnoozeToken } from "../_shared/snoozeToken.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const bodyJson = await req.json().catch(() => ({}));
    const token = typeof bodyJson?.token === "string" ? bodyJson.token : "";
    const minutesRaw = Number(bodyJson?.minutes);
    if (!token) {
      return new Response(JSON.stringify({ error: "token obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await verifySnoozeToken(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: "token inválido ou expirado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const minutes = Math.min(60, Math.max(1, Number.isFinite(minutesRaw) ? minutesRaw : payload.m || 10));
    const remindAt = new Date(Date.now() + minutes * 60_000);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("reminder_snoozes").insert({
      user_id: payload.u,
      practice_key: payload.p,
      remind_at: remindAt.toISOString(),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, remind_at: remindAt.toISOString(), minutes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[snooze-reminder] erro:", err);
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
