// Edge Function: send-push
// Dispara notificações FCM v1 para tokens armazenados em push_tokens.
// Chamada pelo cron pg_cron a cada minuto com payload vazio.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const FCM_URL = "https://fcm.googleapis.com/v1/projects/constante-renovacao/messages:send";

function saToken(saJson: string) {
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${encode(header)}.${encode(claim)}`;

  // Deno não tem crypto.signText nativamente; usamos importação dinâmica de webcrypto
  const keyPEM = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const keyData = Uint8Array.from(atob(keyPEM), (c) => c.charCodeAt(0));

  return crypto.subtle
    .importKey(
      "pkcs8",
      keyData.buffer,
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"]
    )
    .then((key) => {
      const encoder = new TextEncoder();
      return crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, key, encoder.encode(jwt));
    })
    .then((sig) => {
      const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return `${jwt}.${signature}`;
    })
    .then((assertion) =>
      fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion,
        }),
      })
    )
    .then((res) => res.json());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!saJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não configurado");
    }

    // 1) Gera access token do Google
    const tokenRes = await saToken(saJson);
    if (!tokenRes.access_token) {
      throw new Error(`Falha ao obter access token: ${JSON.stringify(tokenRes)}`);
    }
    const accessToken = tokenRes.access_token;

    // 2) Calcula horário atual em São Paulo (HH:MM)
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    const currentTime = `${hour}:${minute}`;

    // 3) Busca práticas ativas que começam exatamente agora
    const { data: practices, error: practicesErr } = await supabase
      .from("practice_configs")
      .select("user_id, practice_key, start_time")
      .eq("is_active", true)
      .not("start_time", "is", null);

    if (practicesErr) throw practicesErr;

    const duePractices = (practices ?? []).filter((p) => {
      const t = (p.start_time as string).slice(0, 5); // "HH:MM"
      return t === currentTime;
    });

    if (!duePractices.length) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, reason: "no_due_practices", currentTime }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    // 4) Para cada prática, busca tokens do usuário e dispara FCM
    let sent = 0;
    let failed = 0;

    for (const p of duePractices) {
      const { data: tokens } = await supabase
        .from("push_tokens")
        .select("token")
        .eq("user_id", p.user_id);

      if (!tokens?.length) continue;

      const title = "Nova Essenvia";
      const body = PRACTICE_LABEL[p.practice_key] ?? "Hora de uma prática";

      for (const { token } of tokens) {
        const res = await fetch(FCM_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: {
                practice_key: p.practice_key,
                url: "/ferramentas",
                tag: `practice-${p.practice_key}`,
              },
              android: { notification: { channel_id: "practices" } },
              apns: {
                payload: {
                  aps: { sound: "default", badge: 1 },
                },
              },
            },
          }),
        });

        if (res.ok) {
          sent++;
        } else {
          failed++;
          const errBody = await res.text();
          console.error(`[send-push] falha token ${token.slice(0, 16)}...:`, res.status, errBody);
          // Se o token for inválido, remove
          if (res.status === 404 || res.status === 400) {
            await supabase.from("push_tokens").delete().eq("token", token);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, failed, currentTime, duePracticesCount: duePractices.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[send-push] erro:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
